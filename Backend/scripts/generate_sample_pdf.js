
import mongoose from 'mongoose';
import { generatePolicyPdf } from '../utils/pdfGenerator.js';
import path from 'path';

// Mock Data exactly matching the fields needed to reproduce the user's sample PDF
const mockPolicy = {
    policyNumber: 'POL-SAMPLE-123456789',
    customerId: {
        id: 'CUST-001',
        fullName: 'Rameshbhai Patel',
        email: 'ramesh@example.com',
        phone: '9876543210'
    },
    ownerName: 'Rameshbhai Patel',
    ownerAddress: '123, Village Road, Near Temple',
    ownerCity: 'Vijapur',
    ownerState: 'Gujarat',
    ownerPincode: '382870',
    ownerPhone: '9876543210',
    ownerEmail: 'ramesh@example.com',
    panNumber: 'ABCDE1234F',

    agentCode: 'AG-007',
    agentId: {
        fullName: 'Suresh Agent',
        userId: { fullName: 'Suresh Agent' }
    },

    startDate: new Date('2026-01-29'),
    endDate: new Date('2027-01-29'),
    createdAt: new Date('2026-01-29'),
    paymentId: 'PAY-123456',
    paymentDate: new Date('2026-01-29'),

    premium: 54000,
    coverageAmount: 54000, // Matching total ('1) column value in image

    tagId: '100327930607',
    cattleType: 'Buffalo',
    breed: 'Murrah',
    gender: 'Female',
    age: 4,
    healthStatus: 'Healthy'
};

const run = async () => {
    try {
        console.log('Generating Official Sample PDF...');
        const filePath = await generatePolicyPdf(mockPolicy);
        console.log(`Official Sample PDF Generated Successfully: ${filePath}`);
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
};

run();
