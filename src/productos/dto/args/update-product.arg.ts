import { Usuario } from "src/usuarios/entities/usuario.entity";
import { Field } from "@nestjs/graphql";
import { UpdateProductoInput } from "../inputs/update-producto.input";

export class UpdateProductArgs {

    @Field( () => UpdateProductoInput )
    updateProductoInput: UpdateProductoInput

    @Field( () => Usuario )
    usuario: Usuario

}