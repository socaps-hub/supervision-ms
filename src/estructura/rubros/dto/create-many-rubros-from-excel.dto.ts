import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateManyRubrosFromExcelDto {
    
    @Field(() => String)
    @IsString()
    Nombre: string;
    
    @Field(() => String)
    @IsString()
    Grupo: string;
}
