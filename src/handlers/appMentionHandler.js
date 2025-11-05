/**
 * App Mention Event Handler
 */

const { getThreadMessages, extractUniqueUsers, selectRandomUser } = require('../utils/threadUtils');
const { getChannelMembers, filterUsersByStatus, isChannelSizeValid, getMaxChannelSize } = require('../utils/channelUtils');
const { logUsage } = require('../database/usageLogger');

/**
 * Handle app_mention events - works in threads and channels!
 */
async function handleAppMention({ event, say, client, context }) {
  try {
    const channelId = event.channel;
    const threadTs = event.thread_ts || event.ts;
    
    // Get bot's own user ID
    const botUserId = context.botUserId;
    
    // Extract task from message (remove the bot mention)
    const mentionRegex = /<@[A-Z0-9]+>/g;
    let task = event.text.replace(mentionRegex, '').trim();
    
    // Remove "wer" or "who" from the beginning of the task
    task = task.replace(/^(wer|who)\s+/i, '').trim();
    
    // Remove trailing question mark if present
    task = task.replace(/\?$/, '').trim();
    
    // Default task if nothing is provided
    if (!task) {
      task = 'has to complete the task';
    }

    console.log(`Mention received: channel=${channelId}, thread=${threadTs}, task="${task}"`);

    // Check if we're in a thread (thread_ts exists and is different from ts)
    const isInThread = event.thread_ts && event.thread_ts !== event.ts;
    
    let users = [];
    
    if (!isInThread && threadTs === event.ts) {
      // Direct channel mention - select from all channel members
      console.log('Direct channel mention - selecting from channel members');
      
      const channelMembers = await getChannelMembers(client, channelId);
      
      if (channelMembers.length === 0) {
        await say({
          text: '❌ Could not fetch channel members.',
          thread_ts: threadTs,
        });
        return;
      }

      // Check if channel is too large for status filtering
      if (!isChannelSizeValid(channelMembers.length)) {
        const maxSize = getMaxChannelSize();
        await say({
          text: `⚠️ *Channel too large for direct selection*\n\nThis channel has ${channelMembers.length} members. For performance reasons, channel-level selection only works in channels with up to ${maxSize} members.\n\n*💡 Please use me in a thread instead:*\n1. Create a thread or reply to an existing message\n2. Mention me there: \`@SpinBot ${task}\`\n\nThis way, only thread participants will be considered!`,
          thread_ts: threadTs,
        });
        return;
      }

      // Filter users by status (exclude users with specific status emojis)
      users = await filterUsersByStatus(client, channelMembers, botUserId);
      
      if (users.length === 0) {
        await say({
          text: '❌ No available users in the channel. Everyone seems to be busy! 😅',
          thread_ts: threadTs,
        });
        return;
      }

      console.log(`${users.length} available channel members (after status filtering)`);
    } else {
      // Thread mention - select from thread participants (existing behavior)

      console.log('Thread mention - selecting from thread participants');
      
      // Fetch all messages from the thread
      const messages = await getThreadMessages(client, channelId, threadTs);
      
      if (messages.length === 0) {
        await say({
          text: '❌ Could not find any messages in the thread.',
          thread_ts: threadTs,
        });
        return;
      }

      // Extract all unique users (excluding bots and deleted users)
      users = await extractUniqueUsers(client, messages);
      
      // Remove the bot from the list of potential users (extra safety)
      users = users.filter(userId => userId !== botUserId);

      if (users.length === 0) {
        await say({
          text: '❌ No other users found in the thread. I need at least one human to pick! 🤖',
          thread_ts: threadTs,
        });
        return;
      }

      console.log(`${users.length} thread participants (excluding bot):`, users);
    }

    // Select a random user
    const selectedUser = selectRandomUser(users);

    // Get channel info for better logging
    let channelName = null;
    try {
      const channelInfo = await client.conversations.info({
        channel: channelId,
      });
      channelName = channelInfo.channel.name;
    } catch (error) {
      console.log('Could not fetch channel name');
    }

    // Log usage to database
    await logUsage({
      channelId: channelId,
      channelName: channelName,
      threadTs: threadTs,
      userId: event.user, // User who invoked the bot
      selectedUserId: selectedUser,
      task: task,
      participantsCount: users.length,
    });

    // Send the response in the thread
    await say({
      text: `🎲 <@${selectedUser}> ${task}`,
      thread_ts: threadTs,
    });

    console.log(`Selected user: ${selectedUser}`);

  } catch (error) {
    console.error('Error processing mention:', error);
    
    await say({
      text: '❌ An error occurred. Please try again later.',
      thread_ts: event.thread_ts || event.ts,
    });
  }
}

module.exports = {
  handleAppMention,
};

