import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorPage from '../../pages/ErrorPage';
import { generateErrorId, classifyError, logErrorToService, ErrorType } from '../../utils/error.utils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode; // Optional custom fallback for widget-level boundaries
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
  errorType: ErrorType | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorId: null,
    errorType: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render shows the fallback UI.
    return {
      hasError: true,
      error,
      errorId: generateErrorId(),
      errorType: classifyError(error),
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (this.state.errorId) {
      logErrorToService(error, errorInfo, this.state.errorId);
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
      errorType: null,
    });
  };

  public render() {
    if (this.state.hasError && this.state.error && this.state.errorId && this.state.errorType) {
      // If a specific fallback is provided (e.g., for a small dashboard widget), use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Otherwise, render the global Error Page
      return (
        <ErrorPage
          error={this.state.error}
          errorId={this.state.errorId}
          errorType={this.state.errorType}
          resetError={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}