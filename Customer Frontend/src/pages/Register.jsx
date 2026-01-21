import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ButtonLoader } from '../components/Loader';
import toast from 'react-hot-toast';
import './Register.css';

const Register = () => {
    // ... existing setup ...
    const navigate = useNavigate();
    const { register, isAuthenticated, isAgent } = useAuth();
    // ... existing logic ...

    useEffect(() => {
        if (isAuthenticated) {
            if (isAgent) {
                navigate('/agent/dashboard');
            } else {
                navigate('/dashboard');
            }
        }
    }, [isAuthenticated, isAgent, navigate]);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        dateOfBirth: '',
        gender: 'male',
        address: '',
        city: '',
        state: '',
        pincode: '',
        agreeTerms: false
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
        // Clear error for this field
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required / પૂરું નામ જરૂરી છે';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required / ઈમેલ જરૂરી છે';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid / ઈમેલ અમાન્ય છે';
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required / ફોન નંબર જરૂરી છે';
        } else if (!/^[0-9]{10}$/.test(formData.phone)) {
            newErrors.phone = 'Phone number must be 10 digits / ફોન નંબર 10 અંકોનો હોવો જોઈએ';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required / પાસવર્ડ જરૂરી છે';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters / પાસવર્ડ ઓછામાં ઓછા 6 અક્ષરોનો હોવો જોઈએ';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match / પાસવર્ડ મેચ થતા નથી';
        }
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required / જન્મ તારીખ જરૂરી છે';
        if (!formData.city.trim()) newErrors.city = 'City is required / શહેર જરૂરી છે';
        if (!formData.state.trim()) newErrors.state = 'State is required / રાજ્ય જરૂરી છે';
        if (!formData.pincode.trim()) {
            newErrors.pincode = 'Pincode is required / પીન કોડ જરૂરી છે';
        } else if (!/^[0-9]{6}$/.test(formData.pincode)) {
            newErrors.pincode = 'Pincode must be 6 digits / પીન કોડ 6 અંકોનો હોવો જોઈએ';
        }
        if (!formData.agreeTerms) {
            newErrors.agreeTerms = 'You must agree to terms and conditions / તમારે નિયમો અને શરતો સાથે સંમત થવું આવશ્યક છે';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            // Register user via AuthContext (no auto login)
            await register({
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                role: 'customer'
            });

            toast.success('Registration successful! Please verify your email, then log in. / નોંધણી સફળ! કૃપા કરીને તમારો ઇમેઇલ ચકાસો, પછી લોગ ઇન કરો.', { duration: 6000 });
            navigate('/login');
        } catch (error) {
            setErrors({ email: error.message || 'Registration failed. Please try again. / નોંધણી નિષ્ફળ. કૃપા કરીને ફરી પ્રયાસ કરો.' });
            setIsSubmitting(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <div className="register-header">
                    <h1>Create Your Account / તમારું ખાતું બનાવો</h1>
                    <p>Join Pashudhan Suraksha and protect what matters most</p>
                </div>

                <form className="register-form" onSubmit={handleSubmit}>
                    {/* Personal Information */}
                    <div className="form-section">
                        <h2 className="section-title">Personal Information / વ્યક્તિગત માહિતી</h2>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Full Name * / પૂરું નામ *</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    placeholder="Enter your full name"
                                    className={errors.fullName ? 'error' : ''}
                                />
                                {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                            </div>
                            <div className="form-group">
                                <label>Date of Birth * / જન્મ તારીખ *</label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleInputChange}
                                    max={new Date().toISOString().split('T')[0]}
                                    className={errors.dateOfBirth ? 'error' : ''}
                                />
                                {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Email Address * / ઈમેલ સરનામું *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="your.email@example.com"
                                    className={errors.email ? 'error' : ''}
                                />
                                {errors.email && <span className="error-message">{errors.email}</span>}
                            </div>
                            <div className="form-group">
                                <label>Phone Number * / ફોન નંબર *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="10-digit mobile number"
                                    maxLength="10"
                                    className={errors.phone ? 'error' : ''}
                                />
                                {errors.phone && <span className="error-message">{errors.phone}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Gender * / લિંગ *</label>
                            <select name="gender" value={formData.gender} onChange={handleInputChange}>
                                <option value="male">Male / પુરુષ</option>
                                <option value="female">Female / સ્ત્રી</option>
                                <option value="other">Other / અન્ય</option>
                            </select>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="form-section">
                        <h2 className="section-title">Address Information / સરનામાની માહિતી</h2>

                        <div className="form-group">
                            <label>Address / સરનામું</label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Enter your complete address"
                                rows="3"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>City * / શહેર *</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleInputChange}
                                    placeholder="Enter city"
                                    className={errors.city ? 'error' : ''}
                                />
                                {errors.city && <span className="error-message">{errors.city}</span>}
                            </div>
                            <div className="form-group">
                                <label>State * / રાજ્ય *</label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    placeholder="Enter state"
                                    className={errors.state ? 'error' : ''}
                                />
                                {errors.state && <span className="error-message">{errors.state}</span>}
                            </div>
                            <div className="form-group">
                                <label>Pincode * / પીન કોડ *</label>
                                <input
                                    type="text"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleInputChange}
                                    placeholder="6-digit pincode"
                                    maxLength="6"
                                    className={errors.pincode ? 'error' : ''}
                                />
                                {errors.pincode && <span className="error-message">{errors.pincode}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="form-section">
                        <h2 className="section-title">Security / સુરક્ષા</h2>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Password * / પાસવર્ડ *</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="Minimum 6 characters"
                                        className={errors.password ? 'error' : ''}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? "👁️" : "👁️‍🗨️"}
                                    </button>
                                </div>
                                {errors.password && <span className="error-message">{errors.password}</span>}
                            </div>
                            <div className="form-group">
                                <label>Confirm Password * / પાસવર્ડની પુષ્ટિ કરો *</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="Re-enter password"
                                        className={errors.confirmPassword ? 'error' : ''}
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                    >
                                        {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                                    </button>
                                </div>
                                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Terms */}
                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="agreeTerms"
                                checked={formData.agreeTerms}
                                onChange={handleInputChange}
                            />
                            <span>
                                I agree to the <Link to="/terms">Terms & Conditions</Link> and <Link to="/privacy">Privacy Policy</Link>
                            </span>
                        </label>
                        {errors.agreeTerms && <span className="error-message">{errors.agreeTerms}</span>}
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
                        {isSubmitting && <ButtonLoader />}
                        {isSubmitting ? 'Creating Account... / ખાતું બનાવી રહ્યું છે...' : 'Create Account / ખાતું બનાવો'}
                    </button>

                    <div className="form-footer">
                        <p>Already have an account? / પહેલાથી જ ખાતું છે? <Link to="/login">Login here / અહીં લોગિન કરો</Link></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
