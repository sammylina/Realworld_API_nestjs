import { IsEmail, IsOptional, MinLength } from "class-validator";


export class UpdateUserDto {

    @IsOptional()
    @MinLength(1)
    username?: string;
    
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @MinLength(1)
    image?: string;
    
    @IsOptional()
    @MinLength(1)
    bio?: string;
}