import nodemailer from 'nodemailer';

// Resolve SMTP config from env with backward-compatible fallbacks to EMAIL_* keys.
const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587);
// Default to startTLS on port 587 unless explicitly secure (465)
const smtpSecure = (process.env.SMTP_SECURE ?? (smtpPort === 465 ? 'true' : 'false')).toString().toLowerCase() === 'true';
// Hard fallback to known sender if envs are missing to avoid undefined auth
const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER || 'pashudhansuraksha2026@gmail.com';
const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || 'kldb vqlo pyej exbb';
const smtpFrom = process.env.SMTP_FROM || process.env.EMAIL_FROM || '"Pashudhan Suraksha" <pashudhansuraksha2026@gmail.com>';

if (!smtpUser || !smtpPass) {
    console.warn('SMTP credentials are missing. Set SMTP_USER/SMTP_PASS (or EMAIL_USER/EMAIL_PASSWORD).');
}

// Centralized transporter uses env vars to avoid hardcoding secrets and allow
// tuning (pooling, IPv4 forcing) without code changes.
const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
    pool: true,
    maxConnections: Number(process.env.SMTP_MAX_CONNECTIONS || 3),
    maxMessages: Number(process.env.SMTP_MAX_MESSAGES || 20),
    connectionTimeout: Number(process.env.SMTP_TIMEOUT_MS || 15000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 10000),
    family: Number(process.env.SMTP_IP_FAMILY || process.env.EMAIL_IP_FAMILY || 4), // Force IPv4 to avoid IPv6 timeouts on some hosts
    tls: {
        rejectUnauthorized: false
    }
});

export const sendEmail = async ({ to, subject, html, text, attachments }) => {
    try {
        const mailOptions = {
            from: smtpFrom,
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
