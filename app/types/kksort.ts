export type SortAlgorithm =
  | "bubbleSort"
  | "heapSort"
  | "insertionSort"
  | "mergeSort"
  | "quickSort"
  | "selectionSort";

export type SearchAlgorithm = "binarySearch" | "linearSearch" | "jumpSearch" | "quickSearch";

export type SortDescriptor = {
  label: SortAlgorithm;
  complexity: string;
  stable: "Yes" | "No";
  note: string;
  run: (arr: number[], compareFn: (a: number, b: number) => number) => number[];
};

export type SearchDescriptor = {
  label: SearchAlgorithm;
  complexity: string;
  requiresSorted: boolean;
  mutates: boolean;
  note: string;
  run: (arr: number[], target: number) => number;
};
