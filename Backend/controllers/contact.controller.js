import { Inquiry } from '../models/index.js';
import { sendInquiryReply } from '../utils/email.util.js';
import { notifyInquirySubmitted, notifyInquiryReplied } from '../utils/notification.util.js';

// @desc    Submit a new inquiry
// @route   POST /api/contact/submit
// @access  Public
export const submitInquiry = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        const inquiry = await Inquiry.create({
            userId: req.user ? req.user._id : null,
            name,
            email,
            phone,
            subject,
            message,
            status: 'pending'
        });

        // Send notification if user is logged in
        if (req.user) {
            try {
                await notifyInquirySubmitted(inquiry);
            } catch (notifyError) {
                console.error('Inquiry submission notification failed:', notifyError);
            }
        }

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
        const inquiries = await Inquiry.find()
            .sort({ createdAt: -1 });

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

        const inquiry = await Inquiry.findById(id);
        if (!inquiry) {
            return res.status(404).json({ success: false, message: 'Inquiry not found' });
        }

        if (inquiry.status === 'replied') {
            return res.status(400).json({ success: false, message: 'Inquiry already replied to' });
        }

        // Try to send email but do not hard-fail the entire request if SMTP is down
        let emailError = null;
        try {
            await sendInquiryReply(inquiry, message);
        } catch (err) {
            emailError = err;
            console.error('Reply email send failed:', err);
        }

        // Update Database regardless so the admin's reply is not lost
        inquiry.status = 'replied';
        inquiry.adminReply = message;
        inquiry.repliedAt = new Date();
        await inquiry.save();

        // Send notification if inquiry belongs to a user
        if (inquiry.userId) {
            try {
                await notifyInquiryReplied(inquiry);
            } catch (notifyError) {
                console.error('Inquiry reply notification failed:', notifyError);
            }
        }

        if (emailError) {
            return res.status(200).json({
                success: true,
                message: 'Reply saved, but email failed to send. Please check SMTP settings and resend.',
                emailSent: false,
                error: emailError.message,
                data: inquiry
            });
        }

        res.json({
            success: true,
            message: 'Reply sent successfully',
            emailSent: true,
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
