export function matchesIfModifiedSince(
  currentLastModified: Date | undefined,
  header: string | undefined,
): boolean {
  if (!currentLastModified || !header) {
    return false;
  }

  const since = new Date(header);
  if (Number.isNaN(since.getTime())) {
    return false;
  }
  const currentSeconds = toUnixSeconds(currentLastModified);
  const sinceSeconds = toUnixSeconds(since);

  return currentSeconds <= sinceSeconds;
}

function toUnixSeconds(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}
