import { Field, ID, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsArray, IsUUID, ValidateNested } from "class-validator";
import { CreateManyRubrosFromExcelDto } from '../create-many-rubros-from-excel.dto';


@InputType()
export class CreateManyRubrosFromExcelArgs {

    @Field(() => [CreateManyRubrosFromExcelDto])
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateManyRubrosFromExcelDto)
    data: CreateManyRubrosFromExcelDto[]

    @Field(() => ID)
    @IsUUID()
    coopId: string

}