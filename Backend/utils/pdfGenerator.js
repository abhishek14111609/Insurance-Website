import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

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

export const generatePolicyPdf = async (policy) => {
    const docsDir = path.join(process.cwd(), 'uploads', 'policy_docs');
    ensureDirectory(docsDir);

    const pdfPath = path.join(docsDir, `Policy-${policy.policyNumber}.pdf`);
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = fs.createWriteStream(pdfPath);

    doc.pipe(stream);

    // === HEADER ===
    doc.fontSize(24).fillColor('#16a34a').text('Pashudhan Suraksha', { align: 'center' });
    doc.fontSize(10).fillColor('black').text('IRDAI Reg. No: IRDA/NL-HLT/2024/001', { align: 'center' });
    doc.text('Regd. Office: 123, Cow Care Lane, Green Pastures, New Delhi - 110001', { align: 'center' });
    doc.text('Toll Free: 1800-245-1234 | Email: support@pashudhansuraksha.com', { align: 'center' });

    doc.moveDown(2);
    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(2);

    // === TITLE ===
    doc.fontSize(16).font('Helvetica-Bold').text('CERTIFICATE OF INSURANCE', { align: 'center' });
    doc.moveDown();

    doc.fontSize(10).font('Helvetica').text('This is to certify that the cattle described below is insured subject to the terms and conditions of the Master Policy.', { align: 'center' });
    doc.moveDown(2);

    const startX = 50;
    const col1X = 50;
    const col2X = 300;
    let currentY = doc.y;

    // === POLICY INFORMATION ===
    doc.rect(startX, currentY, 495, 25).fill('#e8f5e9'); // Header bg
    doc.fillColor('#000').font('Helvetica-Bold').fontSize(12).text('POLICY INFORMATION', startX + 10, currentY + 7);
    currentY += 35;

    doc.font('Helvetica').fontSize(10);
    doc.text('Policy Number:', col1X, currentY);
    doc.font('Helvetica-Bold').text(policy.policyNumber, col1X + 100, currentY);

    doc.font('Helvetica').text('Date of Issue:', col2X, currentY);
    doc.font('Helvetica-Bold').text(new Date().toLocaleDateString('en-IN'), col2X + 100, currentY);

    currentY += 20;

    doc.font('Helvetica').text('Policy Period:', col1X, currentY);
    const startDate = policy.startDate ? new Date(policy.startDate).toLocaleDateString('en-IN') : 'N/A';
    const endDate = policy.endDate ? new Date(policy.endDate).toLocaleDateString('en-IN') : 'N/A';
    doc.font('Helvetica-Bold').text(`${startDate} to ${endDate}`, col1X + 100, currentY);

    currentY += 20;

    doc.font('Helvetica').text('Sum Insured:', col1X, currentY);
    doc.font('Helvetica-Bold').text(formatCurrency(policy.coverageAmount), col1X + 100, currentY);

    doc.font('Helvetica').text('Premium Paid:', col2X, currentY);
    doc.font('Helvetica-Bold').text(formatCurrency(policy.premium), col2X + 100, currentY);

    currentY += 40;

    // === INSURED INFORMATION ===
    doc.rect(startX, currentY, 495, 25).fill('#e8f5e9');
    doc.fillColor('#000').font('Helvetica-Bold').fontSize(12).text('INSURED DETAILS', startX + 10, currentY + 7);
    currentY += 35;

    const customerName = policy.ownerName || policy.customerId?.fullName || 'Customer';
    doc.font('Helvetica').text('Name:', col1X, currentY);
    doc.font('Helvetica-Bold').text(customerName, col1X + 100, currentY);

    doc.font('Helvetica').text('Contact:', col2X, currentY);
    doc.font('Helvetica-Bold').text(policy.ownerPhone || 'N/A', col2X + 100, currentY);

    currentY += 20;

    doc.font('Helvetica').text('Address:', col1X, currentY);
    doc.font('Helvetica-Bold');
    const address = `${policy.ownerAddress || ''}, ${policy.ownerCity || ''}, ${policy.ownerState || ''} - ${policy.ownerPincode || ''}`;
    doc.text(address, col1X + 100, currentY, { width: 350 });

    currentY = doc.y + 20;

    // === CATTLE INFORMATION ===
    doc.rect(startX, currentY, 495, 25).fill('#e8f5e9');
    doc.fillColor('#000').font('Helvetica-Bold').fontSize(12).text('CATTLE DESCRIPTION', startX + 10, currentY + 7);
    currentY += 35;

    doc.font('Helvetica').text('Tag ID:', col1X, currentY);
    doc.font('Helvetica-Bold').text(policy.tagId, col1X + 100, currentY);

    doc.font('Helvetica').text('Type:', col2X, currentY);
    doc.font('Helvetica-Bold').text((policy.cattleType || '').toUpperCase(), col2X + 100, currentY);

    currentY += 20;

    doc.font('Helvetica').text('Breed:', col1X, currentY);
    doc.font('Helvetica-Bold').text(policy.breed || 'N/A', col1X + 100, currentY);

    doc.font('Helvetica').text('Gender:', col2X, currentY);
    doc.font('Helvetica-Bold').text((policy.gender || '').toUpperCase(), col2X + 100, currentY);

    currentY += 20;

    doc.font('Helvetica').text('Age:', col1X, currentY);
    doc.font('Helvetica-Bold').text(`${policy.age} Years`, col1X + 100, currentY);

    doc.font('Helvetica').text('Health:', col2X, currentY);
    doc.font('Helvetica-Bold').text((policy.healthStatus || 'Healthy').toUpperCase(), col2X + 100, currentY);

    currentY += 50;

    // === FOOTER / TERMS ===
    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, currentY).lineTo(545, currentY).stroke();
    currentY += 10;

    doc.font('Helvetica-Bold').fontSize(10).text('Important Terms & Conditions:', 50, currentY);
    currentY += 15;
    doc.font('Helvetica').fontSize(8);
    const terms = [
        "1. This policy covers death of the animal due to diseases and accidents as per policy wordings.",
        "2. Immediate intimation of claim is mandatory (within 24 hours).",
        "3. Ear Tag is mandatory for claim settlement. No Tag No Claim.",
        "4. This certificate is subject to realization of premium payment.",
        "5. In case of any discrepancy, please contact customer care within 15 days."
    ];

    terms.forEach(term => {
        doc.text(term, 50, currentY);
        currentY += 12;
    });

    currentY += 30;

    // Signatures
    const dateStr = new Date().toLocaleDateString('en-IN');
    doc.text(`Place: New Delhi`, 50, currentY);
    doc.text(`Date: ${dateStr}`, 50, currentY + 12);

    doc.font('Helvetica-Bold').text('For Pashudhan Suraksha Insurance', 350, currentY, { align: 'right' });
    doc.moveDown(3);
    doc.font('Helvetica').text('Authorized Signatory', 350, doc.y, { align: 'right' });

    // Bottom Note
    doc.moveDown(2);
    doc.font('Helvetica-Oblique').fontSize(8).text('This is a computer generated document and does not require a physical signature.', { align: 'center', color: '#666666' });

    doc.end();

    await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
    });

    return pdfPath;
};
