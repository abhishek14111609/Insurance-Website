import { useState, useEffect } from 'react';
import { contactAPI } from '../services/api.service';
import './Inquiries.css';

const Inquiries = () => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [replyLoading, setReplyLoading] = useState(false);

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            setLoading(true);
            const response = await contactAPI.getAll();
            if (response.success) {
                setInquiries(response.data);
            } else {
                setError('Failed to fetch inquiries');
            }
        } catch (err) {
            setError(err.message || 'Error loading inquiries');
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyMessage.trim()) return;

        try {
            setReplyLoading(true);
            const response = await contactAPI.reply(selectedInquiry._id, replyMessage);
            if (response.success) {
                alert('Reply sent successfully!');
                setReplyMessage('');
                setSelectedInquiry(null);
                fetchInquiries(); // Refresh list to show updated status
            }
        } catch (error) {
            alert(error.message || 'Failed to send reply');
        } finally {
            setReplyLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading inquiries...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>Customer Inquiries</h1>
            </div>

            <div className="inquiries-list">
                {inquiries.length === 0 ? (
                    <p className="no-data">No inquiries found.</p>
                ) : (
                    inquiries.map(inquiry => (
                        <div key={inquiry._id} className={`inquiry-card ${inquiry.status}`}>
                            <div className="inquiry-header">
                                <div>
                                    <h3 className="inquiry-subject">{inquiry.subject}</h3>
                                    <span className={`status-badge ${inquiry.status}`}>
                                        {inquiry.status}
                                    </span>
                                </div>
                                <span className="inquiry-date">
                                    {new Date(inquiry.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="inquiry-details">
                                <p><strong>From:</strong> {inquiry.name} ({inquiry.email})</p>
                                <p><strong>Phone:</strong> {inquiry.phone}</p>
                            </div>

                            <div className="inquiry-message">
                                <p>{inquiry.message}</p>
                            </div>

                            {inquiry.status === 'replied' && (
                                <div className="admin-reply-view">
                                    <strong>Admin Reply:</strong>
                                    <p>{inquiry.adminReply}</p>
                                    <small>Replied on: {new Date(inquiry.repliedAt).toLocaleDateString()}</small>
                                </div>
                            )}

                            {inquiry.status === 'pending' && (
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => setSelectedInquiry(inquiry)}
                                >
                                    Reply
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Reply Modal */}
            {selectedInquiry && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Reply to {selectedInquiry.name}</h2>
                            <button className="close-btn" onClick={() => setSelectedInquiry(null)}>×</button>
                        </div>
                        <form onSubmit={handleReply}>
                            <div className="form-group">
                                <label>Subject: Re: {selectedInquiry.subject}</label>
                                <textarea
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    placeholder="Type your reply here..."
                                    rows="6"
                                    required
                                ></textarea>
                            </div>
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setSelectedInquiry(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={replyLoading}
                                >
                                    {replyLoading ? 'Sending...' : 'Send Reply'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inquiries;
