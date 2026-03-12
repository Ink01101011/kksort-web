/// <reference lib="WebWorker" />

import {
  SEARCH_ALGORITHMS,
  SEARCH_OPTIONS,
  SORT_ALGORITHMS,
  SORT_OPTIONS,
} from "../constants/kksort";
import type {
  BenchmarkRow,
  BenchmarkWorkerErrorMessage,
  BenchmarkWorkerProgressMessage,
  BenchmarkWorkerRequest,
  SearchBenchmarkRow,
  SearchBenchmarkResultMessage,
  SortBenchmarkResultMessage,
} from "./kksort-benchmark.types";

function createDataset(size: number): number[] {
  const output: number[] = [];
  for (let index = 0; index < size; index += 1) {
    output.push(Math.floor(Math.random() * 100000));
  }
  return output;
}

function rankByAverage<T extends { averageMs: number }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => a.averageMs - b.averageMs);
}

function yesNo(value: boolean): "Yes" | "No" {
  return value ? "Yes" : "No";
}

function runSortBenchmark(
  datasetSize: number,
  runs: number,
  onProgress: (completedSteps: number, totalSteps: number) => void,
): BenchmarkRow[] {
  const dataset = createDataset(datasetSize);
  const compareAsc = (a: number, b: number) => a - b;
  const totalSteps = Math.max(1, SORT_ALGORITHMS.length * runs);
  let completedSteps = 0;

  onProgress(0, totalSteps);

  const rows = SORT_ALGORITHMS.map((algorithmKey) => {
    const algorithm = SORT_OPTIONS[algorithmKey];
    const startedAt = performance.now();

    for (let round = 0; round < runs; round += 1) {
      algorithm.run([...dataset], compareAsc);
      completedSteps += 1;
      onProgress(completedSteps, totalSteps);
    }

    const totalMs = performance.now() - startedAt;
    return {
      algorithm: algorithm.label,
      totalMs,
      averageMs: totalMs / runs,
    };
  });

  return rankByAverage(rows);
}

function runSearchBenchmark(
  datasetSize: number,
  runs: number,
  onProgress: (completedSteps: number, totalSteps: number) => void,
): SearchBenchmarkRow[] {
  const unsortedDataset = createDataset(datasetSize);
  const sortedDataset = SORT_OPTIONS.quickSort.run([...unsortedDataset], (a, b) => a - b);
  const target = sortedDataset[Math.floor(sortedDataset.length / 2)] ?? -1;
  const totalSteps = Math.max(1, SEARCH_ALGORITHMS.length * runs);
  let completedSteps = 0;

  onProgress(0, totalSteps);

  const rows = SEARCH_ALGORITHMS.map((algorithmKey) => {
    const algorithm = SEARCH_OPTIONS[algorithmKey];
    const source = algorithm.requiresSorted ? sortedDataset : unsortedDataset;
    const startedAt = performance.now();

    for (let round = 0; round < runs; round += 1) {
      const input = algorithm.mutates ? [...source] : source;
      algorithm.run(input, target);
      completedSteps += 1;
      onProgress(completedSteps, totalSteps);
    }

    const totalMs = performance.now() - startedAt;
    return {
      algorithm: algorithm.label,
      totalMs,
      averageMs: totalMs / runs,
      requiresSorted: yesNo(algorithm.requiresSorted),
      mutates: yesNo(algorithm.mutates),
    };
  });

  return rankByAverage(rows);
}

function toProgressPercent(completedSteps: number, totalSteps: number): number {
  const safeTotal = totalSteps <= 0 ? 1 : totalSteps;
  return Math.min(100, Math.max(0, Math.round((completedSteps / safeTotal) * 100)));
}

function postProgress(
  ctx: DedicatedWorkerGlobalScope,
  requestId: string,
  benchmarkType: "sort" | "search",
  completedSteps: number,
  totalSteps: number,
): void {
  const message: BenchmarkWorkerProgressMessage = {
    type: "progress",
    requestId,
    benchmarkType,
    progress: toProgressPercent(completedSteps, totalSteps),
    completedSteps,
    totalSteps,
  };

  ctx.postMessage(message);
}

const ctx = self as DedicatedWorkerGlobalScope;

ctx.onmessage = (event: MessageEvent<BenchmarkWorkerRequest>) => {
  const request = event.data;

  try {
    if (request.type === "sort") {
      const rows = runSortBenchmark(request.datasetSize, request.runs, (completedSteps, totalSteps) => {
        postProgress(ctx, request.requestId, "sort", completedSteps, totalSteps);
      });

      const response: SortBenchmarkResultMessage = {
        type: "sort-result",
        requestId: request.requestId,
        rows,
      };
      ctx.postMessage(response);
      return;
    }

    const rows = runSearchBenchmark(request.datasetSize, request.runs, (completedSteps, totalSteps) => {
      postProgress(ctx, request.requestId, "search", completedSteps, totalSteps);
    });

    const response: SearchBenchmarkResultMessage = {
      type: "search-result",
      requestId: request.requestId,
      rows,
    };
    ctx.postMessage(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Worker benchmark failed.";
    const response: BenchmarkWorkerErrorMessage = {
      type: "error",
      requestId: request.requestId,
      message,
    };
    ctx.postMessage(response);
  }
};

export {};
