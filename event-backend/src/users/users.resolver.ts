import { Resolver, Query, ResolveField, Parent, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => UserEntity)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @ResolveField(() => ID)
  id(@Parent() user: any) {
    return user._id?.toString() || user.id;
  }

  @Query(() => String)
  hello() {
    return 'hello';
  }

  @Query(() => UserEntity)
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: any): Promise<UserEntity> {
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  }

  @Query(() => [UserEntity])
  @UseGuards(JwtAuthGuard)
  async users(): Promise<UserEntity[]> {
    const users = await this.usersService.findAll();
    return users.map((user) => ({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    }));
  }
}
