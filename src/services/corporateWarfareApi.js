/**
 * Corporate Warfare API Service
 * Handles API requests to corporate-warfare.com
 * Corporate Warfare Discord Bot
 */

const { logError, logInfo } = require('../utils/errorHandler');
const config = require('../config/config');

const API_BASE_URL = config.apiBaseUrl;

// Cache configuration (TTL in milliseconds)
const CACHE_CONFIG = {
    profile: 60 * 1000,        // 1 minute for profiles
    corporation: 60 * 1000,    // 1 minute for corporations
    leaderboard: 30 * 1000,    // 30 seconds for leaderboard
    market: 30 * 1000,         // 30 seconds for market data
    time: 10 * 1000,           // 10 seconds for game time
    maxSize: 500,              // Max cache entries before cleanup
};

// Simple TTL cache
const cache = new Map();

/**
 * Get cached value if not expired
 * @param {string} key - Cache key
 * @returns {*} Cached value or undefined
 */
function getCached(key) {
    const entry = cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
        cache.delete(key);
        return undefined;
    }
    return entry.value;
}

/**
 * Set cache value with TTL
 * @param {string} key - Cache key
 * @param {*} value - Value to cache
 * @param {number} ttl - Time to live in milliseconds
 */
function setCache(key, value, ttl) {
    // Cleanup if cache is too large
    if (cache.size >= CACHE_CONFIG.maxSize) {
        const now = Date.now();
        for (const [k, v] of cache) {
            if (now > v.expiresAt) {
                cache.delete(k);
            }
        }
        // If still too large, remove oldest entries
        if (cache.size >= CACHE_CONFIG.maxSize) {
            const entries = [...cache.entries()].sort((a, b) => a[1].expiresAt - b[1].expiresAt);
            const toDelete = entries.slice(0, Math.floor(CACHE_CONFIG.maxSize / 4));
            toDelete.forEach(([k]) => cache.delete(k));
        }
    }

    cache.set(key, {
        value,
        expiresAt: Date.now() + ttl,
    });
}

/**
 * Clear all cached data
 */
function clearCache() {
    cache.clear();
    logInfo('CW API', 'Cache cleared');
}

/**
 * Get cache statistics
 * @returns {Object} Cache stats
 */
function getCacheStats() {
    const now = Date.now();
    let valid = 0;
    let expired = 0;

    for (const [, entry] of cache) {
        if (now > entry.expiresAt) {
            expired++;
        } else {
            valid++;
        }
    }

    return { total: cache.size, valid, expired };
}

/**
 * Fetch a player profile by ID
 * @param {number|string} profileId - The profile ID to fetch
 * @param {boolean} [bypassCache=false] - Skip cache and fetch fresh data
 * @returns {Promise<Object|null>} Profile data or null if not found
 */
