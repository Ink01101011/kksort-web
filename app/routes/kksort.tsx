import type { Route } from "./+types/kksort";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  SEARCH_ALGORITHMS,
  SEARCH_OPTIONS,
  SEARCH_SNIPPET,
  SORT_ALGORITHMS,
  SORT_OPTIONS,
  SORT_SNIPPET,
} from "../constants/kksort";
import type { SearchAlgorithm, SortAlgorithm } from "../types/kksort";
import type {
  BenchmarkRow,
  BenchmarkWorkerProgressMessage,
  BenchmarkWorkerRequest,
  BenchmarkWorkerResponse,
  BenchmarkWorkerTerminalResponse,
  SearchBenchmarkRow,
} from "../workers/kksort-benchmark.types";
import { parseNumberInput, toJson } from "@/utils";
import LoadingText from "@/components/features/LoadingText";
import CodePanel from "@/components/features/CodePanel";

let benchmarkRequestCounter = 0;

function nextBenchmarkRequestId(): string {
  benchmarkRequestCounter += 1;
  return `benchmark-${benchmarkRequestCounter}`;
}

function createBenchmarkWorker(): Worker {
  if (typeof Worker === "undefined") {
    throw new Error("Web Worker is not supported in this browser.");
  }

  return new Worker(
    new URL("../workers/kksort-benchmark.worker.ts", import.meta.url),
    {
      type: "module",
    },
  );
}

function runWorkerBenchmark(
  request: BenchmarkWorkerRequest,
  onProgress?: (message: BenchmarkWorkerProgressMessage) => void,
): Promise<BenchmarkWorkerTerminalResponse> {
  return new Promise((resolve, reject) => {
    const worker = createBenchmarkWorker();
    const cleanup = () => worker.terminate();

    worker.onmessage = (event: MessageEvent<BenchmarkWorkerResponse>) => {
      const response = event.data;
      if (!response || response.requestId !== request.requestId) {
        return;
      }

      if (response.type === "progress") {
        onProgress?.(response);
        return;
      }

      cleanup();

      if (response.type === "error") {
        reject(new Error(response.message));
        return;
      }

      resolve(response);
    };

    worker.onerror = (event) => {
      cleanup();
      reject(new Error(event.message || "Benchmark worker failed."));
    };

    worker.postMessage(request);
  });
}

async function runSortBenchmarkInWorker(
  datasetSize: number,
  runs: number,
  onProgress?: (progress: number) => void,
): Promise<BenchmarkRow[]> {
  const request: BenchmarkWorkerRequest = {
    type: "sort",
    requestId: nextBenchmarkRequestId(),
    datasetSize,
    runs,
  };
  const response = await runWorkerBenchmark(request, (message) => {
    if (message.benchmarkType === "sort") {
      onProgress?.(message.progress);
    }
  });

  if (response.type !== "sort-result") {
    throw new Error("Unexpected response from sort benchmark worker.");
  }

  return response.rows;
}

async function runSearchBenchmarkInWorker(
  datasetSize: number,
  runs: number,
  onProgress?: (progress: number) => void,
): Promise<SearchBenchmarkRow[]> {
  const request: BenchmarkWorkerRequest = {
    type: "search",
    requestId: nextBenchmarkRequestId(),
    datasetSize,
    runs,
  };
  const response = await runWorkerBenchmark(request, (message) => {
    if (message.benchmarkType === "search") {
      onProgress?.(message.progress);
    }
  });

  if (response.type !== "search-result") {
    throw new Error("Unexpected response from search benchmark worker.");
  }

  return response.rows;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "KKsort Demo + Benchmark" },
    {
      name: "description",
      content:
        "Interactive demo and benchmark lab for all @kktestdev/kksort sorting and search functions.",
    },
  ];
}

