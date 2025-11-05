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
 * Selects a random user from the array
 * @param {Array} users - Array of user IDs
 * @returns {string} A random user ID
 */
function selectRandomUser(users) {
  const randomIndex = Math.floor(Math.random() * users.length);
  return users[randomIndex];
}

module.exports = {
  getThreadMessages,
  extractUniqueUsers,
  selectRandomUser,
  getAllowedReactionEmojis,
};

