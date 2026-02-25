// API Configuration
const API_BASE_URL = 'http://localhost:3000';

// DOM Elements
const form = document.getElementById('identifyForm');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phoneNumber');
const resultsCard = document.getElementById('resultsCard');
const errorCard = document.getElementById('errorCard');
const errorMessage = document.getElementById('errorMessage');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');

// Check API Health on Load
checkAPIHealth();

// Form Submit Handler
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const phoneNumber = phoneInput.value.trim();
    
    // Validation
    if (!email && !phoneNumber) {
        showError('Please provide at least one field (email or phone number)');
        return;
    }
    
    // Prepare request
    const requestData = {};
    if (email) requestData.email = email;
    if (phoneNumber) requestData.phoneNumber = phoneNumber;
    
    // Call API
    await identifyContact(requestData);
});

// API Call Function
async function identifyContact(data) {
    const button = form.querySelector('button');
    const btnText = button.querySelector('.btn-text');
    const loader = button.querySelector('.loader');
    
    // Show loading state
    button.disabled = true;
    btnText.textContent = 'Identifying...';
    loader.style.display = 'inline-block';
    hideResults();
    
    try {
        const response = await fetch(`${API_BASE_URL}/identify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Failed to identify contact');
        }
        
        displayResults(result);
        
    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Failed to connect to API. Please ensure the server is running.');
    } finally {
        // Reset button state
        button.disabled = false;
        btnText.textContent = 'Identify Contact';
        loader.style.display = 'none';
    }
}

// Display Results
function displayResults(data) {
    hideError();
    
    const contact = data.contact;
    
    // Primary Contact ID
    document.getElementById('primaryBadge').textContent = `#${contact.primaryContactId}`;
    
    // Emails
    const emailsContainer = document.getElementById('emailsContainer');
    const emailsEmpty = document.getElementById('emailsEmpty');
    
    if (contact.emails && contact.emails.length > 0) {
        emailsContainer.innerHTML = contact.emails.map((email, index) => 
            `<span class="tag ${index === 0 ? 'primary' : ''}">${email}</span>`
        ).join('');
        emailsContainer.style.display = 'flex';
        emailsEmpty.style.display = 'none';
    } else {
        emailsContainer.style.display = 'none';
        emailsEmpty.style.display = 'block';
    }
    
    // Phone Numbers
    const phonesContainer = document.getElementById('phonesContainer');
    const phonesEmpty = document.getElementById('phonesEmpty');
    
    if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
        phonesContainer.innerHTML = contact.phoneNumbers.map((phone, index) => 
            `<span class="tag ${index === 0 ? 'primary' : ''}">${phone}</span>`
        ).join('');
        phonesContainer.style.display = 'flex';
        phonesEmpty.style.display = 'none';
    } else {
        phonesContainer.style.display = 'none';
        phonesEmpty.style.display = 'block';
    }
    
    // Secondary Contacts
    const secondaryContainer = document.getElementById('secondaryContainer');
    const secondaryEmpty = document.getElementById('secondaryEmpty');
    
    if (contact.secondaryContactIds && contact.secondaryContactIds.length > 0) {
        secondaryContainer.innerHTML = contact.secondaryContactIds.map(id => 
            `<span class="secondary-badge">
                <span class="badge badge-secondary">#${id}</span>
                <span>Linked Contact</span>
            </span>`
        ).join('');
        secondaryContainer.style.display = 'flex';
        secondaryEmpty.style.display = 'none';
    } else {
        secondaryContainer.style.display = 'none';
        secondaryEmpty.style.display = 'block';
    }
    
    // Show results card
    resultsCard.style.display = 'block';
    
    // Smooth scroll to results
    setTimeout(() => {
        resultsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// Show Error
function showError(message) {
    errorMessage.textContent = message;
    errorCard.style.display = 'block';
    resultsCard.style.display = 'none';
    
    // Smooth scroll to error
    setTimeout(() => {
        errorCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}

// Hide Error
function hideError() {
    errorCard.style.display = 'none';
}

// Hide Results
function hideResults() {
    resultsCard.style.display = 'none';
    errorCard.style.display = 'none';
}

// Check API Health
async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        
        if (response.ok && data.status === 'success') {
            statusDot.classList.add('online');
            statusDot.classList.remove('offline');
            statusText.textContent = 'API Online';
            statusText.style.color = '#10b981';
        } else {
            throw new Error('API not healthy');
        }
    } catch (error) {
        statusDot.classList.add('offline');
        statusDot.classList.remove('online');
        statusText.textContent = 'API Offline';
        statusText.style.color = '#ef4444';
        console.error('API Health Check Failed:', error);
    }
}

// Fill Example Data
function fillExample(email, phone) {
    emailInput.value = email;
    phoneInput.value = phone;
    
    // Smooth scroll to form
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Focus on submit button
    setTimeout(() => {
        form.querySelector('button').focus();
    }, 500);
}

// Re-check API health every 30 seconds
setInterval(checkAPIHealth, 30000);

// Add input validation feedback
emailInput.addEventListener('input', () => {
    if (emailInput.value && !isValidEmail(emailInput.value)) {
        emailInput.style.borderColor = '#f59e0b';
    } else {
        emailInput.style.borderColor = '';
    }
});

// Email validation helper
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Clear form button (optional enhancement)
function clearForm() {
    emailInput.value = '';
    phoneInput.value = '';
    hideResults();
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape to clear results
    if (e.key === 'Escape') {
        hideResults();
    }
});

console.log('🚀 Bitespeed Identity Reconciliation Frontend Loaded');
console.log(`📡 API: ${API_BASE_URL}`);
