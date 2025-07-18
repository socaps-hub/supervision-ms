import { InputType, Field, Int, PartialType, ID } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CreateEvaluacionResumenFase3Input } from './create-resumen-fase3.input';

@InputType()
export class UpdateEvaluacionResumenFase3Input extends PartialType(CreateEvaluacionResumenFase3Input) {
    @Field(() => ID)
    @IsString()
    id: string; // Esto será R10P_num como identificador
}
