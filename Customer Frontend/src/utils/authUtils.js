// Authentication Utility Functions

// Initialize customer users if not exists
export const initializeCustomerUsers = () => {
    const users = localStorage.getItem('customer_users');
    if (!users) {
        localStorage.setItem('customer_users', JSON.stringify([]));
    }
};

// Register new customer
export const registerCustomer = (userData) => {
    initializeCustomerUsers();
    const users = JSON.parse(localStorage.getItem('customer_users') || '[]');

    // Check if email already exists
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
        return { success: false, message: 'Email already registered!' };
    }

    const newUser = {
        id: `customer-${Date.now()}`,
        ...userData,
        createdAt: new Date().toISOString(),
        policies: []
    };

    users.push(newUser);
    localStorage.setItem('customer_users', JSON.stringify(users));

    return { success: true, user: newUser };
};

// Login customer
export const loginCustomer = (email, password) => {
    const users = JSON.parse(localStorage.getItem('customer_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        // Store current session
        const sessionUser = { ...user };
        delete sessionUser.password; // Don't store password in session
        localStorage.setItem('current_customer', JSON.stringify(sessionUser));
        return { success: true, user: sessionUser };
    }

    return { success: false, message: 'Invalid email or password!' };
};

// Logout customer
export const logoutCustomer = () => {
    localStorage.removeItem('current_customer');
};

// Get current logged-in customer
export const getCurrentCustomer = () => {
    const customer = localStorage.getItem('current_customer');
    return customer ? JSON.parse(customer) : null;
};

// Check if customer is logged in
export const isCustomerLoggedIn = () => {
    return getCurrentCustomer() !== null;
};

// Update customer profile
export const updateCustomerProfile = (updatedData) => {
    const currentCustomer = getCurrentCustomer();
    if (!currentCustomer) return { success: false, message: 'Not logged in!' };

    const users = JSON.parse(localStorage.getItem('customer_users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentCustomer.id);

    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updatedData };
        localStorage.setItem('customer_users', JSON.stringify(users));

        // Update session
        const updatedUser = { ...users[userIndex] };
        delete updatedUser.password;
        localStorage.setItem('current_customer', JSON.stringify(updatedUser));

        return { success: true, user: updatedUser };
    }

    return { success: false, message: 'User not found!' };
};

// Change password
export const changePassword = (currentPassword, newPassword) => {
    const currentCustomer = getCurrentCustomer();
    if (!currentCustomer) return { success: false, message: 'Not logged in!' };

    const users = JSON.parse(localStorage.getItem('customer_users') || '[]');
    const user = users.find(u => u.id === currentCustomer.id);

    if (user && user.password === currentPassword) {
        user.password = newPassword;
        localStorage.setItem('customer_users', JSON.stringify(users));
        return { success: true, message: 'Password changed successfully!' };
    }

    return { success: false, message: 'Current password is incorrect!' };
};

// Get customer policies
export const getCustomerPolicies = () => {
    const currentCustomer = getCurrentCustomer();
    if (!currentCustomer) return [];

    const allPolicies = JSON.parse(localStorage.getItem('my_animal_policies') || '[]');
    return allPolicies.filter(p => p.customerId === currentCustomer.id);
};

// Add policy to customer
export const addPolicyToCustomer = (policyData) => {
    const currentCustomer = getCurrentCustomer();
    if (!currentCustomer) return { success: false, message: 'Not logged in!' };

    const policy = {
        ...policyData,
        customerId: currentCustomer.id,
        customerEmail: currentCustomer.email,
        customerName: currentCustomer.fullName
    };

    const allPolicies = JSON.parse(localStorage.getItem('my_animal_policies') || '[]');
    allPolicies.push(policy);
    localStorage.setItem('my_animal_policies', JSON.stringify(allPolicies));

    return { success: true, policy };
};
