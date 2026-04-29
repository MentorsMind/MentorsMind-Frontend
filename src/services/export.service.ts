import api from './api.client';
import { request } from '../utils/request.utils';

export interface ExportJobStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  expires_at: string;
  error_message: string | null;
  created_at: string;
}

export const requestExport = async (): Promise<{ jobId: string }> => {
  const res = await api.post('/v1/export');
  return res.data;
};

export const getExportStatus = async (jobId: string): Promise<ExportJobStatus> => {
  const res = await api.get(`/v1/export/${jobId}/status`);
  return res.data.data;
};

export const getExportDownloadUrl = (jobId: string): string =>
  `/api/v1/export/${jobId}/download`;
