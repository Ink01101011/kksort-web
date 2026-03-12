export type BenchmarkRow = {
  algorithm: string;
  totalMs: number;
  averageMs: number;
};

export type SearchBenchmarkRow = BenchmarkRow & {
  requiresSorted: "Yes" | "No";
  mutates: "Yes" | "No";
};

export type SortBenchmarkRequestMessage = {
  type: "sort";
  requestId: string;
  datasetSize: number;
  runs: number;
};

export type SearchBenchmarkRequestMessage = {
  type: "search";
  requestId: string;
  datasetSize: number;
  runs: number;
};

export type BenchmarkWorkerRequest =
  | SortBenchmarkRequestMessage
  | SearchBenchmarkRequestMessage;

export type SortBenchmarkResultMessage = {
  type: "sort-result";
  requestId: string;
  rows: BenchmarkRow[];
};

export type SearchBenchmarkResultMessage = {
  type: "search-result";
  requestId: string;
  rows: SearchBenchmarkRow[];
};

export type BenchmarkWorkerProgressMessage = {
  type: "progress";
  requestId: string;
  benchmarkType: "sort" | "search";
  progress: number;
  completedSteps: number;
  totalSteps: number;
};

export type BenchmarkWorkerErrorMessage = {
  type: "error";
  requestId: string;
  message: string;
};

export type BenchmarkWorkerTerminalResponse =
  | SortBenchmarkResultMessage
  | SearchBenchmarkResultMessage
  | BenchmarkWorkerErrorMessage;

export type BenchmarkWorkerResponse =
  | BenchmarkWorkerProgressMessage
  | SortBenchmarkResultMessage
  | SearchBenchmarkResultMessage
  | BenchmarkWorkerErrorMessage;
