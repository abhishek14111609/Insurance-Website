import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { TERMS_AND_CONDITIONS, CLAIM_PROCEDURES, EXCLUSIONS } from '../constants/termsAndConditions.js';

const ensureDirectory = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

const formatCurrency = (value) => {
    const numeric = typeof value === 'number' ? value : parseFloat(value);
    if (Number.isNaN(numeric)) return 'N/A';
    return `₹${numeric.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const drawSectionHeader = (doc, text, y) => {
    doc.rect(40, y, 515, 24).fill('#e8f5e9'); // Light green background
    doc.fillColor('#1b5e20').font('Helvetica-Bold').fontSize(11).text(text.toUpperCase(), 50, y + 7);
    return y + 35; // Return next Y position
};

const drawField = (doc, label, value, x, y, width = 200, isCurrency = false) => {
    const labelWidth = 90;
    const valueStartX = x + labelWidth;
    const valueWidth = width - labelWidth;

    doc.fillColor('#616161').font('Helvetica').fontSize(9).text(label, x, y);

    // Calculate height of the value text to handle wrapping
    const textOptions = { width: valueWidth, align: 'left' };
    const valueHeight = doc.heightOfString(value, textOptions);

    doc.fillColor('#000000').font('Helvetica-Bold').fontSize(9).text(value, valueStartX, y, textOptions);

    return Math.max(valueHeight, 14); // Return text height or minimum line height
};

export const generatePolicyPdf = async (policy) => {
    const docsDir = path.join(process.cwd(), 'uploads', 'policy_docs');
    ensureDirectory(docsDir);

    const pdfPath = path.join(docsDir, `Policy-${policy.policyNumber}.pdf`);
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const stream = fs.createWriteStream(pdfPath);

    doc.pipe(stream);

    // === HEADER ===
    // Logo text
    doc.fontSize(22).fillColor('#16a34a').font('Helvetica-Bold').text('Pashudhan Suraksha', { align: 'center' });
    doc.moveDown(0.5);

    // Address & Info
    doc.fontSize(8).fillColor('#424242').font('Helvetica');
    doc.text('IRDAI Reg. No: IRDA/NL-HLT/2024/001', { align: 'center' });
    doc.text('Regd. Office: 123, Cow Care Lane, Green Pastures, New Delhi - 110001', { align: 'center' });
    doc.text('Toll Free: 1800-245-1234 | Email: support@pashudhansuraksha.com', { align: 'center' });

    doc.moveDown(1.5);
    doc.strokeColor('#e0e0e0').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(2);

    // === CERTIFICATE TITLE ===
    doc.fontSize(14).fillColor('#000000').font('Helvetica-Bold').text('CERTIFICATE OF INSURANCE', { align: 'center' });
    doc.moveDown(0.8);

    doc.fontSize(9).font('Helvetica').fillColor('#616161')
        .text('This is to certify that the cattle described below is insured subject to the terms and conditions of the Master Policy.', { align: 'center', width: 400, marginLeft: 97 });

    doc.moveDown(2);

    let currentY = doc.y;
    const leftColX = 50;
    const rightColX = 310;
    const colWidth = 230;

    // === POLICY INFORMATION ===
    currentY = drawSectionHeader(doc, 'POLICY INFORMATION', currentY);

    // Row 1
    let h1 = drawField(doc, 'Policy Number:', policy.policyNumber, leftColX, currentY, colWidth);
    let h2 = drawField(doc, 'Date of Issue:', new Date().toLocaleDateString('en-IN'), rightColX, currentY, colWidth);
    currentY += Math.max(h1, h2) + 8; // Add adequate spacing

    // Row 2
    const startDate = policy.startDate ? new Date(policy.startDate).toLocaleDateString('en-IN') : 'N/A';
    const endDate = policy.endDate ? new Date(policy.endDate).toLocaleDateString('en-IN') : 'N/A';
    h1 = drawField(doc, 'Policy Period:', `${startDate} to ${endDate}`, leftColX, currentY, colWidth);
    currentY += h1 + 8;

    // Row 3
    h1 = drawField(doc, 'Sum Insured:', formatCurrency(policy.coverageAmount), leftColX, currentY, colWidth);
    h2 = drawField(doc, 'Premium Paid:', formatCurrency(policy.premium), rightColX, currentY, colWidth);
    currentY += Math.max(h1, h2) + 15;

    // === INSURED INFORMATION ===
    currentY += 10;
    currentY = drawSectionHeader(doc, 'INSURED DETAILS', currentY);

    const customerName = policy.ownerName || policy.customerId?.fullName || 'Customer';
    h1 = drawField(doc, 'Name:', customerName, leftColX, currentY, colWidth);
    h2 = drawField(doc, 'Contact:', policy.ownerPhone || 'N/A', rightColX, currentY, colWidth);
    currentY += Math.max(h1, h2) + 8;

    const address = `${policy.ownerAddress || ''}, ${policy.ownerCity || ''}, ${policy.ownerState || ''} - ${policy.ownerPincode || ''}`;
    // Give address full width if needed, or keeping column structure
    // Let's allow address to span if it's long, but stick to column for now to be consistent with layout
    h1 = drawField(doc, 'Address:', address, leftColX, currentY, 450); // Wider for address
    currentY += h1 + 15;


    // === CATTLE INFORMATION ===
    currentY += 10;
    currentY = drawSectionHeader(doc, 'CATTLE DESCRIPTION', currentY);

    // Row 1
    h1 = drawField(doc, 'Tag ID:', policy.tagId, leftColX, currentY, colWidth);
    h2 = drawField(doc, 'Type:', (policy.cattleType || '').toUpperCase(), rightColX, currentY, colWidth);
    currentY += Math.max(h1, h2) + 8;

    // Row 2
    h1 = drawField(doc, 'Breed:', policy.breed || 'N/A', leftColX, currentY, colWidth);
    h2 = drawField(doc, 'Gender:', (policy.gender || '').toUpperCase(), rightColX, currentY, colWidth);
    currentY += Math.max(h1, h2) + 8;

    // Row 3
    h1 = drawField(doc, 'Age:', `${policy.age} Years`, leftColX, currentY, colWidth);
    h2 = drawField(doc, 'Health:', (policy.healthStatus || 'Healthy').toUpperCase(), rightColX, currentY, colWidth);
    currentY += Math.max(h1, h2) + 15;

    // === TERMS & FOOTER ===
    currentY += 20;
    doc.strokeColor('#e0e0e0').lineWidth(1).moveTo(40, currentY).lineTo(555, currentY).stroke();
    currentY += 20;

    // Check if we need a new page for terms
    if (currentY > 650) {
        doc.addPage();
        currentY = 40;
    }

    doc.font('Helvetica-Bold').fontSize(10).fillColor('#000').text('Important Terms & Conditions / મહત્વપૂર્ણ નિયમો અને શરતો:', 50, currentY);
    currentY += 15;

    doc.font('Helvetica').fontSize(8).fillColor('#424242');

    // English Terms
    TERMS_AND_CONDITIONS.english.forEach((term, index) => {
        if (currentY > 720) {
            doc.addPage();
            currentY = 40;
        }
        doc.text(term, 50, currentY, { width: 500 });
        currentY += 12;
    });

    currentY += 10;

    // Gujarati Terms
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#1b5e20').text('ગુજરાતીમાં નિયમો:', 50, currentY);
    currentY += 12;

    doc.font('Helvetica').fontSize(8).fillColor('#424242');
    TERMS_AND_CONDITIONS.gujarati.forEach((term, index) => {
        if (currentY > 720) {
            doc.addPage();
            currentY = 40;
        }
        doc.text(term, 50, currentY, { width: 500 });
        currentY += 12;
    });

    currentY += 15;

    // Claim Procedures
    if (currentY > 650) {
        doc.addPage();
        currentY = 40;
    }

    doc.font('Helvetica-Bold').fontSize(10).fillColor('#000').text('Claim Procedures / દાવાની પ્રક્રિયા:', 50, currentY);
    currentY += 12;

    doc.font('Helvetica').fontSize(8).fillColor('#424242');
    CLAIM_PROCEDURES.english.forEach((proc, index) => {
        if (currentY > 720) {
            doc.addPage();
            currentY = 40;
        }
        doc.text(`• ${proc}`, 50, currentY, { width: 500 });
        currentY += 12;
    });

    currentY += 10;
    CLAIM_PROCEDURES.gujarati.forEach((proc, index) => {
        if (currentY > 720) {
            doc.addPage();
            currentY = 40;
        }
        doc.text(`• ${proc}`, 50, currentY, { width: 500 });
        currentY += 12;
    });

    currentY += 15;

    // Exclusions
    if (currentY > 650) {
        doc.addPage();
        currentY = 40;
    }

    doc.font('Helvetica-Bold').fontSize(10).fillColor('#000').text('Exclusions / બાકાતો:', 50, currentY);
    currentY += 12;

    doc.font('Helvetica').fontSize(8).fillColor('#424242');
    EXCLUSIONS.english.forEach((excl, index) => {
        if (currentY > 720) {
            doc.addPage();
            currentY = 40;
        }
        doc.text(`✗ ${excl}`, 50, currentY, { width: 500 });
        currentY += 12;
    });

    currentY += 10;
    EXCLUSIONS.gujarati.forEach((excl, index) => {
        if (currentY > 720) {
            doc.addPage();
            currentY = 40;
        }
        doc.text(`✗ ${excl}`, 50, currentY, { width: 500 });
        currentY += 12;
    });

    // Signature Block
    const footerY = 700; // Fixed footer area roughly

    // If content pushed beyond footerY, start a new page or push down
    const finalY = currentY < footerY ? footerY : currentY + 30;

    doc.text(`Place: New Delhi`, 50, finalY);
    doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 50, finalY + 12);

    doc.font('Helvetica-Bold').text('For Pashudhan Suraksha Insurance', 350, finalY, { align: 'right', width: 200 });

    // Add space for signature
    const signatureY = finalY + 50;
    doc.fontSize(8).font('Helvetica').text('Authorized Signatory', 350, signatureY, { align: 'right', width: 200 });

    // Watermark/Disclaimer
    doc.fontSize(7).font('Helvetica-Oblique').fillColor('#9e9e9e')
        .text('This is a computer generated document and does not require a physical signature.',
            40, 780, { align: 'center', width: 515 });

    doc.end();

    await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
    });

    return pdfPath;
};
