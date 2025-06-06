import { Field } from "@nestjs/graphql";
import { CreateCategoriaInput } from "../inputs/create-categoria.input";
import { Usuario } from "src/sisconcre/usuarios/entities/usuario.entity";

export class CreateCategoriaArgs {

    @Field( () => CreateCategoriaInput )
    createCategoriaInput: CreateCategoriaInput

    @Field( () => Usuario )
    usuario: Usuario

}