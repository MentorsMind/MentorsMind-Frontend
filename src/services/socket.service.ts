/**
 * Mock SocketService for fallback when socket.io-client is not available.
 * Production systems should migrate to websocket.service.ts
 */

class SocketService {
  private listeners: Record<string, ((...args: any[]) => void)[]> = {};

  connect() {
    console.log('Mock socket connected');
  }

  disconnect() {
    console.log('Mock socket disconnected');
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: (...args: any[]) => void) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event: string, data: any) {
    console.log('Mock socket emit:', event, data);
    // Simulate echo for some events if needed
  }

  isConnected() {
    return true;
  }
}

export const socketService = new SocketService();
export default socketService;
