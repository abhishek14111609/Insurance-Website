import './AboutUs.css';

const AboutUs = () => {
    return (
        <div className="about-us" >
            {/* Hero Section */}
            <section className="page-hero" style={{ marginTop: '150px', }}>
                <div className="container">
                    <h1 style={{ textAlign: 'center' }}>About Pashudhan Suraksha</h1>
                    <p style={{ textAlign: 'center' }}>Your trusted partner in protecting what matters most for over 20 years</p>
                </div>
            </section>

            {/* Company Overview */}
            <section className="section">
                <div className="container">
                    <div className="about-content">
                        <div className="about-text">
                            <h2>Who We Are</h2>
                            <p>
                                Pashudhan Suraksha is one of India's leading insurance providers, committed to delivering
                                comprehensive insurance solutions that protect you and your loved ones. With over 20 years
                                of experience in the insurance industry, we have served more than 5 million happy customers
                                across India.
                            </p>
                            <p>
                                Our mission is to make insurance simple, accessible, and affordable for everyone. We leverage
                                technology and innovation to provide seamless digital experiences while maintaining the human
                                touch that our customers value.
                            </p>
                            <p>
                                From health and life insurance to motor and travel insurance, we offer a wide range of
                                products tailored to meet your specific needs. Our commitment to transparency, quick claim
                                settlement, and 24/7 customer support has made us the preferred choice for millions of Indians.
                            </p>
                        </div>
                        <div className="about-image">
                            <div className="stats-box">
                                <div className="stat">
                                    <h3>5M+</h3>
                                    <p>Happy Customers</p>
                                </div>
                                <div className="stat">
                                    <h3>20+</h3>
                                    <p>Years of Service</p>
                                </div>
                                <div className="stat">
                                    <h3>98%</h3>
                                    <p>Claim Settlement</p>
                                </div>
                                <div className="stat">
                                    <h3>15,000+</h3>
                                    <p>Network Hospitals</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="section bg-light">
                <div className="container">
                    <h2 className="section-title">Our Core Values</h2>
                    <div className="grid grid-4">
                        <div className="value-card">
                            <div className="value-icon">🎯</div>
                            <h3>Customer First</h3>
                            <p>We put our customers at the center of everything we do, ensuring their needs are always our priority</p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">🔒</div>
                            <h3>Trust & Integrity</h3>
                            <p>We maintain the highest standards of transparency and honesty in all our dealings</p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">⚡</div>
                            <h3>Innovation</h3>
                            <p>We continuously innovate to provide better, faster, and more convenient insurance solutions</p>
                        </div>
                        <div className="value-card">
                            <div className="value-icon">🤝</div>
                            <h3>Excellence</h3>
                            <p>We strive for excellence in service delivery and claim settlement processes</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Achievements */}
            <section className="section">
                <div className="container">
                    <h2 className="section-title">Awards & Recognition</h2>
                    <div className="grid grid-3">
                        <div className="award-card">
                            <div className="award-icon">🏆</div>
                            <h3>Best General Insurance Company 2024</h3>
                            <p>Awarded at the Insurance Conclave & Awards</p>
                        </div>
                        <div className="award-card">
                            <div className="award-icon">🏆</div>
                            <h3>Excellence in Customer Service 2023</h3>
                            <p>FICCI Insurance Industry Awards</p>
                        </div>
                        <div className="award-card">
                            <div className="award-icon">🏆</div>
                            <h3>Digital Innovation Award 2023</h3>
                            <p>BFSI Leadership Awards</p>
                        </div>
                        <div className="award-card">
                            <div className="award-icon">🏆</div>
                            <h3>Best Health Insurance Provider 2022</h3>
                            <p>Economic Times BFSI Excellence Awards</p>
                        </div>
                        <div className="award-card">
                            <div className="award-icon">🏆</div>
                            <h3>Customer Retention Excellence 2022</h3>
                            <p>Insurance Industry Excellence Awards</p>
                        </div>
                        <div className="award-card">
                            <div className="award-icon">🏆</div>
                            <h3>Best Mobile App 2021</h3>
                            <p>SKOCH Financial Services Award</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Leadership Team */}
            <section className="section bg-light">
                <div className="container">
                    <h2 className="section-title">Our Leadership</h2>
                    <div className="grid grid-4">
                        <div className="leader-card">
                            <div className="leader-avatar">👨‍💼</div>
                            <h3>Rajesh Kumar</h3>
                            <p className="leader-role">CEO & Managing Director</p>
                            <p className="leader-bio">25+ years of experience in insurance and financial services</p>
                        </div>
                        <div className="leader-card">
                            <div className="leader-avatar">👩‍💼</div>
                            <h3>Priya Sharma</h3>
                            <p className="leader-role">Chief Operating Officer</p>
                            <p className="leader-bio">Expert in operations management and digital transformation</p>
                        </div>
                        <div className="leader-card">
                            <div className="leader-avatar">👨‍💼</div>
                            <h3>Amit Verma</h3>
                            <p className="leader-role">Chief Technology Officer</p>
                            <p className="leader-bio">Leading technology innovation and digital initiatives</p>
                        </div>
                        <div className="leader-card">
                            <div className="leader-avatar">👩‍💼</div>
                            <h3>Neha Gupta</h3>
                            <p className="leader-role">Chief Customer Officer</p>
                            <p className="leader-bio">Driving customer experience and satisfaction</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Network Section */}
            <section className="section">
                <div className="container">
                    <h2 className="section-title">Our Network</h2>
                    <div className="grid grid-3">
                        <div className="network-item">
                            <div className="network-number">15,000+</div>
                            <h3>Network Hospitals</h3>
                            <p>Cashless treatment facilities across India</p>
                        </div>
                        <div className="network-item">
                            <div className="network-number">10,000+</div>
                            <h3>Cashless Garages</h3>
                            <p>Authorized repair centers for motor insurance</p>
                        </div>
                        <div className="network-item">
                            <div className="network-number">500+</div>
                            <h3>Branch Offices</h3>
                            <p>Present in all major cities across India</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section bg-gradient">
                <div className="container">
                    <div className="cta-content">
                        <h2 style={{ color: 'white' }}>Join Our Family of 5M+ Happy Customers</h2>
                        <p style={{ color: 'white' }}>Experience the best insurance services with us</p>
                        <button className="btn btn-outline" style={{ color: 'white', border: "8px solid white" }}>Get Started</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutUs;
