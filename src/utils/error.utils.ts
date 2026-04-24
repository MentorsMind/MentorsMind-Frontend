// Generates a short, readable ID for user support tickets (e.g., "A7F9K2")
export const generateErrorId = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export type ErrorType = 'CHUNK_LOAD_ERROR' | 'NETWORK_ERROR' | 'APP_ERROR';

// Identifies the root cause to serve the correct UI message
export const classifyError = (error: Error): ErrorType => {
  const message = error.message.toLowerCase();
  const name = error.name;

  if (
    name === 'ChunkLoadError' ||
    message.includes('loading chunk') ||
    message.includes('failed to fetch dynamically imported module')
  ) {
    return 'CHUNK_LOAD_ERROR';
  }

  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('load failed')
  ) {
    return 'NETWORK_ERROR';
  }

  return 'APP_ERROR';
};

// Centralized logging: swap console.error for Sentry/Datadog later
export const logErrorToService = (error: Error, errorInfo: React.ErrorInfo, errorId: string) => {
  console.error(`[Error ID: ${errorId}]`, error, errorInfo);
  
  // TODO: Implement external tracking
  // Sentry.withScope((scope) => {
  //   scope.setTag("error_id", errorId);
  //   Sentry.captureException(error);
  // });
};