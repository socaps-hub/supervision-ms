import { ArgsType, Field } from "@nestjs/graphql";
import { Usuario } from "src/common/entities/usuario.entity";

@ArgsType()
export class UserArg {

    @Field(() => Usuario)
    usuario: Usuario

}