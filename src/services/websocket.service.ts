// Browser WebSocket types

export interface WebSocketMessage {
  event: 'session:updated' | 'payment:confirmed' | 'notification:new' | 'message:new' | 'ping' | 'pong';
  payload: any;
  timestamp: string;
  id: string;
}

export interface WebSocketConfig {
  url: string;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  onTokenRefresh?: () => Promise<string | null>;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private heartbeatTimeout: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private messageQueue: WebSocketMessage[] = [];
  private isConnecting = false;
  private isManualClose = false;

  private eventListeners: {
    onOpen?: () => void;
    onClose?: (event: WSCloseEvent) => void;
    onMessage?: (message: WebSocketMessage) => void;
    onError?: (error: WSErrorEvent) => void;
    onReconnect?: (attempt: number) => void;
  } = {};

  constructor(config: WebSocketConfig) {
    this.config = {
      maxReconnectAttempts: 5, // max attempts before giving up
      heartbeatInterval: 20000, // 20 seconds
      ...config,
    };
  }

  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Connection already in progress'));
        return;
      }

      this.isConnecting = true;
      this.isManualClose = false;

      try {
        const wsUrl = token ? `${this.config.url}?token=${token}` : this.config.url;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.processMessageQueue();
          this.eventListeners.onOpen?.();
          resolve();
        };

        this.ws.onclose = async (event: WSCloseEvent) => {
          this.isConnecting = false;
          this.stopHeartbeat();

          if (event.code === 4001 && this.config.onTokenRefresh) {
            // Unauthorized, refresh token and reconnect
            try {
              const newToken = await this.config.onTokenRefresh();
              if (newToken) {
                // Retry connect with new token
                this.connect(newToken).catch(console.error);
                return;
              }
            } catch (error) {
              console.error('Failed to refresh token:', error);
            }
          }

          if (!this.isManualClose && this.reconnectAttempts < this.config.maxReconnectAttempts!) {
            this.scheduleReconnect();
          }

          this.eventListeners.onClose?.(event);
        };

        this.ws.onmessage = (event: WSMessageEvent) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data.toString());
            
            if (message.event === 'ping') {
              this.send({ event: 'pong', payload: {} });
              return;
            }

            this.eventListeners.onMessage?.(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (error: WSErrorEvent) => {
          this.isConnecting = false;
          this.eventListeners.onError?.(error);
          reject(new Error(error.message || 'WebSocket error'));
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.isManualClose = true;
    this.stopHeartbeat();
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(message: Omit<WebSocketMessage, 'timestamp' | 'id'>): void {
    const fullMessage: WebSocketMessage = {
      event: message.event,
      payload: message.payload,
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9),
    };

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(fullMessage));
    } else {
      this.messageQueue.push(fullMessage);
    }
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift();
      if (message) {
        this.ws.send(JSON.stringify(message));
      }
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;

    this.eventListeners.onReconnect?.(this.reconnectAttempts);

    // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
    const interval = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);

    this.reconnectTimeout = setTimeout(() => {
      if (!this.isManualClose) {
        this.connect().catch(console.error);
      }
    }, interval);
  }

  private startHeartbeat(): void {
    this.heartbeatTimeout = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping', payload: {} });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimeout) {
      clearInterval(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  get connectionState(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'disconnected';
      default: return 'unknown';
    }
  }

  onOpen(callback?: () => void): void {
    this.eventListeners.onOpen = callback;
  }

  onClose(callback?: (event: WSCloseEvent) => void): void {
    this.eventListeners.onClose = callback;
  }

  onMessage(callback?: (message: WebSocketMessage) => void): void {
    this.eventListeners.onMessage = callback;
  }

  onError(callback?: (error: WSErrorEvent) => void): void {
    this.eventListeners.onError = callback;
  }

  onReconnect(callback?: (attempt: number) => void): void {
    this.eventListeners.onReconnect = callback;
  }

  getQueuedMessages(): WebSocketMessage[] {
    return [...this.messageQueue];
  }

  clearMessageQueue(): void {
    this.messageQueue = [];
  }
}

let websocketInstance: WebSocketService | null = null;

export const getWebSocketService = (config?: WebSocketConfig): WebSocketService => {
  if (!websocketInstance && config) {
    websocketInstance = new WebSocketService(config);
  }
  return websocketInstance!;
};

export const initializeWebSocket = (config: WebSocketConfig): WebSocketService => {
  if (websocketInstance) {
    websocketInstance.disconnect();
  }
  websocketInstance = new WebSocketService(config);
  return websocketInstance;
};
