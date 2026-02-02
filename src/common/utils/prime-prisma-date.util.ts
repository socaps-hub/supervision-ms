export function buildUtcDayRange(dateValue: string | Date) {
  const d = new Date(dateValue);

  const start = new Date(Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    0, 0, 0, 0,
  ));

  const end = new Date(Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    23, 59, 59, 999,
  ));

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}
