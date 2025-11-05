/**
 * Channel-related utility functions
 */

/**
 * Get maximum allowed channel size from environment
 * @returns {number} Maximum channel size
 */
function getMaxChannelSize() {
  return parseInt(process.env.MAX_CHANNEL_SIZE || '20', 10);
}

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
 * Check if channel size is within limits for status filtering
 * @param {number} memberCount - Number of channel members
 * @returns {boolean} True if within limits
 */
function isChannelSizeValid(memberCount) {
  return memberCount <= getMaxChannelSize();
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

/**
 * Get all channels where the bot is a member
 * @param {Object} client - Slack client
 * @returns {Array} Array of channel objects with id and name
 */
async function getBotChannels(client) {
  try {
    const result = await client.conversations.list({
      types: 'public_channel,private_channel',
      exclude_archived: true,
      limit: 200,
    });
    
    // Filter only channels where bot is a member and get accurate member counts
    const botChannels = [];
    for (const channel of result.channels || []) {
      if (channel.is_member) {
        try {
          // Get accurate channel info including member count
          const channelInfo = await client.conversations.info({
            channel: channel.id,
          });
          
          botChannels.push({
            id: channel.id,
            name: channel.name,
            is_private: channel.is_private || false,
            num_members: channelInfo.channel.num_members || 0,
          });
        } catch (infoError) {
          console.error(`Error fetching info for channel ${channel.name}:`, infoError);
          // Fallback to basic info if conversations.info fails
          botChannels.push({
            id: channel.id,
            name: channel.name,
            is_private: channel.is_private || false,
            num_members: channel.num_members || 0,
          });
        }
      }
    }
    
    return botChannels;
  } catch (error) {
    console.error('Error fetching bot channels:', error);
    return [];
  }
}

module.exports = {
  getChannelMembers,
  getUserStatus,
  getExcludedEmojis,
  filterUsersByStatus,
  getMaxChannelSize,
  isChannelSizeValid,
  getBotChannels,
};

