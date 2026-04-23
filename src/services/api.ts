// Re-export the single API client used across the app.
// This file exists for backward compatibility where some modules import
// from `services/api`. We delegate to `api.client` which contains the
// canonical axios instance and centralized refresh handling.
import apiClient from './api.client';

export const api = apiClient;
export default apiClient;
