import { Controller, Get, Post, Body, Patch, Req, Param, Delete, ValidationPipe, UseInterceptors, Query, UseGuards } from '@nestjs/common';
import { UserD } from 'src/user/dto/user.decorator';
import { User } from 'src/user/entity/user.entity';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleReponseInterceptor, CommentResponseInterceptor } from './article-response.interceptor';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentRO } from './dto/article.interface';
import { JwtAuthGuard } from 'src/profile/auth.guard';
import { OptionalJwtAuthGuard } from 'src/profile/optionalauth.guard';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(new ArticleReponseInterceptor())
  async create(@Body('article', ValidationPipe) createArticleDto: CreateArticleDto, @UserD() user: User) {
    return await this.articleService.create(user.id, user.username, createArticleDto);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  getArticles(@Query() queryString: any, @UserD('id') userId: string) {
    //return this.articleService.findArticles(queryString, userId);
    return this.articleService.findArticles(queryString, userId)
  }

  @UseGuards(JwtAuthGuard)
  @Get('/feed')
  getFeeds( @Query() queryString: any,  @UserD('id') loggedInUserId: string) {
    return this.articleService.feeds(loggedInUserId, queryString)
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const article = await this.articleService.findOne({slug});
    return {article}
  }

  @UseGuards(JwtAuthGuard)
  @Post(":slug/favorite")
  @UseInterceptors(new ArticleReponseInterceptor())
  async favorite(@UserD('id') userId, @Param('slug') slug: string) {
    return await this.articleService.favorite(userId, slug)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":slug/favorite")
  @UseInterceptors(new ArticleReponseInterceptor())
  async unfavorite(@UserD('id') userId, @Param('slug') slug: string) {
    return await this.articleService.unFavorite(userId, slug)
  }

  @Post(":slug/comments")
  @UseInterceptors(new CommentResponseInterceptor())
  async createComment(
    @Param('slug') article_slug: string, 
    @Body('comment', ValidationPipe) comment: CreateCommentDto, 
    @UserD('id') userId: any
  ) {
    return await this.articleService.addComment(comment, article_slug, userId)
  }
}
