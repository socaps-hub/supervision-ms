import { Field, InputType } from "@nestjs/graphql";
import { IsString } from "class-validator";

@InputType()
export class CreateManyElementoFromExcelDto {
    @Field(() => String)
    @IsString()
    Nombre: string;
    
    @Field(() => String)
    @IsString()
    Impacto: string;
}
