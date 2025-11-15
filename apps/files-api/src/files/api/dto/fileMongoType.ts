export class FileMongoType {
  originalName: string;
  url: string;
  fileId: string;
  type: string;
  userId: string;
  deleteAt: Date | null = null;
}
