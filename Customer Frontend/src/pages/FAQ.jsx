import { useState } from 'react';
import './FAQ.css';

function FAQ() {
    const [activeCategory, setActiveCategory] = useState('general');
    const [openQuestion, setOpenQuestion] = useState(null);

    const faqData = {
        general: [
            {
                question: "What is insurance and why do I need it?",
                answer: "Insurance is a financial protection mechanism that helps you manage risks and uncertainties. It provides financial compensation in case of unforeseen events like accidents, illnesses, or property damage. Having insurance ensures you and your family are protected from significant financial losses."
            },
            {
                question: "How do I choose the right insurance plan?",
                answer: "Consider factors like your age, health status, financial goals, and family needs. Evaluate coverage amount, premium costs, claim settlement ratio, network hospitals/garages, and policy features. Our expert advisors can help you select the most suitable plan."
            },
            {
                question: "What is a premium and how is it calculated?",
                answer: "A premium is the amount you pay to keep your insurance policy active. It's calculated based on factors like age, coverage amount, policy type, add-ons, location, and risk factors. You can pay premiums monthly, quarterly, or annually."
            },
            {
                question: "Can I have multiple insurance policies?",
                answer: "Yes, you can have multiple insurance policies from different insurers. For health insurance, you can claim from multiple policies. For motor insurance, one comprehensive policy per vehicle is recommended, though you can have third-party coverage as legally required."
            },
            {
                question: "What is the claim settlement ratio?",
                answer: "Claim settlement ratio indicates the percentage of claims settled by an insurance company out of total claims received. A higher ratio (above 95%) suggests better reliability and customer satisfaction. We partner with insurers having excellent settlement records."
            }
        ],
        health: [
            {
                question: "What does health insurance cover?",
                answer: "Health insurance typically covers hospitalization expenses, room rent, ICU charges, surgeon fees, medicines, diagnostic tests, pre and post-hospitalization expenses, ambulance charges, and daycare procedures. Coverage varies by plan type."
            },
            {
                question: "What is a waiting period in health insurance?",
                answer: "A waiting period is the time you must wait before certain benefits become active. Initial waiting period (30 days) applies to most treatments except accidents. Pre-existing diseases have 2-4 year waiting periods. Specific diseases may have 1-2 year waiting periods."
            },
            {
                question: "Can I add family members to my health insurance?",
                answer: "Yes, our family floater plans allow you to cover your spouse, children, and parents under a single policy. This is cost-effective and convenient. Each member can use the sum insured as needed throughout the policy year."
            },
            {
                question: "What are pre-existing diseases?",
                answer: "Pre-existing diseases are medical conditions you had before buying insurance, like diabetes, hypertension, or asthma. These are typically covered after a waiting period of 2-4 years. Some plans offer reduced waiting periods for an additional premium."
            },
            {
                question: "Is COVID-19 treatment covered?",
                answer: "Yes, COVID-19 treatment including hospitalization, ICU charges, and quarantine expenses are covered under health insurance plans. Coverage is subject to policy terms, waiting periods, and sub-limits as applicable."
            }
        ],
        motor: [
            {
                question: "What's the difference between comprehensive and third-party insurance?",
                answer: "Third-party insurance only covers damages to third parties and is legally mandatory. Comprehensive insurance covers both third-party liabilities and damages to your own vehicle from accidents, theft, natural calamities, and fire."
            },
            {
                question: "What is No Claim Bonus (NCB)?",
                answer: "NCB is a discount on your premium for not making claims during the policy year. It ranges from 20% to 50% based on claim-free years. NCB belongs to you and can be transferred when you buy a new vehicle or switch insurers."
            },
            {
                question: "What is Insured Declared Value (IDV)?",
                answer: "IDV is the current market value of your vehicle for which it is insured. It decreases each year due to depreciation. In case of total loss or theft, you receive compensation based on IDV. Higher IDV means higher premium but better coverage."
            },
            {
                question: "Are accessories covered in car insurance?",
                answer: "Standard accessories installed by manufacturers are covered. Additional accessories like music systems, alloy wheels, or GPS need to be declared and insured separately by paying extra premium."
            },
            {
                question: "What to do immediately after an accident?",
                answer: "First, ensure everyone's safety and call emergency services if needed. Take photos of the accident scene and damages. Exchange details with other parties. Inform the police if necessary. Contact your insurer immediately and file an FIR within 24 hours for claims."
            }
        ],
        claims: [
            {
                question: "How do I file a claim?",
                answer: "File claims through our website, mobile app, or customer service. For cashless claims, visit network hospitals/garages with your policy details. For reimbursement, submit bills and documents after treatment. Our team will guide you through the process."
            },
            {
                question: "What is cashless claim facility?",
                answer: "Cashless facility allows you to get treatment at network hospitals or vehicle repairs at network garages without paying upfront. The hospital/garage directly settles bills with the insurance company, subject to policy coverage and approval."
            },
            {
                question: "How long does claim settlement take?",
                answer: "Cashless claims are typically approved within 2-6 hours for planned treatments. Reimbursement claims are settled within 7-15 days after receiving complete documents. Emergency cashless claims are processed immediately based on availability."
            },
            {
                question: "What documents are needed for claims?",
                answer: "Common documents include policy copy, claim form, hospital/garage bills, medical reports, FIR (for accidents/theft), driving license, RC copy, and ID proof. Specific requirements vary by claim type. Our team will provide a complete checklist."
            },
            {
                question: "Can my claim be rejected?",
                answer: "Claims may be rejected for reasons like policy lapse, incorrect information, exclusions, non-disclosure of pre-existing conditions, drunk driving, or driving without a valid license. Always provide accurate information and follow policy terms to avoid rejection."
            }
        ],
        policy: [
            {
                question: "How do I renew my policy?",
                answer: "You can renew online through our website or app, or contact our support team. We send renewal reminders 30 days before expiry. Renewing before expiry maintains continuity benefits like NCB and waiting period credit. Grace periods are usually 30 days."
            },
            {
                question: "Can I cancel my policy?",
                answer: "Yes, you can cancel your policy anytime. For cancellations within the cooling period (usually 15 days), you get a full refund minus stamp duty. After that, refunds are calculated based on the unused period minus administrative charges."
            },
            {
                question: "What happens if I miss a premium payment?",
                answer: "Your policy enters a grace period (usually 30 days) during which coverage continues. If not paid within grace period, the policy lapses and coverage stops. You can revive lapsed policies within a specific period by paying pending premiums and undergoing medical tests if required."
            },
            {
                question: "Can I port my insurance to another company?",
                answer: "Yes, you can port your existing policy to another insurer at renewal without losing benefits like NCB, waiting period credit, or claim history. Submit porting request 45 days before renewal. The new insurer evaluates and decides on acceptance."
            },
            {
                question: "What is policy exclusion?",
                answer: "Exclusions are specific conditions, treatments, or situations not covered by the policy. Common exclusions include cosmetic treatments, self-inflicted injuries, war-related damages, and intentional acts. Review policy wordings carefully to understand all exclusions."
            }
        ]
    };

    const categories = [
        { id: 'general', name: 'General', icon: '❓' },
        { id: 'health', name: 'Health Insurance', icon: '🏥' },
        { id: 'motor', name: 'Motor Insurance', icon: '🚗' },
        { id: 'claims', name: 'Claims', icon: '📋' },
        { id: 'policy', name: 'Policy Management', icon: '📄' }
    ];

    const toggleQuestion = (index) => {
        setOpenQuestion(openQuestion === index ? null : index);
    };

    return (
        <div className="faq-page">
            <section className="faq-hero">
                <div className="container">
                    <h1>Frequently Asked Questions</h1>
                    <p>Find answers to common questions about insurance, claims, and policies</p>
                </div>
            </section>

            <section className="faq-section section">
                <div className="container">
                    <div className="faq-content">
                        <div className="faq-categories">
                            {categories.map(category => (
                                <button
                                    key={category.id}
                                    className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                                    onClick={() => {
                                        setActiveCategory(category.id);
                                        setOpenQuestion(null);
                                    }}
                                >
                                    <span className="category-icon">{category.icon}</span>
                                    <span className="category-name">{category.name}</span>
                                </button>
                            ))}
                        </div>

                        <div className="faq-questions">
                            <h2 className="category-title">
                                {categories.find(c => c.id === activeCategory)?.name}
                            </h2>

                            {faqData[activeCategory].map((faq, index) => (
                                <div key={index} className={`faq-item ${openQuestion === index ? 'active' : ''}`}>
                                    <button
                                        className="faq-question"
                                        onClick={() => toggleQuestion(index)}
                                    >
                                        <span>{faq.question}</span>
                                        <span className="faq-icon">{openQuestion === index ? '−' : '+'}</span>
                                    </button>
                                    {openQuestion === index && (
                                        <div className="faq-answer">
                                            <p>{faq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="faq-contact section bg-light">
                <div className="container">
                    <div className="faq-contact-content">
                        <h2>Still Have Questions?</h2>
                        <p>Can't find what you're looking for? Our support team is here to help you 24/7</p>
                        <div className="faq-contact-buttons">
                            <a href="/contact" className="btn btn-primary">Contact Support</a>
                            <a href="tel:1800-123-4567" className="btn btn-secondary">📞 Call 1800-123-4567</a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default FAQ;
