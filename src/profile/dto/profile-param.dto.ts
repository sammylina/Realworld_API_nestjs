import { IsNotEmpty, IsString } from "class-validator";

export class ProfileUsernameDto{
    @IsString()
    username: string;
}