import { Injectable } from '@nestjs/common';

@Injectable()
export class FilesApiService {
  getHello(): string {
    return 'Hello World!';
  }
}
