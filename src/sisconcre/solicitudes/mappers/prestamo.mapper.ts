import { R01Prestamo } from '@prisma/client';
import { Prestamo } from '../entities/solicitud.entity';
import { EvaluacionFase2 } from 'src/fase-ii-seguimiento/evaluaciones-fase2/entities/evaluacion-fase2.entity';
import { EvaluacionResumenFase2 } from 'src/fase-ii-seguimiento/evaluaciones-fase2/resumen-fase2/entities/evaluacion-resumen-fase2.entity';
import { EvaluacionFase3 } from 'src/fase-iii-desembolso/evaluaciones-fase3/entities/evaluacion-fase3.entity';
import { EvaluacionResumenFase3 } from 'src/fase-iii-desembolso/evaluaciones-fase3/resumen-fase3/entities/resumen-fase3.entity';
import { EvaluacionFase4 } from 'src/fase-iv-seg-global/evaluaciones-fase4/entities/evaluacion-fase4.entity';
import { EvaluacionResumenFase4 } from 'src/fase-iv-seg-global/evaluaciones-fase4/resumen-fase4/entities/resumen-fase4.entity';
import { EvaluacionFase1 } from '../entities/fase1-levantamiento/evaluacion-fase1.entity';
import { EvaluacionResumenFase1 } from '../entities/fase1-levantamiento/resumen-fase1.entity';

type PrestamoWithRelaciones = R01Prestamo & {
  evaluacionesF1?: EvaluacionFase1[];
  resumenF1?: EvaluacionResumenFase1 | null;
  evaluacionesF2?: EvaluacionFase2[];
  resumenF2?: EvaluacionResumenFase2 | null;
  evaluacionesF3?: EvaluacionFase3[];
  resumenF3?: EvaluacionResumenFase3 | null;
  evaluacionesF4?: EvaluacionFase4[];
  resumenF4?: EvaluacionResumenFase4 | null;
  // Agrega evaluacionesF2, resumenF2, etc. si los necesitas
};

export function mapR01ToPrestamo(data: PrestamoWithRelaciones): Prestamo {
  return {
    R01NUM: data.R01NUM,
    R01Suc_id: data.R01Suc_id,
    R01Nso: data.R01Nso,
    R01Nom: data.R01Nom,
    R01Cat_id: data.R01Cat_id,
    R01Pro_id: data.R01Pro_id,
    R01Imp: data.R01Imp, // conversión de Decimal a number
    R01Dir: data.R01Dir,
    R01SP_id: data.R01SP_id,
    R01Ejvo_id: data.R01Ejvo_id,
    R01Fsol: data.R01Fsol.toString(),
    R01FRec: data.R01FRec.toString(),
    R01FRev: data.R01FRev.toString(),
    R01FMov: data.R01FMov.toString(),
    R01ObsA: data.R01ObsA ?? '',
    R01ObsM: data.R01ObsM ?? '',
    R01ObsB: data.R01ObsB ?? '',
    R01ObsT: data.R01ObsT ?? '',
    R01Notas: data.R01Notas ?? '',
    R01Est: data.R01Est,
    R01Activ: data.R01Activ,
    R01Coop_id: data.R01Coop_id,
    R01Creado_en: data.R01Creado_en,
    R01Actualizado_en: data.R01Actualizado_en,

    // Evaluaciones / Resumen
    evaluacionesF1: data.evaluacionesF1 || [],
    resumenF1: data.resumenF1 ? data.resumenF1 : undefined,
    evaluacionesF2: data.evaluacionesF2 || [],
    resumenF2: data.resumenF2 ? data.resumenF2 : undefined,
    evaluacionesF3: data.evaluacionesF3 || [],
    resumenF3: data.resumenF3 ? data.resumenF3 : undefined,
    evaluacionesF4: data.evaluacionesF4 || [],
    resumenF4: data.resumenF4 ? data.resumenF4 : undefined,
  };
}
