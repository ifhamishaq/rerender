export const getFingerprint = async () => {
    try {
        const nav = window.navigator;
        const screen = window.screen;
        const components = [
            nav.userAgent,
            nav.language,
            screen.colorDepth,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset()
        ];
        
        // Add canvas fingerprinting
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.textBaseline = "top";
            ctx.font = "14px 'Arial'";
            ctx.textBaseline = "alphabetic";
            ctx.fillStyle = "#f60";
            ctx.fillRect(125,1,62,20);
            ctx.fillStyle = "#069";
            ctx.fillText("re-render", 2, 15);
            ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
            ctx.fillText("re-render", 4, 17);
            components.push(canvas.toDataURL());
        }

        const raw = components.join('||');
        
        // Hash it using SubtleCrypto
        const msgBuffer = new TextEncoder().encode(raw);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
        // Fallback if crypto fails or is unsupported
        return 'fallback-id-' + new Date().getTimezoneOffset() + '-' + navigator.userAgent.length;
    }
};

export const getSecureQuota = async (storageKey) => {
    const today = new Date().toISOString().split('T')[0];
    const fp = await getFingerprint();
    const fpKey = `${storageKey}_${fp}`;

    let lsQuota = localStorage.getItem(fpKey);
    let cookieQuota = document.cookie.split('; ').find(row => row.startsWith(`${fpKey}=`));

    let count = 0;
    
    if (lsQuota) {
        try {
            const parsed = JSON.parse(lsQuota);
            if (parsed.date === today) count = Math.max(count, parsed.count);
        } catch(e) {}
    }
    
    if (cookieQuota) {
        try {
            const parsed = JSON.parse(decodeURIComponent(cookieQuota.split('=')[1]));
            if (parsed.date === today) count = Math.max(count, parsed.count);
        } catch(e) {}
    }

    return { date: today, count };
};

export const updateSecureQuota = async (storageKey, count) => {
    const today = new Date().toISOString().split('T')[0];
    const fp = await getFingerprint();
    const fpKey = `${storageKey}_${fp}`;
    
    const data = JSON.stringify({ date: today, count });
    
    // Set LocalStorage
    localStorage.setItem(fpKey, data);
    
    // Set Cookie
    const expires = new Date();
    expires.setDate(expires.getDate() + 2); // robust expiration
    document.cookie = `${fpKey}=${encodeURIComponent(data)}; expires=${expires.toUTCString()}; path=/`;
};
