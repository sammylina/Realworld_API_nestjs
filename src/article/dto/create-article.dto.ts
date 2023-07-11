import { Type } from "class-transformer";
import { IsString, ArrayNotEmpty, IsArray, IsNotEmpty, IsNotEmptyObject, IsOptional } from "class-validator";
import { User } from "src/user/entity/user.entity";

export class CreateArticleDto {

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsString()
    body: string;

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    @IsString({each: true})
    tagList: string[]
}
