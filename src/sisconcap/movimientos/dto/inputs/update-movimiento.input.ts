import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { CreateFase1Input } from "./create-fase1.input";
import { IsNumber } from "class-validator";

@InputType()
export class UpdateMovimientoArgs extends PartialType(CreateFase1Input) {

    @Field(() => Int)
    @IsNumber()
    folio: number

}