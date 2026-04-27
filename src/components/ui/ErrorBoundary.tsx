import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    // TODO: send to logging service
    // console.error(error, info);
  }

  reset = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-lg text-center">
            <h2 className="text-2xl font-bold text-gray-900">Something went wrong</h2>
            <p className="text-sm text-gray-500 mt-2">An unexpected error occurred. You can retry or refresh the page.</p>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={() => this.reset()} className="px-4 py-2 bg-stellar text-white rounded-2xl">Retry</button>
              <button onClick={() => window.location.reload()} className="px-4 py-2 border rounded-2xl">Refresh</button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
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