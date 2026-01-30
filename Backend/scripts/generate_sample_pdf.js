
import mongoose from 'mongoose';
import { generatePolicyPdf } from '../utils/pdfGenerator.js';
import Policy from '../models/Policy.js';
import User from '../models/User.js';
import path from 'path';

// Mock Data if no DB connection or just forcing a sample
const mockPolicy = {
    policyNumber: 'POL-SAMPLE-123456789',
    customerId: {
        id: 'CUST-001',
        fullName: 'Rameshbhai Patel'
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
    agentId: { fullName: 'Suresh Agent' },

    startDate: new Date(),
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    createdAt: new Date(),
    paymentId: 'PAY-123456',
    paymentDate: new Date(),

    premium: 54000,
    coverageAmount: 50000,

    tagId: '100327930607',
    cattleType: 'Buffalo',
    breed: 'Murrah',
    gender: 'Female',
    age: 4,
    healthStatus: 'Healthy'
};

const run = async () => {
    try {
        console.log('Generating Sample PDF...');
        const filePath = await generatePolicyPdf(mockPolicy);
        console.log(`Sample PDF Generated Successfully: ${filePath}`);
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
};

run();
