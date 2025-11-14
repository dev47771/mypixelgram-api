import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'files',
})
export class File {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  fileId: string;

  @Prop({ type: Date, default: null })
  deleteAt?: Date | null;

  @Prop()
  userId: string;
}

export const FileSchema = SchemaFactory.createForClass(File);
export type FileDocument = HydratedDocument<File>;
