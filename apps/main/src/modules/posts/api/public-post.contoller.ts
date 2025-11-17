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
        description: 'First public post: short.',
        location: 'Baku',
        file: files[0],
        createdAt: new Date().toISOString(),
        user: {
          userId: 'user-101',
          login: 'kozlov97',
          avatar: null,
        },
      },
      {
        postId: '2',
        description:
          'Second long hardcoded post. This text is intentionally verbose and extensive to demonstrate how a description ' +
          'in a social media post can contain much more detail, reflections, and personal impressions about the visited' +
          ' location, weather, events that happened during the day, opinions about the local food, scenery, ' +
          'and anecdotes about meeting new people. Overall, this post contains a full-fledged travel diary with' +
          ' personal thoughts, experiences, and stories, making it five times longer than a generic caption.',
        location: 'Istanbul',
        file: files[1],
        createdAt: new Date().toISOString(),
        user: {
          userId: 'user-102',
          login: 'elchin234',
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        },
      },
      {
        postId: '3',
        description:
          'Third post: sharing a few lines about my journey in Tbilisi. The old town, cobblestone streets, friendly atmosphere,' +
          ' local food, and the majestic mountains around the city — all this creates a unique flavor. Spent the evening at a' +
          ' cozy cafe overlooking the square. Lots of impressions!',
        location: 'Tbilisi',
        file: files[2],
        createdAt: new Date().toISOString(),
        user: {
          userId: 'user-103',
          login: 'guliko',
          avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
        },
      },
      {
        postId: '4',
        description:
          'My fourth and longest post: Walking through the historic streets of London, admiring the blend of tradition' +
          ' and modernity. Today’s walk included Big Ben, the London Eye, and a cup of tea at a local shop. ' +
          'Met brilliant people, enjoyed wonderful weather, explored city parks, and finished the day at the ' +
          'British Museum. Loved every minute — so much history here!',
        location: 'London',
        file: files[3],
        createdAt: new Date().toISOString(),
        user: {
          userId: 'user-104',
          login: 'samirlondon',
          avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
        },
      },
    ];

    return {
      posts,
    };
  }
}
