// API Configuration
// This file centralizes all API URLs for easy deployment

const getApiUrl = (): string => {
    // In production, use environment variable
    // In development, use localhost
    return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};

export const API_URL = getApiUrl();

// Export full API endpoints
export const API_ENDPOINTS = {
    // Auth
    LOGIN: `${API_URL}/api/auth/login`,
    REGISTER: `${API_URL}/api/auth/register`,

    // User
    DASHBOARD: `${API_URL}/api/user/dashboard`,
    PROFILE_COMPLETION: `${API_URL}/api/user/profile/completion`,

    // Items
    ITEMS: `${API_URL}/items`,
    USER_ITEMS: `${API_URL}/items/user/me`,
    MARKETPLACE: `${API_URL}/api/marketplace/items`,

    // Offers
    OFFERS: `${API_URL}/api/offer`,
    CREATE_OFFER: `${API_URL}/api/offer/create`,

    // Messages
    MESSAGES: `${API_URL}/api/messages`,
    CONVERSATIONS: `${API_URL}/api/messages/conversations`,

    // Notifications
    NOTIFICATIONS: `${API_URL}/api/notifications`,
    MARK_ALL_READ: `${API_URL}/api/notifications/mark-read`,

    // Friends
    FRIENDS: `${API_URL}/api/friends`,
    FRIEND_REQUESTS: `${API_URL}/api/friends/requests`,

    // Meetups
    MEETUPS: `${API_URL}/api/meetup`,
    MY_MEETUPS: `${API_URL}/api/meetup/my-meetups`,

    // Request Board
    BOARD_REQUESTS: `${API_URL}/api/board/requests`,
    BOARD_REQUEST: `${API_URL}/api/board/request`,

    // Referrals
    REFERRAL_STATS: `${API_URL}/api/referral/stats`,
    REFERRAL_LEADERBOARD: `${API_URL}/api/referral/leaderboard`,
    REFERRAL_VALIDATE: `${API_URL}/api/referral/validate`,

    // Feedback
    FEEDBACK: `${API_URL}/api/feedback`,

    // Search
    SEARCH_USERS: `${API_URL}/api/search/users`,
};

export default API_URL;
