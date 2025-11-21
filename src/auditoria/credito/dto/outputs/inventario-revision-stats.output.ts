import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class InventarioRevisionStatsOutput {

  @Field(() => Int)
  totalCreditos: number;

  @Field(() => Int)
  totalHallazgos: number;

  @Field(() => Int)
  calA_correctos: number;

  @Field(() => Int)
  calA_deficientes: number;

  @Field(() => Int)
  calB_completos: number;

  @Field(() => Int)
  calB_aceptables: number;

  @Field(() => Int)
  calB_graves: number;
}
