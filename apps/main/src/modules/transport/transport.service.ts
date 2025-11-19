import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PayloadTypeDto } from '../files/api/dto/payloadTypeDto';
import { ValidFileIdDto } from './trasport-dto';

@Injectable()
export class TransportService {
  constructor(@Inject('FILES_API') private readonly filesApiClient: ClientProxy) {}

  async sendFilesForS3Upload(payload: PayloadTypeDto): Promise<void> {
    try {
      const res = await firstValueFrom(this.filesApiClient.send({ cmd: 'filesUpload' }, payload));
      await this.filesApiClient.close();
      return res;
    } catch (e) {
      console.error('TransportService error:', {
        error: e,
        payload,
      });
      throw new RpcException('Transport error: ' + e.message);
    }
  }

  async verifyFileOwnership(payload: ValidFileIdDto): Promise<void> {
    try {
      await firstValueFrom(this.filesApiClient.send({ cmd: 'checkFileOwner' }, payload));
    } catch (error) {
      throw new Error(error?.message || 'Error accessing owner files');
    } finally {
      await this.filesApiClient.close();
    }
  }
  async softDeleteFilesByPost(filesId: string[]) {
    const resultDeleted = await firstValueFrom(this.filesApiClient.send({ cmd: 'deleteFiles' }, filesId));
    await this.filesApiClient.close();
    return resultDeleted;
  }
}
