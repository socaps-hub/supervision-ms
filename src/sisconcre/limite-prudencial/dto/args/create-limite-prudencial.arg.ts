import { Field } from "@nestjs/graphql";
import { CreateLimitePrudencialInput } from "../inputs/create-limite-prudencial.input";
import { Usuario } from "src/sisconcre/usuarios/entities/usuario.entity";

export class CreateLimitePrudencialArgs {

    @Field( () => CreateLimitePrudencialInput )
    createLimitePrudencialInput: CreateLimitePrudencialInput

    @Field( () => Usuario )
    usuario: Usuario

}