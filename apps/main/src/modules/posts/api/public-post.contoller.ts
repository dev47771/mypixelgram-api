import { Controller, Get } from '@nestjs/common';
import { PUBLIC_POST_ROUTE } from '../../user-accounts/domain/constants';
import { LastPostsSwagger } from '../decorators/post.swagger.decorators';

@Controller(PUBLIC_POST_ROUTE)
export class PublicPostController {
  @Get('last-posts')
  @LastPostsSwagger()
  async getLastPosts() {
    const files = [
      { url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' },
      { url: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca' },
      { url: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308' },
      { url: 'https://images.unsplash.com/photo-1444065381814-865dc9da92c0' },
    ];

    const posts = [
      {
        postId: '1',
        description: 'First hardcoded post',
        location: 'Baku',
        file: files[0],
        createdAt: new Date().toISOString(),
        user: {
          userId: 'user-101',
          userName: 'kozlov97',
          avatar: null,
        },
      },
      {
        postId: '2',
        description: 'Second hardcoded post',
        location: 'Istanbul',
        file: files[1],
        createdAt: new Date().toISOString(),
        user: {
          userId: 'user-102',
          userName: 'elchin234',
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        },
      },
      {
        postId: '3',
        description: 'Third hardcoded post',
        location: 'Tbilisi',
        file: files[2],
        createdAt: new Date().toISOString(),
        user: {
          userId: 'user-103',
          userName: 'guliko',
          avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
        },
      },
      {
        postId: '4',
        description: 'Fourth hardcoded post',
        location: 'London',
        file: files[3],
        createdAt: new Date().toISOString(),
        user: {
          userId: 'user-104',
          userName: 'samirlondon',
          avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
        },
      },
    ];

    return {
      posts,
    };
  }
}
