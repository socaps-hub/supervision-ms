import { Field } from "@nestjs/graphql";
import { CreateUsuarioInput } from "../inputs/create-usuario.input";
import { Usuario } from "src/usuarios/entities/usuario.entity";
import { IsNotEmpty } from "class-validator";

export class CreateUsuarioArgs {

    @Field( () => CreateUsuarioInput )
    @IsNotEmpty()
    createUsuarioInput: CreateUsuarioInput

    @Field( () => Usuario )
    @IsNotEmpty()
    usuario: Usuario

}