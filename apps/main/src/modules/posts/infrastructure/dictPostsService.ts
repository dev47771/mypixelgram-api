import { Injectable } from '@nestjs/common';
import { Post } from '@prisma/client';
import { TransportService } from '../../transport/transport.service';

@Injectable()
export class DictPostsService {
  constructor(private transportService: TransportService) {}

  async getDictPosts(posts: Post[]): Promise<Record<string, string>> {
    const fileIds: string[] = posts.map((post: Post) => post.fileIds).reduce((acc, current) => acc.concat(current), []);
    const files = await this.transportService.getFiles(fileIds);

    const dict: Record<string, string> = files.reduce((acc, current) => {
      acc[current.fileId] = current.url;
      return acc;
    }, {});

    return dict;
  }
}
