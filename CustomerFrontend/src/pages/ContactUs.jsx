import { useState, useEffect } from 'react';
import { contactAPI } from '../services/api.service';
import { useAuth } from '../context/AuthContext';
import { ButtonLoader } from '../components/Loader';
import toast from 'react-hot-toast';
import './ContactUs.css';

const ContactUs = () => {
    // ... existing setup ...
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    // ... existing useEffect ...
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.fullName || prev.name,
                email: user.email || prev.email,
                phone: user.phone || prev.phone
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await contactAPI.submit(formData);
            toast.success('Thank you for contacting us! We will get back to you soon. / અમારો સંપર્ક કરવા બદલ આભાર! અમે જલ્દી જ તમારો સંપર્ક કરીશું.');
            setFormData(prev => ({
                ...prev,
                subject: '',
                message: ''
            }));
        } catch (error) {
            toast.error(error.message || 'Failed to send message. Please try again. / સંદેશ મોકલવામાં નિષ્ફળ. કૃપા કરીને ફરી પ્રયાસ કરો.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="contact-us">
            {/* Hero Section */}
            <section className="page-hero" style={{ marginTop: '150px', marginBottom: '10px' }}>
                <div className="container">
                    <h1>Contact Us / અમારો સંપર્ક કરો</h1>
                    <p>We're here to help! Reach out to us for any queries or assistance / અમે મદદ કરવા માટે અહીં છીએ! કોઈપણ પ્રશ્નો અથવા સહાય માટે અમારો સંપર્ક કરો</p>
                </div>
            </section>

            {/* Contact Section */}
            <section className="section">
                <div className="container">
                    <div className="contact-grid">
                        {/* Contact Form */}
                        <div className="contact-form-container">
                            <h2>Send Us a Message / અમને સંદેશ મોકલો</h2>
                            <form onSubmit={handleSubmit} className="contact-form">
                                <div className="form-group">
                                    <label>Full Name * / પૂરું નામ *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email Address * / ઈમેલ સરનામું *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number * / ફોન નંબર *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Enter your phone"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Subject * / વિષય *</label>
                                    <select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Subject / વિષય પસંદ કરો</option>
                                        <option value="general">General Inquiry / સામાન્ય પૂછપરછ</option>
                                        <option value="claims">Claims Support / દાવા સહાય</option>
                                        <option value="policy">Policy Information / પોલિસી માહિતી</option>
                                        <option value="renewal">Policy Renewal / પોલિસી રિન્યુઅલ</option>
                                        <option value="complaint">Complaint / ફરિયાદ</option>
                                        <option value="feedback">Feedback / પ્રતિસાદ</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Message * / સંદેશ *</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Enter your message"
                                        rows="5"
                                        required
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                    {loading && <ButtonLoader />}
                                    {loading ? 'Sending... / મોકલી રહ્યું છે...' : 'Send Message / સંદેશ મોકલો'}
                                </button>
                            </form>
                        </div>

                        {/* Contact Info */}
                        <div className="contact-info">
                            <h2>Get in Touch</h2>
                            <div className="info-cards">
                                <div className="info-card">
                                    <div className="info-icon">📞</div>
                                    <h3>Call Us</h3>
                                    <p style={{ fontWeight: "bold" }}>Customer Care: 79903 39567</p>
                                    <p style={{ fontWeight: "bold" }}>For Claims: 83479 46718</p>
                                    <p>Mon-Sat: 9 AM - 7 PM</p>
                                </div>

                                <div className="info-card">
                                    <div className="info-icon">✉️</div>
                                    <h3>Email Us</h3>
                                    <p style={{ fontWeight: "bold" }}>pashudhansuraksha2026@gmail.com</p>

                                    <p>Response within 24 hours</p>
                                </div>

                                <div className="info-card">
                                    <div className="info-icon">📍</div>
                                    <h3>Visit Us</h3>
                                    <p>Shop No-10, Second Floor,</p>
                                    <p>Suvidhi Solitaire, TB Road,</p>
                                    <p>Opp. APMC Market, Vijapur,</p>
                                    <p>Mahesana, Gujarat - 384570</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Branch Locator */}
            {/* <section className="section bg-light">
                <div className="container">
                    <h2 className="section-title">Find a Branch Near You</h2>
                    <div className="locator-section">
                        <div className="locator-form">
                            <input type="text" placeholder="Enter your city or PIN code" />
                            <button className="btn btn-primary">Search</button>
                        </div>
                        <div className="grid grid-3">
                            <div className="branch-card">
                                <h3>Mumbai</h3>
                                <p>📍 Andheri West, Mumbai - 400058</p>
                                <p>📞 022-12345678</p>
                                <p>🕐 Mon-Sat: 10 AM - 6 PM</p>
                            </div>
                            <div className="branch-card">
                                <h3>Delhi</h3>
                                <p>📍 Connaught Place, New Delhi - 110001</p>
                                <p>📞 011-12345678</p>
                                <p>🕐 Mon-Sat: 10 AM - 6 PM</p>
                            </div>
                            <div className="branch-card">
                                <h3>Bangalore</h3>
                                <p>📍 MG Road, Bangalore - 560001</p>
                                <p>📞 080-12345678</p>
                                <p>🕐 Mon-Sat: 10 AM - 6 PM</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section> */}

            {/* FAQ Section */}
            <section className="section">
                <div className="container">
                    <h2 className="section-title" style={{ justifyContent: "center" }}>Frequently Asked Questions</h2>
                    <div className="faq-grid">
                        <div className="faq-item">
                            <h3>How can I buy insurance online?</h3>
                            <p>You can buy insurance online by visiting our website, selecting your desired plan, filling in your details, and making the payment. Your policy will be issued instantly.</p>
                        </div>
                        <div className="faq-item">
                            <h3>How do I file a claim?</h3>
                            <p>You can file a claim through our mobile app, website, or by calling our claims helpline at 83479 46718. Our team will guide you through the process.</p>
                        </div>
                        <div className="faq-item">
                            <h3>What documents are required for claims?</h3>
                            <p>The documents vary based on the type of claim. Generally, you'll need your policy document, claim form, medical bills (for health), FIR copy (for theft), etc.</p>
                        </div>
                        <div className="faq-item">
                            <h3>How long does claim settlement take?</h3>
                            <p>For cashless claims, pre-authorization is instant. For reimbursement claims, it typically takes 3-7 working days once all documents are submitted.</p>
                        </div>
                        <div className="faq-item">
                            <h3>Can I renew my policy online?</h3>
                            <p>Yes, you can easily renew your policy online through our website or mobile app. The process takes just 2 minutes.</p>
                        </div>
                        <div className="faq-item">
                            <h3>What is cashless treatment?</h3>
                            <p>Cashless treatment allows you to get medical treatment at network hospitals without paying upfront. The hospital bills us directly for covered expenses.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section bg-gradient">
                <div className="container">
                    <div className="cta-content">
                        <h2 style={{ color: "white" }}>Still Have Questions?</h2>
                        <p style={{ color: "white" }}>Our customer support team is available 24/7 to assist you</p>
                        <button className="btn btn-outline" style={{ color: "white", border: "8px solid white" }}>Call 83479 46718</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactUs;
