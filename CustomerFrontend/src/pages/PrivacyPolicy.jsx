import React, { useState } from 'react';
import { PRIVACY_POLICY } from '../constants/privacyPolicy';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
    const [activeLanguage, setActiveLanguage] = useState('english');
    const [expandedSections, setExpandedSections] = useState({
        collection: true,
        use: false,
        sharing: false,
        security: true
    });

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const renderList = (items) => {
        if (!Array.isArray(items)) return <p>{items}</p>;
        return (
            <ul className="policy-list-compact">
                {items.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        );
    };

    return (
        <div className="policy-page">
            <div className="policy-container-compact">
                {/* Header */}
                <div className="policy-header-compact">
                    <div className="header-icon">🔒</div>
                    <h1>Privacy Policy</h1>
                    <h2>ગોપનીયતા નીતિ</h2>
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

                {/* Introduction */}
                <div className="policy-intro">
                    <p>{activeLanguage === 'english' ? PRIVACY_POLICY.introduction.english : PRIVACY_POLICY.introduction.gujarati}</p>
                </div>

                {/* Content Cards */}
                <div className="policy-cards-grid">
                    {PRIVACY_POLICY.sections.map((section) => (
                        <div className="policy-card" key={section.id}>
                            <div
                                className="card-header"
                                onClick={() => toggleSection(section.id)}
                            >
                                <div className="card-title">
                                    <span className="card-icon">{section.title.icon}</span>
                                    <h3>
                                        {activeLanguage === 'english' ? section.title.english : section.title.gujarati}
                                    </h3>
                                </div>
                                <span className="toggle-icon">{expandedSections[section.id] ? '−' : '+'}</span>
                            </div>
                            {expandedSections[section.id] && (
                                <div className="card-content">
                                    {renderList(activeLanguage === 'english' ? section.content.english : section.content.gujarati)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Contact Footer */}
                <div className="policy-footer">
                    <h3>Questions? / પ્રશ્નો?</h3>
                    <div className="contact-buttons">
                        <a href="mailto:pashudhansuraksha2026@gmail.com" className="contact-btn">
                            📧 pashudhansuraksha2026@gmail.com
                        </a>
                        <div className="contact-btn">
                            🕒 Working Hours: 9:00 AM - 6:00 PM (Mon-Sat)
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
