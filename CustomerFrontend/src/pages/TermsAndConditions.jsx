import React, { useState } from 'react';
import { TERMS_AND_CONDITIONS, CLAIM_PROCEDURES, EXCLUSIONS, TAGGING_FEES } from '../constants/termsAndConditions';
import './TermsAndConditions.css';

const TermsAndConditions = () => {
    const [activeLanguage, setActiveLanguage] = useState('english');
    const [expandedSections, setExpandedSections] = useState({
        terms: true,
        claims: false,
        exclusions: false,
        fees: true
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const renderTermsList = (items) => {
        return (
            <ul className="terms-list-compact">
                {items.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        );
    };

    return (
        <div className="terms-page">
            <div className="terms-container-compact">
                {/* Header */}
                <div className="terms-header-compact">
                    <div className="header-icon">🛡️</div>
                    <h1>Terms & Conditions</h1>
                    <h2>નિયમો અને શરતો</h2>
                    <p className="subtitle">Pashudhan Suraksha Insurance Policy</p>
                </div>

                {/* Language Tabs */}
                <div className="language-tabs">
                    <button
                        className={`tab ${activeLanguage === 'english' ? 'active' : ''}`}
                        onClick={() => setActiveLanguage('english')}
                    >
                        English
                    </button>
                    <button
                        className={`tab ${activeLanguage === 'gujarati' ? 'active' : ''}`}
                        onClick={() => setActiveLanguage('gujarati')}
                    >
                        ગુજરાતી (Gujarati)
                    </button>
                </div>

                {/* Content Cards */}
                <div className="terms-cards-grid">
                    {/* Policy Terms Card */}
                    <div className="term-card">
                        <div
                            className="card-header"
                            onClick={() => toggleSection('terms')}
                        >
                            <div className="card-title">
                                <span className="card-icon">📋</span>
                                <h3>Policy Terms {activeLanguage === 'gujarati' && '/ પોલિસી નિયમો'}</h3>
                            </div>
                            <span className="toggle-icon">{expandedSections.terms ? '−' : '+'}</span>
                        </div>
                        {expandedSections.terms && (
                            <div className="card-content">
                                {activeLanguage === 'english'
                                    ? renderTermsList(TERMS_AND_CONDITIONS.english)
                                    : renderTermsList(TERMS_AND_CONDITIONS.gujarati)
                                }
                            </div>
                        )}
                    </div>

                    {/* Claim Procedures Card */}
                    <div className="term-card">
                        <div
                            className="card-header"
                            onClick={() => toggleSection('claims')}
                        >
                            <div className="card-title">
                                <span className="card-icon">📝</span>
                                <h3>Claim Procedures {activeLanguage === 'gujarati' && '/ દાવાની પ્રક્રિયા'}</h3>
                            </div>
                            <span className="toggle-icon">{expandedSections.claims ? '−' : '+'}</span>
                        </div>
                        {expandedSections.claims && (
                            <div className="card-content">
                                {activeLanguage === 'english'
                                    ? renderTermsList(CLAIM_PROCEDURES.english)
                                    : renderTermsList(CLAIM_PROCEDURES.gujarati)
                                }
                            </div>
                        )}
                    </div>

                    {/* Exclusions Card */}
                    <div className="term-card exclusion-card">
                        <div
                            className="card-header"
                            onClick={() => toggleSection('exclusions')}
                        >
                            <div className="card-title">
                                <span className="card-icon">⚠️</span>
                                <h3>Exclusions {activeLanguage === 'gujarati' && '/ બાકાતો'}</h3>
                            </div>
                            <span className="toggle-icon">{expandedSections.exclusions ? '−' : '+'}</span>
                        </div>
                        {expandedSections.exclusions && (
                            <div className="card-content">
                                <ul className="terms-list-compact exclusion-list">
                                    {(activeLanguage === 'english' ? EXCLUSIONS.english : EXCLUSIONS.gujarati).map((item, index) => (
                                        <li key={index}>
                                            <span className="excl-icon">✗</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Premium & Fees Card */}
                    <div className="term-card fees-card">
                        <div
                            className="card-header"
                            onClick={() => toggleSection('fees')}
                        >
                            <div className="card-title">
                                <span className="card-icon">💰</span>
                                <h3>Premium & Fees {activeLanguage === 'gujarati' && '/ પ્રીમિયમ અને ફી'}</h3>
                            </div>
                            <span className="toggle-icon">{expandedSections.fees ? '−' : '+'}</span>
                        </div>
                        {expandedSections.fees && (
                            <div className="card-content">
                                <div className="fees-grid-compact">
                                    <div className="fee-item">
                                        <div className="fee-label">{TAGGING_FEES.dasha.description}</div>
                                        <div className="fee-value">₹{TAGGING_FEES.dasha.min.toLocaleString()} - ₹{TAGGING_FEES.dasha.max.toLocaleString()}</div>
                                    </div>
                                    <div className="fee-item">
                                        <div className="fee-label">{TAGGING_FEES.shafar.description}</div>
                                        <div className="fee-value">₹{TAGGING_FEES.shafar.min.toLocaleString()} - ₹{TAGGING_FEES.shafar.max.toLocaleString()}</div>
                                    </div>
                                    <div className="fee-item">
                                        <div className="fee-label">{TAGGING_FEES.bhens.description}</div>
                                        <div className="fee-value">₹{TAGGING_FEES.bhens.min.toLocaleString()} - ₹{TAGGING_FEES.bhens.max.toLocaleString()}</div>
                                    </div>
                                    <div className="fee-item highlight">
                                        <div className="fee-label">{TAGGING_FEES.taggingCharge.description}</div>
                                        <div className="fee-value">₹{TAGGING_FEES.taggingCharge.amount}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contact Footer */}
                <div className="terms-footer">
                    <h3>Need Help? / મદદ જોઈએ છે?</h3>
                    <div className="contact-buttons">
                        <a href="tel:1800-245-1234" className="contact-btn">
                            📞 Toll Free: 1800-245-1234
                        </a>
                        <a href="mailto:support@pashudhansuraksha.com" className="contact-btn">
                            📧 Email: support@pashudhansuraksha.com
                        </a>
                        <div className="contact-btn">
                            🕒 Working Hours: 9:00 AM - 6:00 PM (Mon-Sat)
                        </div>
                    </div>
                    <p className="last-updated">Last Updated: January 2026 | છેલ્લે અપડેટ: જાન્યુઆરી 2026</p>
                </div>
            </div>
        </div>
    );
};

export default TermsAndConditions;
