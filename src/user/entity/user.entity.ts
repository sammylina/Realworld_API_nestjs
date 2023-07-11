import {Entity, Column, PrimaryGeneratedColumn, BeforeInsert, CreateDateColumn, UpdateDateColumn, AfterInsert, OneToMany, ManyToMany, JoinColumn, JoinTable, OneToOne, BeforeUpdate, Unique} from 'typeorm'
import * as argon2 from 'argon2'
import { Article } from 'src/article/entities/article.entity';
import { ProfileService } from 'src/profile/profile.service';
import { CommentEntity } from 'src/article/entities/comment.entity';
import { IsEmail } from 'class-validator';

@Entity()
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    username: string;

    @Column({unique: true})
    email: string;

    @Column({default: ''})
    bio: string;

    @Column({default: ''})
    image: string;

    @Column()
    password: string;

    @ManyToMany(() => Article)
    @JoinTable()
    favorites: Article[]

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        console.log("hashing the password")
        this.password = await argon2.hash(this.password)
    }

    async profileJson(profileService, article_author_id, userId) {
        return await profileService.getProfile(article_author_id, this.username)
    }
}
