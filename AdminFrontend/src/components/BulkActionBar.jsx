import { useState } from 'react';
import { CheckSquare, Square, X, Check, Ban, Trash2 } from 'lucide-react';
import './BulkActionBar.css';

const BulkActionBar = ({
    selectedCount,
    totalCount,
    onSelectAll,
    onClearSelection,
    actions = [],
    entityName = 'items'
}) => {
    if (selectedCount === 0) return null;

    const allSelected = selectedCount === totalCount;

    return (
        <div className="bulk-action-bar">
            <div className="bulk-info">
                <button
                    className="select-all-btn"
                    onClick={allSelected ? onClearSelection : onSelectAll}
                    title={allSelected ? "Deselect all" : "Select all"}
                >
                    {allSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                </button>
                <span className="selected-count">
                    <strong>{selectedCount}</strong> {entityName} selected
                    {selectedCount < totalCount && ` of ${totalCount}`}
                </span>
                <button
                    className="clear-btn"
                    onClick={onClearSelection}
                    title="Clear selection"
                >
                    <X size={16} /> Clear
                </button>
            </div>

            <div className="bulk-actions">
                {actions.map((action, index) => (
                    <button
                        key={index}
                        className={`bulk-action-btn ${action.variant || 'primary'}`}
                        onClick={action.onClick}
                        disabled={action.disabled}
                        title={action.title}
                    >
                        {action.icon}
                        <span>{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default BulkActionBar;
