import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NotificationRepo } from '../infrastructure/notification.repo';
import { OnlineUsersStore } from '../online-users.store';

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly onlineUsers: OnlineUsersStore,
    private readonly notificationRepo: NotificationRepo,
  ) {}

  afterInit(server: Server) {
    server.use(async (socket: Socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Unauthorized'));
      }

      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get<string>('JWT_SECRET_KEY'),
        });

        socket.data.user = { id: payload.userId };
        next();
      } catch {
        next(new Error('Unauthorized'));
      }
    });
  }

  async handleConnection(client: Socket) {
    const userId = client.data.user.id;
    console.log('userId ', userId);
    this.onlineUsers.add(userId, client);

    const unreadCount = await this.notificationRepo.countUnreadByUser(userId);

    client.emit('notifications:unread-count', { unreadCount });
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.user?.id;
    if (!userId) return;

    this.onlineUsers.remove(userId, client);
  }
}
