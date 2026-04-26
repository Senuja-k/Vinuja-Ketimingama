/**
 * Generates a basic device fingerprint based on browser and screen attributes.
 * This is used for security identification without storing personal data.
 */
export const getFingerprint = () => {
    const parts = [
        navigator.userAgent,
        navigator.language,
        screen.width + "x" + screen.height,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
        !!window.sessionStorage,
        !!window.localStorage,
        !!window.indexedDB,
    ];
    
    // Simple hash function to condense the parts into a single string
    const str = parts.join('|');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    
    // Return as hex string
    return "ID-" + Math.abs(hash).toString(16).toUpperCase();
};
