import api from './api.client';

export const connectGoogleCalendar = (): void => {
  window.location.href = '/api/v1/calendar/google/connect';
};

export const disconnectGoogleCalendar = async (): Promise<boolean> => {
  const res = await api.delete('/v1/calendar/google/disconnect');
  return res.data?.status === 'success';
};
