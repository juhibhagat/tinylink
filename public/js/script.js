const API_BASE = '/api';
const createLinkForm = document.getElementById('createLinkForm');
const linksTableBody = document.getElementById('linksTableBody');
const emptyState = document.getElementById('emptyState');
const loadingState = document.getElementById('loadingState');
const successMessage = document.getElementById('successMessage');
const successText = document.getElementById('successText');
const submitBtn = document.getElementById('submitBtn');
let currentShortUrl = '';

document.addEventListener('DOMContentLoaded', loadLinks);

createLinkForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(createLinkForm);
    const originalUrl = formData.get('originalUrl');
    const customCode = formData.get('customCode');

    if (!isValidUrl(originalUrl)) {
        showError('originalUrl', 'Please enter a valid URL');
        return;
    }

    await createLink(originalUrl, customCode || undefined);
});

async function createLink(originalUrl, customCode) {
    try {
        setSubmitButtonState(true);
        const response = await fetch(`${API_BASE}/links`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ originalUrl, code: customCode })
        });

        const data = await response.json();
        if (response.ok) {
            showSuccess(data.shortUrl);
            createLinkForm.reset();
            loadLinks();
        } else {
            showError('originalUrl', data.error || 'Failed to create link');
        }
    } catch (error) {
        showError('originalUrl', 'Network error. Please try again.');
    } finally {
        setSubmitButtonState(false);
    }
}

async function loadLinks() {
    try {
        showLoadingState();
        const response = await fetch(`${API_BASE}/links`);
        const links = await response.json();
        if (response.ok) {
            displayLinks(links);
        } else {
            showEmptyState('Failed to load links');
        }
    } catch (error) {
        showEmptyState('Network error');
    }
}

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
                            class="ml-2 text-gray-400 hover:text-gray-600">
                    </button>
                </div>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm text-gray-900 max-w-xs truncate" title="${link.original_url}">
                    ${link.original_url}
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${link.clicks}
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

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function setSubmitButtonState(loading) {
    submitBtn.disabled = loading;
    submitBtn.textContent = loading ? 'Creating...' : 'Create Short Link';
    submitBtn.classList.toggle('opacity-50', loading);
}

function showError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}Error`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('text-gray-500');
        errorElement.classList.add('text-red-500');
    }
}

function showSuccess(shortUrl) {
    currentShortUrl = shortUrl;
    successText.textContent = `Short URL created: ${shortUrl}`;
    successMessage.classList.remove('hidden');
}

function copyToClipboard(text = currentShortUrl) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
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

async function deleteLink(code) {
    if (!confirm('Are you sure you want to delete this link?')) return;
    try {
        const response = await fetch(`${API_BASE}/links/${code}`, { method: 'DELETE' });
        if (response.ok) {
            loadLinks();
        } else {
            alert('Failed to delete link');
        }
    } catch (error) {
        alert('Network error');
    }
}