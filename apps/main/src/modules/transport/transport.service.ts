import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PayloadTypeDto } from '../files/api/dto/payloadTypeDto';

@Injectable()
export class TransportService {
  constructor(@Inject('FILES_API') private readonly filesApiClient: ClientProxy) {}

  async sendFilesForS3Upload(payload: PayloadTypeDto): Promise<void> {
    const res = await firstValueFrom(this.filesApiClient.send({ cmd: 'filesUpload' }, payload));
    await this.filesApiClient.close();
    return res;
  }
}
