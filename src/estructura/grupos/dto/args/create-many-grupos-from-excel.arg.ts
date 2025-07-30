import { Field, ID, InputType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { IsArray, IsUUID, ValidateNested } from "class-validator";
import { CreateManyGruposFromExcelDto } from "../create-many-grupos-from-excel.dto";


@InputType()
export class CreateManyGruposFromExcelArgs {

    @Field(() => [CreateManyGruposFromExcelDto])
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateManyGruposFromExcelDto)
    data: CreateManyGruposFromExcelDto[]

    @Field(() => ID)
    @IsUUID()
    coopId: string

}