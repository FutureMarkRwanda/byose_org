import {jwtDecode} from "jwt-decode";
import axios from "axios";

export async function fetchData(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${returnToken()}`,
            },
        });
        return {data: response.data, message: response.data.message};
    } catch (error) {
        let errorMessage = "Server is down";

        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }

        return {error: errorMessage, data: -1};
    }
}

export async function sendData(url, data) {
    try {
        const response = await axios.post(url, data, {
            headers: {
                Authorization: `Bearer ${returnToken()}`,
            },
        });
        return {data: response.data, message: response.data.message};
    } catch (error) {
        let errorMessage = "Server is down";

        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }

        return {error: errorMessage, data: -1};
    }
}


export async function updateData(url, data) {
    try {
        const response = await axios.put(url, data, {
            headers: {
                Authorization: `Bearer ${returnToken()}`,
            },
        });
        return {data: response.data, message: response.data.message};
    } catch (error) {
        let errorMessage = "Server is down";

        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }

        return {error: errorMessage, data: -1};
    }
}

export async function deleteData(url) {
    try {
        const response = await axios.delete(url, {
            headers: {
                Authorization: `Bearer ${returnToken()}`,
            },
        });

        return {data: response.data, message: response.data.message};
    } catch (error) {
        let errorMessage = "Server is down";

        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }

        return {error: errorMessage, data: -1};
    }
}

export async function patchData(url, data) {
    try {
        const response = await axios.patch(url, data, {
            headers: {
                Authorization: `Bearer ${returnToken()}`,
            },
        });

        return {data: response.data, message: response.data.message};
    } catch (error) {
        let errorMessage = "Server is down";

        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }

        return {error: errorMessage, data: -1};
    }
}

export async function getImageData(url, data) {
    try {
        const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${returnToken()}`,
        "Content-Type": "application/json",
      },
      responseType: "blob", // ⭐ Important for PNG or other binary data
    });
        const blobUrl = URL.createObjectURL(response.data);
        return {data: blobUrl, message:"success"};
    } catch (error) {
        let errorMessage = "Server is down";

        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }

        return {error: errorMessage, data: -1};
    }
}

export function handleLogout(tokenName = null, pathName) {
    if (tokenName) {
        localStorage.removeItem(tokenName);
    } else {
        // Remove all product tokens
        localStorage.removeItem('byose_tv_token');
        localStorage.removeItem('presence_eye_token');
        // Legacy token removal for backward compatibility
        localStorage.removeItem('movie-rw');
    }
    window.location = pathName || "/auth";
}

export function returnToken() {
    // Auto-detect product from current route
    if (typeof window !== 'undefined') {
        const pathname = window.location.pathname;
        const product = getProductFromRoute(pathname);
        const productToken = getProductToken(product);
        if (productToken) {
            return productToken;
        }
    }
    // Return null if no token specified and no legacy token
    return null;
}

export function getProductToken(product) {
    // Product-specific token retrieval
    const tokenMap = {
        'byose_tv': 'byose_tv_token',
        'presence_eye': 'presence_eye_token'
    };
    return localStorage.getItem(tokenMap[product]);
}

export function setToken(token, product = null) {
    if (product) {
        // Product-specific token storage
        const tokenMap = {
            'byose_tv': 'byose_tv_token',
            'presence_eye': 'presence_eye_token'
        };
        localStorage.setItem(tokenMap[product], token);
    } else {
        // Legacy support for backward compatibility
        localStorage.setItem('movie-rw', token);
    }
}

export const decodeToken = (tokenName = null) => {
    let token;
    if (tokenName) {
        token = localStorage.getItem(tokenName);
    } else {
        // Try legacy token first for backward compatibility
        token = localStorage.getItem('movie-rw');
        if (!token) {
            // If no legacy token, return null
            return null;
        }
    }
    if (!token) {
        return null;
    }
    try {
        const decoded = jwtDecode(token);
        const {firstName, lastName, ...otherProperties} = decoded;
        return {firstName, lastName, ...otherProperties};
    } catch (error) {
        return null;
    }
};

export const decodeProductToken = (product) => {
    const tokenMap = {
        'byose_tv': 'byose_tv_token',
        'presence_eye': 'presence_eye_token'
    };
    return decodeToken(tokenMap[product]);
};

// Helper function to determine product from route
export const getProductFromRoute = (pathname) => {
    if (pathname === '/dashboard' || pathname === '/dashboard/') {
        // Dashboard home route - allow both products
        return null;
    }
    if (pathname.includes('/byose-tv/')) {
        return 'byose_tv';
    }
    if (pathname.includes('/presence-eye-buttons/')) {
        return 'presence_eye';
    }
    // Default to null for unknown routes (allow access)
    return null;
};

// Helper function to get the correct token for the current route
export const getTokenForRoute = (pathname) => {
    const product = getProductFromRoute(pathname);
    return getProductToken(product);
};

// Session Management Helper Functions
export const getDeviceManagementToken = () => {
    return localStorage.getItem('device_management_token');
};

