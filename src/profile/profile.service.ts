import { Get, HttpException, HttpStatus, Inject, Injectable, Param, Req } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { UserD } from 'src/user/dto/user.decorator';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Follow } from './entities/follow.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileUsernameDto } from './dto/profile-param.dto';

@Injectable()
export class ProfileService {

  constructor(@InjectRepository(Follow) private followRepository: Repository<Follow>,  private userService: UserService) {}

  async getProfile(userId: string, profileUsername) {
    const _profile = await this.userService.findBy('username', profileUsername);
    let _userProfile;
    
    if (_profile) {
      _userProfile = _profile.user;
    }
    if (!_profile) {
      throw new HttpException({errors: ['profile not found']}, HttpStatus.BAD_REQUEST)
    }
    console.log("follower Id: ", userId)

    const following = await this.followRepository.findOne({where: {followerId: userId, followingId: _userProfile.id}});
    console.log("following: ", following)

    const profile = {
      username: _userProfile.username,
      bio: _userProfile.bio,
      image: _userProfile.image,
      following: following ? true : false
    }

    return profile;

  }

  async followProfile(@UserD('id') _id, profileUsername) {
    
    const userProfile = await this.userService.findBy('username', profileUsername )
    let _profile;
    if (!userProfile) {
      throw new HttpException({errors: ['profile not found']}, HttpStatus.BAD_REQUEST)
    }
    _profile = userProfile.user;
    if (_profile.id === _id) {
      throw new HttpException({errors: ['User can\'t follow itself']}, HttpStatus.BAD_REQUEST)
    }
    const _follow = await this.followRepository.findOneBy({followerId: _id, followingId: _profile.id})

    if (!_follow) {
      const newFollow = new Follow();
      newFollow.followerId = _id;
      newFollow.followingId = _profile.id;
      await this.followRepository.save(newFollow)
    }

    const profile = {
      username: _profile.username,
      bio: _profile.bio,
      image: _profile.image,
      following: true 
    }

    return profile;
  }

  async unFollowProfile(@UserD('id') _id, profileUsername: string) {
    if (!_id || !profileUsername) {
      throw  new HttpException('FollowerId and username not provided', HttpStatus.BAD_REQUEST)
    }

    const userProfile = await this.userService.findBy('username', profileUsername)

    if (!userProfile) {
      throw new HttpException({errors: ['profile not found']}, HttpStatus.BAD_REQUEST)
    }
    let _profile = userProfile.user;
    if (_profile.id === _id) {
      throw new HttpException({errors: ['User can\'t unfollow itself']}, HttpStatus.BAD_REQUEST)
    }

    await this.followRepository.delete({followerId: _id, followingId: _profile.id})

    const profile = {
      username: _profile.username,
      bio: _profile.bio,
      image: _profile.image,
      following: false
    }

    return profile;
  }
}
