import { CanActivate, ExecutionContext, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import * as jwt from 'jsonwebtoken'
import { User } from "src/user/entity/user.entity";
import { UserService } from "src/user/user.service";

@Injectable()
export class JwtAuthGuard implements CanActivate {

    constructor(private userService: UserService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const authHeader = req.headers.authorization;
            let _user;
            if (authHeader && authHeader.split(' ')[1]) {
                const [, token] = authHeader.split(' ')
                try {
                    const decode = jwt.verify(token, 'secret')
                    _user = await this.userService.findBy('id', decode.id)
                } catch(err) {}

                if (!_user)
                {
                    return false;
                    //throw new HttpException({errors: ['user not found']}, HttpStatus.UNAUTHORIZED)
                }
                
                req.user = _user.user;
                return true
            }
            else {
                return this.OptionalAuthentication(req);
                //throw new HttpException({errors: ['unauthorized']}, HttpStatus.UNAUTHORIZED)
            }
    }

    OptionalAuthentication(req) {
        return false;
    }
}
