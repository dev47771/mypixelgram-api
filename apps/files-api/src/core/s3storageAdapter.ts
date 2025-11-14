import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { BucketFile } from '../files/api/dto/bucketFile';
import { FileMongoType } from '../files/api/dto/fileMongoType';

export class S3StorageAdapter {
  s3Client: S3Client;
  bucketName: string;
  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('BUCKET_REGION'),
      endpoint: this.configService.get<string>('BUCKET_ENDPOINT'),
      credentials: {
        secretAccessKey: this.configService.get<string>('BUCKET_SECRET_ACCESS_KEY')!,
        accessKeyId: this.configService.get<string>('BUCKET_ACCESS_KEY_ID')!,
      },
    });
    this.bucketName = this.configService.get<string>('BUCKET_NAME')!;
  }

  async uploadFile(key: string, buffer: Buffer, contentType: string) {
    const bucketParams = {
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    };

    const command = new PutObjectCommand(bucketParams);

    try {
      return await this.s3Client.send(command);
    } catch (error) {
      console.error(error);
      throw new Error();
    }
  }

  async uploadFiles(userId: string, files: BucketFile[]) {
    const uploadedKeys: string[] = [];
    const uploadPromises: Promise<any>[] = [];

    try {
      files.forEach((file: BucketFile, index: number) => {
        const key = `users/${userId}/${Date.now()}-${index}-${file.originalname}`;

        const uploadPromise = this.uploadFile(key, file.buffer, file.mimetype).then(() => {
          uploadedKeys.push(key);
          return {
            originalName: file.originalname,
            url: `https://${this.bucketName}.storage.yandexcloud.net/${key}`,
            fileId: uuidv4(),
            type: file.mimetype,
            userId: userId,
            deletedAt: null,
          };
        });

        uploadPromises.push(uploadPromise);
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('💥 One or more uploads failed, starting rollback...');

      await this.rollbackUploads(uploadedKeys);
      throw new Error(`Upload failed: ${error.message}. Rollback completed.`);
    }
  }

  async deleteFile(key: string) {
    const bucketParams = {
      Bucket: this.bucketName,
      Key: key,
    };
    try {
      const data = this.s3Client.send(new DeleteObjectCommand(bucketParams));
      console.log(`✅ Successfully deleted: ${key}`);
      return data;
    } catch (deleteError) {
      console.error(`❌ Failed to delete ${key}:`, deleteError);
    }
  }

  private async rollbackUploads(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    console.log(`🔄 Rolling back ${keys.length} uploaded files...`);

    const deletePromises = keys.map(async (key) => await this.deleteFile(key));
    await Promise.all(deletePromises);
    console.log('✅ Rollback completed');
  }
}
