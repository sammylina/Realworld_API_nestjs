import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('user_follow_users')
export class Follow {

   @PrimaryGeneratedColumn('uuid')
   id: string;
   
   @Column()
   followerId: string;

   @Column()
   followingId: string;

}
