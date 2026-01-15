import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'pashudhansuraksha2026@gmail.com',
        pass: 'kldb vqlo pyej exbb' // App password
    }
});

export const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const mailOptions = {
            from: '"Pashudhan Suraksha" <pashudhansuraksha2026@gmail.com>',
            to,
            subject,
            html,
            text
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

export const sendInquiryReply = async (inquiry, replyMessage) => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6366f1;">Response to Your Inquiry</h2>
            <p>Dear ${inquiry.name},</p>
            <p>Thank you for contacting Pashudhan Suraksha. Regarding your inquiry about "<strong>${inquiry.subject}</strong>":</p>
            <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #6366f1; margin: 20px 0;">
                <p style="margin: 0; color: #334155;">${replyMessage}</p>
            </div>
            <p>If you have any further questions, please feel free to reply to this email.</p>
            <br>
            <p>Best regards,</p>
            <p><strong>Support Team</strong><br>Pashudhan Suraksha</p>
        </div>
    `;

    return sendEmail({
        to: inquiry.email,
        subject: `Re: ${inquiry.subject} - Pashudhan Suraksha`,
        html,
        text: replyMessage
    });
};