export const getSessionLimitInfo = () => {
    const info = localStorage.getItem('session_limit_info');
    return info ? JSON.parse(info) : null;
};

export const clearDeviceManagementToken = () => {
    localStorage.removeItem('device_management_token');
    localStorage.removeItem('session_limit_info');
};

export const fetchSessions = async (presenceServer) => {
    const token = getDeviceManagementToken();
    if (!token) {
        return { error: 'No device management token found' };
    }

    try {
        const response = await axios.get(`${presenceServer}/api/sessions/my-sessions`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return { data: response.data, message: response.data.message };
    } catch (error) {
        let errorMessage = "Server is down";
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        return { error: errorMessage, data: -1 };
    }
};

export const removeSession = async (presenceServer, sessionId) => {
    const token = getDeviceManagementToken();
    if (!token) {
        return { error: 'No device management token found' };
    }

    try {
        const response = await axios.delete(`${presenceServer}/api/sessions/remove-session/${sessionId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return { data: response.data, message: response.data.message };
    } catch (error) {
        let errorMessage = "Server is down";
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        return { error: errorMessage, data: -1 };
    }
};

export const markDeviceAsLost = async (presenceServer, sessionId) => {
    const token = getDeviceManagementToken();
    if (!token) {
        return { error: 'No device management token found' };
    }

    try {
        const response = await axios.post(`${presenceServer}/api/sessions/mark-lost/${sessionId}`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return { data: response.data, message: response.data.message };
    } catch (error) {
        let errorMessage = "Server is down";
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        return { error: errorMessage, data: -1 };
    }
};

export function combineInitials(sentence) {
    // Split the sentence into words
    const words = sentence.split(' ');

    // Map each word to its first character and join them
    const initials = words.map(word => word[0]).join('');

    // Capitalize the result and return
    return initials.toUpperCase();
}


export function containsKeyWord(text, keyword) {
    if (typeof text !== "string" || typeof keyword !== "string") {
        throw new Error("The input must be a string");
    }
    return text.toLowerCase().includes(keyword);
}

export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function findObjectByKeyword(array, property, keyword) {
    // Check if inputs are valid
    if (!Array.isArray(array) || !property || typeof keyword !== 'string') {
        return null;
    }

    // Find the first object where the specified property contains the keyword
    return array.find(obj => {
        // Ensure the object has the property and it's a string
        if (obj && typeof obj[property] === 'string') {
            // Case-insensitive search for the keyword
            return obj[property].toLowerCase().includes(keyword.toLowerCase());
        }
        return false;
    }) || null; // Return null if no match is found
}


export function generateYouTubeEmbedURL(url) {
    try {
        const parsedUrl = new URL(url);
        const videoId = parsedUrl.searchParams.get('v');

        if (!videoId) {
            // throw new Error('Invalid YouTube URL: missing video ID');
            return null;
        }

        // Construct the embed URL with desired parameters
        return `https://www.youtube.com/embed/${videoId}?loop=1&autoplay=1&fs=0&controls=0&modestbranding=1&enablejsapi=1&mute=1&start=0&playlist=${videoId}`;
    } catch (error) {
        // console.error(error);
        return null;
    }
}


export const getTextColor = (hex) => {
    // Convert hex to RGB
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Calculate luminance
    const luminance = 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);

    // If the color is dark, return a lighter contrasting color
    if (luminance < 0.5) {
        return `rgb(${r + 100 > 255 ? 255 : r + 130}, ${g + 100 > 255 ? 255 : g + 130}, ${b + 100 > 255 ? 255 : b + 130})`;
    }
    // If the color is light, return a darker contrasting color
    else {
        return `rgb(${r - 100 < 0 ? 0 : r - 120}, ${g - 100 < 0 ? 0 : g - 120}, ${b - 100 < 0 ? 0 : b - 120})`;
    }
};

// Mostly in  Presence Eye Admin Portal

export function formatDate(d) {
    if (!d) return "—";
    try {
        const dt = new Date(d);
        return dt.toLocaleDateString();
    } catch {
        return d;
    }
}

export function getOwnerLabel(owner) {
    if (!owner) return "—";
    if (typeof owner === "string") return owner;
    if (owner.email) return owner.email;
    if (owner.firstName || owner.lastName) return `${owner.firstName || ""} ${owner.lastName || ""}`.trim();
    return owner._id || "owner";
}

export function lastNChars(str, n) {
    if (typeof str !== "string") return "";
    if (typeof n !== "number" || n <= 0) return "";
    return str.slice(-n);
}

export const copyToClipboard = async (text, label = "copied", showNotification) => {
    try {
        await navigator.clipboard.writeText(String(text));
        // Check if showNotification exists before calling to prevent crash
        if (showNotification) {
            showNotification(`${label} copied to clipboard`, "success");
        } else {
            alert(`${label} copied to clipboard`);
        }
    } catch (err) {
        if (showNotification) showNotification('Failed to copy: ' + err.message, "error");
    }
};
