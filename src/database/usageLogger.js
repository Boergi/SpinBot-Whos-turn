/**
 * Database usage logging functions
 */

const db = require('../../db');

/**
 * Log bot usage to database
 * @param {Object} data - Usage data
 * @param {string} data.channelId - Channel ID
 * @param {string} data.channelName - Channel name
 * @param {string} data.threadTs - Thread timestamp
 * @param {string} data.userId - User who invoked the bot
 * @param {string} data.selectedUserId - User who was selected
 * @param {string} data.task - Task description
 * @param {number} data.participantsCount - Number of participants
 */
async function logUsage(data) {
  try {
    await db('bot_usage').insert({
      channel_id: data.channelId,
      channel_name: data.channelName || null,
      thread_ts: data.threadTs,
      user_id: data.userId,
      selected_user_id: data.selectedUserId,
      task: data.task,
      participants_count: data.participantsCount,
    });
    console.log('Usage logged successfully');
  } catch (error) {
    console.error('Error logging usage:', error);
  }
}

module.exports = {
  logUsage,
};

