import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Movimiento as Mov, Figura } from '@prisma/client';

import { FiguraEnum } from '../enums/figura.enum';
import { MovimientoEnum } from '../enums/movimiento.enum';
import { SisconcapEvaluacionFase1 } from 'src/sisconcap/fase1-registro/evaluacion-fase1/entities/sisconcap-evaluacion-fase1.entity';
import { SisconcapEvaluacionResumenFase1 } from 'src/sisconcap/fase1-registro/resumen-fase1/entities/sisconcap-resumen-fase1.entity';
import { Sucursal } from 'src/common/entities/sucursal.entity';

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
}