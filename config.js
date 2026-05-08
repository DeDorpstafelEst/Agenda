/**
 * Configuration loader for Google Calendar API
 * Loads from config.json (which should be added to .gitignore)
 * Falls back to URL parameters for development
 */

let CONFIG = {
    apiKey: null,
    calendarId: null,
    maxLines: 15,
    fontSize: 21,
    backgroundColor: null
};

// Load configuration from config.json
fetch('config.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('config.json not found. Please create config.json from config.example.json');
        }
        return response.json();
    })
    .then(data => {
        CONFIG.apiKey = data.apiKey;
        CONFIG.calendarId = data.calendarId;
        console.log('Configuration loaded from config.json');
    })
    .catch(error => {
        console.warn('Could not load config.json:', error.message);
        console.log('Attempting to load from URL parameters (development mode)');
        
        // Fallback to URL parameters for development
        CONFIG.apiKey = getParam('apiKey');
        CONFIG.calendarId = getParam('calendarId');
        
        if (!CONFIG.apiKey || !CONFIG.calendarId) {
            showError('API configuration missing. Please create config.json or provide URL parameters.');
        }
    })
    .finally(() => {
        // Load optional URL parameters
        const maxLinesParam = getParam('ml');
        if (maxLinesParam && !isNaN(parseInt(maxLinesParam))) {
            CONFIG.maxLines = parseInt(maxLinesParam);
        }

        const fontSizeParam = getParam('fs');
        if (fontSizeParam && !isNaN(parseInt(fontSizeParam))) {
            CONFIG.fontSize = parseInt(fontSizeParam);
            document.body.style.fontSize = CONFIG.fontSize + 'px';
            document.documentElement.style.fontSize = CONFIG.fontSize + 'px';            
        }

        const bgParam = getParam('bg');
        if (bgParam && bgParam.trim() !== '') {
            CONFIG.backgroundColor = bgParam.trim();
            document.body.style.backgroundColor = CONFIG.backgroundColor;
            CONFIG.maxLines = 100; // Increase max lines when background is set
        } else {
            document.body.style.backgroundColor = 'transparent';
        }
    });

/**
 * Get URL parameter by name
 * @param {string} paramName - The parameter name
 * @returns {string} - The parameter value or empty string
 */
function getParam(paramName) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const value = urlParams.get(paramName);
    return value === null ? '' : value;
}

/**
 * Show error message on page
 * @param {string} message - The error message
 */
function showError(message) {
    const appointmentsDiv = document.getElementById('appointments');
    if (appointmentsDiv) {
        appointmentsDiv.innerHTML = `<div class="error">${escapeHtml(message)}</div>`;
    }
    console.error(message);
}

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} text - The text to escape
 * @returns {string} - The escaped text
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
