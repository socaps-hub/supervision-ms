import { IsString } from "class-validator";
import { Field, InputType } from "@nestjs/graphql";
import { GrupoTipo as GrupoType } from "@prisma/client";
import { GrupoTipo } from "../enums/grupo-type-enum";


@InputType()
export class CreateManyGruposFromExcelDto {

    @Field(() => String)
    @IsString()
    Nombre: string;

    @Field(() => GrupoTipo)
    @IsString()
    Tipo: GrupoType;

}
