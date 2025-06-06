import { Usuario } from "src/usuarios/entities/usuario.entity";
import { CreateProductoInput } from "../inputs/create-producto.input";
import { Field } from "@nestjs/graphql";

export class CreateProductArgs {

    @Field( () => CreateProductoInput )
    createProductoInput: CreateProductoInput

    @Field( () => Usuario )
    usuario: Usuario

}