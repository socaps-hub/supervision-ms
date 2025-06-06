import { Field } from "@nestjs/graphql";
import { CreateProductoInput } from "../inputs/create-producto.input";
import { Usuario } from "src/sisconcre/usuarios/entities/usuario.entity";

export class CreateProductArgs {

    @Field( () => CreateProductoInput )
    createProductoInput: CreateProductoInput

    @Field( () => Usuario )
    usuario: Usuario

}