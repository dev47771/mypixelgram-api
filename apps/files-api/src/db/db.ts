import 'dotenv/config';
import { Collection, MongoClient } from 'mongodb';
import { File } from '../infrastructure/file.schema';

const mongoUri: string = process.env.MONGO_URL || 'mongodb://0.0.0.0:27017';
const client = new MongoClient(mongoUri);
const db = client.db();

export const fileCollection: Collection<File> = db.collection<File>('files');

export const runDb = async () => {
  try {
    await client.connect();
    console.log(`Client connected to DB`);
    console.log(`DB URI ${mongoUri}`);
  } catch (e) {
    console.log(`----------------------------------------`);
    console.log(`Can't connect to DB`);
    console.log(`----------------------------------------`);
    console.log(`${e}`);
    console.log(`----------------------------------------`);
    await client.close();
  }
};
