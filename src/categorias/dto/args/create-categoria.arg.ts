import { Field } from "@nestjs/graphql";
import { Usuario } from "src/usuarios/entities/usuario.entity";
import { CreateCategoriaInput } from "../inputs/create-categoria.input";

export class CreateCategoriaArgs {

    @Field( () => CreateCategoriaInput )
    createCategoriaInput: CreateCategoriaInput

    @Field( () => Usuario )
    usuario: Usuario

}