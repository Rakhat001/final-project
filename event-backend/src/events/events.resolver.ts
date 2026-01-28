import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent, Subscription } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { Event } from './entities/event.entity';
import { UserEntity } from '../users/entities/user.entity';
import { CreateEventInput } from './dto/create-event.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaginationArgs } from '../common/dto/pagination.args';
import { Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from '../pubsub/pubsub.module';

@Resolver(() => Event)
export class EventsResolver {
  constructor(
    private readonly eventsService: EventsService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  @ResolveField(() => UserEntity)
  organizer(@Parent() event: any) {
    if (!event.organizer) return null;
    return event.organizer;
  }

  @ResolveField(() => [UserEntity])
  participants(@Parent() event: any) {
    return event.participants || [];
  }

  @ResolveField(() => ID)
  id(@Parent() event: any) {
    return event._id?.toString() || event.id;
  }

  @Mutation(() => Event)
  @UseGuards(JwtAuthGuard)
  async createEvent(
    @Args('createEventInput') createEventInput: CreateEventInput,
    @CurrentUser() user: any,
  ) {
    return this.eventsService.create(createEventInput, user._id);
  }

  @Query(() => [Event], { name: 'events' })
  async findAll(@Args() paginationArgs: PaginationArgs) {
    return this.eventsService.findAll(paginationArgs.offset, paginationArgs.limit);
  }

  @Query(() => Event, { name: 'event' })
  async findOne(@Args('id', { type: () => ID }) id: string) {
    return this.eventsService.findOne(id);
  }

  @Mutation(() => Event)
  @UseGuards(JwtAuthGuard)
  async registerForEvent(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ) {
    return this.eventsService.addParticipant(id, user._id);
  }

  @Mutation(() => Event)
  @UseGuards(JwtAuthGuard)
  async cancelRegistration(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
  ) {
    return this.eventsService.removeParticipant(id, user._id);
  }

  @Query(() => [Event], { name: 'myEvents' })
  @UseGuards(JwtAuthGuard)
  async findMyEvents(@CurrentUser() user: any) {
    return this.eventsService.findOrganizedBy(user._id);
  }

  @Query(() => [Event], { name: 'subscribedEvents' })
  @UseGuards(JwtAuthGuard)
  async findSubscribedEvents(@CurrentUser() user: any) {
    return this.eventsService.findRegisteredBy(user._id);
  }

  @Subscription(() => UserEntity, {
    filter: (payload, variables, context) => {
      console.log('Subscription Payload:', payload);
      console.log('Subscription Context User:', context?.user);
      
      const currentUserId = context?.user?.id;
      
      if (!currentUserId) {
        console.log('No authenticated user in context - subscription blocked');
        return false;
      }
      
      const isOrganizer = payload.organizerId === currentUserId;
      console.log(`User ${currentUserId} is organizer: ${isOrganizer}`);
      
      return isOrganizer;
    },
  })
  onUserRegistered() {
    return this.pubSub.asyncIterableIterator('userRegistered');
  }
}
