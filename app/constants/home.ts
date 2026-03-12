export const INSTALL_SNIPPET = `pnpm add @kktestdev/kksort
npm i @kktestdev/kksort
yarn add @kktestdev/kksort`;

export const IMPORT_SNIPPET = `import { quickSort } from "@kktestdev/kksort/quick-sort";
import { binarySearch } from "@kktestdev/kksort/binary";

import { mergeSort, heapSort } from "@kktestdev/kksort/sort";
import { linearSearch, jumpSearch } from "@kktestdev/kksort/search";`;

export const ADVANTAGES = [
  "Type-safe API with TypeScript generics",
  "Tree-shakable subpath imports for small bundles",
  "Zero runtime dependencies",
  "Includes 6 sorting + 4 searching algorithms",
  "Comparator support for numbers, strings, and objects",
  "Lightweight package footprint with production-ready docs",
];

export const TRADE_OFFS = [
  "Binary Search and Jump Search require sorted input",
  "Quick Search mutates the working array during execution",
  "Bubble/Insertion/Selection are slower on large datasets",
  "Quick Sort can degrade to O(n^2) in worst pivot scenarios",
  "Stable ordering is guaranteed only for stable algorithms",
];

export const SORT_SNAPSHOT = [
  {
    algorithm: "Bubble Sort",
    complexity: "O(n) / O(n^2) / O(n^2)",
    stable: "✅",
    useCase: "Learning, tiny arrays",
  },
  {
    algorithm: "Insertion Sort",
    complexity: "O(n) / O(n^2) / O(n^2)",
    stable: "✅",
    useCase: "Nearly sorted data",
  },
  {
    algorithm: "Selection Sort",
    complexity: "O(n^2) / O(n^2) / O(n^2)",
    stable: "❌",
    useCase: "Low write count",
  },
  {
    algorithm: "Merge Sort",
    complexity: "O(n log n) / O(n log n) / O(n log n)",
    stable: "✅",
    useCase: "Stable output needed",
  },
  {
    algorithm: "Quick Sort",
    complexity: "O(n log n) / O(n log n) / O(n^2)",
    stable: "❌",
    useCase: "General purpose",
  },
  {
    algorithm: "Heap Sort",
    complexity: "O(n log n) / O(n log n) / O(n log n)",
    stable: "❌",
    useCase: "Worst-case safety",
  },
];

export const SEARCH_SNAPSHOT = [
  {
    algorithm: "Binary Search",
    complexity: "O(1) / O(log n) / O(log n)",
    requirement: "Sorted input",
  },
  {
    algorithm: "Linear Search",
    complexity: "O(1) / O(n) / O(n)",
    requirement: "Unsorted is fine",
  },
  {
    algorithm: "Jump Search",
    complexity: "O(1) / O(sqrt(n)) / O(sqrt(n))",
    requirement: "Sorted input",
  },
  {
    algorithm: "Quick Search",
    complexity: "O(1) / O(n) / O(n^2)",
    requirement: "Mutates working array",
  },
];