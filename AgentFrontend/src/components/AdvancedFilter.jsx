import { useState } from 'react';
import './AdvancedFilter.css';

const AdvancedFilter = ({
    onFilterChange,
    filters = {},
    showDateRange = true,
    showStatus = true,
    showAmount = false,
    statusOptions = [],
    customFilters = []
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [localFilters, setLocalFilters] = useState({
        startDate: filters.startDate || '',
        endDate: filters.endDate || '',
        status: filters.status || '',
        minAmount: filters.minAmount || '',
        maxAmount: filters.maxAmount || '',
        search: filters.search || '',
        ...filters
    });

    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleReset = () => {
        const resetFilters = {
            startDate: '',
            endDate: '',
            status: '',
            minAmount: '',
            maxAmount: '',
            search: ''
        };
        setLocalFilters(resetFilters);
        onFilterChange(resetFilters);
    };

    const activeFilterCount = Object.values(localFilters).filter(v => v !== '').length;

    return (
        <div className="advanced-filter">
            <div className="filter-header">
                <div className="filter-title">
                    <span>🔍 Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="filter-count">{activeFilterCount} active</span>
                    )}
                </div>
                <div className="filter-actions">
                    {activeFilterCount > 0 && (
                        <button
                            className="btn-reset"
                            onClick={handleReset}
                        >
                            Clear All
                        </button>
                    )}
                    <button
                        className="btn-toggle"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? '▲ Hide' : '▼ Show'} Filters
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="filter-body">
                    <div className="filter-grid">
                        {/* Search */}
                        <div className="filter-item full-width">
                            <label>Search</label>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={localFilters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="filter-input"
                            />
                        </div>

                        {/* Date Range */}
                        {showDateRange && (
                            <>
                                <div className="filter-item">
                                    <label>Start Date</label>
                                    <input
                                        type="date"
                                        value={localFilters.startDate}
                                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                        className="filter-input"
                                    />
                                </div>
                                <div className="filter-item">
                                    <label>End Date</label>
                                    <input
                                        type="date"
                                        value={localFilters.endDate}
                                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                        className="filter-input"
                                    />
                                </div>
                            </>
                        )}

                        {/* Status */}
                        {showStatus && statusOptions.length > 0 && (
                            <div className="filter-item">
                                <label>Status</label>
                                <select
                                    value={localFilters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="filter-input"
                                >
                                    <option value="">All Status</option>
                                    {statusOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Amount Range */}
                        {showAmount && (
                            <>
                                <div className="filter-item">
                                    <label>Min Amount</label>
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={localFilters.minAmount}
                                        onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                                        className="filter-input"
                                    />
                                </div>
                                <div className="filter-item">
                                    <label>Max Amount</label>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={localFilters.maxAmount}
                                        onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                                        className="filter-input"
                                    />
                                </div>
                            </>
                        )}

                        {/* Custom Filters */}
                        {customFilters.map((filter, index) => (
                            <div key={index} className="filter-item">
                                <label>{filter.label}</label>
                                {filter.type === 'select' ? (
                                    <select
                                        value={localFilters[filter.key] || ''}
                                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                        className="filter-input"
                                    >
                                        <option value="">All</option>
                                        {filter.options.map(opt => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type={filter.type || 'text'}
                                        placeholder={filter.placeholder}
                                        value={localFilters[filter.key] || ''}
                                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                        className="filter-input"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedFilter;
