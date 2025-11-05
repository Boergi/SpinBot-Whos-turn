/**
 * Statistics view builder for App Home
 */

const { getStats } = require('../../stats');

/**
 * Build stats view blocks for App Home
 * @returns {Array} Array of Slack blocks
 */
async function buildStatsView() {
  try {
    const stats = await getStats();
    
    const blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "📊 SpinBot Usage Statistics",
          emoji: true
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*🎲 Total Spins:*\n${stats.total || 0}`
          },
          {
            type: "mrkdwn",
            text: `*👥 Avg Participants:*\n${stats.avgParticipants || 0}`
          }
        ]
      }
    ];

    // Show info message if no data yet
    if (!stats.total || stats.total === 0) {
      blocks.push(
        {
          type: "divider"
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "📭 *No statistics available yet*\n\nStart using SpinBot in threads to see statistics here!\n\nMention `@SpinBot who has to...?` in any thread to get started."
          }
        }
      );
      return blocks;
    }

    blocks.push(
      {
        type: "divider"
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*📈 Top 5 Channels*"
        }
      }
    );

    // Add top channels
    if (stats.byChannel.length > 0) {
      const channelText = stats.byChannel.slice(0, 5).map((ch, i) => 
        `${i + 1}. *${ch.channel_name || ch.channel_id}*: ${ch.usage_count} times`
      ).join('\n');
      
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: channelText
        }
      });
    } else {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: "_No data yet_"
        }
      });
    }

    blocks.push({
      type: "divider"
    });

    // Add most active users
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*🏆 Most Active Users (Top 5)*"
      }
    });

    if (stats.mostActiveUsers.length > 0) {
      const activeUsersText = stats.mostActiveUsers.slice(0, 5).map((user, i) => 
        `${i + 1}. <@${user.user_id}>: ${user.times_invoked} times`
      ).join('\n');
      
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: activeUsersText
        }
      });
    } else {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: "_No data yet_"
        }
      });
    }

    blocks.push({
      type: "divider"
    });

    // Add most selected users
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*🎯 Most Selected Users (Top 5)*"
      }
    });

    if (stats.mostSelectedUsers.length > 0) {
      const selectedUsersText = stats.mostSelectedUsers.slice(0, 5).map((user, i) => 
        `${i + 1}. <@${user.selected_user_id}>: ${user.times_selected} times`
      ).join('\n');
      
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: selectedUsersText
        }
      });
    } else {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: "_No data yet_"
        }
      });
    }

    blocks.push({
      type: "divider"
    });

    // Add usage over time
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*📅 Last 7 Days*"
      }
    });

    if (stats.usageOverTime.length > 0) {
      const timeText = stats.usageOverTime.slice(0, 7).map(day => 
        `• ${day.date}: ${day.count} times`
      ).join('\n');
      
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: timeText
        }
      });
    } else {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: "_No data yet_"
        }
      });
    }

    return blocks;
  } catch (error) {
    console.error('Error building stats view:', error);
    
    // Check if it's a database connection error
    const isDatabaseError = error.code === 'ECONNREFUSED' || 
                           error.code === 'ER_ACCESS_DENIED_ERROR' ||
                           error.message?.includes('database') ||
                           error.message?.includes('connect');
    
    return [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "📊 SpinBot Statistics",
          emoji: true
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: isDatabaseError 
            ? "⚠️ *Database not configured*\n\nStatistics tracking requires a MySQL database.\n\nThe bot works fine without it, but you won't see usage statistics.\n\nSee `DATABASE.md` for setup instructions."
            : "❌ *Error loading statistics*\n\nAn unexpected error occurred while loading stats.\n\nCheck the console logs for details."
        }
      }
    ];
  }
}

module.exports = {
  buildStatsView,
};

