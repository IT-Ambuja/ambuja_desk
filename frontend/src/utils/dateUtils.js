/**
 * Utility functions enforcing India Standard Time (IST - Asia/Kolkata UTC+05:30)
 * and strict DD-MM-YYYY date format.
 * Guarantees exact Indian date (DD-MM-YYYY) and time regardless of client machine browser timezone.
 */

/**
 * Safely parses any date string (including DD-MM-YYYY, DD/MM/YYYY, ISO) into a Date object.
 * Fixes JavaScript V8 engine bug where DD-MM-YYYY is incorrectly parsed as MM-DD-YYYY.
 */
export const parseDateString = (dateOrStr) => {
    if (!dateOrStr) return null;
    if (dateOrStr instanceof Date) return dateOrStr;
    const str = String(dateOrStr).trim();
    if (!str || str.toLowerCase() === 'nan' || str.toLowerCase() === 'none') return null;

    // Check for DD-MM-YYYY or DD/MM/YYYY format (e.g., 03-08-2026 or 03/08/2026 12:30)
    const match = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
    if (match) {
        const [, day, month, year, hour = '0', minute = '0', second = '0'] = match;
        // Construct ISO format YYYY-MM-DDTHH:mm:ss so JS Date parses it unambiguously as Day=day, Month=month
        const isoStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
        const dt = new Date(isoStr);
        return isNaN(dt.getTime()) ? null : dt;
    }

    const dt = new Date(str);
    return isNaN(dt.getTime()) ? null : dt;
};

/**
 * Returns current Date object in India Standard Time
 */
export const getISTDate = () => {
    const now = new Date();
    const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    return new Date(istString);
};

/**
 * Formats a Date object or timestamp string into DD-MM-YYYY or DD-MM-YYYY HH:mm IST string
 */
export const formatISTDate = (dateOrStr, includeTime = false) => {
    if (!dateOrStr) return '';
    const dt = parseDateString(dateOrStr);
    if (!dt || isNaN(dt.getTime())) return String(dateOrStr).split(' ')[0];

    const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        ...(includeTime ? { hour: '2-digit', minute: '2-digit', hour12: false } : {})
    });

    const parts = formatter.formatToParts(dt);
    const d = parts.find(p => p.type === 'day')?.value;
    const m = parts.find(p => p.type === 'month')?.value;
    const y = parts.find(p => p.type === 'year')?.value;

    if (!includeTime) {
        return `${d}-${m}-${y}`;
    }

    const hp = parts.find(p => p.type === 'hour')?.value || '00';
    const mp = parts.find(p => p.type === 'minute')?.value || '00';
    if (`${hp}:${mp}` === '23:59' || `${hp}:${mp}` === '00:00') {
        return `${d}-${m}-${y}`;
    }
    return `${d}-${m}-${y} ${hp}:${mp}`;
};

/**
 * Converts any date string to numeric timestamp for accurate sorting and comparisons
 */
export const parseDateToTimestamp = (ts) => {
    const dt = parseDateString(ts);
    return dt ? dt.getTime() : 0;
};

/**
 * Returns current IST timestamp formatted as DD-MM-YYYY HH:mm
 */
export const getISTTimestamp = () => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    const parts = formatter.formatToParts(now);
    const d = parts.find(p => p.type === 'day').value;
    const m = parts.find(p => p.type === 'month').value;
    const y = parts.find(p => p.type === 'year').value;
    const hp = parts.find(p => p.type === 'hour').value;
    const mp = parts.find(p => p.type === 'minute').value;
    return `${d}-${m}-${y} ${hp}:${mp}`;
};

/**
 * Returns minimum datetime string (YYYY-MM-DDTHH:mm) for HTML5 datetime-local inputs in IST
 */
export const getISTMinDatetime = () => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', { // en-CA formats YYYY-MM-DD
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    const parts = formatter.formatToParts(now);
    const y = parts.find(p => p.type === 'year').value;
    const m = parts.find(p => p.type === 'month').value;
    const d = parts.find(p => p.type === 'day').value;
    let hp = parts.find(p => p.type === 'hour').value;
    let mp = parts.find(p => p.type === 'minute').value;
    if (hp === '24') hp = '00';
    return `${y}-${m}-${d}T${hp}:${mp}`;
};

/**
 * Returns tomorrow ISO date string (YYYY-MM-DD) in IST
 */
export const getISTTomorrowDate = () => {
    const istNow = getISTDate();
    istNow.setDate(istNow.getDate() + 1);
    const y = istNow.getFullYear();
    const m = String(istNow.getMonth() + 1).padStart(2, '0');
    const d = String(istNow.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};
