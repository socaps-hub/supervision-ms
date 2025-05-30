import { IsString, MinLength } from "class-validator";

export class LoginUserDto {

    @IsString()
    ni: string

    @IsString()
    @MinLength(6)
    password: string

}
