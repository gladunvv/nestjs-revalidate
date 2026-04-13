export interface ParsedIfNoneMatch {
  any: boolean;
  values: string[];
}

export function parseIfNoneMatch(header: string | undefined): ParsedIfNoneMatch {
  if (!header) {
    return { any: false, values: [] };
  }

  const trimmed = header.trim();
  if (trimmed === '*') {
    return { any: true, values: [] };
  }

  const values = trimmed
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  return { any: false, values };
}
