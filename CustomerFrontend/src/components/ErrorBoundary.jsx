import React from 'react';
import PropTypes from 'prop-types';

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
        // Log error details for debugging
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        this.setState({
            error,
            errorInfo
        });

        // You can also log the error to an error reporting service here
        // Example: logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
        // Optionally reload the page
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    padding: '20px',
                    textAlign: 'center',
                    backgroundColor: '#f8f9fa'
                }}>
                    <div style={{
                        maxWidth: '600px',
                        backgroundColor: 'white',
                        padding: '40px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h1 style={{
                            color: '#dc3545',
                            marginBottom: '20px',
                            fontSize: '2rem'
                        }}>
                            ⚠️ Something went wrong
                        </h1>
                        <p style={{
                            color: '#6c757d',
                            marginBottom: '30px',
                            fontSize: '1.1rem'
                        }}>
                            We apologize for the inconvenience. An unexpected error has occurred.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details style={{
                                marginBottom: '20px',
                                textAlign: 'left',
                                backgroundColor: '#f8f9fa',
                                padding: '15px',
                                borderRadius: '8px',
                                border: '1px solid #dee2e6'
                            }}>
                                <summary style={{
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    marginBottom: '10px',
                                    color: '#495057'
                                }}>
                                    Error Details (Development Mode)
                                </summary>
                                <pre style={{
                                    fontSize: '0.85rem',
                                    color: '#dc3545',
                                    overflow: 'auto',
                                    maxHeight: '200px'
                                }}>
                                    {this.state.error.toString()}
                                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button
                                onClick={this.handleReset}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
                            >
                                Reload Page
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#545b62'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
                            >
                                Go to Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired
};

export default ErrorBoundary;
