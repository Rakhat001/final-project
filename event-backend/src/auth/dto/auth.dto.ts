import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

@InputType()
export class LoginInput {
  @Field()
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @Field()
  @IsNotEmpty({ message: 'Пароль обязателен' })
  password: string;
}

@InputType()
export class UserInput {
  @Field()
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @Field()
  @IsNotEmpty({ message: 'Имя обязательно' })
  name: string;

  @Field()
  @MinLength(6, { message: 'Пароль должен содержать минимум 6 символов' })
  password: string;
}

@ObjectType()
export class UserResponse {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  name: string;
}

@ObjectType()
export class AuthPayload {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field(() => UserResponse)
  user: UserResponse;
}
