const API_BASE = '/api';
const createLinkForm = document.getElementById('createLinkForm');
const linksTableBody = document.getElementById('linksTableBody');
const emptyState = document.getElementById('emptyState');
const loadingState = document.getElementById('loadingState');
const successMessage = document.getElementById('successMessage');
const successText = document.getElementById('successText');
const submitBtn = document.getElementById('submitBtn');
const originalUrlInput = document.getElementById('originalUrl');
const customCodeInput = document.getElementById('customCode');

let currentShortUrl = '';

// Load links when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadLinks();
    setupRealTimeValidation();
});

// Setup real-time validation
function setupRealTimeValidation() {
    // URL validation
    originalUrlInput.addEventListener('input', function() {
        validateUrlField(this);
    });
    
    originalUrlInput.addEventListener('blur', function() {
        validateUrlField(this);
    });

    // Custom code validation
    customCodeInput.addEventListener('input', function() {
        validateCodeField(this);
    });
    
    customCodeInput.addEventListener('blur', function() {
        validateCodeField(this);
    });

    // Form submission
    createLinkForm.addEventListener('submit', handleFormSubmit);
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        return;
    }

    const formData = new FormData(createLinkForm);
    const originalUrl = formData.get('originalUrl');
    const customCode = formData.get('customCode');

    await createLink(originalUrl, customCode || undefined);
}

// Validate URL field in real-time
function validateUrlField(field) {
    const value = field.value.trim();
    const errorElement = document.getElementById('originalUrlError');
    
    if (value === '') {
        showFieldError(field, errorElement, 'URL is required');
        return false;
    }
    
    if (!isValidUrl(value)) {
        showFieldError(field, errorElement, 'Please enter a valid URL starting with http:// or https://');
        return false;
    }
    
    clearFieldError(field, errorElement);
    return true;
}

// Validate code field in real-time
function validateCodeField(field) {
    const value = field.value.trim();
    const errorElement = document.getElementById('customCodeError');
    
    // Code is optional, so if empty, it's valid
    if (value === '') {
        clearFieldError(field, errorElement);
        return true;
    }
    
    if (!/^[A-Za-z0-9]{6,8}$/.test(value)) {
        showFieldError(field, errorElement, 'Code must be 6-8 characters, letters and numbers only');
        return false;
    }
    
    clearFieldError(field, errorElement);
    return true;
}

// Validate entire form before submission
function validateForm() {
    const isUrlValid = validateUrlField(originalUrlInput);
    const isCodeValid = validateCodeField(customCodeInput);
    
    return isUrlValid && isCodeValid;
}

// Show field error
function showFieldError(field, errorElement, message) {
    field.classList.add('border-red-300', 'focus:ring-red-500', 'focus:border-red-500');
    field.classList.remove('border-gray-300', 'focus:ring-blue-500', 'focus:border-blue-500', 'valid:border-green-300');
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden', 'text-gray-500');
        errorElement.classList.add('text-red-500');
    }
}

// Clear field error
function clearFieldError(field, errorElement) {
    field.classList.remove('border-red-300', 'focus:ring-red-500', 'focus:border-red-500');
    field.classList.add('border-gray-300', 'focus:ring-blue-500', 'focus:border-blue-500');
    
    if (field.value.trim() !== '' && field.checkValidity()) {
        field.classList.add('valid:border-green-300');
    }
    
    if (errorElement) {
        errorElement.classList.add('hidden');
        errorElement.classList.remove('text-red-500');
    }
}

// Create short link
async function createLink(originalUrl, customCode) {
    try {
        setSubmitButtonState(true);
        const response = await fetch(`${API_BASE}/links`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                originalUrl: originalUrl.trim(),
                code: customCode ? customCode.trim() : undefined
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            showSuccess(data.shortUrl);
            createLinkForm.reset();
            clearAllFieldErrors();
            loadLinks();
        } else {
            // Handle backend validation errors
            const errorMessage = Array.isArray(data.errors) 
                ? data.errors.join(', ') 
                : (data.error || 'Failed to create link');
            showFieldError(originalUrlInput, document.getElementById('originalUrlError'), errorMessage);
        }
    } catch (error) {
        showFieldError(originalUrlInput, document.getElementById('originalUrlError'), 'Network error. Please try again.');
    } finally {
        setSubmitButtonState(false);
    }
}

