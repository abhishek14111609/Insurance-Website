import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { policyAPI, claimAPI } from '../services/api.service';
import toast from 'react-hot-toast';
import PhotoUpload from '../components/PhotoUpload';
import './ClaimForm.css';

const ClaimForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, isAgent } = useAuth();

    useEffect(() => {
        if (isAgent) {
            navigate('/agent/dashboard');
        }
    }, [isAgent, navigate]);
    const preSelectedPolicy = location.state?.policy;

    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingPolicies, setLoadingPolicies] = useState(true);

    const [formData, setFormData] = useState({
        policyId: preSelectedPolicy?._id || preSelectedPolicy?.id || '',
        claimType: 'death',
        incidentDate: '',
        incidentLocation: '',
        claimAmount: preSelectedPolicy?.coverageAmount || '',
        description: ''
    });

    const [documents, setDocuments] = useState({
        incident: null,
        postmortem: null,
        veterinary: null,
        other: null
    });

    const [documentPreviews, setDocumentPreviews] = useState({
        incident: null,
        postmortem: null,
        veterinary: null,
        other: null
    });

    // Fetch user's approved policies
    useEffect(() => {
        const fetchPolicies = async () => {
            try {
                setLoadingPolicies(true);
                const response = await policyAPI.getAll({ status: 'APPROVED' });
                if (response.success) {
                    setPolicies(response.data.policies || []);
                }
            } catch (error) {
                console.error('Error fetching policies:', error);
            } finally {
                setLoadingPolicies(false);
            }
        };

        fetchPolicies();
    }, []);

    // Keep claim amount in sync with selected policy coverage
    useEffect(() => {
        if (!formData.policyId) return;

        const selectedPolicy = policies.find(
            (policy) => (policy._id || policy.id) === formData.policyId
        );

        if (selectedPolicy?.coverageAmount != null) {
            setFormData((prev) => ({
                ...prev,
                claimAmount: selectedPolicy.coverageAmount
            }));
        }
    }, [formData.policyId, policies]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handlePhotoChange = (side, file, preview) => {
        setDocuments(prev => ({ ...prev, [side]: file }));
        setDocumentPreviews(prev => ({ ...prev, [side]: preview }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate
            if (!formData.policyId) {
                toast.error('Please select a policy');
                setLoading(false);
                return;
            }

            if (!documentPreviews.incident) {
                toast.error('Please upload at least one incident photo');
                setLoading(false);
                return;
            }

            // Prepare documents array
            const uploadedDocuments = [];
            Object.entries(documentPreviews).forEach(([key, value]) => {
                if (value) {
                    uploadedDocuments.push(value);
                }
            });

            // Submit claim
            const claimData = {
                policyId: formData.policyId,
                claimType: formData.claimType,
                incidentDate: formData.incidentDate,
                incidentLocation: formData.incidentLocation,
                claimAmount: parseFloat(formData.claimAmount),
                description: formData.description,
                documents: uploadedDocuments
            };

            const response = await claimAPI.create(claimData);

            if (response.success) {
                toast.success('Claim submitted successfully! Our team will review it shortly.');
                navigate('/claims');
            } else {
                throw new Error(response.message || 'Failed to submit claim');
            }
        } catch (error) {
            console.error('Claim submission error:', error);
            toast.error(error.message || 'Failed to submit claim. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loadingPolicies) {
        return (
            <div className="claim-form-page">
                <div className="container">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading your policies...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (policies.length === 0) {
        return (
            <div className="claim-form-page">
                <div className="container">
                    <div className="empty-state">
                        <h3>No Approved Policies Found</h3>
                        <p>You need an approved policy to file a claim.</p>
                        <button className="btn btn-primary" onClick={() => navigate('/policies')}>
                            Buy a Policy
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="claim-form-page">
            <div className="container">
                <div className="form-header">
                    <h1>File Insurance Claim / વીમા દાવો દાખલ કરો</h1>
                    <p>Submit your claim for review. Our team will process it within 3-5 business days. / સમીક્ષા માટે તમારો દાવો સબમિટ કરો. અમારી ટીમ 3-5 કામકાજના દિવસોમાં તેની પ્રક્રિયા કરશે.</p>
                </div>

                <form onSubmit={handleSubmit} className="claim-form">
                    {/* Policy Selection */}
                    <div className="form-section">
                        <h2>Select Policy / પોલિસી પસંદ કરો</h2>
                        <div className="form-group">
                            <label>Policy / પોલિસી *</label>
                            <select
                                name="policyId"
                                value={formData.policyId}
                                onChange={handleInputChange}
                                required
                                disabled={!!preSelectedPolicy}
                            >
                                <option value="">Select a policy / પોલિસી પસંદ કરો</option>
                                {policies.map(policy => {
                                    const policyId = policy._id || policy.id;
                                    return (
                                        <option key={policyId} value={policyId}>
                                            {policy.policyNumber} - {policy.cattleType} ({policy.tagId})
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>

                    {/* Claim Details */}
                    <div className="form-section">
                        <h2>Claim Details / દાવાની વિગતો</h2>

                        <div className="form-group">
                            <label>Claim Type / દાવાનો પ્રકાર *</label>
                            <select
                                name="claimType"
                                value={formData.claimType}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="death">Death / મૃત્યુ</option>
                                <option value="accident">Accident / અકસ્માત</option>
                                <option value="disease">Disease / રોગ</option>
                                <option value="disability">Permanent Disability / કાયમી અપંગતા</option>
                                <option value="other">Other / અન્ય</option>
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Incident Date / ઘટનાની તારીખ *</label>
                                <input
                                    type="date"
                                    name="incidentDate"
                                    value={formData.incidentDate}
                                    onChange={handleInputChange}
                                    max={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Incident Location / ઘટનાનું સ્થાન *</label>
                                <input
                                    type="text"
                                    name="incidentLocation"
                                    value={formData.incidentLocation}
                                    onChange={handleInputChange}
                                    placeholder="Enter location"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Claim Amount (₹) / દાવાની રકમ (₹) *</label>
                            <input
                                type="number"
                                name="claimAmount"
                                value={formData.claimAmount}
                                onChange={handleInputChange}
                                placeholder="Enter claim amount"
                                min="1"
                                required
                                readOnly
                            />
                            <small className="form-hint">
                                Prefilled from your policy coverage; this claim will be filed for the full covered amount
                            </small>
                        </div>

                        <div className="form-group">
                            <label>Description / વર્ણન *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="5"
                                placeholder="Provide detailed description of the incident..."
                                required
                            />
                        </div>
                    </div>

                    {/* Document Upload */}
                    <div className="form-section">
                        <h2>Upload Documents / દસ્તાવેજો અપલોડ કરો</h2>
                        <p className="section-hint">
                            Upload clear photos of relevant documents. At least one incident photo is required. / સંબંધિત દસ્તાવેજોના સ્પષ્ટ ફોટા અપલોડ કરો. ઓછામાં ઓછો એક ઘટનાનો ફોટો આવશ્યક છે.
                        </p>

                        <div className="documents-grid">
                            <PhotoUpload
                                side="incident"
                                label="Incident Photo / ઘટનાનો ફોટો *"
                                value={documentPreviews.incident}
                                onChange={handlePhotoChange}
                                required
                            />
                            <PhotoUpload
                                side="postmortem"
                                label="Post-mortem Report / પોસ્ટમોર્ટમ રિપોર્ટ"
                                value={documentPreviews.postmortem}
                                onChange={handlePhotoChange}
                            />
                            <PhotoUpload
                                side="veterinary"
                                label="Veterinary Certificate / વેટરનરી સર્ટિફિકેટ"
                                value={documentPreviews.veterinary}
                                onChange={handlePhotoChange}
                            />
                            <PhotoUpload
                                side="other"
                                label="Other Documents / અન્ય દસ્તાવેજો"
                                value={documentPreviews.other}
                                onChange={handlePhotoChange}
                            />
                        </div>
                    </div>

                    {/* Important Notes */}
                    <div className="info-box">
                        <h4>📋 Important Notes / મહત્વપૂર્ણ નોંધો</h4>
                        <ul>
                            <li>Claims must be filed within 24 hours of the incident / ઘટનાના 24 કલાકની અંદર દાવાઓ ફાઇલ કરવા આવશ્યક છે</li>
                            <li>Post-mortem report is mandatory for death claims / મૃત્યુના દાવા માટે પોસ્ટમોર્ટમ રિપોર્ટ ફરજિયાત છે</li>
                            <li>Veterinary certificate is required for disease/disability claims / રોગ/અપંગતાના દાવાઓ માટે વેટરનરી સર્ટિફિકેટ જરૂરી છે</li>
                            <li>All documents should be clear and legible / બધા દસ્તાવેજો સ્પષ્ટ અને વાંચી શકાય તેવા હોવા જોઈએ</li>
                            <li>False claims may result in policy cancellation / ખોટા દાવાઓને કારણે પોલિસી રદ થઈ શકે છે</li>
                        </ul>
                    </div>

                    {/* Submit Button */}
                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate('/claims')}
                        >
                            Cancel / રદ કરો
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Submitting... / સબમિટ થઈ રહ્યું છે...' : 'Submit Claim / દાવો સબમિટ કરો'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ClaimForm;
