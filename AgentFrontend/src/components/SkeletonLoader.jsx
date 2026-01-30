import './SkeletonLoader.css';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
    const renderSkeleton = () => {
        switch (type) {
            case 'card':
                return (
                    <div className="skeleton-card">
                        <div className="skeleton-header">
                            <div className="skeleton-circle"></div>
                            <div className="skeleton-text-group">
                                <div className="skeleton-text skeleton-title"></div>
                                <div className="skeleton-text skeleton-subtitle"></div>
                            </div>
                        </div>
                        <div className="skeleton-body">
                            <div className="skeleton-text"></div>
                            <div className="skeleton-text"></div>
                            <div className="skeleton-text short"></div>
                        </div>
                    </div>
                );

            case 'table-row':
                return (
                    <div className="skeleton-table-row">
                        <div className="skeleton-text"></div>
                        <div className="skeleton-text"></div>
                        <div className="skeleton-text"></div>
                        <div className="skeleton-text short"></div>
                    </div>
                );

            case 'stat':
                return (
                    <div className="skeleton-stat">
                        <div className="skeleton-text short"></div>
                        <div className="skeleton-text skeleton-value"></div>
                    </div>
                );

            case 'list-item':
                return (
                    <div className="skeleton-list-item">
                        <div className="skeleton-circle small"></div>
                        <div className="skeleton-text-group flex-1">
                            <div className="skeleton-text"></div>
                            <div className="skeleton-text short"></div>
                        </div>
                        <div className="skeleton-text short"></div>
                    </div>
                );

            case 'policy-card':
                return (
                    <div className="skeleton-policy-card">
                        <div className="skeleton-header">
                            <div className="skeleton-text skeleton-title"></div>
                            <div className="skeleton-badge"></div>
                        </div>
                        <div className="skeleton-divider"></div>
                        <div className="skeleton-body">
                            <div className="skeleton-detail-row">
                                <div className="skeleton-text short"></div>
                                <div className="skeleton-text short"></div>
                            </div>
                            <div className="skeleton-detail-row">
                                <div className="skeleton-text short"></div>
                                <div className="skeleton-text short"></div>
                            </div>
                            <div className="skeleton-detail-row">
                                <div className="skeleton-text short"></div>
                                <div className="skeleton-text short"></div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return <div className="skeleton-text"></div>;
        }
    };

    return (
        <div className="skeleton-container">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="skeleton-wrapper">
                    {renderSkeleton()}
                </div>
            ))}
        </div>
    );
};

export default SkeletonLoader;