export default function KKsortDemo() {
  const [sortInput, setSortInput] = useState("64, 34, 25, 12, 22, 11, 90");
  const [sortAlgorithm, setSortAlgorithm] =
    useState<SortAlgorithm>("quickSort");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [searchInput, setSearchInput] = useState("1, 3, 5, 7, 9, 11, 13");
  const [searchAlgorithm, setSearchAlgorithm] =
    useState<SearchAlgorithm>("binarySearch");
  const [searchTarget, setSearchTarget] = useState("7");

  const [sortBenchmarkSize, setSortBenchmarkSize] = useState("1200");
  const [sortBenchmarkRuns, setSortBenchmarkRuns] = useState("6");
  const [sortBenchmarkRows, setSortBenchmarkRows] = useState<BenchmarkRow[]>(
    [],
  );
  const [sortBenchmarkError, setSortBenchmarkError] = useState("");
  const [isSortBenchmarking, setIsSortBenchmarking] = useState(false);
  const [sortBenchmarkProgress, setSortBenchmarkProgress] = useState(0);

  const [searchBenchmarkSize, setSearchBenchmarkSize] = useState("20000");
  const [searchBenchmarkRuns, setSearchBenchmarkRuns] = useState("20");
  const [searchBenchmarkRows, setSearchBenchmarkRows] = useState<
    SearchBenchmarkRow[]
  >([]);
  const [searchBenchmarkError, setSearchBenchmarkError] = useState("");
  const [isSearchBenchmarking, setIsSearchBenchmarking] = useState(false);
  const [searchBenchmarkProgress, setSearchBenchmarkProgress] = useState(0);

  const selectedSort = SORT_OPTIONS[sortAlgorithm];
  const selectedSearch = SEARCH_OPTIONS[searchAlgorithm];

  const sortState = useMemo(() => {
    const parsed = parseNumberInput(sortInput);
    const compare =
      sortOrder === "asc"
        ? (a: number, b: number) => a - b
        : (a: number, b: number) => b - a;
    const runSorter = SORT_OPTIONS[sortAlgorithm].run;

    return {
      ...parsed,
      sorted:
        parsed.numbers.length > 0
          ? runSorter([...parsed.numbers], compare)
          : [],
    };
  }, [sortAlgorithm, sortInput, sortOrder]);

  const searchState = useMemo(() => {
    const parsed = parseNumberInput(searchInput);
    const normalized = SORT_OPTIONS.quickSort.run(
      [...parsed.numbers],
      (a, b) => a - b,
    );
    const selected = SEARCH_OPTIONS[searchAlgorithm];
    const baseDataset = selected.requiresSorted ? normalized : parsed.numbers;
    const workingDataset = [...baseDataset];
    const target = Number(searchTarget.trim());
    const isTargetValid = Number.isFinite(target);

    let index = -1;
    if (isTargetValid && workingDataset.length > 0) {
      index = selected.run(workingDataset, target);
    }

    return {
      ...parsed,
      index,
      isTargetValid,
      target,
      datasetBeforeSearch: baseDataset,
      datasetAfterSearch: workingDataset,
    };
  }, [searchAlgorithm, searchInput, searchTarget]);

  async function runSortBenchmark(): Promise<void> {
    const parsedSize = Number(sortBenchmarkSize);
    const parsedRuns = Number(sortBenchmarkRuns);

    if (
      !Number.isInteger(parsedSize) ||
      parsedSize < 10 ||
      parsedSize > 12000
    ) {
      setSortBenchmarkError(
        "Dataset size must be an integer between 10 and 12000.",
      );
      return;
    }

    if (!Number.isInteger(parsedRuns) || parsedRuns < 1 || parsedRuns > 50) {
      setSortBenchmarkError("Runs must be an integer between 1 and 50.");
      return;
    }

    setSortBenchmarkError("");
    setSortBenchmarkProgress(0);
    setIsSortBenchmarking(true);

    try {
      const rows = await runSortBenchmarkInWorker(
        parsedSize,
        parsedRuns,
        setSortBenchmarkProgress,
      );
      setSortBenchmarkProgress(100);
      setSortBenchmarkRows(rows);
    } catch (error) {
      setSortBenchmarkProgress(0);
      setSortBenchmarkRows([]);
      setSortBenchmarkError(
        error instanceof Error
          ? error.message
          : "Unable to run sorting benchmark.",
      );
    } finally {
      setIsSortBenchmarking(false);
    }
  }

  async function runSearchBenchmark(): Promise<void> {
    const parsedSize = Number(searchBenchmarkSize);
    const parsedRuns = Number(searchBenchmarkRuns);

    if (
      !Number.isInteger(parsedSize) ||
      parsedSize < 100 ||
      parsedSize > 150000
    ) {
      setSearchBenchmarkError(
        "Dataset size must be an integer between 100 and 150000.",
      );
      return;
    }

    if (!Number.isInteger(parsedRuns) || parsedRuns < 1 || parsedRuns > 200) {
      setSearchBenchmarkError("Runs must be an integer between 1 and 200.");
      return;
    }

    setSearchBenchmarkError("");
    setSearchBenchmarkProgress(0);
    setIsSearchBenchmarking(true);

    try {
      const rows = await runSearchBenchmarkInWorker(
        parsedSize,
        parsedRuns,
        setSearchBenchmarkProgress,
      );
      setSearchBenchmarkProgress(100);
      setSearchBenchmarkRows(rows);
    } catch (error) {
      setSearchBenchmarkProgress(0);
      setSearchBenchmarkRows([]);
      setSearchBenchmarkError(
        error instanceof Error
          ? error.message
          : "Unable to run search benchmark.",
      );
    } finally {
      setIsSearchBenchmarking(false);
    }
  }

  return (
    <main className="home-grid kksort-page min-h-screen px-4 py-8 md:px-8 md:py-10">
      <div className="kksort-layout mx-auto max-w-7xl space-y-7">
        <header className="home-card kksort-hero-card fade-in-up p-6 md:p-8">
          <p className="home-kicker">interactive lab</p>
          <h1 className="home-title mt-4">KKsort Demo + Benchmark</h1>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed md:text-base">
            Play with all sorting/search functions and benchmark both categories
            on shared datasets.
          </p>

          <div className="mt-6 flex flex-wrap gap-2 text-xs font-mono">
            <span className="home-chip">6 Sorting Functions</span>
            <span className="home-chip">4 Search Functions</span>
            <span className="home-chip">Two Benchmark Tables</span>
            <span className="home-chip">Copyable Snippets</span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              className="primary-link-btn w-full text-center sm:w-auto"
              to="/"
            >
              Back To Overview
            </Link>
            <a
              className="secondary-link-btn w-full text-center sm:w-auto"
              href="https://www.npmjs.com/package/@kktestdev/kksort"
              target="_blank"
              rel="noreferrer"
            >
              Open NPM Docs
            </a>
          </div>
        </header>

        <section className="kksort-primary-grid grid gap-4 sm:gap-6 lg:grid-cols-2">
          <article className="home-card kksort-demo-card p-5 md:p-6">
            <h2 className="text-xl font-semibold">Sorting Demo</h2>
            <p className="mt-2 text-sm">
              Switch algorithms and ordering strategy on the same input.
            </p>

            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium">
                  Input numbers (comma separated)
                </span>
                <textarea
                  className="home-input h-28 w-full p-3 font-mono text-sm"
                  value={sortInput}
                  onChange={(event) => setSortInput(event.target.value)}
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-medium">Algorithm</span>
                  <select
                    className="home-input w-full p-3 font-mono text-sm"
                    value={sortAlgorithm}
                    onChange={(event) =>
                      setSortAlgorithm(event.target.value as SortAlgorithm)
                    }
                  >
                    {SORT_ALGORITHMS.map((algorithm) => (
                      <option key={algorithm} value={algorithm}>
                        {SORT_OPTIONS[algorithm].label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-sm">
                  <span className="font-medium">Order</span>
                  <select
                    className="home-input w-full p-3 font-mono text-sm"
                    value={sortOrder}
                    onChange={(event) =>
                      setSortOrder(event.target.value as "asc" | "desc")
                    }
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="mt-4 rounded border border-black p-3 text-sm">
              <p>
                <span className="font-mono">Complexity:</span>{" "}
                {selectedSort.complexity}
              </p>
              <p className="mt-1">
                <span className="font-mono">Stable:</span> {selectedSort.stable}
              </p>
              <p className="mt-1">{selectedSort.note}</p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <article className="rounded border border-black p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide">
                  Parsed Input
                </h3>
                <pre className="mt-2 overflow-x-auto text-xs font-mono">
                  {toJson(sortState.numbers)}
                </pre>
              </article>
              <article className="rounded border border-black p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide">
                  Sorted Result
                </h3>
                <pre className="mt-2 overflow-x-auto text-xs font-mono">
                  {toJson(sortState.sorted)}
                </pre>
              </article>
            </div>

            {sortState.invalidTokens.length > 0 && (
              <p className="mt-4 text-sm">
                Invalid tokens ignored:{" "}
                <span className="font-mono">
                  {sortState.invalidTokens.join(", ")}
                </span>
              </p>
            )}
          </article>

          <article className="home-card kksort-demo-card p-5 md:p-6">
            <h2 className="text-xl font-semibold">Search Demo</h2>
            <p className="mt-2 text-sm">
              Pick any search function and inspect before/after arrays.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="space-y-2 text-sm md:col-span-2">
                <span className="font-medium">Dataset</span>
                <input
                  className="home-input w-full p-3 font-mono text-sm"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium">Target</span>
                <input
                  className="home-input w-full p-3 font-mono text-sm"
                  value={searchTarget}
                  onChange={(event) => setSearchTarget(event.target.value)}
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="space-y-2 text-sm">
                <span className="font-medium">Search Algorithm</span>
                <select
                  className="home-input w-full p-3 font-mono text-sm"
                  value={searchAlgorithm}
                  onChange={(event) =>
                    setSearchAlgorithm(event.target.value as SearchAlgorithm)
                  }
                >
                  {SEARCH_ALGORITHMS.map((algorithm) => (
                    <option key={algorithm} value={algorithm}>
                      {SEARCH_OPTIONS[algorithm].label}
                    </option>
                  ))}
                </select>
              </label>

              <article className="rounded border border-black p-4 md:col-span-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide">
                  Algorithm Info
                </h3>
                <p className="mt-2 text-sm">
                  <span className="font-mono">Complexity:</span>{" "}
                  {selectedSearch.complexity}
                </p>
                <p className="mt-1 text-sm">
                  <span className="font-mono">Requires Sorted:</span>{" "}
                  {selectedSearch.requiresSorted ? "Yes" : "No"}
                </p>
                <p className="mt-1 text-sm">
                  <span className="font-mono">Mutates Array:</span>{" "}
                  {selectedSearch.mutates ? "Yes" : "No"}
                </p>
                <p className="mt-1 text-sm">{selectedSearch.note}</p>
              </article>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <article className="rounded border border-black p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide">
                  Dataset Before Search
                </h3>
                <pre className="mt-2 overflow-x-auto text-xs font-mono">
                  {toJson(searchState.datasetBeforeSearch)}
                </pre>
              </article>
              <article className="rounded border border-black p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide">
                  Dataset After Search
                </h3>
                <pre className="mt-2 overflow-x-auto text-xs font-mono">
                  {toJson(searchState.datasetAfterSearch)}
                </pre>
              </article>
            </div>

            <article className="mt-4 rounded border border-black p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide">
                Search Result
              </h3>
              {!searchState.isTargetValid ? (
                <p className="mt-2 text-sm">Target must be numeric.</p>
              ) : searchState.index >= 0 ? (
                <p className="mt-2 text-sm">
                  Found target{" "}
                  <code className="font-mono">{searchState.target}</code> at
                  index <code className="font-mono">{searchState.index}</code>
                </p>
              ) : (
                <p className="mt-2 text-sm">Target not found</p>
              )}
            </article>
          </article>
        </section>

        <section className="home-card kksort-benchmark-card p-5 md:p-6">
          <h2 className="text-xl font-semibold">
            Benchmark: Sorting Algorithms
          </h2>
          <p className="mt-2 text-sm">
            Run all sorting functions on the same random dataset and compare
            speed ranking.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <label className="space-y-2 text-sm">
              <span className="font-medium">Dataset Size</span>
              <input
                className="home-input w-full p-3 font-mono text-sm"
                value={sortBenchmarkSize}
                onChange={(event) => setSortBenchmarkSize(event.target.value)}
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">Runs</span>
              <input
                className="home-input w-full p-3 font-mono text-sm"
                value={sortBenchmarkRuns}
                onChange={(event) => setSortBenchmarkRuns(event.target.value)}
              />
            </label>
            <div className="flex items-end">
              <button
                type="button"
                className="primary-link-btn w-full disabled:opacity-60"
                onClick={runSortBenchmark}
                disabled={isSortBenchmarking}
              >
                {isSortBenchmarking ? "Running..." : "Run Sorting Benchmark"}
              </button>
            </div>
          </div>

          {sortBenchmarkError && (
            <p className="mt-3 text-sm">{sortBenchmarkError}</p>
          )}
          {isSortBenchmarking && (
            <LoadingText
              text="Running sorting benchmark..."
              progress={sortBenchmarkProgress}
            />
          )}

          {sortBenchmarkRows.length > 0 && (
            <div className="mt-5 overflow-x-auto -mx-1 px-1 sm:mx-0 sm:px-0">
              <table className="min-w-130 w-full border-collapse border border-black text-xs sm:text-sm">
                <thead>
                  <tr className="bg-neutral-100">
                    <th className="border border-black px-2 py-2 text-left font-mono sm:px-3">
                      Rank
                    </th>
                    <th className="border border-black px-2 py-2 text-left font-mono sm:px-3">
                      Algorithm
                    </th>
                    <th className="border border-black px-2 py-2 text-right font-mono sm:px-3">
                      Total (ms)
                    </th>
                    <th className="border border-black px-2 py-2 text-right font-mono sm:px-3">
                      Average (ms)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortBenchmarkRows.map((row, index) => (
                    <tr key={row.algorithm}>
                      <td className="border border-black px-2 py-2 font-mono sm:px-3">
                        #{index + 1}
                      </td>
                      <td className="border border-black px-2 py-2 font-mono sm:px-3">
                        {row.algorithm}
                      </td>
                      <td className="border border-black px-2 py-2 text-right font-mono sm:px-3">
                        {row.totalMs.toFixed(2)}
                      </td>
                      <td className="border border-black px-2 py-2 text-right font-mono sm:px-3">
                        {row.averageMs.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="home-card kksort-benchmark-card p-5 md:p-6">
          <h2 className="text-xl font-semibold">
            Benchmark: Search Algorithms
          </h2>
          <p className="mt-2 text-sm">
            Benchmarks all search functions using a shared target value
            (binary/jump use sorted source).
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <label className="space-y-2 text-sm">
              <span className="font-medium">Dataset Size</span>
              <input
                className="home-input w-full p-3 font-mono text-sm"
                value={searchBenchmarkSize}
                onChange={(event) => setSearchBenchmarkSize(event.target.value)}
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">Runs</span>
              <input
                className="home-input w-full p-3 font-mono text-sm"
                value={searchBenchmarkRuns}
                onChange={(event) => setSearchBenchmarkRuns(event.target.value)}
              />
            </label>
            <div className="flex items-end">
              <button
                type="button"
                className="primary-link-btn w-full disabled:opacity-60"
                onClick={runSearchBenchmark}
                disabled={isSearchBenchmarking}
              >
                {isSearchBenchmarking ? "Running..." : "Run Search Benchmark"}
              </button>
            </div>
          </div>

          {searchBenchmarkError && (
            <p className="mt-3 text-sm">{searchBenchmarkError}</p>
          )}
          {isSearchBenchmarking && (
            <LoadingText
              text="Running search benchmark..."
              progress={searchBenchmarkProgress}
            />
          )}

          {searchBenchmarkRows.length > 0 && (
            <div className="mt-5 overflow-x-auto -mx-1 px-1 sm:mx-0 sm:px-0">
              <table className="min-w-190 w-full border-collapse border border-black text-xs sm:text-sm">
                <thead>
                  <tr className="bg-neutral-100">
                    <th className="border border-black px-2 py-2 text-left font-mono sm:px-3">
                      Rank
                    </th>
                    <th className="border border-black px-2 py-2 text-left font-mono sm:px-3">
                      Algorithm
                    </th>
                    <th className="border border-black px-2 py-2 text-right font-mono sm:px-3">
                      Total (ms)
                    </th>
                    <th className="border border-black px-2 py-2 text-right font-mono sm:px-3">
                      Average (ms)
                    </th>
                    <th className="border border-black px-2 py-2 text-left font-mono sm:px-3">
                      Requires Sorted
                    </th>
                    <th className="border border-black px-2 py-2 text-left font-mono sm:px-3">
                      Mutates
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {searchBenchmarkRows.map((row, index) => (
                    <tr key={row.algorithm}>
                      <td className="border border-black px-2 py-2 font-mono sm:px-3">
                        #{index + 1}
                      </td>
                      <td className="border border-black px-2 py-2 font-mono sm:px-3">
                        {row.algorithm}
                      </td>
                      <td className="border border-black px-2 py-2 text-right font-mono sm:px-3">
                        {row.totalMs.toFixed(2)}
                      </td>
                      <td className="border border-black px-2 py-2 text-right font-mono sm:px-3">
                        {row.averageMs.toFixed(2)}
                      </td>
                      <td className="border border-black px-2 py-2 sm:px-3">
                        {row.requiresSorted}
                      </td>
                      <td className="border border-black px-2 py-2 sm:px-3">
                        {row.mutates}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="kksort-example-grid grid gap-4 sm:gap-6 lg:grid-cols-2">
          <CodePanel title="Sorting example" code={SORT_SNIPPET} />
          <CodePanel title="Search example" code={SEARCH_SNIPPET} />
        </section>
      </div>
    </main>
  );
}
