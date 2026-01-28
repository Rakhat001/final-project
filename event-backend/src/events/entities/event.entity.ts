import { ObjectType, Field, ID } from '@nestjs/graphql';
import { UserEntity } from '../../users/entities/user.entity';

@ObjectType()
export class Event {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field()
  date: Date;

  @Field({ nullable: true })
  img?: string;

  @Field(() => UserEntity)
  organizer: UserEntity;

  @Field(() => [UserEntity])
  participants: UserEntity[];
}
