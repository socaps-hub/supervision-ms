
import { ArgsType, Field } from "@nestjs/graphql";
import { IsOptional, IsString } from "class-validator";
import { ValidRoles } from "src/common/valid-roles.enum";

@ArgsType()
export class ValidRolesArgs {

    @Field( () => ValidRoles, { nullable: true })
    @IsString()
    @IsOptional()
    role: ValidRoles

}
