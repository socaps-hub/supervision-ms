import { buildUtcDayRange } from './prime-prisma-date.util';

// export function mapPrimeConstraintToPrisma(
//   field: string,
//   constraint: any,
// ): Record<string, any> {
//   const matchMode = constraint.matchMode ?? 'contains';
//   let value = constraint.value;
//   const isNumericValue = typeof value === 'number' || !isNaN(Number(value));

//   console.log({matchMode, value});


//   if (value instanceof Date) {
//     value = value.toISOString();
//   }

//   const prismaFilter: any = {};

//   switch (matchMode) {
//     /* =====================
//      * Fechas
//      * ===================== */
//     // case 'dateIs': {
//     //   const { start, end } = buildUtcDayRange(value);
//     //   prismaFilter.gte = start;
//     //   prismaFilter.lte = end;
//     //   break;
//     // }
//     case 'dateIs':
//     case 'equals': {
//       const normalized = normalizeDateToYMD(value);
//       if (normalized) {
//         prismaFilter.equals = normalized;
//       }
//       break;
//     }

//     case 'dateAfter': {
//       const { start } = buildUtcDayRange(value);
//       prismaFilter.gte = start;
//       break;
//     }

//     case 'dateBefore': {
//       const { end } = buildUtcDayRange(value);
//       prismaFilter.lte = end;
//       break;
//     }

//     /* =====================
//      * Texto / genéricos
//      * ===================== */
//     // case 'equals':
//     //   prismaFilter.equals = value;
//     //   break;

//     case 'startsWith':
//     case 'contains':
//     case 'endsWith':
//       // if (isNumericValue) return {}; // NO aplicar filtro string a número
//       prismaFilter[matchMode] = value;
//       prismaFilter.mode = 'insensitive';
//       break;

//     case 'gte':
//       prismaFilter.gte = value;
//       break;

//     case 'lte':
//       prismaFilter.lte = value;
//       break;

//     default:
//       prismaFilter.contains = value;
//       prismaFilter.mode = 'insensitive';
//   }

//   /* =====================
//    * Campos anidados
//    * ===================== */
//   const path = field.split('.');
//   let nested: any = prismaFilter;

//   for (let i = path.length - 1; i >= 0; i--) {
//     nested = { [path[i]]: nested };
//   }

//   return nested;
// }

export function mapPrimeConstraintToPrisma(
  field: string,
  constraint: any,
): Record<string, any> {
  const matchMode = constraint.matchMode ?? 'contains';
  let value = constraint.value;

  // PrimeNG a veces manda Date
  if (value instanceof Date) {
    value = value.toISOString();
  }

  // Helpers de tipo
  const numericValue =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value !== '' && !isNaN(Number(value))
        ? Number(value)
        : null;

  const prismaFilter: any = {};

  switch (matchMode) {
    /* =====================
     * Fechas (tu sistema: YYYY-MM-DD string)
     * ===================== */
    case 'dateIs': {
      const normalized = normalizeDateToYMD(value);
      if (normalized) {
        prismaFilter.equals = normalized;
      }
      break;
    }

    case 'dateAfter': {
      // Si tu campo en DB es YYYY-MM-DD string, conviene normalizar a YMD
      // Si este campo en particular es DateTime, puedes mantener buildUtcDayRange.
      const normalized = normalizeDateToYMD(value);
      if (normalized) {
        prismaFilter.gte = normalized;
      }
      break;
    }

    case 'dateBefore': {
      const normalized = normalizeDateToYMD(value);
      if (normalized) {
        prismaFilter.lte = normalized;
      }
      break;
    }

    /* =====================
     * Numéricos (Importe / Folios / etc.)
     * PrimeNG numeric filter: equals, notEquals, lt, lte, gt, gte
     * ===================== */
    case 'equals': {
      // Si viene número, es filtro numérico; si no, es texto
      if (numericValue !== null) {
        prismaFilter.equals = numericValue;
      } else {
        prismaFilter.equals = value;
      }
      break;
    }

    case 'notEquals': {
      if (numericValue !== null) {
        prismaFilter.not = numericValue;
      } else {
        prismaFilter.not = value;
      }
      break;
    }

    case 'lt': {
      if (numericValue === null) return {};
      prismaFilter.lt = numericValue;
      break;
    }

    case 'gt': {
      if (numericValue === null) return {};
      prismaFilter.gt = numericValue;
      break;
    }

    case 'gte': {
      // gte puede ser numérico o incluso string comparable; para importe es numérico
      prismaFilter.gte = numericValue ?? value;
      break;
    }

    case 'lte': {
      prismaFilter.lte = numericValue ?? value;
      break;
    }

    /* =====================
     * Texto
     * ===================== */
    case 'startsWith':
    case 'contains':
    case 'endsWith':
      prismaFilter[matchMode] = value;
      prismaFilter.mode = 'insensitive';
      break;

    default:
      // Fallback de texto
      prismaFilter.contains = value;
      prismaFilter.mode = 'insensitive';
  }

  /* =====================
   * Campos anidados (tu estructura)
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
