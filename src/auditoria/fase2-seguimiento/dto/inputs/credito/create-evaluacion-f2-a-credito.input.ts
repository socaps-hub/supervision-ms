import { IsString, IsUUID } from 'class-validator';
import { InputType, Field, Int, ID } from '@nestjs/graphql';
import { ResFaseII as ResF2 } from '@prisma/client';
import { ResFaseII } from 'src/fase-ii-seguimiento/evaluaciones-fase2/enums/evaluacion-fase2.enum';

@InputType()
export class CreateEvaluacionF2ACreditoInput {
  @Field(() => ID)
  @IsUUID()
  A05E_id: string;

  @Field(() => ResFaseII)
  @IsString()
  A05Res: ResF2;
}
