import { io, Socket } from 'socket.io-client';
import { tokenStorage } from '../utils/token.storage.utils';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return;

    const token = tokenStorage.getAccessToken();
    
    // In production, this would be the actual backend URL
    // For development, we assume the same host or proxy
    const socketUrl = window.location.origin;

    this.socket = io(socketUrl, {
      auth: {
        token: `Bearer ${token}`,
      },
      path: '/socket.io',
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to messaging socket');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.socket) this.connect();
    this.socket?.on(event, callback);
  }

  off(event: string, callback: (...args: any[]) => void) {
    this.socket?.off(event, callback);
  }

  emit(event: string, data: any) {
    if (!this.socket?.connected) this.connect();
    this.socket?.emit(event, data);
  }

  isConnected() {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
export default socketService;
