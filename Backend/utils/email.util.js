import nodemailer from 'nodemailer';

// Centralized transporter uses env vars so we do not leak credentials and
// can tweak connection settings (e.g. IPv4 forcing) without code changes.
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: (process.env.SMTP_SECURE || 'true').toLowerCase() === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    pool: true,
    maxConnections: Number(process.env.SMTP_MAX_CONNECTIONS || 3),
    maxMessages: Number(process.env.SMTP_MAX_MESSAGES || 50),
    connectionTimeout: Number(process.env.SMTP_TIMEOUT_MS || 15000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 10000),
    family: Number(process.env.SMTP_IP_FAMILY || 4) // Force IPv4 to avoid IPv6 timeouts on some hosts
});

export const sendEmail = async ({ to, subject, html, text, attachments }) => {
    try {
        const mailOptions = {
            from: '"Pashudhan Suraksha" <pashudhansuraksha2026@gmail.com>',
            to,
            subject,
            html,
            text,
            attachments: attachments && attachments.length ? attachments : undefined
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
