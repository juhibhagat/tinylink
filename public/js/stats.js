// Get the code from URL
const pathSegments = window.location.pathname.split('/');
const code = pathSegments[pathSegments.length - 1];

// API base URL
const API_BASE = '/api';

// Load stats when page loads
document.addEventListener('DOMContentLoaded', loadStats);

async function loadStats() {
    try {
        const response = await fetch(`${API_BASE}/links/${code}`);
        
        if (!response.ok) {
            throw new Error('Link not found');
        }

        const link = await response.json();
        displayStats(link);
    } catch (error) {
        showError(error.message);
    }
}

function displayStats(link) {
    const statsContent = document.getElementById('statsContent');
    
    const shortUrl = `${window.location.origin}/${link.code}`;
    const createdDate = new Date(link.created_at).toLocaleDateString();
    const lastClicked = link.last_clicked_at 
        ? new Date(link.last_clicked_at).toLocaleString()
        : 'Never';

    statsContent.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 class="text-lg font-semibold text-blue-800 mb-2">Total Clicks</h3>
                <p class="text-3xl font-bold text-blue-600">${link.clicks}</p>
            </div>
            
            <div class="bg-green-50 p-6 rounded-lg border border-green-200">
                <h3 class="text-lg font-semibold text-green-800 mb-2">Created On</h3>
                <p class="text-lg text-green-600">${createdDate}</p>
            </div>
            
            <div class="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <h3 class="text-lg font-semibold text-purple-800 mb-2">Last Clicked</h3>
                <p class="text-lg text-purple-600">${lastClicked}</p>
            </div>
        </div>

        <div class="space-y-6">
            <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Short URL</h3>
                <div class="flex items-center space-x-2">
                    <input 
                        type="text" 
                        value="${shortUrl}" 
                        readonly 
                        class="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono"
                    >
                    <button 
                        onclick="copyToClipboard('${shortUrl}')"
                        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Copy
                    </button>
                </div>
            </div>

            <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Original URL</h3>
                <div class="flex items-center space-x-2">
                    <input 
                        type="text" 
                        value="${link.original_url}" 
                        readonly 
                        class="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    >
                    <a 
                        href="${link.original_url}" 
                        target="_blank"
                        class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                        Visit
                    </a>
                </div>
            </div>

            <div class="pt-4 border-t border-gray-200">
                <button 
                    onclick="deleteLink('${link.code}')"
                    class="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
                >
                    Delete This Link
                </button>
            </div>
        </div>
    `;
}

function showError(message) {
    const statsContent = document.getElementById('statsContent');
    statsContent.innerHTML = `
        <div class="text-center py-8">
            <svg class="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">Error</h3>
            <p class="mt-1 text-sm text-gray-500">${message}</p>
            <a 
                href="/" 
                class="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
                Back to Dashboard
            </a>
        </div>
    `;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show temporary success message
        const originalText = event.target.textContent;
        event.target.textContent = 'Copied!';
        event.target.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        event.target.classList.add('bg-green-600', 'hover:bg-green-700');
        
        setTimeout(() => {
            event.target.textContent = originalText;
            event.target.classList.remove('bg-green-600', 'hover:bg-green-700');
            event.target.classList.add('bg-blue-600', 'hover:bg-blue-700');
        }, 2000);
    });
}

async function deleteLink(code) {
    if (!confirm('Are you sure you want to delete this link? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/links/${code}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Link deleted successfully!');
            window.location.href = '/';
        } else {
            throw new Error('Failed to delete link');
        }
    } catch (error) {
        alert('Error deleting link: ' + error.message);
    }
}