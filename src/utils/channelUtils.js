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
 * Get all users with their profiles (cached)
 * @param {Object} client - Slack client
 * @returns {Map} Map of userId -> user object with profile
 */
async function getAllUsers(client) {
  const usersMap = new Map();
  let cursor = undefined;
  
  do {
    const result = await client.users.list({
      limit: 200,
      cursor: cursor,
    });
    
    for (const user of result.members || []) {
      usersMap.set(user.id, user);
    }
    
    cursor = result.response_metadata?.next_cursor;
  } while (cursor);
  
  console.log(`Loaded ${usersMap.size} users with profiles`);
  return usersMap;
}

/**
 * Filter users by their status - exclude users with specific status emojis and bots
 * @param {Object} client - Slack client
 * @param {Array} userIds - Array of user IDs
 * @param {string} botUserId - Bot's user ID to exclude
 * @returns {Array} Filtered array of user IDs
 */
async function filterUsersByStatus(client, userIds, botUserId) {
  const excludedEmojis = getExcludedEmojis();
  const filteredUsers = [];
  
  // Get all users with profiles in one batch
  const usersMap = await getAllUsers(client);
  
  for (const userId of userIds) {
    // Skip the bot itself
    if (userId === botUserId) {
      continue;
    }

    // Get user from map
    const user = usersMap.get(userId);
    if (!user) {
      console.log(`User ${userId} not found in workspace`);
      continue;
    }
    
    // Skip bots and deleted users
    if (user.is_bot || user.deleted) {
      console.log(`User ${userId} excluded (bot: ${user.is_bot}, deleted: ${user.deleted})`);
      continue;
    }

    // If no excluded emojis configured, user is valid
    if (excludedEmojis.length === 0) {
      filteredUsers.push(userId);
      continue;
    }

    // Check status from profile
    const statusEmoji = user.profile?.status_emoji || '';
    const statusText = user.profile?.status_text || '';
    
    // Check if status emoji matches any excluded emoji
    const hasExcludedStatus = excludedEmojis.some(excludedEmoji => {
      return statusEmoji.includes(excludedEmoji) || statusText.includes(excludedEmoji);
    });

    if (!hasExcludedStatus) {
      filteredUsers.push(userId);
    } else {
      console.log(`User ${userId} excluded due to status: ${statusEmoji} ${statusText}`);
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
    let allChannels = [];
    let cursor = undefined;
    
    // Step 1: Get all channels where bot is a member
    do {
      const result = await client.users.conversations({
        types: 'public_channel,private_channel',
        exclude_archived: true,
        limit: 200,
        cursor: cursor,
      });
      
      allChannels = allChannels.concat(result.channels || []);
      cursor = result.response_metadata?.next_cursor;
      
      console.log(`Fetched ${result.channels?.length || 0} bot channels, cursor: ${cursor ? 'has more' : 'done'}`);
    } while (cursor);
    
    console.log(`Found ${allChannels.length} total channels where bot is member`);
    
    // Step 2: Get all users once (for efficient bot/human filtering)
    const usersMap = await getAllUsers(client);
    
    // Step 3: Get member counts for each channel (count only humans, not bots)
    const botChannels = [];
    for (const channel of allChannels) {
      try {
        // Get members list
        const membersResult = await client.conversations.members({
          channel: channel.id,
        });
        
        // Count only real users (filter out bots using the users map)
        let humanCount = 0;
        for (const memberId of membersResult.members || []) {
          const user = usersMap.get(memberId);
          
          // Only count real humans (not bots, not deleted)
          if (user && !user.is_bot && !user.deleted) {
            humanCount++;
          }
        }
        
        botChannels.push({
          id: channel.id,
          name: channel.name,
          is_private: channel.is_private || false,
          num_members: humanCount,
        });
        
        console.log(`Channel ${channel.name}: ${humanCount} human members (${channel.is_private ? 'private' : 'public'})`);
      } catch (channelError) {
        console.error(`Error fetching members for channel ${channel.name}:`, channelError);
        // Fallback to basic channel data without member count
        botChannels.push({
          id: channel.id,
          name: channel.name,
          is_private: channel.is_private || false,
          num_members: 0,
        });
      }
    }
    
    console.log(`Processed ${botChannels.length} channels`);
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
  getAllUsers,
};

