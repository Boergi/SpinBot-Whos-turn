/**
 * Channel-related utility functions
 */

/**
 * Get all members of a channel
 * @param {Object} client - Slack client
 * @param {string} channelId - The channel ID
 * @returns {Array} Array of user IDs
 */
async function getChannelMembers(client, channelId) {
  try {
    const result = await client.conversations.members({
      channel: channelId,
    });
    return result.members || [];
  } catch (error) {
    console.error('Error fetching channel members:', error);
    return [];
  }
}

/**
 * Get user status
 * @param {Object} client - Slack client
 * @param {string} userId - User ID
 * @returns {Object} User profile with status
 */
async function getUserStatus(client, userId) {
  try {
    const result = await client.users.profile.get({
      user: userId,
    });
    return {
      statusText: result.profile.status_text || '',
      statusEmoji: result.profile.status_emoji || '',
    };
  } catch (error) {
    console.error(`Error fetching status for user ${userId}:`, error);
    return { statusText: '', statusEmoji: '' };
  }
}

/**
 * Get excluded status emojis from environment
 * @returns {Array} Array of emoji strings
 */
function getExcludedEmojis() {
  const emojis = (process.env.EXCLUDED_STATUS_EMOJIS || '')
    .split(',')
    .map(emoji => emoji.trim())
    .filter(emoji => emoji.length > 0);
  
  return emojis;
}

/**
 * Filter users by their status - exclude users with specific status emojis
 * @param {Object} client - Slack client
 * @param {Array} userIds - Array of user IDs
 * @param {string} botUserId - Bot's user ID to exclude
 * @returns {Array} Filtered array of user IDs
 */
async function filterUsersByStatus(client, userIds, botUserId) {
  const excludedEmojis = getExcludedEmojis();
  
  // If no excluded emojis configured, just filter out bot
  if (excludedEmojis.length === 0) {
    return userIds.filter(id => id !== botUserId);
  }

  const filteredUsers = [];
  
  for (const userId of userIds) {
    // Skip bot
    if (userId === botUserId) {
      continue;
    }

    // Get user status
    const status = await getUserStatus(client, userId);
    
    // Check if status emoji matches any excluded emoji
    const hasExcludedStatus = excludedEmojis.some(excludedEmoji => {
      // Check both status_emoji and if emoji appears in status_text
      return status.statusEmoji.includes(excludedEmoji) || 
             status.statusText.includes(excludedEmoji);
    });

    if (!hasExcludedStatus) {
      filteredUsers.push(userId);
    } else {
      console.log(`User ${userId} excluded due to status: ${status.statusEmoji} ${status.statusText}`);
    }
  }

  return filteredUsers;
}

module.exports = {
  getChannelMembers,
  getUserStatus,
  getExcludedEmojis,
  filterUsersByStatus,
};

