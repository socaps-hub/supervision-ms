import { IsUUID } from 'class-validator';
import { CreateGrupoInput } from './create-grupo.input';
import { InputType, Field, Int, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateGrupoInput extends PartialType(CreateGrupoInput) {

  @Field(() => ID)
  @IsUUID()
  id: string;

}
