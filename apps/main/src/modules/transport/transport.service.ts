import { Get, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TransportService {
  constructor(@Inject('FILES_API') private readonly filesApiClient: ClientProxy) {}

  async sendFilesForS3Upload(payload: { userId: string; files: Express.Multer.File[] }) {
    return await firstValueFrom(this.filesApiClient.send({ cmd: 'filesUpload' }, payload));
  }

  async changeFile(data) {
    return this.filesApiClient.send({ cmd: 'change' }, data);
  }

  async deleteFiles(filesId: string[]) {
    return this.filesApiClient.send({ cmd: 'deleteFiles' }, filesId);
  }
}
