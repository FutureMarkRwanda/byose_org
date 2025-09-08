const default_api = import.meta.env.VITE_DEFAULT_SERVER_URL || 'http://localhost:5000';

// API endpoints
export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        LOGIN: `${default_api}/auth/login`,
        REGISTER: `${default_api}/auth/register`,
        VERIFY: `${default_api}/auth/verify`,
        RESET_PASSWORD: `${default_api}/auth/reset-password`,
    },
    // Admin
    ADMIN: {
        REPORTS: `${default_api}/admin/reports`,
    },
    // Parking Stations
    STATIONS: {
        BASE: `${default_api}/station`,
        GET_ALL: `${default_api}/station`,
        GET_BY_ID: (id) => `${default_api}/station/${id}`,
        CREATE: `${default_api}/station`,
        UPDATE: (id) => `${default_api}/station/${id}`,
        DELETE: (id) => `${default_api}/station/${id}`,
    },
};

export const server = default_api