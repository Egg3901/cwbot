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
        cash: profile.cash,
        portfolioValue: profile.portfolio_value,
        netWorth: profile.net_worth,
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

/**
 * Fetch a corporation by ID
 * @param {number|string} corporationId - The corporation ID to fetch
 * @returns {Promise<Object|null>} Corporation data or null if not found
 */
async function fetchCorporation(corporationId) {
    try {
        const response = await fetch(`${API_BASE_URL}/corporation/${corporationId}`);

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`API responded with status ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        logError('CW API', `Failed to fetch corporation ${corporationId}`, error);
        return null;
    }
}

/**
 * Format corporation data for display
 * @param {Object} corp - Raw corporation data from API
 * @returns {Object} Formatted corporation safe for display
 */
function formatCorporationForDisplay(corp) {
    return {
        id: corp.id,
        name: corp.name,
        logo: corp.logo,
        type: corp.type,
        structure: corp.structure,
        sector: corp.focus,
        hqState: corp.hq_state,
        shares: corp.shares,
        publicShares: corp.public_shares,
        sharePrice: corp.share_price,
        capital: corp.capital,
        boardSize: corp.board_size,
        ceoSalary: corp.ceo_salary,
        dividendPercentage: corp.dividend_percentage,
        ceo: corp.ceo ? {
            playerName: corp.ceo.player_name,
            profileSlug: corp.ceo.profile_slug,
            profileId: corp.ceo.profile_id,
        } : null,
        shareholders: (corp.shareholders || []).map(sh => ({
            shares: sh.shares,
            playerName: sh.user?.player_name,
            profileSlug: sh.user?.profile_slug,
            profileId: sh.user?.profile_id,
        })),
        createdAt: corp.created_at ? new Date(corp.created_at) : null,
    };
}

/**
 * Get corporation URL for the website
 * @param {number} corporationId - The corporation ID
 * @returns {string} Full corporation URL
 */
function getCorporationUrl(corporationId) {
    return `https://corporate-warfare.com/corporation/${corporationId}`;
}

/**
 * Format currency for display
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    if (amount === null || amount === undefined) return '$0';
    return '$' + amount.toLocaleString('en-US');
}

/**
 * Format number with commas
 * @param {number} num - The number to format
 * @returns {string} Formatted number string
 */
function formatNumber(num) {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString('en-US');
}

/**
 * Fetch leaderboard data
 * @param {number} page - Page number (1-indexed)
 * @param {string} sort - Sort field: 'net_worth', 'cash', or 'portfolio_value'
 * @param {number} limit - Number of entries per page
 * @returns {Promise<Object|null>} Leaderboard data or null if error
 */
async function fetchLeaderboard(page = 1, sort = 'net_worth', limit = 10) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/leaderboard?page=${page}&limit=${limit}&sort=${sort}`
        );

        if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        logError('CW API', `Failed to fetch leaderboard (page ${page}, sort ${sort})`, error);
        return null;
    }
}

/**
 * Format leaderboard entry for display (excludes sensitive login info)
 * @param {Object} entry - Raw leaderboard entry from API
 * @returns {Object} Formatted entry safe for display
 */
function formatLeaderboardEntry(entry) {
    return {
        rank: entry.rank,
        playerName: entry.player_name,
        profileId: entry.profile_id,
        profileSlug: entry.profile_slug,
        profileImageUrl: entry.profile_image_url,
        cash: entry.cash,
        portfolioValue: entry.portfolio_value,
        netWorth: entry.net_worth,
    };
}

module.exports = {
    fetchProfile,
    formatProfileForDisplay,
    getProfileUrl,
    fetchCorporation,
    formatCorporationForDisplay,
    getCorporationUrl,
    formatCurrency,
    formatNumber,
    fetchLeaderboard,
    formatLeaderboardEntry,
    API_BASE_URL,
};
