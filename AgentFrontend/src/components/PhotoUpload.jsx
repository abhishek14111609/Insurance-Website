import { useState } from 'react';
import PropTypes from 'prop-types';
import './PhotoUpload.css';

const PhotoUpload = ({ side, label, value, onChange, required }) => {
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file (JPG, PNG, etc.)');
            return;
        }

        // Validate file size (5MB = 5242880 bytes)
        if (file.size > 5242880) {
            setError('File size must be less than 5MB. Please compress the image.');
            return;
        }

        setError('');

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            onChange(side, file, reader.result);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="photo-upload">
            <label className="photo-upload-label">
                {label} {required && <span className="required">*</span>}
            </label>

            <div className="photo-upload-container">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="photo-upload-input"
                    id={`photo-${side}`}
                />

                <label htmlFor={`photo-${side}`} className="photo-upload-box">
                    {value ? (
                        <div className="photo-preview">
                            <img src={value} alt={`${label} preview`} />
                            <div className="photo-overlay">
                                <span>Click to change photo</span>
                            </div>
                        </div>
                    ) : (
                        <div className="photo-placeholder">
                            <span className="upload-icon">📷</span>
                            <span>Click to upload</span>
                            <span className="upload-hint">Max 5MB • JPG, PNG</span>
                        </div>
                    )}
                </label>
            </div>

            {error && <span className="error-message">{error}</span>}
        </div>
    );
};

PhotoUpload.propTypes = {
    side: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    required: PropTypes.bool
};

PhotoUpload.defaultProps = {
    value: null,
    required: false
};

export default PhotoUpload;
