import { useState, useEffect } from 'react';
import { contactAPI } from '../services/api.service';
import { useAuth } from '../context/AuthContext';
import './ContactUs.css';

const ContactUs = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    // Auto-fill user data if logged in
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
            alert('Thank you for contacting us! We will get back to you soon.');
            setFormData(prev => ({
                ...prev,
                subject: '',
                message: ''
            }));
        } catch (error) {
            alert(error.message || 'Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="contact-us">
            {/* Hero Section */}
            <section className="page-hero">
                <div className="container">
                    <h1>Contact Us</h1>
                    <p>We're here to help! Reach out to us for any queries or assistance</p>
                </div>
            </section>

            {/* Contact Section */}
            <section className="section">
                <div className="container">
                    <div className="contact-grid">
                        {/* Contact Form */}
                        <div className="contact-form-container">
                            <h2>Send Us a Message</h2>
                            <form onSubmit={handleSubmit} className="contact-form">
                                <div className="form-group">
                                    <label>Full Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter your name"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email Address *</label>
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
                                    <label>Phone Number *</label>
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
                                    <label>Subject *</label>
                                    <select
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Subject</option>
                                        <option value="general">General Inquiry</option>
                                        <option value="claims">Claims Support</option>
                                        <option value="policy">Policy Information</option>
                                        <option value="renewal">Policy Renewal</option>
                                        <option value="complaint">Complaint</option>
                                        <option value="feedback">Feedback</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Message *</label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Enter your message"
                                        rows="5"
                                        required
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Sending...' : 'Send Message'}
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
                                    <p>Customer Care: 1800-123-4567</p>
                                    <p>Claims: 1800-123-7890</p>
                                    <p>Mon-Sat: 9 AM - 7 PM</p>
                                </div>

                                <div className="info-card">
                                    <div className="info-icon">✉️</div>
                                    <h3>Email Us</h3>
                                    <p>support@securelife.com</p>
                                    <p>claims@securelife.com</p>
                                    <p>Response within 24 hours</p>
                                </div>

                                <div className="info-card">
                                    <div className="info-icon">📍</div>
                                    <h3>Visit Us</h3>
                                    <p>SecureLife Insurance House</p>
                                    <p>Sector 44, Gurugram</p>
                                    <p>Haryana - 122001</p>
                                </div>

                                <div className="info-card">
                                    <div className="info-icon">💬</div>
                                    <h3>Live Chat</h3>
                                    <p>Chat with our experts</p>
                                    <p>Available 24/7</p>
                                    <button className="btn btn-secondary">Start Chat</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Branch Locator */}
            <section className="section bg-light">
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
            </section>

            {/* FAQ Section */}
            <section className="section">
                <div className="container">
                    <h2 className="section-title">Frequently Asked Questions</h2>
                    <div className="faq-grid">
                        <div className="faq-item">
                            <h3>How can I buy insurance online?</h3>
                            <p>You can buy insurance online by visiting our website, selecting your desired plan, filling in your details, and making the payment. Your policy will be issued instantly.</p>
                        </div>
                        <div className="faq-item">
                            <h3>How do I file a claim?</h3>
                            <p>You can file a claim through our mobile app, website, or by calling our claims helpline at 1800-123-7890. Our team will guide you through the process.</p>
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
                        <h2>Still Have Questions?</h2>
                        <p>Our customer support team is available 24/7 to assist you</p>
                        <button className="btn btn-outline">Call 1800-123-4567</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ContactUs;
