import { Field, InputType, Int } from "@nestjs/graphql";
import { IsNumber, IsString } from "class-validator";

@InputType()
export class CreateManyElementoFromExcelDto {
    @Field(() => String)
    @IsString()
    Nombre: string;
    
    @Field(() => String)
    @IsString()
    Impacto: string;

    @Field( () => Int)
    @IsNumber()
    Ponderacion: number;
}
