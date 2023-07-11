import { User } from "src/user/entity/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Article } from "./article.entity";

@Entity('comment')
export class CommentEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    body: string;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

    @ManyToOne(() => Article, article => article.comments)
    article: Article;

    @ManyToOne(() => User)
    @JoinColumn()
    author: User;
}