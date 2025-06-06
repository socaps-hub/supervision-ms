import { Field } from "@nestjs/graphql";
import { CreateUsuarioInput } from "../inputs/create-usuario.input";
import { IsNotEmpty } from "class-validator";
import { Usuario } from "../../entities/usuario.entity";

export class CreateUsuarioArgs {

    @Field( () => CreateUsuarioInput )
    @IsNotEmpty()
    createUsuarioInput: CreateUsuarioInput

    @Field( () => Usuario )
    @IsNotEmpty()
    usuario: Usuario

}