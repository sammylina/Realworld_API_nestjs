import { CanActivate, ExecutionContext, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import * as jwt from 'jsonwebtoken'
import { User } from "src/user/entity/user.entity";
import { UserService } from "src/user/user.service";
import { JwtAuthGuard } from "./auth.guard";
import { UserData } from "src/user/dto/user.interface";

@Injectable()
export class OptionalJwtAuthGuard extends JwtAuthGuard{

    constructor(@Inject(UserService) userService) {
        super(userService);
    }

    OptionalAuthentication(req: any): boolean {
        console.log("optional authentcation")
        req.user = {id: 'fake_id'}    
        return true;
    }
}
