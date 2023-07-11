import { Controller, Get, Post, Body, Req, ValidationPipe, Inject, UsePipes, HttpException, Put, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import {CreateUserDto} from './dto/create-user.dto'
import { LoginDto } from './dto/login.dto';
import { UserD } from './dto/user.decorator';
import { UserRO } from './dto/user.interface';
import { UpdateUserDto } from './dto/update-user.dto';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';


@ApiBearerAuth()
@ApiTags('user')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}


  @Get('user')
  findByEmail(@UserD('email') email: string) : Promise<UserRO> {
    return this.userService.findBy('email', email)
  } 

  @Put('user')
  updateUser(@UserD('id') userId: string, @Body('user', new ValidationPipe({whitelist: true})) userData: UpdateUserDto) : Promise<UserRO>{
    return this.userService.updateUser(userId, userData)
  }

  @Post('users')
  async create(@Body('user', new ValidationPipe({whitelist: true})) userData: CreateUserDto) {
    const response = await this.userService.create(userData)
    return response;
  }  
  
  @Post('users/login')
  async login(@Body('user', ValidationPipe) loginCredentials: LoginDto) {
    const _user = await this.userService.findOne(loginCredentials)

    if (!_user) {
      throw new HttpException({errors:['invalid credentials']}, HttpStatus.FORBIDDEN)
    }

    return this.userService.buildUser(_user)
  }


}
