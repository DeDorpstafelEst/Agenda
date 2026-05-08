/**
 * Google Calendar Event Display Application
 * Displays upcoming events from a Google Calendar
 */

// Constants
const CALENDAR_REFRESH_INTERVAL = 60 * 60 * 1000; // 1 hour
const DAYS_AHEAD = 60;

/**
 * Initialize the calendar application
 */
function initCalendar() {
    // Wait for config to load
    const checkConfigInterval = setInterval(() => {
        if (CONFIG.apiKey && CONFIG.calendarId) {
            clearInterval(checkConfigInterval);
            loadCalendarAPI();
        }
    }, 100);

    // Timeout after 5 seconds
    setTimeout(() => {
        clearInterval(checkConfigInterval);
        if (!CONFIG.apiKey || !CONFIG.calendarId) {
            showError('Failed to load configuration. Please check config.json.');
        }
    }, 5000);
}

/**
 * Load Google Calendar API
 */
function loadCalendarAPI() {
    gapi.load('client', function () {
        gapi.client.setApiKey(CONFIG.apiKey);
        gapi.client.load('calendar', 'v3')
            .then(function () {
                loadEvents();
            })
            .catch(function (error) {
                console.error('Error loading API:', error);
                showError('Error loading Google Calendar API. Please check your configuration.');
            });
    });
}

/**
 * Load events from Google Calendar
 */
function loadEvents() {
    const now = new Date();
    const endDate = new Date(now.getTime() + DAYS_AHEAD * 24 * 60 * 60 * 1000);

    const request = gapi.client.calendar.events.list({
        'calendarId': CONFIG.calendarId,
        'timeMin': now.toISOString(),
        'timeMax': endDate.toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'orderBy': 'startTime',
        'maxResults': CONFIG.backgroundColor ? 150 : (CONFIG.maxLines * 2) + 20
    });

    request.execute(function (response) {
        if (response && response.error) {
            handleAPIError(response.error);
            return;
        }

        const events = response && response.items ? response.items : [];
        displayEvents(events);
        scheduleRefresh();
    });
}

/**
 * Handle API errors
 * @param {object} error - The error object
 */
function handleAPIError(error) {
    console.error('API error:', error);
    let message = 'Error loading calendar data';

    if (error.code === 403) {
        message = 'Access denied (403). The calendar data may not be publicly shared or the API key does not have access to this calendar.';
    } else if (error.code === 404) {
        message = 'Calendar not found (404). Please check the calendar ID.';
    } else if (error.code === 400) {
        message = 'Invalid request (400). Please check your configuration.';
    } else if (error.message) {
        message = `Error: ${error.message}`;
    }

    showError(message);
}

/**
 * Display events on the page
 * @param {array} events - Array of event objects
 */
function displayEvents(events) {
    if (!events || events.length === 0) {
        document.getElementById('appointments').innerHTML = '<div class="loading">No upcoming events.</div>';
        return;
    }

    const now = new Date();
    let htmlLeft = '';
    let htmlRight = '';
    let lines = 0;
    let eventGroups = {};
    let currentFound = false;

    // Group events by date
    events.forEach(event => {
        const start = new Date(event.start.dateTime || event.start.date);
        const dateStr = start.toLocaleString('nl-NL', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });

        if (!eventGroups[dateStr]) {
            eventGroups[dateStr] = [];
        }
        eventGroups[dateStr].push(event);
    });

    // Build HTML for each date group
    for (const dateStr in eventGroups) {
        const groupedEvents = eventGroups[dateStr];
        let htmlLine = `<div class="appointment-group"><div class="date">${escapeHtml(dateStr)}</div>`;
        lines++;

        groupedEvents.forEach(event => {
            const start = new Date(event.start.dateTime || event.start.date);
            const end = new Date(event.end.dateTime || event.end.date);
            const isCurrent = !currentFound && start <= now && now < end;

            if (isCurrent) {
                currentFound = true;
            }

            htmlLine += formatEventHTML(event, isCurrent);
            lines++;
        });

        htmlLine += '</div>';

        // Distribute across columns
        if (lines <= 2 * CONFIG.maxLines - 1) {
            if (lines <= CONFIG.maxLines) {
                htmlLeft += htmlLine;
            } else if (!CONFIG.backgroundColor) {
                htmlRight += htmlLine;
            }
        }
    }

    // Render final layout
    document.getElementById('appointments').innerHTML = `
        <div class="columnleft">${htmlLeft}</div>
        <div class="columnright">${htmlRight}</div>
    `;
}

/**
 * Format an event as HTML
 * @param {object} event - The event object
 * @param {boolean} isCurrent - Whether this event is currently happening
 * @returns {string} - HTML string
 */
function formatEventHTML(event, isCurrent) {
    const start = new Date(event.start.dateTime || event.start.date);
    const end = new Date(event.end.dateTime || event.end.date);
    const title = event.summary || 'Unknown';
    const location = event.location || '';

    const timeStr = start.toLocaleString('nl-NL', { hour: '2-digit', minute: '2-digit' }) +
        ' - ' + end.toLocaleString('nl-NL', { hour: '2-digit', minute: '2-digit' });

    const currentClass = isCurrent ? ' current' : '';

    return `
        <div class="event${currentClass}">
            <span class="time">${timeStr}</span>
            <span class="title">${escapeHtml(title)}</span>
            ${location ? `<span class="location">${escapeHtml(location)}</span>` : ''}
        </div>
    `;
}

/**
 * Schedule the next page refresh
 */
function scheduleRefresh() {
    // Refresh every hour or at the top of the next hour
    const now = new Date();
    const nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0, 0);
    const timeUntilNextHour = nextHour - now;

    setTimeout(() => {
        location.reload();
    }, Math.min(CALENDAR_REFRESH_INTERVAL, timeUntilNextHour));
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalendar);
} else {
    initCalendar();
}
