import { ArgsType, Field } from "@nestjs/graphql";
import { Usuario } from "src/sisconcre/usuarios/entities/usuario.entity";

@ArgsType()
export class UserArg {

    @Field(() => Usuario)
    usuario: Usuario

}