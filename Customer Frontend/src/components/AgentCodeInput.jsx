import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { authAPI } from '../services/api.service';
import './AgentCodeInput.css';

const AgentCodeInput = ({ value, onChange, required = false, label = "Referral Agent Code (Optional)" }) => {
    const [agentInfo, setAgentInfo] = useState(null);
    const [isValid, setIsValid] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const verifyCode = async () => {
            if (value && value.length >= 5) {
                setLoading(true);
                try {
                    const response = await authAPI.verifyAgentCode(value);
                    if (response.success) {
                        setIsValid(true);
                        setAgentInfo({
                            name: response.data.fullName,
                            code: response.data.agentCode,
                            level: response.data.level
                        });
                    } else {
                        setIsValid(false);
                        setAgentInfo(null);
                    }
                } catch (err) {
                    setIsValid(false);
                    setAgentInfo(null);
                } finally {
                    setLoading(false);
                }
            } else {
                setAgentInfo(null);
                setIsValid(null);
            }
        };

        const timer = setTimeout(verifyCode, 500);
        return () => clearTimeout(timer);
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
