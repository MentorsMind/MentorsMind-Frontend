import api from './api.client';

export interface ICalTokenResponse {
  status: string;
  data: {
    icalUrl: string;
  };
}

export interface RegenerateICalTokenResponse {
  status: string;
  data: {
    icalUrl: string;
  };
  message?: string;
}

export const calendarService = {
  // Get iCal token URL
  getICalToken: async (): Promise<ICalTokenResponse> => {
    const response = await api.get('/api/v1/calendar/ical/token');
    return response.data;
  },

  // Regenerate iCal token URL
  regenerateICalToken: async (): Promise<RegenerateICalTokenResponse> => {
    const response = await api.post('/api/v1/calendar/ical/regenerate');
    return response.data;
  }
};
