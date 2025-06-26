import { R01Prestamo } from '@prisma/client';
import { Prestamo } from '../entities/solicitud.entity';

export function mapR01ToPrestamo(data: R01Prestamo): Prestamo {
  return {
    R01NUM: data.R01NUM,
    R01Suc_id: data.R01Suc_id,
    R01Nso: data.R01Nso,
    R01Nom: data.R01Nom,
    R01Cat_id: data.R01Cat_id,
    R01Pro_id: data.R01Pro_id,
    R01Imp: data.R01Imp.toNumber(), // conversión de Decimal a number
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
    R01Est: data.R01Est,
    R01Activ: data.R01Activ,
    R01Coop_id: data.R01Coop_id,
    R01Creado_en: data.R01Creado_en,
    R01Actualizado_en: data.R01Actualizado_en,
  };
}
