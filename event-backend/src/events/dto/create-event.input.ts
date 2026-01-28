import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CreateEventInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  description: string;

  @Field()
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  date: Date;

  @Field({ nullable: true })
  @IsString()
  img?: string;
}
