import { Field } from "@nestjs/graphql"
import { IsString } from "class-validator"
import { Usuario } from "src/usuarios/entities/usuario.entity"

export class ActivateProductArgs {

    @Field( () => String )
    @IsString()
    name: string
    
    @Field( () => Usuario )
    usuario: Usuario

}