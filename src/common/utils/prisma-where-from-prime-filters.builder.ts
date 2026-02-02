import { mapPrimeConstraintToPrisma } from './prime-prisma-filter.helper';

export function buildPrismaWhereFromPrimeFilters(
  filters?: Record<string, any>,
): { AND?: any[] } {
  if (!filters) return {};

  const AND: any[] = [];

  for (const [field, meta] of Object.entries(filters)) {
    if (!meta) continue;

    const constraints = Array.isArray(meta)
      ? meta
      : meta.constraints ?? [];

    for (const constraint of constraints) {
      if (
        constraint?.value === null ||
        constraint?.value === undefined ||
        constraint?.value === ''
      ) {
        continue;
      }

      const mapped = mapPrimeConstraintToPrisma(field, constraint);

      if (Object.keys(mapped).length) {
        AND.push(mapped);
      }
    }
  }

  return AND.length ? { AND } : {};
}
