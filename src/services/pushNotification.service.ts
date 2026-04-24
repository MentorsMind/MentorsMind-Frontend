import api from './api';
import type { PushDevice, PushSubscribeRequest } from '../types/pushNotification.types';

const pushNotificationService = {
  async subscribe(token: string, deviceName: string): Promise<void> {
    const body: PushSubscribeRequest = { token, deviceName };
    await api.post('/notifications/push/subscribe', body);
  },

  async unsubscribe(token: string): Promise<void> {
    await api.delete('/notifications/push/unsubscribe', { data: { token } });
  },

  async getTokens(): Promise<PushDevice[]> {
    const { data } = await api.get<PushDevice[]>('/notifications/push/tokens');
    return data;
  },

  async sendTest(): Promise<void> {
    await api.post('/notifications/push/test');
  },
};

export default pushNotificationService;
