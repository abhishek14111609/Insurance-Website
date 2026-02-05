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
    // Using Rs. instead of ₹ for better visibility in PDF
    return `Rs. ${numeric.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Helper to add watermark
const addWatermark = (doc) => {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    
    doc.save();
    doc.opacity(0.08); // Semi-transparent
    doc.fontSize(80);
    doc.fillColor('gray');
    
    // Position from bottom-left to top-right diagonal
    doc.translate(pageWidth / 2, pageHeight / 2);
    doc.rotate(-45);
    doc.text('PASHUDHAN SURAKSHA', -250, -50, { 
        align: 'center', 
        width: 500,
        font: 'Helvetica-Bold'
    });
    
    doc.restore();
};

// Helper to draw a cell in a grid
const drawCell = (doc, x, y, w, h, text, isHeader = false, isLeft = true, fontSize = 8) => {
    doc.rect(x, y, w, h).stroke();
    if (text) {
        doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
            .fontSize(fontSize)
            .fillColor('black')
            .text(text, x + 2, y + 4, { width: w - 4, align: isLeft ? 'left' : 'center', height: h });
    }
    return y;
};

// Helper for key-value pairs in a box
const drawFieldBox = (doc, x, y, w, h, label, value) => {
    doc.rect(x, y, w, h).stroke();

    // Label part
    doc.font('Helvetica-Bold').fontSize(8).text(label, x + 2, y + 3, { width: w / 3, continued: false });

    // Separator line (approximate)
    // doc.moveTo(x + w/3, y).lineTo(x + w/3, y + h).stroke(); // Optional: split label/value with line

    // Value part
    doc.font('Helvetica').fontSize(8).text(`: ${value || '-'}`, x + (w / 3), y + 3, { width: (w * 2 / 3) - 2 });
};

export const generatePolicyPdf = async (policy) => {
    const docsDir = path.join(process.cwd(), 'uploads', 'policy_docs');
    ensureDirectory(docsDir);

    const pdfPath = path.join(docsDir, `Policy-${policy.policyNumber}.pdf`);
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    const stream = fs.createWriteStream(pdfPath);

    doc.pipe(stream);

    // Add watermark to first page
    addWatermark(doc);

    // Register a font that supports Rupee if possible, but for now we stick to standard.
    // If the default font doesn't support Rupee, it might show blank.
    // However, in many PDFKit versions, standard fonts don't include it. 
    // We can try to use a different strategy if it fails, but for now we trust the user saw it or wants it.

    // --- CONSTANTS ---
    const startX = 30;
    const pageWidth = 535; // A4 width (595) - margins roughly
    const rowHeight = 15;

    let currentY = 30;

    // --- HEADER ---
    // Company Title (Blue)
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#003366')
        .text('PASHUDHAN SURAKSHA', startX, currentY, { align: 'center' });
    currentY += 18;

    doc.fontSize(10).fillColor('black')
        .text('Government of India', startX, currentY, { align: 'center' });
    currentY += 15;

    // Address & GST
    doc.fontSize(8).font('Helvetica')
        .text(`Regd. Office: Shop No-10, Second Floor, Suvidhi Solitaire, TB Road,`, startX, currentY, { align: 'center' })
    currentY += 10;
    doc.text(`Opp. APMC Market, Vijapur, Mahesana, Gujarat - 384570`, startX, currentY, { align: 'center' });
    currentY += 10;
    doc.text(`GSTIN: 24ABIFP7717Q1ZI | State Code: 24 (Gujarat)`, startX, currentY, { align: 'center' });
    currentY += 20;

    // --- TITLE ---
    doc.font('Helvetica-Bold').fontSize(12).text('CATTLE INSURANCE POLICY', startX, currentY, { align: 'center' });
    currentY += 16;
    doc.fontSize(9).text(`UIN NUMBER - IRDAN190P0152V01100001`, startX, currentY, { align: 'center' });
    currentY += 20;

    // --- INSURED & OFFICE DETAILS (2 Columns) ---
    const col1X = startX;
    const col2X = startX + (pageWidth / 2);
    const colWidth = pageWidth / 2;

    const startDetailsY = currentY;
    const detailsBoxHeight = rowHeight * 10;

    // Left Column: Insured Details
    doc.rect(col1X, currentY, colWidth, detailsBoxHeight).stroke();
    let leftY = currentY;

    const customerIdNumber = policy.customerId?.id || policy.customerId?._id || policy.customerId;
    const customerIdText = customerIdNumber ? customerIdNumber.toString() : 'NA';
    drawCell(doc, col1X, leftY, colWidth, rowHeight, `Insured Name: ${policy.ownerName || policy.customerId?.fullName || ''}`, true); leftY += rowHeight;
    drawCell(doc, col1X, leftY, colWidth, rowHeight, `Customer ID No: ${customerIdText}`, true); leftY += rowHeight;

    // Address wrapping
    doc.rect(col1X, leftY, colWidth, rowHeight * 3).stroke();
    doc.font('Helvetica-Bold').fontSize(8).text('Address:', col1X + 2, leftY + 2);
    doc.font('Helvetica').fontSize(8).text(`${policy.ownerAddress}, ${policy.ownerCity}, ${policy.ownerState} - ${policy.ownerPincode}`,
        col1X + 45, leftY + 2, { width: colWidth - 50 });
    leftY += (rowHeight * 3);

    drawCell(doc, col1X, leftY, colWidth, rowHeight, `Phone No: ${policy.ownerPhone}`, true); leftY += rowHeight;
    drawCell(doc, col1X, leftY, colWidth, rowHeight, `Email: ${policy.ownerEmail}`, true); leftY += rowHeight;
    const panNumber = policy.customerId?.kycDetails?.panNumber || 'NA';
    const aadharNumber = policy.customerId?.kycDetails?.aadharNumber || 'NA';
    drawCell(doc, col1X, leftY, colWidth, rowHeight, `PAN No: ${panNumber}`, true); leftY += rowHeight;
    drawCell(doc, col1X, leftY, colWidth, rowHeight, `Aadhar No: ${aadharNumber}`, true); leftY += rowHeight;

    // Right Column: Office/Agent Details
    doc.rect(col2X, currentY, colWidth, detailsBoxHeight).stroke();
    let rightY = currentY;

    drawCell(doc, col2X, rightY, colWidth, rowHeight, `Issuing Office Details:`, true, false); rightY += rowHeight; // Header centered
    drawCell(doc, col2X, rightY, colWidth, rowHeight, `Office Code: Vijapur21506`, true); rightY += rowHeight;

    // Address wrapping
    doc.rect(col2X, rightY, colWidth, rowHeight * 3).stroke();
    doc.font('Helvetica-Bold').fontSize(8).text('Address:', col2X + 2, rightY + 2);
    doc.font('Helvetica').fontSize(7).text(`Shop No-10, Second Floor,\nSuvidhi Solitaire, TB Road,\nOpp. APMC Market, Vijapur,\nMahesana, Gujarat - 384570`,
        col2X + 45, rightY + 2, { width: colWidth - 50 });
    rightY += (rowHeight * 3);

    drawCell(doc, col2X, rightY, colWidth, rowHeight, `Phone No: 79903 39567`, true); rightY += rowHeight;
    drawCell(doc, col2X, rightY, colWidth, rowHeight, `Agent Code: ${policy.agentCode || 'DIRECT'}`, true); rightY += rowHeight;
    // Handle populated agentId with nested userId for name
    const resolvedAgentName = policy.agentId?.userId?.fullName || policy.agentId?.fullName || '';
    const agentName = resolvedAgentName || (policy.agentCode ? 'NA' : 'Direct Business');
    const agentPhone = policy.agentId?.userId?.phone || policy.agentId?.phone || 'NA';
    drawCell(doc, col2X, rightY, colWidth, rowHeight, `Agent Name: ${agentName}`, true); rightY += rowHeight;
    drawCell(doc, col2X, rightY, colWidth, rowHeight, `Agent Phone No: ${agentPhone}`, true); rightY += rowHeight;

    currentY = Math.max(leftY, rightY) + 10;

    // --- POLICY DETAILS (Full Width) ---
    doc.rect(startX, currentY, pageWidth, 20).fill('#e0e0e0').stroke(); // Header bg
    doc.fillColor('black').font('Helvetica-Bold').fontSize(10).text('Policy Details', startX, currentY + 5, { align: 'center', width: pageWidth });
    currentY += 20;

    // Grid for Policy Details
    // Row 1
    drawCell(doc, startX, currentY, pageWidth * 0.25, rowHeight, 'Policy Number', true);
    drawCell(doc, startX + pageWidth * 0.25, currentY, pageWidth * 0.25, rowHeight, policy.policyNumber);
    drawCell(doc, startX + pageWidth * 0.5, currentY, pageWidth * 0.25, rowHeight, 'Business Source', true);
    const businessSource = policy.agentCode ? 'Agent' : 'Direct';
    drawCell(doc, startX + pageWidth * 0.75, currentY, pageWidth * 0.25, rowHeight, businessSource);
    currentY += rowHeight;

    // Row 2
    drawCell(doc, startX, currentY, pageWidth * 0.25, rowHeight, 'Period of Insurance', true);
    drawCell(doc, startX + pageWidth * 0.25, currentY, pageWidth * 0.25, rowHeight, `${formatDate(policy.startDate)} to ${formatDate(policy.endDate)}`);
    drawCell(doc, startX + pageWidth * 0.5, currentY, pageWidth * 0.25, rowHeight, 'Dev. Off Level', true);
    drawCell(doc, startX + pageWidth * 0.75, currentY, pageWidth * 0.25, rowHeight, 'HO');
    currentY += rowHeight;

    // Row 3
    drawCell(doc, startX, currentY, pageWidth * 0.25, rowHeight, 'Date of Proposal', true);
    drawCell(doc, startX + pageWidth * 0.25, currentY, pageWidth * 0.25, rowHeight, formatDate(policy.createdAt));
    drawCell(doc, startX + pageWidth * 0.5, currentY, pageWidth * 0.25, rowHeight, 'Prev. Policy No', true);
    const prevPolicyNo = policy.previousPolicyNumber || 'New Policy';
    drawCell(doc, startX + pageWidth * 0.75, currentY, pageWidth * 0.25, rowHeight, prevPolicyNo);
    currentY += rowHeight;
    currentY += 10;

    // --- PREMIUM TABLE ---
    // Headers - Adjust column widths to give more space to Receipt No & Date
    const premColW1 = pageWidth * 0.20; // Premium
    const premColW2 = pageWidth * 0.15; // GST
    const premColW3 = pageWidth * 0.20; // Total
    const premColW4 = pageWidth * 0.45; // Receipt No & Date (wider)
    const premiumRowHeight = 25; // Larger row height for premium table
    
    drawCell(doc, startX, currentY, premColW1, premiumRowHeight, 'Premium', true, false);
    drawCell(doc, startX + premColW1, currentY, premColW2, premiumRowHeight, 'GST', true, false);
    drawCell(doc, startX + premColW1 + premColW2, currentY, premColW3, premiumRowHeight, 'Total (₹)', true, false);
    drawCell(doc, startX + premColW1 + premColW2 + premColW3, currentY, premColW4, premiumRowHeight, 'Receipt No & Date', true, false);
    currentY += premiumRowHeight;

    // Values (Approximation for GST splitting)
    const premium = parseFloat(policy.premium) || 0;
    const gstRate = 0.18; // Assuming 18% standard, or if premium includes/excludes...
    // Assuming policy.premium is TOTAL. Back calculate base? Or assumes it's base?
    // Let's assume policy.premium is total amount payable for simplicity unless specified. 
    // Actually, usually premium field is total. 
    // Let's just put the total in Total and '-' in breakdown to avoid math errors if not sure.
    // OR: Assume standard breakdown if applicable.

    drawCell(doc, startX, currentY, premColW1, premiumRowHeight, formatCurrency(premium)); // Base
    drawCell(doc, startX + premColW1, currentY, premColW2, premiumRowHeight, 'Included'); // GST
    drawCell(doc, startX + premColW1 + premColW2, currentY, premColW3, premiumRowHeight, formatCurrency(premium)); // Total
    
    // Format receipt info with date on separate lines with larger cell
    const receiptNo = policy.paymentId ? policy.paymentId.substring(0, 18) : 'NA'; // Shorten receipt ID
    // Use paymentDate if available, otherwise use createdAt or approvedAt as fallback
    const receiptDate = policy.paymentDate 
        ? formatDate(policy.paymentDate) 
        : (policy.approvedAt ? formatDate(policy.approvedAt) : formatDate(policy.createdAt));
    
    // Create a custom cell for receipt info with better text wrapping
    const receiptCellX = startX + premColW1 + premColW2 + premColW3;
    doc.rect(receiptCellX, currentY, premColW4, premiumRowHeight).stroke();
    doc.font('Helvetica').fontSize(8);
    doc.text(`${receiptNo}`, receiptCellX + 3, currentY + 4, { width: premColW4 - 6, align: 'center' });
    doc.text(`${receiptDate}`, receiptCellX + 3, currentY + 14, { width: premColW4 - 6, align: 'center' });
    
    currentY += premiumRowHeight + 15;


    // --- POLICY SCHEDULE HEADER ---
    doc.rect(startX, currentY, pageWidth, 20).fill('#e0e0e0').stroke();
    doc.fillColor('black').font('Helvetica-Bold').fontSize(10).text('POLICY SCHEDULE - CATTLE DESCRIPTION', startX, currentY + 5, { align: 'center', width: pageWidth });
    currentY += 20;

    // Additional Header Info
    drawCell(doc, startX, currentY, pageWidth / 3, rowHeight, 'Type of Policy:', true);
    drawCell(doc, startX + pageWidth / 3, currentY, pageWidth * 2 / 3, rowHeight, 'Non-Scheme / Individual');
    currentY += rowHeight;
    drawCell(doc, startX, currentY, pageWidth / 3, rowHeight, 'Bank Financed:', true);
    drawCell(doc, startX + pageWidth / 3, currentY, pageWidth * 2 / 3, rowHeight, 'No');
    currentY += rowHeight + 10;


    // --- CATTLE DETAILS TABLE ---
    const cattleCols = [
        { w: 30, t: 'Sr. No' },
        { w: 80, t: 'Tag ID' },
        { w: 70, t: 'Type' },
        { w: 70, t: 'Breed' },
        { w: 40, t: 'Sex' },
        { w: 40, t: 'Age' },
        { w: 60, t: 'Health' }, // Replacing 'Milk' with Health or Colour as strict pdf might have different col
        { w: 70, t: 'Sum Insured' },
        { w: 75, t: 'Excess' }
    ];

    let x = startX;
    // Table Header
    cattleCols.forEach(col => {
        drawCell(doc, x, currentY, col.w, rowHeight * 1.5, col.t, true, false);
        x += col.w;
    });
    currentY += rowHeight * 1.5;

    // Table Data (Single row for now as policy has one cattle)
    x = startX;
    drawCell(doc, x, currentY, cattleCols[0].w, rowHeight, '1', false, false); x += cattleCols[0].w;
    drawCell(doc, x, currentY, cattleCols[1].w, rowHeight, policy.tagId, false, false); x += cattleCols[1].w;
    drawCell(doc, x, currentY, cattleCols[2].w, rowHeight, policy.cattleType, false, false); x += cattleCols[2].w;
    drawCell(doc, x, currentY, cattleCols[3].w, rowHeight, policy.breed, false, false); x += cattleCols[3].w;
    drawCell(doc, x, currentY, cattleCols[4].w, rowHeight, policy.gender, false, false); x += cattleCols[4].w;
    drawCell(doc, x, currentY, cattleCols[5].w, rowHeight, `${policy.age} Yrs`, false, false); x += cattleCols[5].w;
    drawCell(doc, x, currentY, cattleCols[6].w, rowHeight, policy.healthStatus, false, false); x += cattleCols[6].w;
    drawCell(doc, x, currentY, cattleCols[7].w, rowHeight, formatCurrency(policy.coverageAmount), false, true); x += cattleCols[7].w;
    drawCell(doc, x, currentY, cattleCols[8].w, rowHeight, '0', false, false);

    currentY += rowHeight + 20;

    // --- FOOTER & SIGNATURE ---
    if (currentY > 650) {
        doc.addPage();
        currentY = 40;
    }

    // Declaration
    doc.font('Helvetica').fontSize(8).text('In witness whereof the undersigned being duly authorised by the Insurers and on behalf of the Insurers has (have) hereunder set his (their) hand(s) on this date.', startX, currentY, { width: pageWidth });
    currentY += 30;

    // Place and Date
    doc.text(`Place: Vijapur, Gujarat`, startX, currentY);
    doc.text(`Date of Issue: ${formatDate(new Date())}`, startX, currentY + 12);

    // Signature Box
    const sigX = startX + 350;
    doc.font('Helvetica-Bold').text('For PASHUDHAN SURAKSHA', sigX, currentY, { align: 'center', width: 150 });
    currentY += 50;
    doc.font('Helvetica').text('Authorized Signatory', sigX, currentY, { align: 'center', width: 150 });

    // Divider
    currentY += 30;
    doc.moveTo(startX, currentY).lineTo(startX + pageWidth, currentY).stroke();
    currentY += 10;

    // Important Note / Disclaimer
    doc.font('Helvetica-Bold').fontSize(8).text('IMPORTANT NOTICE:', startX, currentY);
    doc.font('Helvetica').fontSize(7)
        .text('1. Returns/Refunds are subject to terms and conditions.', startX, currentY + 12)
        .text('2. This policy is subject to the Cattle Insurance Clause attached hereto.', startX, currentY + 22)
        .text('3. In case of claim, ear tag/s intact condition is mandatory.', startX, currentY + 32);

    // --- ADD NEW PAGE FOR TERMS AND CONDITIONS ---
    doc.addPage();
    addWatermark(doc); // Add watermark to second page
    let termsY = 40;

    // Terms Header
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#003366')
        .text('TERMS AND CONDITIONS', startX, termsY, { align: 'center' });
    termsY += 20;

    // Special Conditions Section
    doc.font('Helvetica-Bold').fontSize(10).fillColor('black').text('Special Conditions:', startX, termsY);
    termsY += 12;

    const specialConditions = [
        "1. This policy covers death of the animal due to diseases and accidents as per policy wordings.",
        "2. Immediate intimation of claim is mandatory (within 24 hours of incident).",
        "3. Ear tag is mandatory for claim settlement. No tag = No claim.",
        "4. In case of any discrepancy, please contact customer care within 15 days of commencement of risk.",
        "5. If the doctor does not come for post-mortem, the claim will be rejected and the premium will be refunded within 16 days."
    ];

    specialConditions.forEach(condition => {
        doc.font('Helvetica').fontSize(8).fillColor('black')
            .text(condition, startX + 10, termsY, { width: pageWidth - 20 });
        termsY += 15;
    });

    termsY += 10;

    // Post-Mortem Conditions
    doc.font('Helvetica-Bold').fontSize(10).fillColor('black').text('Post-Mortem (P.M) Conditions:', startX, termsY);
    termsY += 12;

    const pmConditions = [
        "1. Lump and other communicable cattle diseases not covered. Lumpy cattle, intact original tag & second tag & treatment papers are to be submitted.",
        "2. If the doctor comes within 5 hours, the tag will be available for P.M. If the doctor comes after 5 hours, the next day morning will be available.",
        "3. If the doctor does not come within 3 days, the claim will be rejected and the premium will be refunded.",
        "4. In case of sudden death, immediate post-mortem must be conducted for claim settlement."
    ];

    pmConditions.forEach(condition => {
        doc.font('Helvetica').fontSize(8).fillColor('black')
            .text(condition, startX + 10, termsY, { width: pageWidth - 20 });
        termsY += 18;
    });

    termsY += 10;

    // Restrictions Section
    doc.font('Helvetica-Bold').fontSize(10).fillColor('black').text('Restrictions & Exclusions:', startX, termsY);
    termsY += 12;

    const restrictions = [
        "1. Animals under treatment or sickly animals are not covered.",
        "2. Death due to starvation, negligence, or improper care is excluded.",
        "3. Surgical treatment and accidents due to owner's negligence are not covered.",
        "4. Claims must be supported with valid veterinary certificate and photographs.",
        "5. Tag must be intact. Damaged or missing tags may result in claim rejection."
    ];

    restrictions.forEach(restriction => {
        doc.font('Helvetica').fontSize(8).fillColor('black')
            .text(restriction, startX + 10, termsY, { width: pageWidth - 20 });
        termsY += 15;
    });

    termsY += 10;

    // Claim Procedure Section
    doc.font('Helvetica-Bold').fontSize(10).fillColor('black').text('Claim Procedure:', startX, termsY);
    termsY += 12;

    const claimProcedures = [
        "1. Report the incident to our office within 24 hours",
        "2. Arrange for veterinary post-mortem examination",
        "3. Submit all required documents (PM report, photographs, original tag)",
        "4. Our team will verify and process the claim within 3-5 working days",
        "5. Approved claims will be settled within 15 working days from approval"
    ];

    claimProcedures.forEach(procedure => {
        doc.font('Helvetica').fontSize(8).fillColor('black')
            .text(procedure, startX + 10, termsY, { width: pageWidth - 20 });
        termsY += 12;
    });

    termsY += 15;

    // Contact Information
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#003366').text('CUSTOMER CARE CONTACT:', startX, termsY);
    termsY += 12;
    doc.font('Helvetica').fontSize(8).fillColor('black')
        .text('Phone: 79903 39567 | Email: pashudhansuraksha2026@gmail.com', startX + 10, termsY);
    termsY += 12;
    doc.text('Shop No-10, Second Floor,', startX + 10, termsY);
    termsY += 10;
    doc.text('Suvidhi Solitaire, TB Road,', startX + 10, termsY);
    termsY += 10;
    doc.text('Opp. APMC Market, Vijapur,', startX + 10, termsY);
    termsY += 10;
    doc.text('Mahesana, Gujarat - 384570', startX + 10, termsY);

    doc.end();

    return new Promise((resolve, reject) => {
        stream.on('finish', () => resolve(pdfPath));
        stream.on('error', reject);
    });
};