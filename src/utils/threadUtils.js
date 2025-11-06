/**
 * Thread-related utility functions
 */

/**
 * Get allowed reaction emojis from environment
 * @returns {Array} Array of emoji names (without colons)
 */
function getAllowedReactionEmojis() {
  const emojis = (process.env.ALLOWED_REACTION_EMOJIS || '')
    .split(',')
    .map(emoji => emoji.trim())
    .map(emoji => emoji.replace(/^:/, '').replace(/:$/, '')) // Remove leading/trailing colons
    .filter(emoji => emoji.length > 0);
  
  return emojis;
}

/**
 * Fetches all messages from a thread
 * @param {Object} client - Slack client
 * @param {string} channel - The channel ID
 * @param {string} threadTs - The thread timestamp
 * @returns {Array} Array of messages
 */
async function getThreadMessages(client, channel, threadTs) {
  try {
    const result = await client.conversations.replies({
      channel: channel,
      ts: threadTs,
    });
    return result.messages || [];
  } catch (error) {
    console.error('Error fetching thread messages:', error);
    return [];
  }
}

/**
 * Extracts all unique user IDs from thread messages and reactions (excluding bots)
 * @param {Object} client - Slack client
 * @param {Array} messages - Array of Slack messages
 * @param {Map} usersMap - Optional map of all users (for efficiency)
 * @returns {Promise<Array>} Array of unique user IDs (humans only)
 */
async function extractUniqueUsers(client, messages, usersMap = null) {
  const userIds = new Set();
  const allowedReactions = getAllowedReactionEmojis();
  
  messages.forEach(message => {
    // Regular messages have a user property
    if (message.user && !message.bot_id) {
      // Only add if message doesn't have bot_id (bot messages can have user property)
      userIds.add(message.user);
    }
    
    // Log ALL reactions to see what Slack returns
    if (message.reactions) {
      console.log(`📝 Message has ${message.reactions.length} reaction(s):`);
      message.reactions.forEach(reaction => {
        console.log(`  - :${reaction.name}: (${reaction.count} reactions, ${reaction.users?.length || 0} users)`);
      });
    }
    
    // Check reactions if configured
    if (allowedReactions.length > 0 && message.reactions) {
      message.reactions.forEach(reaction => {
        // Check if this reaction emoji is allowed
        if (allowedReactions.includes(reaction.name)) {
          // Add all users who reacted with this emoji
          reaction.users?.forEach(userId => {
            userIds.add(userId);
          });
          console.log(`✅ Counted ${reaction.users?.length || 0} users with :${reaction.name}: reaction (ALLOWED)`);
        } else {
          console.log(`❌ Ignored :${reaction.name}: reaction (NOT in allowed list)`);
        }
      });
    }
  });
  
  console.log(`\n📊 Summary: Found ${userIds.size} unique participants (messages + reactions)`);
  console.log(`🔍 Allowed reaction emojis: [${allowedReactions.join(', ')}]\n`);
  
  // Get users map if not provided
  if (!usersMap) {
    const { getAllUsers } = require('./channelUtils');
    usersMap = await getAllUsers(client);
  }
  
  // Filter out bots and deleted users using the map
  const validUsers = [];
  for (const userId of Array.from(userIds)) {
    const user = usersMap.get(userId);
    
    if (!user) {
      console.log(`Thread participant ${userId} not found in workspace`);
      continue;
    }
    
    // Only include real humans (not bots, not deleted)
    if (!user.is_bot && !user.deleted) {
      validUsers.push(userId);
    } else {
      console.log(`Thread participant ${userId} excluded (bot: ${user.is_bot}, deleted: ${user.deleted})`);
    }
  }
  
  return validUsers;
}

/**
 * Get recent selection history for a channel to enable fair distribution
 * @param {string} channelId - Channel ID
 * @param {number} limit - Number of recent selections to fetch
 * @returns {Promise<Array>} Array of recent selected user IDs
 */
async function getRecentSelections(channelId, limit = 20) {
  try {
    const db = require('../../db');
    const recentSelections = await db('bot_usage')
      .where('channel_id', channelId)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .pluck('selected_user_id');
    
    return recentSelections;
  } catch (error) {
    console.error('Error fetching recent selections:', error);
    return [];
  }
}

/**
 * Calculate weights for users based on selection history
 * Users who were recently selected get lower weights (lower chance)
 * @param {Array} users - Array of user IDs
 * @param {Array} recentSelections - Array of recently selected user IDs (newest first)
 * @returns {Map} Map of userId -> weight
 */
function calculateUserWeights(users, recentSelections) {
  const weights = new Map();
  
  // Initialize all users with maximum weight
  users.forEach(userId => weights.set(userId, 100));
  
  // Reduce weight based on recent selections (more recent = more penalty)
  recentSelections.forEach((selectedUserId, index) => {
    if (weights.has(selectedUserId)) {
      // Penalty decreases with time: most recent gets -50, then -45, -40, etc.
      const penalty = Math.max(50 - (index * 2.5), 0);
      const currentWeight = weights.get(selectedUserId);
      weights.set(selectedUserId, Math.max(currentWeight - penalty, 1)); // Minimum weight of 1
    }
  });
  
  return weights;
}

/**
 * Selects a random user from the array using weighted randomness
 * Users who were recently selected have lower chances
 * @param {Array} users - Array of user IDs
 * @param {string} channelId - Channel ID for history lookup
 * @returns {Promise<string>} A random user ID
 */
async function selectRandomUser(users, channelId = null) {
  // If only one user, no need for fancy logic
  if (users.length === 1) {
    return users[0];
  }
  
  // If no channel ID provided, use simple random (fallback)
  if (!channelId) {
    console.log('⚠️  No channel ID provided, using simple random selection');
    const randomIndex = Math.floor(Math.random() * users.length);
    return users[randomIndex];
  }
  
  // Get recent selection history
  const recentSelections = await getRecentSelections(channelId);
  
  // Calculate weights based on history
  const weights = calculateUserWeights(users, recentSelections);
  
  // Log weights for transparency
  console.log('🎯 User weights for fair selection:');
  users.forEach(userId => {
    const weight = weights.get(userId);
    const recentCount = recentSelections.filter(id => id === userId).length;
    console.log(`  ${userId}: weight=${weight} (selected ${recentCount} times recently)`);
  });
  
  // Calculate total weight
  const totalWeight = Array.from(weights.values()).reduce((sum, w) => sum + w, 0);
  
  // Perform weighted random selection
  let random = Math.random() * totalWeight;
  
  for (const userId of users) {
    const weight = weights.get(userId);
    random -= weight;
    if (random <= 0) {
      console.log(`✅ Selected ${userId} using weighted randomness`);
      return userId;
    }
  }
  
  // Fallback (should never happen)
  console.log('⚠️  Fallback to last user in list');
  return users[users.length - 1];
}

module.exports = {
  getThreadMessages,
  extractUniqueUsers,
  selectRandomUser,
  getAllowedReactionEmojis,
};

