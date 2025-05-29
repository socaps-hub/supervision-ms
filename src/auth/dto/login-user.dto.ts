import { IsString } from "class-validator";

export class LoginUserDto {

    @IsString()
    ni: string

}
