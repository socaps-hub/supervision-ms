import { Field, ID, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsArray, IsUUID, ValidateNested } from "class-validator";
import { CreateManyElementoFromExcelDto } from '../create-many-elementos-from-excel.dto';


@InputType()
export class CreateManyElementosFromExcelArgs {

    @Field(() => [CreateManyElementoFromExcelDto])
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateManyElementoFromExcelDto)
    data: CreateManyElementoFromExcelDto[]

    @Field(() => ID)
    @IsUUID()
    rubroId: string

}