/**
 * Corporate Warfare API Service
 * Handles API requests to corporate-warfare.com
 * Corporate Warfare Discord Bot
 */

const { logError, logInfo } = require('../utils/errorHandler');

const API_BASE_URL = 'https://corporate-warfare.com/api';

/**
 * Fetch a player profile by ID
 * @param {number|string} profileId - The profile ID to fetch
 * @returns {Promise<Object|null>} Profile data or null if not found
 */
async function fetchProfile(profileId) {
    try {
        const response = await fetch(`${API_BASE_URL}/profile/${profileId}`);

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`API responded with status ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        logError('CW API', `Failed to fetch profile ${profileId}`, error);
        return null;
    }
}

/**
 * Format profile data for display (excludes sensitive login info)
 * @param {Object} profile - Raw profile data from API
 * @returns {Object} Formatted profile safe for display
 */
function formatProfileForDisplay(profile) {
    return {
        id: profile.id,
        profileId: profile.profile_id,
        playerName: profile.player_name,
        startingState: profile.starting_state,
        gender: profile.gender,
        age: profile.age,
        profileSlug: profile.profile_slug,
        profileImageUrl: profile.profile_image_url,
        bio: profile.bio,
        actions: profile.actions,
        isOnline: profile.is_online,
        lastSeenAt: profile.last_seen_at ? new Date(profile.last_seen_at) : null,
        createdAt: profile.created_at ? new Date(profile.created_at) : null,
    };
}

/**
 * Get profile URL for the website
 * @param {string} profileSlug - The profile slug
 * @returns {string} Full profile URL
 */
function getProfileUrl(profileSlug) {
    return `https://corporate-warfare.com/profile/${profileSlug}`;
}

module.exports = {
    fetchProfile,
    formatProfileForDisplay,
    getProfileUrl,
    API_BASE_URL,
};
