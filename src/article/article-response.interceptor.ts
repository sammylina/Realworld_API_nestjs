import { CallHandler, Injectable, NestInterceptor, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from 'rxjs/operators'


@Injectable()
export class ArticleReponseInterceptor implements NestInterceptor {

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {

        return next.handle().pipe(
            map(({article, author}) => {
                return {...article, author}
            })
        )
    }
}

@Injectable()
export class CommentResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        return next.handle().pipe(
            map(({comment, author}) => {
                return {...comment, author}
            })
        )
    }
}