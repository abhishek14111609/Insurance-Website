import nodemailer from 'nodemailer';

// Resolve SMTP config from env with backward-compatible fallbacks to EMAIL_* keys.
const smtpHost = process.env.SMTP_HOST
const smtpPort = Number(process.env.SMTP_PORT);
// Default to startTLS on port 587 unless explicitly secure (465)
const smtpSecure = (process.env.SMTP_SECURE ?? (smtpPort === 465 ? 'true' : 'false')).toString().toLowerCase() === 'true';
const smtpUser = process.env.SMTP_USER
const smtpPass = process.env.SMTP_PASS;
// Default from falls back to the user if not explicitly provided
const smtpFrom = process.env.SMTP_FROM || (smtpUser ? `"Pashudhan Suraksha" <${smtpUser}>` : '');

if (!smtpUser || !smtpPass) {
    console.warn('SMTP credentials are missing. Set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS.');
}

// Centralized transporter uses env vars; avoid hardcoded Gmail service to support any SMTP.
const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
    pool: false, // single connection to reduce chance of pool timeouts on free hosts
    connectionTimeout: Number(process.env.SMTP_TIMEOUT_MS || 15000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 10000),
    family: Number(process.env.SMTP_IP_FAMILY || process.env.EMAIL_IP_FAMILY || 4),
    logger: false,
    debug: false
});

// Verify transporter once at startup to surface bad creds/host quickly.
transporter.verify((err, success) => {
    if (err) {
        console.error('SMTP verify failed:', err.message || err);
    } else {
        console.log('SMTP ready:', success ? 'ok' : 'unknown');
    }
});

export const sendEmail = async ({ to, subject, html, text, attachments }) => {
    try {
        if (!smtpUser || !smtpPass) {
            throw new Error('SMTP credentials not configured (SMTP_USER/SMTP_PASS)');
        }
        if (!smtpFrom) {
            throw new Error('SMTP_FROM not configured');
        }

        const mailOptions = {
            from: smtpFrom,
            to,
            subject,
            html,
            text,
            attachments: attachments && attachments.length ? attachments : undefined
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent to %s: %s', to, info.messageId);
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
            <br />
            <p>Best regards,</p>
            <p><strong>Support Team</strong><br />Pashudhan Suraksha</p>
            <p style="margin-top: 10px; font-size: 12px; color: #64748b;">
                Customer Care: 79903 39567 | Claims: 83479 46718<br/>
                Email: pashudhansuraksha2026@gmail.com<br/>
                Address: Shop No-10, Second Floor, Suvidhi Solitaire, TB Road, Vijapur, Gujarat - 384570
            </p>
        </div>
    `;

    return sendEmail({
        to: inquiry.email,
        subject: `Re: ${inquiry.subject} - Pashudhan Suraksha`,
        html,
        text: replyMessage
    });
};