// Clear all field errors
function clearAllFieldErrors() {
    clearFieldError(originalUrlInput, document.getElementById('originalUrlError'));
    clearFieldError(customCodeInput, document.getElementById('customCodeError'));
}

// Load all links
async function loadLinks() {
    try {
        showLoadingState();
        const response = await fetch(`${API_BASE}/links`);
        
        if (!response.ok) {
            throw new Error('Failed to load links');
        }
        
        const links = await response.json();
        displayLinks(links);
    } catch (error) {
        showEmptyState('Failed to load links: ' + error.message);
    }
}

// Display links in table
function displayLinks(links) {
    if (!links || links.length === 0) {
        showEmptyState();
        return;
    }

    linksTableBody.innerHTML = links.map(link => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <a href="/${link.code}" target="_blank" class="text-blue-600 hover:text-blue-900 font-mono">
                        ${link.code}
                    </a>
                    <button onclick="copyToClipboard('${window.location.origin}/${link.code}')" 
                            class="ml-2 text-gray-400 hover:text-gray-600 text-sm"
                            title="Copy short URL">
                    </button>
                </div>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm text-gray-900 max-w-xs truncate" title="${link.original_url}">
                    ${link.original_url}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ${link.clicks}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${link.last_clicked_at ? new Date(link.last_clicked_at).toLocaleDateString() : 'Never'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <a href="/code/${link.code}" class="text-blue-600 hover:text-blue-900 mr-3">Stats</a>
                <button onclick="deleteLink('${link.code}')" class="text-red-600 hover:text-red-900">Delete</button>
            </td>
        </tr>
    `).join('');

    hideLoadingState();
    hideEmptyState();
}

// Utility functions
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

function setSubmitButtonState(loading) {
    submitBtn.disabled = loading;
    submitBtn.textContent = loading ? 'Creating...' : 'Create Short Link';
    submitBtn.classList.toggle('opacity-50', loading);
    submitBtn.classList.toggle('cursor-not-allowed', loading);
}

function showSuccess(shortUrl) {
    currentShortUrl = shortUrl;
    successText.textContent = `Short URL created: ${shortUrl}`;
    successMessage.classList.remove('hidden');
    
    // Auto-hide success message after 5 seconds
    setTimeout(() => {
        successMessage.classList.add('hidden');
    }, 5000);
}

function copyToClipboard(text = currentShortUrl) {
    navigator.clipboard.writeText(text).then(() => {
        // Show temporary success
        const originalText = event.target.textContent;
        event.target.textContent = 'Copied!';
        event.target.classList.add('text-green-500');
        
        setTimeout(() => {
            event.target.textContent = '📋';
            event.target.classList.remove('text-green-500');
        }, 2000);
    }).catch(err => {
        console.error('Copy failed:', err);
    });
}

function showLoadingState() {
    loadingState.classList.remove('hidden');
    emptyState.classList.add('hidden');
    linksTableBody.innerHTML = '';
}

function hideLoadingState() {
    loadingState.classList.add('hidden');
}

function showEmptyState(message = 'No links created yet') {
    emptyState.querySelector('p').textContent = message;
    emptyState.classList.remove('hidden');
    linksTableBody.innerHTML = '';
    hideLoadingState();
}

function hideEmptyState() {
    emptyState.classList.add('hidden');
}

// Delete link function
async function deleteLink(code) {
    if (!confirm('Are you sure you want to delete this link? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/links/${code}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadLinks();
            alert('Link deleted successfully!');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete link');
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// Search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const rows = linksTableBody.getElementsByTagName('tr');
            
            for (let row of rows) {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            }
        });
    }
}

// Initialize search when page loads
document.addEventListener('DOMContentLoaded', setupSearch);