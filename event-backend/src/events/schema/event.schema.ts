import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/users/schema/user.schema';

export type EventDocument = EventModel & Document;

@Schema({ timestamps: true })
export class EventModel extends Document {
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  description: string;
  @Prop({ required: true })
  date: Date;
  @Prop()
  img: string;
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  organizer: User;
  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
  participants: User[];
}

export const EventSchema = SchemaFactory.createForClass(EventModel);
