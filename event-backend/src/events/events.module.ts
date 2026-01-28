import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsService } from './events.service';
import { EventsResolver } from './events.resolver';
import { EventModel, EventSchema } from './schema/event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: EventModel.name, schema: EventSchema }])
  ],
  providers: [EventsResolver, EventsService],
})
export class EventsModule {}
