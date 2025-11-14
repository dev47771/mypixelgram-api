import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TransportService {
  constructor(@Inject('FILES_API') private readonly filesApiClient: ClientProxy) {}

  async sendFilesForS3Upload(payload: { userId: string; files: Express.Multer.File[] }) {
    const res = await firstValueFrom(this.filesApiClient.send({ cmd: 'filesUpload' }, payload));
    await this.filesApiClient.close();
    return res;
  }
}
