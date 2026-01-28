import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginInput, UserInput, AuthPayload } from './dto/auth.dto';
import { UseGuards } from '@nestjs/common';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/schema/user.schema';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthPayload)
  async login(@Args('loginInput') loginInput: LoginInput): Promise<AuthPayload> {
    return this.authService.login(loginInput.email, loginInput.password);
  }

  @Mutation(() => AuthPayload)
  async signup(
    @Args('userInput') userInput: UserInput,
  ): Promise<AuthPayload> {
    return this.authService.register(
      userInput.email,
      userInput.name,
      userInput.password,
    );
  }

  @Mutation(() => AuthPayload)
  @UseGuards(RefreshTokenGuard)
  async refreshTokens(
    @CurrentUser() user: any,
  ): Promise<AuthPayload> {
    return this.authService.refreshTokens(user);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: any): Promise<boolean> {
    await this.authService.logout(user._id);
    return true;
  }
}
