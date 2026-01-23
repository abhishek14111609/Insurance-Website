import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; // Reusing Home css for button styles

const NotFound = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '70vh',
            textAlign: 'center',
            padding: '20px'
        }}>
            <h1 style={{ fontSize: '6rem', color: 'var(--primary-color)', marginBottom: '0' }}>404</h1>
            <h2 style={{ marginBottom: '20px' }}>Page Not Found</h2>
            <p style={{ maxWidth: '500px', marginBottom: '30px', color: '#666' }}>
                Oops! The page you are looking for does not exist or has been moved.
            </p>
            <Link to="/" className="btn btn-primary">
                Back to Home
            </Link>
        </div>
    );
};

export default NotFound;
