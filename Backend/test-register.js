import fetch from 'node-fetch';

async function testRegister() {
    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: `test${Date.now()}@test.com`,
                password: 'Test@123',
                fullName: 'Test Customer',
                phone: '9876543210',
                address: '123 Test Street',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400001',
                role: 'customer'
            })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (data.success) {
            console.log('\n✅ Registration successful!');
            console.log('Token:', data.data.token.substring(0, 30) + '...');
        } else {
            console.log('\n❌ Registration failed');
            console.log('Error:', data.error);
        }
    } catch (error) {
        console.error('❌ Request failed:', error.message);
    }
}

testRegister();
