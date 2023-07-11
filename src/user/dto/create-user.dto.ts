import {IsEmail, IsNotEmpty, IsOptional, IsString, MinLength} from 'class-validator'


export class CreateUserDto {

    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @MinLength(4)
    password: string;

    @IsOptional()
    bio: string;

    @IsOptional()
    image: string;
}
