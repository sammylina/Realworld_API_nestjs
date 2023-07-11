import { AfterLoad, BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import slugify from 'slugify'
import { User } from "src/user/entity/user.entity";
import { ProfileResponse } from "src/profile/dto/profile-response.interface";
import { CommentEntity } from "./comment.entity";

@Entity()
export class Article {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    body: string;

    @Column()
    slug: string;

    @Column('simple-array')
    tags: string[];

    @ManyToOne(
        type => User,
    )
    @JoinColumn()
    author: User;

    @Column({default: 0})
    favoriteCount: number;

    @OneToMany(() => CommentEntity, comment => comment.article)
    @JoinColumn()
    comments: CommentEntity[];

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

    @BeforeInsert()
    @BeforeUpdate()
    generateSlug() {
        this.slug = slugify(this.title, {lower: true})
    }
    
}
