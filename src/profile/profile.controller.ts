import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserService } from 'src/user/user.service';
import { ProfileResponse } from './dto/profile-response.interface';
import { UserD } from 'src/user/dto/user.decorator';
import { JwtAuthGuard } from './auth.guard';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from './optionalauth.guard';
import { ProfileUsernameDto } from './dto/profile-param.dto';

@ApiBearerAuth()
@ApiTags()
@Controller()
export class ProfileController {
  constructor(private readonly profileService: ProfileService, private userService: UserService) {}

 
  @UseGuards(OptionalJwtAuthGuard)
  @Get('profiles/:username')
  async getProfile(@Param('username') profileUsername, @UserD('id') userId: string) {
    console.log("ger profile: ", profileUsername, userId)
    const profile = await this.profileService.getProfile(userId, profileUsername);
    return {profile: profile}
  }

  @UseGuards(JwtAuthGuard)
  @Post('profiles/:username/follow')
  async followUser(@UserD('id') userId: number, @Param('username') profileUsername) {

    const profile = await this.profileService.followProfile(userId, profileUsername);
    return {profile}
  }

  @UseGuards(JwtAuthGuard)
  @Delete('profiles/:username/unfollow')
  async unfollowUser(@UserD('id') userId: number, @Param('username') profileUsername: string) {
    const profile = await this.profileService.unFollowProfile(userId, profileUsername)
    return {profile}
  }

 // @Post()
 // create(@Body() createProfileDto: CreateProfileDto) {
 //   return this.profileService.create(createProfileDto);
 // }

 // @Get()
 // findAll() {
 //   return this.profileService.findAll();
 // }

 // @Get(':id')
 // findOne(@Param('id') id: string) {
 //   return this.profileService.findOne(+id);
 // }

 // @Patch(':id')
 // update(@Param('id') id: string, @Body() updateProfileDto: UpdateProfileDto) {
 //   return this.profileService.update(+id, updateProfileDto);
 // }

 // @Delete(':id')
 // remove(@Param('id') id: string) {
 //   return this.profileService.remove(+id);
 // }
}
