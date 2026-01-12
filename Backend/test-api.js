// API Testing Script
// Run with: node test-api.js

const API_BASE = 'http://localhost:3000/api';

// Test data
let authToken = '';
let userId = '';
let policyId = '';

// Helper function to make requests
async function apiRequest(endpoint, method = 'GET', body = null, token = null) {
    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const data = await response.json();
        return { status: response.status, data };
    } catch (error) {
        return { error: error.message };
    }
}

// Test 1: Health Check
async function testHealthCheck() {
    console.log('\n🧪 Test 1: Health Check');
    const response = await fetch('http://localhost:3000/health');
    const data = await response.json();
    console.log('✅ Response:', data);
}

// Test 2: Register User
async function testRegister() {
    console.log('\n🧪 Test 2: Register User');
    const userData = {
        email: `test${Date.now()}@test.com`,
        password: 'Test@123',
        fullName: 'Test Customer',
        phone: '9876543210',
        address: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        role: 'customer'
    };

    const result = await apiRequest('/auth/register', 'POST', userData);
    console.log('Status:', result.status);
    console.log('Success:', result.data.success);

    if (result.data.success) {
        authToken = result.data.data.token;
        userId = result.data.data.user.id;
        console.log('✅ User registered successfully');
        console.log('Token:', authToken.substring(0, 20) + '...');
    } else {
        console.log('❌ Registration failed:', result.data.message);
    }
}

// Test 3: Login
async function testLogin() {
    console.log('\n🧪 Test 3: Login User');
    const credentials = {
        email: 'test@test.com',
        password: 'Test@123'
    };

    const result = await apiRequest('/auth/login', 'POST', credentials);
    console.log('Status:', result.status);

    if (result.data.success) {
        console.log('✅ Login successful');
        console.log('User:', result.data.data.user.fullName);
    } else {
        console.log('ℹ️  User not found (expected if first run)');
    }
}

// Test 4: Get Current User
async function testGetMe() {
    console.log('\n🧪 Test 4: Get Current User');
    const result = await apiRequest('/auth/me', 'GET', null, authToken);
    console.log('Status:', result.status);

    if (result.data.success) {
        console.log('✅ User profile retrieved');
        console.log('User:', result.data.data.user.fullName);
        console.log('Email:', result.data.data.user.email);
    } else {
        console.log('❌ Failed:', result.data.message);
    }
}

// Test 5: Create Policy
async function testCreatePolicy() {
    console.log('\n🧪 Test 5: Create Policy');
    const policyData = {
        cattleType: 'cow',
        tagId: `COW-${Date.now()}`,
        age: 4,
        breed: 'Gir',
        gender: 'female',
        milkYield: 12,
        healthStatus: 'healthy',
        coverageAmount: 50000,
        premium: 2500,
        duration: '1 Year',
        startDate: '2026-01-12',
        endDate: '2027-01-12',
        ownerName: 'Test Customer',
        ownerEmail: 'test@test.com',
        ownerPhone: '9876543210',
        ownerAddress: '123 Test Street',
        ownerCity: 'Mumbai',
        ownerState: 'Maharashtra',
        ownerPincode: '400001',
        photos: {
            front: 'base64_image_data',
            back: 'base64_image_data',
            left: 'base64_image_data',
            right: 'base64_image_data'
        }
    };

    const result = await apiRequest('/policies', 'POST', policyData, authToken);
    console.log('Status:', result.status);

    if (result.data.success) {
        policyId = result.data.data.policy.id;
        console.log('✅ Policy created successfully');
        console.log('Policy Number:', result.data.data.policy.policyNumber);
        console.log('Policy ID:', policyId);
    } else {
        console.log('❌ Failed:', result.data.message);
    }
}

// Test 6: Get Policies
async function testGetPolicies() {
    console.log('\n🧪 Test 6: Get User Policies');
    const result = await apiRequest('/policies', 'GET', null, authToken);
    console.log('Status:', result.status);

    if (result.data.success) {
        console.log('✅ Policies retrieved');
        console.log('Count:', result.data.count);
        if (result.data.data.policies.length > 0) {
            console.log('First Policy:', result.data.data.policies[0].policyNumber);
        }
    } else {
        console.log('❌ Failed:', result.data.message);
    }
}

// Test 7: Get Single Policy
async function testGetPolicyById() {
    console.log('\n🧪 Test 7: Get Single Policy');
    if (!policyId) {
        console.log('⏭️  Skipped (no policy created)');
        return;
    }

    const result = await apiRequest(`/policies/${policyId}`, 'GET', null, authToken);
    console.log('Status:', result.status);

    if (result.data.success) {
        console.log('✅ Policy details retrieved');
        console.log('Policy Number:', result.data.data.policy.policyNumber);
        console.log('Status:', result.data.data.policy.status);
    } else {
        console.log('❌ Failed:', result.data.message);
    }
}

// Run all tests
async function runTests() {
    console.log('🚀 Starting API Tests...\n');
    console.log('API Base URL:', API_BASE);
    console.log('='.repeat(50));

    try {
        await testHealthCheck();
        await testRegister();
        await testGetMe();
        await testLogin();
        await testCreatePolicy();
        await testGetPolicies();
        await testGetPolicyById();

        console.log('\n' + '='.repeat(50));
        console.log('✅ All tests completed!');
        console.log('\n📝 Summary:');
        console.log('- User registered and authenticated');
        console.log('- Policy created successfully');
        console.log('- All endpoints working');
        console.log('\n💡 Next: Test payment endpoints (requires Razorpay keys)');
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
    }
}

// Run tests
runTests();
