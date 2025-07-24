import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ResFaseIII as ResFIII, ResFaseI as ResFI } from '@prisma/client';
import { ResFaseII as ResFII } from '@prisma/client';
import { Elemento } from 'src/estructura/elementos/entities/elemento.entity';
import { ResFaseI } from 'src/fase-i-levantamiento/evaluaciones/enums/evaluacion.enum';
import { Prestamo } from 'src/fase-i-levantamiento/solicitudes/entities/solicitud.entity';
import { ResFaseII } from 'src/fase-ii-seguimiento/evaluaciones-fase2/enums/evaluacion-fase2.enum';
import { ResFaseIII } from 'src/fase-iii-desembolso/evaluaciones-fase3/enums/evaluacion-fase3.enum';

@ObjectType()
export class EvaluacionFase4 {
  @Field(() => ID)
  R15Id: string;

  @Field()
  R15P_num: string;

  @Field()
  R15E_id: string;

  @Field(() => ResFaseII)
  R15Res: ResFII;

  @Field(() => ResFaseI, { nullable: true })
  resF1?: ResFI;

  @Field(() => ResFaseIII, { nullable: true })
  resF3?: ResFIII;

  @Field(() => Elemento, { nullable: true })
  elemento?: Elemento;

  @Field(() => Prestamo, { nullable: true })
  prestamo?: Prestamo;

}
