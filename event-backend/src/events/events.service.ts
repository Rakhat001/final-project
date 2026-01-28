import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventModel, EventDocument } from './schema/event.schema';
import { CreateEventInput } from './dto/create-event.input';
import { Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { PUB_SUB } from '../pubsub/pubsub.module';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(EventModel.name) private eventModel: Model<EventDocument>,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}
  async create(
    createEventDto: CreateEventInput,
    userId: string,
  ): Promise<EventModel> {
    const createdEvent = new this.eventModel({
      ...createEventDto,
      organizer: userId,
      participants: [],
    });
    await createdEvent.save();
    return createdEvent.populate(['organizer', 'participants']);
  }

  async findAll(offset: number, limit: number): Promise<EventModel[]> {
    return this.eventModel
      .find()
      .skip(offset)
      .limit(limit)
      .populate('organizer')
      .populate('participants')
      .exec();
  }

  async findOne(id: string): Promise<EventModel> {
    const event = await this.eventModel
      .findById(id)
      .populate('organizer')
      .populate('participants')
      .exec();
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async addParticipant(eventId: string, userId: string): Promise<EventModel> {
    const event = await this.eventModel.findById(eventId).exec();
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    if (event.organizer.toString() === userId.toString()) {
      throw new ConflictException(
        'Organizer cannot register for their own event',
      );
    }

    if (event.participants.some((p) => p.toString() === userId.toString())) {
      throw new BadRequestException('User already registered for this event');
    }

    await event.updateOne({ $push: { participants: userId } }, { new: true });

    const updatedEvent = await this.findOne(eventId);
    const newParticipant = updatedEvent.participants.find(
      (p: any) => p._id.toString() === userId.toString(),
    );

    if (newParticipant) {
      this.pubSub.publish('userRegistered', {
        onUserRegistered: newParticipant,           
        organizerId: event.organizer.toString(),    
        eventTitle: updatedEvent.title,             
      });
    }

    return updatedEvent;
  }

  async removeParticipant(
    eventId: string,
    userId: string,
  ): Promise<EventModel> {
    const event = await this.eventModel.findById(eventId).exec();
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    await event.updateOne({ $pull: { participants: userId } });

    return this.findOne(eventId);
  }

  async findOrganizedBy(userId: string): Promise<EventModel[]> {
    return this.eventModel
      .find({ organizer: userId })
      .populate('organizer')
      .populate('participants')
      .exec();
  }

  async findRegisteredBy(userId: string): Promise<EventModel[]> {
    return this.eventModel
      .find({ participants: userId } as any)
      .populate('organizer')
      .populate('participants')
      .exec();
  }
}
