import { Field, ID, ObjectType } from '@nestjs/graphql';
import { ResFaseIII as ResFIII, ResFaseI as ResFI } from '@prisma/client';
import { ResFaseII as ResFII } from '@prisma/client';
import { Elemento } from 'src/estructura/elementos/entities/elemento.entity';
import { Prestamo } from 'src/sisconcre/solicitudes/entities/solicitud.entity';
import { ResFaseII } from 'src/sisconcre/solicitudes/enums/evaluacion-fase2.enum';
import { ResFaseIII } from 'src/sisconcre/solicitudes/enums/evaluacion-fase3.enum';
import { ResFaseI } from 'src/sisconcre/solicitudes/enums/evaluacion.enum';

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
