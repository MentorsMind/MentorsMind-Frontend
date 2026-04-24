export interface PushDevice {
  token: string;
  deviceName: string;
  browser: string;
  lastActiveAt: string; // ISO 8601
}

export interface PushSubscribeRequest {
  token: string;
  deviceName: string;
}
