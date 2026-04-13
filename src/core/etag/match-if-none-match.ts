import { parseIfNoneMatch } from './parse-if-none-match';

function normalizeWeak(value: string): string {
  return value.startsWith('W/') ? value.slice(2) : value;
}

export function matchesIfNoneMatch(
  currentEtag: string | undefined,
  header: string | undefined,
): boolean {
  if (!currentEtag || !header) {
    return false;
  }

  const parsed = parseIfNoneMatch(header);

  if (parsed.any) {
    return true;
  }

  const normalizedCurrent = normalizeWeak(currentEtag);

  return parsed.values.some((value) => normalizeWeak(value) === normalizedCurrent);
}
