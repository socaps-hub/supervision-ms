
import { ArgsType, Field } from "@nestjs/graphql";
import { IsString } from "class-validator";
import { ValidEstados } from "../../enums/valid-estados.enum";

@ArgsType()
export class ValidEstadosArgs {

    @Field( () => ValidEstados)
    @IsString()
    estado: ValidEstados

}
