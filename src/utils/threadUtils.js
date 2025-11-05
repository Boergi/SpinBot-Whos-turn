/**
 * Thread-related utility functions
 */

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
 * Extracts all unique user IDs from thread messages
 * @param {Array} messages - Array of Slack messages
 * @returns {Array} Array of unique user IDs
 */
function extractUniqueUsers(messages) {
  const userIds = new Set();
  
  messages.forEach(message => {
    // Regular messages have a user property
    if (message.user) {
      userIds.add(message.user);
    }
    // Bot messages sometimes only have bot_id
    // We filter those out since we only want real users
  });
  
  return Array.from(userIds);
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
};