async function fetchProfile(profileId, bypassCache = false) {
    const cacheKey = `profile:${profileId}`;

    // Check cache first
    if (!bypassCache) {
        const cached = getCached(cacheKey);
        if (cached !== undefined) {
            return cached;
        }
    }

    try {
        const response = await fetch(`${API_BASE_URL}/profile/${profileId}`);

        if (!response.ok) {
            if (response.status === 404) {
                // Cache null result briefly to avoid repeated 404s
                setCache(cacheKey, null, 10 * 1000);
                return null;
            }
            throw new Error(`API responded with status ${response.status}`);
        }

        const data = await response.json();
        setCache(cacheKey, data, CACHE_CONFIG.profile);
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
 * @param {boolean} [bypassCache=false] - Skip cache and fetch fresh data
 * @returns {Promise<Object|null>} Corporation data or null if not found
 */
async function fetchCorporation(corporationId, bypassCache = false) {
    const cacheKey = `corporation:${corporationId}`;

    // Check cache first
    if (!bypassCache) {
        const cached = getCached(cacheKey);
        if (cached !== undefined) {
            return cached;
        }
    }

    try {
        const response = await fetch(`${API_BASE_URL}/corporation/${corporationId}`);

        if (!response.ok) {
            if (response.status === 404) {
                setCache(cacheKey, null, 10 * 1000);
                return null;
            }
            throw new Error(`API responded with status ${response.status}`);
        }

        const data = await response.json();
        setCache(cacheKey, data, CACHE_CONFIG.corporation);
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
 * Format leaderboard entry
 * @param {Object} entry - Raw leaderboard entry
 * @returns {Object} Formatted entry
 */
function formatLeaderboardEntry(entry) {
    return {
        rank: entry.rank,
        playerName: entry.player_name,
        profileSlug: entry.profile_slug,
        profileId: entry.profile_id,
        netWorth: entry.net_worth,
        cash: entry.cash,
        portfolioValue: entry.portfolio_value
    };
}

/**
 * Fetch leaderboard data
 * @param {number} page - Page number (1-indexed)
 * @param {string} sort - Sort field: 'net_worth', 'cash', or 'portfolio_value'
 * @param {number} limit - Number of entries per page
 * @param {boolean} [bypassCache=false] - Skip cache and fetch fresh data
 * @returns {Promise<Object|null>} Leaderboard data or null if error
 */
async function fetchLeaderboard(page = 1, sort = 'net_worth', limit = 10, bypassCache = false) {
    const cacheKey = `leaderboard:${page}:${sort}:${limit}`;

    // Check cache first
    if (!bypassCache) {
        const cached = getCached(cacheKey);
        if (cached !== undefined) {
            return cached;
        }
    }

    try {
        const response = await fetch(
            `${API_BASE_URL}/leaderboard?page=${page}&limit=${limit}&sort=${sort}`
        );

        if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
        }

        const data = await response.json();
        setCache(cacheKey, data, CACHE_CONFIG.leaderboard);
        return data;
    } catch (error) {
        logError('CW API', `Failed to fetch leaderboard`, error);
        return null;
    }
}

/**
 * Fetch current game time
 * @param {boolean} [bypassCache=false] - Skip cache and fetch fresh data
 * @returns {Promise<Object|null>} Game time object or null
 */
async function fetchGameTime(bypassCache = false) {
    const cacheKey = 'game:time';

    if (!bypassCache) {
        const cached = getCached(cacheKey);
        if (cached !== undefined) return cached;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/game/time`);
        if (!response.ok) throw new Error(`Status ${response.status}`);

        const data = await response.json();
        setCache(cacheKey, data, CACHE_CONFIG.time);
        return data;
    } catch (error) {
        logError('CW API', 'Failed to fetch game time', error);
        return null;
    }
}

/**
 * Fetch state market data
 * @param {string} stateCode - Two-letter state code (e.g., 'CA')
 * @param {boolean} [bypassCache=false] - Skip cache
 * @returns {Promise<Object|null>} State data or null
 */
async function fetchState(stateCode, bypassCache = false) {
    const code = stateCode.toUpperCase();
    const cacheKey = `market:state:${code}`;

    if (!bypassCache) {
        const cached = getCached(cacheKey);
        if (cached !== undefined) return cached;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/markets/states/${code}`);
        
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`Status ${response.status}`);
        }

        const data = await response.json();
        setCache(cacheKey, data, CACHE_CONFIG.market);
        return data;
    } catch (error) {
        logError('CW API', `Failed to fetch state ${code}`, error);
        return null;
    }
}

/**
 * Fetch commodity market data
 * @param {boolean} [bypassCache=false] - Skip cache
 * @returns {Promise<Array|null>} List of commodities or null
 */
async function fetchCommodities(bypassCache = false) {
    const cacheKey = 'market:commodities';

    if (!bypassCache) {
        const cached = getCached(cacheKey);
        if (cached !== undefined) return cached;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/markets/commodities`);
        if (!response.ok) throw new Error(`Status ${response.status}`);

        const data = await response.json();
        setCache(cacheKey, data, CACHE_CONFIG.market);
        return data;
    } catch (error) {
        logError('CW API', 'Failed to fetch commodities', error);
        return null;
    }
}

/**
 * Sync Discord users with the game
 * @param {string} guildId - Discord Guild ID
 * @param {Array} users - Array of user objects { id, username, discriminator, avatar }
 * @returns {Promise<Object|null>} Sync result
 */
async function syncDiscordUsers(guildId, users) {
    try {
        const response = await fetch(`${API_BASE_URL}/discord/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Bot-Token': config.discordBotApiToken
            },
            body: JSON.stringify({ guild_id: guildId, users })
        });

        if (!response.ok) {
            // Attempt to read error body
            const errorText = await response.text().catch(() => 'No response body');
            throw new Error(`Sync failed with status ${response.status} at ${API_BASE_URL}/discord/sync. Body: ${errorText.substring(0, 200)}`);
        }

        return await response.json();
    } catch (error) {
        logError('CW API', 'Failed to sync users', error);
        return null;
    }
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
    fetchGameTime,
    fetchState,
    fetchCommodities,
    syncDiscordUsers,
    getCacheStats,
    clearCache,
};
