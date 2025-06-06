import { Field } from "@nestjs/graphql";
import { UpdateProductoInput } from "../inputs/update-producto.input";
import { Usuario } from "src/sisconcre/usuarios/entities/usuario.entity";

export class UpdateProductArgs {

    @Field( () => UpdateProductoInput )
    updateProductoInput: UpdateProductoInput

    @Field( () => Usuario )
    usuario: Usuario

}