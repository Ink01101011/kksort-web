export function parseNumberInput(raw: string): {
  numbers: number[];
  invalidTokens: string[];
} {
  const numbers: number[] = [];
  const invalidTokens: string[] = [];

  for (const token of raw.split(",").map((chunk) => chunk.trim())) {
    if (!token) {
      continue;
    }

    const parsed = Number(token);
    if (Number.isFinite(parsed)) {
      numbers.push(parsed);
    } else {
      invalidTokens.push(token);
    }
  }

  return { numbers, invalidTokens };
}

export function toJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}
