// Global API URL configuration
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_URL = BASE_URL;
export const API_BASE = `${BASE_URL}/api`;

// Helper function to build API URLs
export const buildApiUrl = (path: string) => {
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${BASE_URL}/${cleanPath}`;
};
