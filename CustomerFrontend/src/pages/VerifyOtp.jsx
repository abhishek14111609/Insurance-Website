import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api.service';
import { ButtonLoader } from '../components/Loader';
import toast from 'react-hot-toast';
import './VerifyOtp.css';

const VerifyOtp = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (location.state && location.state.email) {
            setEmail(location.state.email);
        } else {
            // If no email in state, redirect to login
            toast.error('Session expired or invalid access');
            navigate('/login');
        }
    }, [location, navigate]);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else {
            setResendDisabled(false);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // Focus next input
        if (element.value && element.nextSibling) {
            element.nextSibling.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace") {
            if (!otp[index] && e.target.previousSibling) {
                e.target.previousSibling.focus();
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text').slice(0, 6).split('');
        if (data.length === 0) return;

        const newOtp = [...otp];
        data.forEach((val, i) => {
            if (i < 6 && !isNaN(val)) newOtp[i] = val;
        });
        setOtp(newOtp);

        // Focus appropriate child
        const focusIndex = Math.min(data.length, 5);
        const inputs = document.querySelectorAll('.otp-input');
        if (inputs[focusIndex]) inputs[focusIndex].focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpValue = otp.join('');
        if (otpValue.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await authAPI.verifyEmailOTP(email, otpValue);
            if (response.success) {
                toast.success('Email verified successfully! / ઈમેલ સફળતાપૂર્વક ચકાસવામાં આવ્યો!');
                navigate('/login');
            }
        } catch (error) {
            toast.error(error.message || 'Verification failed / ચકાસણી નિષ્ફળ');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async () => {
        setResendDisabled(true);
        setCountdown(60); // 60 seconds cooldown
        try {
            await authAPI.resendVerification(email);
            toast.success('OTP resent successfully / OTP ફરી મોકલ્યો');
        } catch (error) {
            toast.error(error.message || 'Failed to resend OTP');
            setResendDisabled(false);
            setCountdown(0);
        }
    };

    return (
        <div className="verify-page">
            <div className="verify-container">
                <div className="verify-header">
                    <h2>Verify Your Email / તમારી ઈમેલ ચકાસો</h2>
                    <p>Enter the 6-digit code sent to <strong>{email}</strong></p>
                </div>

                <form onSubmit={handleSubmit} className="verify-form">
                    <div className="otp-container" onPaste={handlePaste}>
                        {otp.map((data, index) => (
                            <input
                                className="otp-input"
                                type="text"
                                name="otp"
                                maxLength="1"
                                key={index}
                                value={data}
                                onChange={(e) => handleChange(e.target, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                onFocus={(e) => e.target.select()}
                                required
                            />
                        ))}
                    </div>

                    <button type="submit" className="btn-verify" disabled={isSubmitting}>
                        {isSubmitting ? <ButtonLoader /> : 'Verify Account / એકાઉન્ટ ચકાસો'}
                    </button>

                    <div className="resend-container">
                        <p>Didn't receive code? / કોડ મળ્યો નથી?</p>
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendDisabled}
                            className="btn-resend"
                        >
                            {resendDisabled ? `Resend in ${countdown}s` : 'Resend OTP'}
                        </button>
                    </div>

                    <div className="back-to-login">
                        <Link to="/login">Back to Login / લૉગિન પર પાછા જાઓ</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VerifyOtp;
