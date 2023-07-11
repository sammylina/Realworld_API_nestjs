import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import * as jwt from 'jsonwebtoken'


export const UserD = createParamDecorator((data: string, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    console.log("loggedIN user: ", req.user)
    if (req.user) {
        return data ? req.user[data] : req.user
    }

    //const [_, token] = req.headers.authorization.split(' ')
    //else if (token) {
    //    const _user = jwt.verify(token, 'secret')
    //    return data ? _user[data] : _user;
    //}

})