import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { Grupo } from 'src/estructura/grupos/entities/grupo.entity';

@ObjectType()
export class Rubro {

  @Field(() => ID)
  R03Id: string;

  @Field(() => ID)
  R03G_id: string;

  @Field(() => String)
  R03Nom: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  R03Creado_en: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  R03Actualizado_en: Date;

  @Field(() => Grupo, { nullable: true }) // ⚠️ nullable en caso de que no esté cargado
  grupo?: Grupo;
}
