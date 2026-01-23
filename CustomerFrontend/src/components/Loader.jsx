import { RotateLoader, ClipLoader } from 'react-spinners';
import './Loader.css';

// Full page loader
export const PageLoader = ({ message = 'Loading...', color = '#0f4c75' }) => {
    return (
        <div className="page-loader-overlay">
            <div className="page-loader-content">
                <RotateLoader color={color} size={15} margin={2} />
                <p className="loader-message">{message}</p>
            </div>
        </div>
    );
};

// Inline loader for sections
export const SectionLoader = ({ message = 'Loading...', color = '#0f4c75' }) => {
    return (
        <div className="section-loader">
            <RotateLoader color={color} size={12} margin={2} />
            <p className="loader-message-small">{message}</p>
        </div>
    );
};

// Small spinner for buttons
export const ButtonLoader = ({ color = '#ffffff' }) => {
    return <ClipLoader color={color} size={16} cssOverride={{ marginRight: '0.5rem' }} />;
};

// Card skeleton loader
export const CardSkeleton = ({ count = 1 }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="skeleton-card">
                    <div className="skeleton-header"></div>
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line short"></div>
                    <div className="skeleton-footer"></div>
                </div>
            ))}
        </>
    );
};

// Table skeleton loader
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
    return (
        <div className="skeleton-table">
            <div className="skeleton-table-header">
                {Array.from({ length: columns }).map((_, i) => (
                    <div key={i} className="skeleton-th"></div>
                ))}
            </div>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="skeleton-table-row">
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <div key={colIndex} className="skeleton-td"></div>
                    ))}
                </div>
            ))}
        </div>
    );
};

// Progress bar
export const ProgressBar = ({ progress = 0, message = '' }) => {
    return (
        <div className="progress-container">
            {message && <p className="progress-message">{message}</p>}
            <div className="progress-bar">
                <div
                    className="progress-fill"
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                >
                    <span className="progress-text">{Math.round(progress)}%</span>
                </div>
            </div>
        </div>
    );
};

// Policy card skeleton (specific to customer)
export const PolicyCardSkeleton = ({ count = 3 }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="skeleton-policy-card">
                    <div className="skeleton-policy-header"></div>
                    <div className="skeleton-policy-body">
                        <div className="skeleton-line"></div>
                        <div className="skeleton-line"></div>
                        <div className="skeleton-line short"></div>
                    </div>
                    <div className="skeleton-policy-footer"></div>
                </div>
            ))}
        </>
    );
};

export default {
    PageLoader,
    SectionLoader,
    ButtonLoader,
    CardSkeleton,
    TableSkeleton,
    ProgressBar,
    PolicyCardSkeleton
};
