import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Movimiento as Mov, Figura } from '@prisma/client';

import { FiguraEnum } from '../enums/figura.enum';
import { MovimientoEnum } from '../enums/movimiento.enum';
import { SisconcapEvaluacionFase1 } from 'src/sisconcap/fase1-registro/evaluacion-fase1/entities/sisconcap-evaluacion-fase1.entity';
import { SisconcapEvaluacionResumenFase1 } from 'src/sisconcap/fase1-registro/resumen-fase1/entities/sisconcap-resumen-fase1.entity';
import { Sucursal } from 'src/common/entities/sucursal.entity';
import { SisconcapEvaluacionFase2 } from 'src/sisconcap/fase2-seguimiento/evaluacion-fase2/entities/sisconcap-evaluacion-fase2.entity';
import { SisconcapEvaluacionResumenFase2 } from 'src/sisconcap/fase2-seguimiento/resumen-fase2/entities/sisconcap-resumen-fase2.entity';
import { SisconcapEvaluacionFase3 } from 'src/sisconcap/fase3-seguimiento-final/evaluacion-fase3/entities/sisconcap-evaluacion-fase3.entity';
import { SisconcapEvaluacionResumenFase3 } from 'src/sisconcap/fase3-seguimiento-final/resumen-fase3/entities/sisconcap-resumen-fase3.entity';

@ObjectType()
export class Movimiento {

    @Field(() => Int)
    R19Folio: number;

    @Field(() => String)
    R19Cag: string;

    @Field(() => String)
    R19Nom: string;

    @Field(() => FiguraEnum)
    R19Figura: Figura;

    @Field(() => String)
    R19Suc_id: string;

    @Field(() => MovimientoEnum)
    R19TipoMov: Mov;

    @Field(() => String)
    R19FMov: string;

    @Field(() => String)
    R19FRec: string;

    @Field(() => String)
    R19FRev: string;

    @Field(() => String)
    R19Est: string;

    @Field(() => String)
    R19Coop_id: string;

    // @Field(() => Date)
    R19Creado_en: Date;

    // @Field(() => Date)
    R19Actualizado_en: Date;

    // Relaciones
    @Field(() => Sucursal, { nullable: true })
    sucursal?: Sucursal

    @Field(() => [SisconcapEvaluacionFase1], { nullable: true })
    evaluacionFase1?: SisconcapEvaluacionFase1[];

    @Field(() => SisconcapEvaluacionResumenFase1, { nullable: true })
    evaluacionResumenFase1?: SisconcapEvaluacionResumenFase1;

    @Field(() => [SisconcapEvaluacionFase2], { nullable: true })
    evaluacionFase2?: SisconcapEvaluacionFase2[];

    @Field(() => SisconcapEvaluacionResumenFase2, { nullable: true })
    evaluacionResumenFase2?: SisconcapEvaluacionResumenFase2;

    @Field(() => [SisconcapEvaluacionFase3], { nullable: true })
    evaluacionFase3?: SisconcapEvaluacionFase3[];

    @Field(() => SisconcapEvaluacionResumenFase3, { nullable: true })
    evaluacionResumenFase3?: SisconcapEvaluacionResumenFase3;
}