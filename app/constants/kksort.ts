import { binarySearch } from "@kktestdev/kksort/binary";
import { jumpSearch } from "@kktestdev/kksort/jump";
import { linearSearch } from "@kktestdev/kksort/linear";
import { quickSearch } from "@kktestdev/kksort/quick-search";
import {
  bubbleSort,
  heapSort,
  insertionSort,
  mergeSort,
  quickSort,
  selectionSort,
} from "@kktestdev/kksort/sort";
import type {
  SearchAlgorithm,
  SearchDescriptor,
  SortAlgorithm,
  SortDescriptor,
} from "../types/kksort";

export const SORT_OPTIONS: Record<SortAlgorithm, SortDescriptor> = {
  bubbleSort: {
    label: "bubbleSort",
    complexity: "O(n) / O(n^2) / O(n^2)",
    stable: "Yes",
    note: "Good for learning and very small arrays.",
    run: bubbleSort,
  },
  heapSort: {
    label: "heapSort",
    complexity: "O(n log n) / O(n log n) / O(n log n)",
    stable: "No",
    note: "Consistent worst-case performance.",
    run: heapSort,
  },
  insertionSort: {
    label: "insertionSort",
    complexity: "O(n) / O(n^2) / O(n^2)",
    stable: "Yes",
    note: "Excellent when data is almost sorted.",
    run: insertionSort,
  },
  mergeSort: {
    label: "mergeSort",
    complexity: "O(n log n) / O(n log n) / O(n log n)",
    stable: "Yes",
    note: "Stable output for equal values.",
    run: mergeSort,
  },
  quickSort: {
    label: "quickSort",
    complexity: "O(n log n) / O(n log n) / O(n^2)",
    stable: "No",
    note: "Fast in practice for general workloads.",
    run: quickSort,
  },
  selectionSort: {
    label: "selectionSort",
    complexity: "O(n^2) / O(n^2) / O(n^2)",
    stable: "No",
    note: "Predictable writes and simple behavior.",
    run: selectionSort,
  },
};

export const SEARCH_OPTIONS: Record<SearchAlgorithm, SearchDescriptor> = {
  binarySearch: {
    label: "binarySearch",
    complexity: "O(1) / O(log n) / O(log n)",
    requiresSorted: true,
    mutates: false,
    note: "Best for sorted datasets.",
    run: (arr, target) => binarySearch(arr, target),
  },
  linearSearch: {
    label: "linearSearch",
    complexity: "O(1) / O(n) / O(n)",
    requiresSorted: false,
    mutates: false,
    note: "Works on unsorted datasets.",
    run: (arr, target) => linearSearch(arr, target),
  },
  jumpSearch: {
    label: "jumpSearch",
    complexity: "O(1) / O(sqrt(n)) / O(sqrt(n))",
    requiresSorted: true,
    mutates: false,
    note: "Balanced alternative for sorted arrays.",
    run: (arr, target) => jumpSearch(arr, target),
  },
  quickSearch: {
    label: "quickSearch",
    complexity: "O(1) / O(n) / O(n^2)",
    requiresSorted: false,
    mutates: true,
    note: "Mutates the array while partitioning.",
    run: (arr, target) => quickSearch(arr, target),
  },
};

export const SORT_ALGORITHMS = Object.keys(SORT_OPTIONS) as SortAlgorithm[];
export const SEARCH_ALGORITHMS = Object.keys(SEARCH_OPTIONS) as SearchAlgorithm[];

export const SORT_SNIPPET = `import { mergeSort } from "@kktestdev/kksort/merge";

const employees = [
  { name: "Alice", salary: 50000 },
  { name: "Bob", salary: 80000 },
  { name: "Charlie", salary: 60000 },
];

const sorted = mergeSort(employees, (a, b) => a.salary - b.salary);`;

export const SEARCH_SNIPPET = `import { binarySearch } from "@kktestdev/kksort/binary";
import { quickSearch } from "@kktestdev/kksort/quick-search";

const sortedNumbers = [1, 3, 5, 7, 9, 11, 13];
const exactIndex = binarySearch(sortedNumbers, 7);

const unsortedNumbers = [7, 4, 9, 1, 5, 8];
const quickIndex = quickSearch([...unsortedNumbers], 5);`;
