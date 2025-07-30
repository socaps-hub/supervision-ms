import { Field, InputType } from "@nestjs/graphql";
import { IsString } from "class-validator";


@InputType()
export class CreateManyGruposFromExcelDto {

    @Field(() => String)
    @IsString()
    Nombre: string;

}
