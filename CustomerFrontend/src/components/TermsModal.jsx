import React from 'react';
import { TERMS_AND_CONDITIONS, CLAIM_PROCEDURES, EXCLUSIONS } from '../constants/termsAndConditions';
import './TermsModal.css';

const TermsModal = ({ isOpen, onClose, type = 'terms' }) => {
    if (!isOpen) return null;

    const renderContent = () => {
        if (type === 'terms') {
            return (
                <>
                    <h2>Terms & Conditions / નિયમો અને શરતો</h2>

                    <div className="modal-section">
                        <h3>📋 Policy Terms / પોલિસી નિયમો</h3>
                        <div className="terms-columns">
                            <div className="terms-column">
                                <h4>English:</h4>
                                <ul>
                                    {TERMS_AND_CONDITIONS.english.map((term, index) => (
                                        <li key={`en-${index}`}>{term}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="terms-column">
                                <h4>ગુજરાતી:</h4>
                                <ul>
                                    {TERMS_AND_CONDITIONS.gujarati.map((term, index) => (
                                        <li key={`gu-${index}`}>{term}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="modal-section">
                        <h3>📝 Claim Procedures / દાવાની પ્રક્રિયા</h3>
                        <ul>
                            {CLAIM_PROCEDURES.english.map((proc, index) => (
                                <li key={`claim-${index}`}>{proc}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="modal-section exclusions">
                        <h3>⚠️ Exclusions / બાકાતો</h3>
                        <ul>
                            {EXCLUSIONS.english.map((excl, index) => (
                                <li key={`excl-${index}`}>
                                    <span className="excl-icon">✗</span>
                                    {excl}
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            );
        } else {
            return (
                <>
                    <h2>Privacy Policy / ગોપનીયતા નીતિ</h2>
                    <div className="modal-section">
                        <h3>Information Collection</h3>
                        <p>We collect personal information including name, contact details, and cattle information for policy processing.</p>

                        <h3>Data Usage</h3>
                        <p>Your data is used solely for insurance purposes and claim processing. We do not share your information with third parties without consent.</p>

                        <h3>Data Security</h3>
                        <p>We implement industry-standard security measures to protect your personal information.</p>

                        <h3>માહિતી સંગ્રહ</h3>
                        <p>અમે પોલિસી પ્રક્રિયા માટે નામ, સંપર્ક વિગતો અને પશુની માહિતી સહિત વ્યક્તિગત માહિતી એકત્રિત કરીએ છીએ.</p>
                    </div>
                </>
            );
        }
    };

    return (
        <div className="terms-modal-overlay" onClick={onClose}>
            <div className="terms-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>✕</button>
                <div className="modal-body">
                    {renderContent()}
                </div>
                <div className="modal-footer">
                    <button className="btn-close" onClick={onClose}>Close / બંધ કરો</button>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;
