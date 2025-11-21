export function mapPrimeFilterToPrisma(field: string, filter: any) {
  if (!filter || filter.value === undefined || filter.value === null) return {};

  const matchMode = filter.matchMode || 'contains';
  let value = filter.value;

  // Convertir DatePicker a ISO string (primer paso)
  if (value instanceof Date) {
    value = value.toISOString();
  }

  const prismaFilter: any = {};

  switch (matchMode) {

    // ───────────────────────────────────────────────
    // 📌 FECHAS: Date is (día completo)
    // ───────────────────────────────────────────────
    case 'dateIs': {
      const date = new Date(value);

      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      prismaFilter.gte = start.toISOString();
      prismaFilter.lte = end.toISOString();
      break;
    }

    // ───────────────────────────────────────────────
    // 📌 FECHAS: Date is not
    // (NOT BETWEEN día completo)
    // ───────────────────────────────────────────────
    case 'dateIsNot': {
      const date = new Date(value);

      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      // Prisma espera un array de NOTs
      return {
        NOT: {
          [field]: {
            gte: start.toISOString(),
            lte: end.toISOString(),
          }
        }
      };
    }

    // ───────────────────────────────────────────────
    // 📌 FECHAS: Date is before
    // ───────────────────────────────────────────────
    case 'dateBefore': {
      const date = new Date(value);
      prismaFilter.lt = date.toISOString();
      break;
    }

    // ───────────────────────────────────────────────
    // 📌 FECHAS: Date is after
    // ───────────────────────────────────────────────
    case 'dateAfter': {
      const date = new Date(value);
      prismaFilter.gt = date.toISOString();
      break;
    }

    // ───────────────────────────────────────────────
    // 📌 MATCH MODES NORMALES (texto / num)
    // ───────────────────────────────────────────────
    case 'equals':
      prismaFilter.equals = value;
      break;

    case 'contains':
      prismaFilter.contains = value;
      prismaFilter.mode = 'insensitive';
      break;

    case 'startsWith':
      prismaFilter.startsWith = value;
      prismaFilter.mode = 'insensitive';
      break;

    case 'endsWith':
      prismaFilter.endsWith = value;
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

  // ───────────────────────────────────────────────
  // 📌 Campos simples
  // ───────────────────────────────────────────────
  if (!field.includes('.')) {
    return { [field]: prismaFilter };
  }

  // ───────────────────────────────────────────────
  // 📌 Campos anidados (e.g. resumenRevisionF1.A04CalA)
  // ───────────────────────────────────────────────
  const [relation, nestedField] = field.split('.');

  return {
    [relation]: {
      [nestedField]: prismaFilter,
    },
  };
}
