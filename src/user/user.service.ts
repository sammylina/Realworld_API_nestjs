import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './entity/user.entity';
const jwt = require('jsonwebtoken')
import * as argon2 from 'argon2';
import { Follow } from 'src/profile/entities/follow.entity';
import { UserRO } from './dto/user.interface';

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async create(createUserDto: CreateUserDto){
        const {username, email} = createUserDto;
        const _user = await this.userRepository.findOne({
            where: [{username}, {email}]
        })

        if (_user) {
            throw new HttpException({errors: ['Email or Username must be unique']}, HttpStatus.BAD_REQUEST)
        }
        const newUser = await this.userRepository.create(createUserDto)
        const savedUser = await this.userRepository.save(newUser)
        return this.buildUser(savedUser)
    }

    async findBy(key, value): Promise<UserRO> {
        const user = await this.userRepository.findOneBy({
            [key]: value
        })
        if (!user) {
            return null;
        }
        return this.buildUser(user);
    }

    async findOne({email, password}: LoginDto): Promise<User> {
        const user = await this.userRepository.findOne({
            where: {email}
        })
        if (!user) {
            throw new HttpException({errors: ['user not found']}, HttpStatus.UNAUTHORIZED)
        }
        const validPassword = await argon2.verify(user.password, password)
        if (validPassword) {
            return user;
        }
    }

    async updateUser(userId, userData) {

        const _user = await this.userRepository.findOneBy({id: userId})
        if (!_user) return;

        // if update user data is empty
        if (Object.keys(userData).length === 0) {
            return this.buildUser(_user)
        }

        // check is the username or email is already used
        let existedUser;
        if (userData.email || userData.username) {
            existedUser = await this.userRepository.findOne({
                where: [{username: userData.username}, {email: userData.email}]
            })
        }
        if (existedUser) {
            throw new HttpException({errors: ['Email or Username is already taken']}, HttpStatus.BAD_REQUEST)
        }
        delete _user.password;

        const updatedUser = {..._user, ...userData}
        console.log("udpated user: ", updatedUser)
        const user = await this.userRepository.save(updatedUser);
        return this.buildUser(user)
    }


    generateToken(user) {
        return jwt.sign({
            id: user.id,
            email: user.email
        }, 'secret')
    }

    buildUser(user: User) {
        
        const userCreatedResponse = {
            id: user.id,
            username: user.username,
            email: user.email, 
            bio: user.bio,
            image: user.image,
            token: this.generateToken(user)
        }
        return {user: userCreatedResponse}
    }
}
