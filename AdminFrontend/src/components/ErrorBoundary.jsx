import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to console in development
        if (import.meta.env.DEV) {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }

        // Store error details in state
        this.setState({
            error,
            errorInfo
        });

        // TODO: Log to error tracking service (Sentry, LogRocket, etc.)
        // Example: logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
        // Optionally reload the page or navigate to home
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary-container">
                    <div className="error-boundary-card">
                        <div className="error-icon">⚠️</div>
                        <h1>Oops! Something went wrong</h1>
                        <p className="error-message">
                            We're sorry for the inconvenience. The application encountered an unexpected error.
                        </p>

                        {import.meta.env.DEV && this.state.error && (
                            <details className="error-details">
                                <summary>Error Details (Development Only)</summary>
                                <div className="error-stack">
                                    <strong>Error:</strong> {this.state.error.toString()}
                                    <br />
                                    <strong>Stack Trace:</strong>
                                    <pre>{this.state.errorInfo?.componentStack}</pre>
                                </div>
                            </details>
                        )}

                        <div className="error-actions">
                            <button
                                onClick={this.handleReset}
                                className="btn btn-primary"
                            >
                                🏠 Return to Dashboard
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="btn btn-secondary"
                            >
                                🔄 Reload Page
                            </button>
                        </div>

                        <p className="error-help-text">
                            If this problem persists, please contact support.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
