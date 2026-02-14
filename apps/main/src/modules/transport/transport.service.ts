import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PayloadTypeDto } from '../files/api/dto/payloadTypeDto';
import { CreateCheckoutPayload, ValidFileIdDto } from './trasport-dto';
import { UploadedFileInfo } from '../files/api/dto/typeFile.enum';

@Injectable()
export class TransportService {
  constructor(
    @Inject('FILES_API') private readonly filesApiClient: ClientProxy,
    @Inject('PAYMENT') private readonly paymentApiClient: ClientProxy,
  ) {}

  async sendFilesForS3Upload(payload: PayloadTypeDto): Promise<UploadedFileInfo[]> {
    try {
      const res = await firstValueFrom(this.filesApiClient.send({ cmd: 'filesUpload' }, payload));
      await this.filesApiClient.close();
      return res;
    } catch (e) {
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

  async getFiles(arrayFilesId: string[]) {
    return await firstValueFrom(this.filesApiClient.send({ cmd: 'getFiles' }, arrayFilesId));
  }

  async createSubscriptionCheckout(payload: CreateCheckoutPayload): Promise<{ paymentUrl: string }> {
    try {
      return await firstValueFrom(this.paymentApiClient.send({ cmd: 'createSubscriptionCheckout' }, payload));
    } catch (e) {
      throw new RpcException(e.message);
    }
  }

  async getUserPayments(params: { userId: string; page: number; limit: number }) {
    try {
      return await firstValueFrom(this.paymentApiClient.send({ cmd: 'getUserPayments' }, params));
    } catch (e) {
      throw new RpcException(e.message);
    }
  }
  async handleStripeWebhook(payload: { rawBody: string; headers: Record<string, string> }) {
    try {
      return await firstValueFrom(this.paymentApiClient.send({ cmd: 'handleStripeWebhook' }, payload));
    } catch (e) {
      throw new RpcException(e.message);
    }
  }
  async cancelStripeSubscription(payload: { userId: string }) {
    try {
      return await firstValueFrom(this.paymentApiClient.send({ cmd: 'cancelStripeSubscription' }, payload));
    } catch (e) {
      throw new RpcException(e.message);
    }
  }
}
