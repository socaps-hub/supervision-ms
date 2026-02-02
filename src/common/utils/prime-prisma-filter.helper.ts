import { buildUtcDayRange } from './prime-prisma-date.util';

export function mapPrimeConstraintToPrisma(
  field: string,
  constraint: any,
): Record<string, any> {
  const matchMode = constraint.matchMode ?? 'contains';
  let value = constraint.value;
  const isNumericValue = typeof value === 'number' || !isNaN(Number(value));

  if (value instanceof Date) {
    value = value.toISOString();
  }

  const prismaFilter: any = {};

  switch (matchMode) {
    /* =====================
     * Fechas
     * ===================== */
    // case 'dateIs': {
    //   const { start, end } = buildUtcDayRange(value);
    //   prismaFilter.gte = start;
    //   prismaFilter.lte = end;
    //   break;
    // }
    case 'dateIs':
    case 'equals': {
      const normalized = normalizeDateToYMD(value);
      if (normalized) {
        prismaFilter.equals = normalized;
      }
      break;
    }

    case 'dateAfter': {
      const { start } = buildUtcDayRange(value);
      prismaFilter.gte = start;
      break;
    }

    case 'dateBefore': {
      const { end } = buildUtcDayRange(value);
      prismaFilter.lte = end;
      break;
    }

    /* =====================
     * Texto / genéricos
     * ===================== */
    // case 'equals':
    //   prismaFilter.equals = value;
    //   break;

    case 'startsWith':
    case 'contains':
    case 'endsWith':
      // if (isNumericValue) return {}; // NO aplicar filtro string a número
      prismaFilter[matchMode] = value;
      prismaFilter.mode = 'insensitive';
      break;

    case 'gte':
      prismaFilter.gte = value;
      break;

    case 'lte':
      prismaFilter.lte = value;
      break;

    default:
      prismaFilter.contains = value;
      prismaFilter.mode = 'insensitive';
  }

  /* =====================
   * Campos anidados
   * ===================== */
  const path = field.split('.');
  let nested: any = prismaFilter;

  for (let i = path.length - 1; i >= 0; i--) {
    nested = { [path[i]]: nested };
  }

  return nested;
}


function normalizeDateToYMD(value: any): string | null {
  if (!value) return null;

  if (typeof value === 'string') {
    return value.slice(0, 10); // YYYY-MM-DD
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return null;
}
