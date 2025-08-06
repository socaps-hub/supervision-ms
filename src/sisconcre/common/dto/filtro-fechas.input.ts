import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class FiltroFechasInput {
  @Field(() => String)
  @IsString()
  fechaInicio: string; // formato ISO
  
  @Field(() => String)
  @IsString()
  fechaFinal: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  grupoId?: string; // UUID del grupo si se desea filtrar
}
