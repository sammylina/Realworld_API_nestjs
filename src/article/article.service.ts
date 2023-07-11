import { UseInterceptors, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article } from './entities/article.entity';
import { Db, FindOperator, Like, Repository } from 'typeorm';
import { ProfileService } from 'src/profile/profile.service';
import { User } from 'src/user/entity/user.entity';
import { Follow } from 'src/profile/entities/follow.entity';
import { timeStamp } from 'console';
import { CommentEntity } from './entities/comment.entity';
import { use } from 'passport';

@Injectable()
export class ArticleService {
  
  constructor(
    @InjectRepository(Article) private articleRepository: Repository<Article>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Follow) private followRepository: Repository<Follow>,
    @InjectRepository(CommentEntity) private commentRepository: Repository<CommentEntity>,
  ) {}

  async create(authorId: string, authorUsername: string, createArticleDto: CreateArticleDto) {

    const { title, description, tagList, body} = createArticleDto;
    const _article = new Article()
    _article.title = title;
    _article.description = description;
    _article.tags = tagList || [];
    _article.body = body;
     
    const _user = await this.userRepository.findOneBy({id: authorId})
    const following = await this.followRepository.findOneBy({'followerId': authorId, 'followingId': _user.id});
    _article.author = _user;
    const article = await this.articleRepository.save(_article);
   `` 
    const author = {
      username: _user.username,
      bio: _user.bio,
      image: _user.image,
      following: following ? true : false
    }
    return {article, author}
  }

  async feeds(userId, query) {
    console.log('feeds: ', userId, query)
    const _follows = await this.followRepository.find({where: {followerId: userId}});
    console.log("follows: ", _follows)

    if (!(Array.isArray(_follows) && _follows.length > 0)) {
      return {articles: [], articlesCount: 0};
    }

    const ids = _follows.map(el => el.followingId);

    const qb = await this.articleRepository
      .createQueryBuilder('article')
      .where('article.authorId IN (:ids)', { ids });

    qb.orderBy('article.createdAt', 'DESC');

    const articlesCount = await qb.getCount();

    if ('limit' in query) {
      qb.limit(query.limit);
    }

    if ('offset' in query) {
      qb.offset(query.offset);
    }

    qb.leftJoinAndMapMany

    const articles = await qb.getMany();

    return {articles, articlesCount};
  }

  async findArticles(queryString, userId) {
    const user = await this.userRepository.findOne({
      relations: {favorites: true},
      where: {id: userId},
    })

    if (queryString.tag) {
      return await this.filterByTag(queryString.tag, user)
    }

    else if (queryString.author) {
      return await this.filterByAuthor(queryString.author, user)
    }
    
    else if (queryString.favorited) {
    const favoritedUser = await this.userRepository.findOne({
      where: {username: queryString.favorited},
    })
      const favoritedUserId = favoritedUser ? favoritedUser.id : null;
      return await this.favoritedBy(favoritedUserId, user)
    }
    else {
      const _user = user ? user : {id: null, favorites: []}
      const dbResponse = await this.userRepository.query(
          `

          select   a.slug, 
                   a.id,
                   a.title,
                   a.description,
                   a.body,
                   a.tags,
                   a.favoriteCount,
                   a.createdAt,
                   a.updatedAt,
                   u.username, 
                   u.bio,
                   u.image,
                   concat(f.followingId, f.followerId) following
          from article a 
          left join user u on u.id = a.authorId
          left join user_follow_users f on f.followerId = '${_user.id}' and f.followingId = u.id
          `
        )
      const userFavorites = _user.favorites.map(article => article.id)
      console.log("logged in user favorites: ", userFavorites)
      const articles = []
      dbResponse.forEach((elem, idx) => {
        const {username, bio, image, following, ...article} = elem;
        console.log("each elem: ", userFavorites.includes(article.id), article.slug, article.id)
        articles.push({
          ...article,
          author: {username, bio, image, following},
          favorited: userFavorites.includes(article.id)
        })
      });
    return {articles, articlesCount: articles.length}
    }
  }

  async favoritedBy(favoritedUserId, loggedInUser) {
    const user = loggedInUser ? loggedInUser : {id: null, favorites: []}
    const dbResponse = await this.userRepository.query(
      `

      select   a.slug, 
               a.id,
               a.title,
               a.description,
               a.body,
               a.tags,
               a.favoriteCount,
               a.createdAt,
               a.updatedAt,
               u.username, 
               u.bio,
               u.image,
               concat(f.followingId, f.followerId) following
      from article a 
      right join ( 
        select * from user_favorites_article uf
        where uf.userId = '${favoritedUserId}' 
      ) o on o.articleId = a.id
      left join user u on u.id = a.authorId
      left join user_follow_users f on f.followerId = '${user.id}' and f.followingId = u.id


      `
    )
      const userFavorites = user.favorites.map(article => article.id)
      const articles = []
      dbResponse.forEach((elem, idx) => {
        const {username, bio, image, following, ...article} = elem;
        articles.push({
          ...article,
          author: {username, bio, image, following},
          favorited: userFavorites.includes(article.id)
        })
      });
    return {articles, articlesCount: articles.length}
  }

  async filterByAuthor(author, loggedInUser) {
    const user = loggedInUser ? loggedInUser : {id: null, favorites: []}
    const dbResponse = await this.articleRepository.query(
      `
        select a.slug, 
               a.id,
               a.title,
               a.description,
               a.body,
               a.tags,
               a.favoriteCount,
               a.createdAt,
               a.updatedAt,
               u.username, 
               u.bio,
               u.image,
               concat(f.followingId, f.followerId) following
        from article a
        left join user u on u.id = a.authorId
        left join user_follow_users f on f.followerId = '${user.id}' and f.followingId = u.id
        where u.username = '${author}'

      `
    )
      const userFavorites = user.favorites.map(article => article.id)
      const articles = []
      dbResponse.forEach((elem, idx) => {
        const {username, bio, image, following, ...article} = elem;
        articles.push({
          ...article,
          author: {username, bio, image, following},
          favorited: userFavorites.includes(article.id)
        })
      });
    return {articles, articlesCount: articles.length}
  }

  async filterByTag(tag, loggedInUser) {

    const user = loggedInUser ? loggedInUser : {id: null, favorites: []}
    const dbResponse = await this.articleRepository.query(
      `
        select a.slug, 
               a.id,
               a.title,
               a.description,
               a.body,
               a.tags,
               a.favoriteCount,
               a.createdAt,
               a.updatedAt,
               u.username, 
               u.bio,
               u.image,
               concat(f.followingId, f.followerId) following
        from article a
        left join user u on u.id = a.authorId
        left join user_follow_users f on f.followerId = '${user.id}' and f.followingId = u.id
        where a.tags like '%${tag}%'
      `
    )
      const userFavorites = user.favorites.map(article => article.id)
      const articles = []
      console.log("db repose for eatch: ", dbResponse)
      dbResponse.forEach((elem, idx) => {
        const {username, bio, image, following, ...article} = elem;
        articles.push({
          ...article,
          author: {username, bio, image, following},
          favorited: userFavorites.includes(article.id)
        })
      });

    return {articles, articlesCount: articles.length}
  }

  async findOne({slug}:any) {
    return await this.articleRepository.findOne({where: {slug}, relations: ['author']})
  }

  async favorite(userId: string, slug: string) {
    
    console.log("who said this is my favorite: ", userId)
    const articleIsFavorite = await this.userRepository.findOne({
      relations: {favorites: true},
      where: {
        id: userId,
        favorites: {slug}
      }
    });

    if (articleIsFavorite)
    {
      throw new HttpException({errors : ['article is favorite alreay']}, HttpStatus.BAD_REQUEST)
    }
    const _article = await this.articleRepository.findOne({
      relations: {author: true},
      where: {slug},
    })
    console.log("the article we are now favoriting: ", _article)
    if (!_article) {
      throw new HttpException({errors : ['article dose\'t exist']}, HttpStatus.BAD_REQUEST)
    }

    const _userPopulated = await this.userRepository.findOne({
      relations: {favorites: true},
      where: {id: userId}
    })

    console.log("article favoriting: ", _article)

    _article.favoriteCount += 1;
    _userPopulated.favorites.push(_article)

    const article = await this.articleRepository.save(_article)
    const user = await this.userRepository.save(_userPopulated)
    const following = await this.followRepository.findOneBy({'followerId': userId, 'followingId': article.author.id});


    const author = {
      username: article.author.username,
      bio: article.author.bio,
      image: article.author.image,
      following: following ? true : false
    }

    return {article, author}
  }

  async unFavorite(userId: string, slug: string)
  {
    const articleIsFavorite = await this.userRepository.findOne({
      relations: {favorites: true},
      where: {
        id: userId,
        favorites: {slug}
      }
    })


    if (!articleIsFavorite) {
      throw new HttpException({errors : ['article is not favorite already']}, HttpStatus.BAD_REQUEST)
    }

    const _user = await this.userRepository.findOne({
      relations: {favorites: true},
      where: {id: userId}
    })
    const _article = await this.articleRepository.findOne({
      relations: {author: true},
      where: {slug},
    })

    _user.favorites = _user.favorites.filter(article => {
      return article.id !== _article.id
    })
    _article.favoriteCount -= 1;

    const article = await this.articleRepository.save(_article)
    const user = await this.userRepository.save(_user)
    const following = await this.followRepository.findOneBy({'followerId': user.id, 'followingId': article.author.id});

    const author = {
      username: article.author.username,
      bio: article.author.bio,
      image: article.author.image,
      following: following ? true : false
    }

    return {article, author}

  }

  async addComment(commentDto, article_slug, userId) {
    const _article = await this.articleRepository.findOne({
      relations: {comments: true, author: true},
      where: {slug: article_slug}
    })

    const _user = await this.userRepository.findOneBy({id: userId})
    
    const following = await this.followRepository.findOneBy({'followerId': userId, 'followingId': _article.author.id});

    const author = {
      username: _user.username,
      bio: _user.bio,
      image: _user.image,
      following: following ? true : false
    }

    const _comment = new CommentEntity()

    // Create comment 
    _comment.body = commentDto.body;
    _comment.author = _user;
    const comment = await this.commentRepository.save(_comment)
   
    _article.comments.push(comment)
    await this.articleRepository.save(_article)
    
    delete comment.author;
    return {comment, author}
  }
}
