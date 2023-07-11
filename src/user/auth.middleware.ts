import {HttpException, HttpStatus, Injectable, NestMiddleware} from '@nestjs/common'
import * as jwt from 'jsonwebtoken'
import {Request, Response, NextFunction} from 'express';
import { UserService } from './user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(
        private userService: UserService
    ) {}

    async use(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;
        let _user;

        // if authorization header and token are provided
        if (authHeader && authHeader.split(' ')[1]) {
            const [, token] = authHeader.split(' ')

            try {
                const decode = jwt.verify(token, 'secret')
                _user = await this.userService.findBy("id", decode.id)
            } catch(err) {}

            if (!_user)
            {
                throw new HttpException({errors: ['user not found']}, HttpStatus.UNAUTHORIZED)
            }
            
            req.user = _user.user;
            next();
        }
        else {
            throw new HttpException({errors: ['unauthorized']}, HttpStatus.UNAUTHORIZED)
        }
    }
}