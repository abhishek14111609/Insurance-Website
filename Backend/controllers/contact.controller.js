import { Inquiry } from '../models/index.js';
import { sendInquiryReply } from '../utils/email.util.js';

// @desc    Submit a new inquiry
// @route   POST /api/contact/submit
// @access  Public
export const submitInquiry = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        const inquiry = await Inquiry.create({
            name,
            email,
            phone,
            subject,
            message,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Inquiry submitted successfully',
            data: inquiry
        });
    } catch (error) {
        console.error('Submit Inquiry Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit inquiry',
            error: error.message
        });
    }
};

// @desc    Get all inquiries (Admin)
// @route   GET /api/contact/all
// @access  Private (Admin)
export const getAllInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.findAll({
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: inquiries
        });
    } catch (error) {
        console.error('Get Inquiries Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch inquiries',
            error: error.message
        });
    }
};

// @desc    Reply to inquiry
// @route   POST /api/contact/reply/:id
// @access  Private (Admin)
export const replyToInquiry = async (req, res) => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: 'Reply message is required' });
        }

        const inquiry = await Inquiry.findByPk(id);
        if (!inquiry) {
            return res.status(404).json({ success: false, message: 'Inquiry not found' });
        }

        if (inquiry.status === 'replied') {
            return res.status(400).json({ success: false, message: 'Inquiry already replied to' });
        }

        // Send Email
        await sendInquiryReply(inquiry, message);

        // Update Database
        await inquiry.update({
            status: 'replied',
            adminReply: message,
            repliedAt: new Date()
        });

        res.json({
            success: true,
            message: 'Reply sent successfully',
            data: inquiry
        });
    } catch (error) {
        console.error('Reply Inquiry Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send reply',
            error: error.message
        });
    }
};
