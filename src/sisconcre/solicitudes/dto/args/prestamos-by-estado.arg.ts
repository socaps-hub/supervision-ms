
import { ArgsType, Field } from "@nestjs/graphql";
import { IsBoolean, IsOptional, IsString } from "class-validator";
import { ValidEstados } from "../../enums/valid-estados.enum";

@ArgsType()
export class ValidEstadosArgs {

    @Field( () => ValidEstados)
    @IsString()
    estado: ValidEstados

    @Field( () => Boolean, { nullable: true, defaultValue: true })
    @IsBoolean()
    @IsOptional()
    filterBySucursal?: boolean

}
