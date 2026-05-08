import { Socket } from 'socket.io';

export class OnlineUsersStore {
  private readonly users = new Map<string, Set<Socket>>();

  add(userId: string, socket: Socket) {
    if (!this.users.has(userId)) {
      this.users.set(userId, new Set());
    }
    this.users.get(userId)!.add(socket);
  }

  remove(userId: string, socket: Socket) {
    const sockets = this.users.get(userId);
    if (!sockets) return;

    sockets.delete(socket);

    if (sockets.size === 0) {
      this.users.delete(userId);
    }
  }

  getSockets(userId: string): Set<Socket> | undefined {
    return this.users.get(userId);
  }

  isOnline(userId: string): boolean {
    return this.users.has(userId);
  }
}
