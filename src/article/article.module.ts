import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './entities/article.entity';
import { ProfileModule } from 'src/profile/profile.module';
import { User } from 'src/user/entity/user.entity';
import { Follow } from 'src/profile/entities/follow.entity';
import { AuthMiddleware } from 'src/user/auth.middleware';
import { CommentEntity } from './entities/comment.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Article, User, Follow, CommentEntity]), UserModule],
  controllers: [ArticleController],
  providers: [ArticleService]
})
export class ArticleModule {
}
