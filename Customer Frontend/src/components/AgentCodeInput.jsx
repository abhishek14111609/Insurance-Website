import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { findAgentByCode, validateAgentCode, getAgentAncestors } from '../utils/agentUtils';
import './AgentCodeInput.css';

/**
 * AgentCodeInput Component
 * Input field for agent code with validation and hierarchy display
 */
const AgentCodeInput = ({ value, onChange, required = false, label = "Agent Code (Optional)" }) => {
    const [agentInfo, setAgentInfo] = useState(null);
    const [isValid, setIsValid] = useState(null);
    const [hierarchy, setHierarchy] = useState([]);

    useEffect(() => {
        if (value && value.length >= 5) {
            const isValidCode = validateAgentCode(value);
            setIsValid(isValidCode);

            if (isValidCode) {
                const agent = findAgentByCode(value);
                if (agent) {
                    setAgentInfo(agent);
                    const ancestors = getAgentAncestors(agent.id);
                    setHierarchy(ancestors);
                } else {
                    setAgentInfo(null);
                    setHierarchy([]);
                    setIsValid(false);
                }
            } else {
                setAgentInfo(null);
                setHierarchy([]);
            }
        } else {
            setAgentInfo(null);
            setIsValid(null);
            setHierarchy([]);
        }
    }, [value]);

    const getInputClass = () => {
        if (!value) return 'agent-code-input';
        if (isValid === true) return 'agent-code-input valid';
        if (isValid === false) return 'agent-code-input invalid';
        return 'agent-code-input';
    };

    return (
        <div className="agent-code-field">
            <label className="agent-code-label">
                {label}
                {required && <span className="required-star">*</span>}
            </label>

            <div className="input-wrapper">
                <input
                    type="text"
                    className={getInputClass()}
                    value={value}
                    onChange={(e) => onChange(e.target.value.toUpperCase())}
                    placeholder="e.g., AG001 or AG001-1"
                    required={required}
                />

                {isValid === true && (
                    <span className="validation-icon success">✓</span>
                )}
                {isValid === false && (
                    <span className="validation-icon error">✗</span>
                )}
            </div>

            {agentInfo && (
                <div className="agent-info-card">
                    <div className="agent-info-header">
                        <span className="agent-icon">👤</span>
                        <div>
                            <div className="agent-name">{agentInfo.name}</div>
                            <div className="agent-code-display">{agentInfo.code}</div>
                        </div>
                        <span className={`level-badge level-${agentInfo.level}`}>
                            Level {agentInfo.level}
                        </span>
                    </div>

                    {hierarchy.length > 0 && (
                        <div className="agent-hierarchy">
                            <div className="hierarchy-label">Under:</div>
                            <div className="hierarchy-chain">
                                {hierarchy.reverse().map((ancestor, index) => (
                                    <React.Fragment key={ancestor.id}>
                                        <span className="hierarchy-item">
                                            {ancestor.name} ({ancestor.code})
                                        </span>
                                        {index < hierarchy.length - 1 && (
                                            <span className="hierarchy-arrow">→</span>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="commission-info">
                        <span className="commission-label">Commission Rate:</span>
                        <span className="commission-rate">{agentInfo.commissionRate}%</span>
                    </div>
                </div>
            )}

            {isValid === false && value && (
                <div className="error-message">
                    Invalid agent code format. Use AG001 or AG001-1 format.
                </div>
            )}

            <div className="help-text">
                Enter the agent code who referred you to get special benefits
            </div>
        </div>
    );
};

AgentCodeInput.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    required: PropTypes.bool,
    label: PropTypes.string
};

export default AgentCodeInput;
