import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class UserEntity {
  @Field(() => ID)
  id: string;
  @Field()
  email: string;
  @Field()
  name: string;
  @Field({ nullable: true })
  avatarUrl?: string;
  @Field()
  createdAt: Date;
}