import { Injectable } from '@nestjs/common';
import { OnlineUsersStore } from '../online-users.store';

@Injectable()
export class NotificationsWsService {
  constructor(private readonly onlineUsers: OnlineUsersStore) {}

  notifyUser(userId: string, event: string, payload: any) {
    const sockets = this.onlineUsers.getSockets(userId);
    if (!sockets) return;

    for (const socket of sockets) {
      socket.emit(event, payload);
    }
  }
}
