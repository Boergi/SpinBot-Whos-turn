/**
 * Welcome view builder for App Home (non-authorized users)
 */

/**
 * Build default App Home view with README
 * @param {boolean} showStatsButton - Whether to show the "View Statistics" button (for authorized users)
 * @returns {Array} Array of Slack blocks
 */
function buildWelcomeView(showStatsButton = false) {
  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "👋 Welcome to SpinBot!",
        emoji: true
      }
    },
  ];
  
  // Add stats button for authorized users
  if (showStatsButton) {
    blocks.push(
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "📊 View Statistics",
              emoji: true
            },
            action_id: "view_stats",
            style: "primary"
          }
        ]
      },
      {
        type: "divider"
      }
    );
  }
  
  blocks.push(
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "SpinBot helps you randomly and fairly select someone from a thread to decide who's turn it is! Perfect for deciding who has to pre-order lunch, get coffee, clean up, or take on any other task."
      }
    },
    {
      type: "divider"
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*🎯 How to Use*"
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "1️⃣ Go to any channel where SpinBot is installed\n2️⃣ *Channel mode:* Mention directly in channel OR *Thread mode:* Reply in a thread\n3️⃣ Mention the bot with your task:"
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "```@SpinBot who has to pre-order lunch?```\nor\n```@SpinBot wer muss Kaffee holen?```\n\n💡 *Tip:* Users can also just react with 👍, ➕, or ✅ to participate!"
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "5️⃣ The bot will randomly select one person from the thread and announce:\n```🎲 @Username has to pre-order lunch```"
      }
    },
    {
      type: "divider"
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*✨ Features*"
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "🧵 *Works in Threads*\nUse @mentions directly in any thread - slash commands don't work in threads!\n\n👍 *Reaction Support*\nUsers can participate by writing a message OR by reacting with 👍, ➕, or ✅ - perfect for quick polls!\n\n📢 *Works in Channels*\nMention the bot directly in a channel to select from all members - works with any channel size!\n\n🌍 *Bilingual Support*\nUse \"who\" (English) or \"wer\" (German) - both work perfectly!\n\n⚖️ *Fair Weighted Selection*\nUsers who were recently selected have a lower chance of being picked again. The more recent the selection, the lower the chance - ensuring fair distribution!\n\n🤖 *Excludes Bots*\nThe bot will never select itself, only real users. Bots and deleted users are automatically excluded.\n\n🏖️ *Smart Status Filtering*\nIn channels, users with :palm_tree: (vacation), :face_with_thermometer: (sick), :kids: (parental leave), or :school: (school) status are automatically excluded!\n\n💬 *Smart Message Parsing*\nThe bot only processes text from @SpinBot until the first \"?\". Everything before the mention and after the question mark is ignored - perfect for complex messages!\n\n⚡ *Performance Optimized*\nUser lists are cached for 10 minutes to reduce API calls and ensure fast responses."
      }
    },
    {
      type: "divider"
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*💡 Examples*"
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "```@SpinBot who has to moderate the meeting?```\n```@SpinBot wer muss heute einkaufen?```\n```@SpinBot who is up for code review?```\n```@SpinBot wer muss die Präsentation halten?```"
      }
    },
    {
      type: "divider"
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*🔧 Technical Details*"
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "• Built with Slack Bolt for Node.js\n• Uses Socket Mode (WebSocket) - no public server needed\n• Weighted random selection based on history (fair distribution)\n• User list caching (10 minutes) for optimal performance\n• Smart message parsing (ignores text before/after bot mention)\n• MySQL database for usage tracking\n• Bilingual: English & German"
      }
    },
    {
      type: "divider"
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*❓ FAQ*"
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Q: Why can't I use /spinbot in threads?*\nA: Slack doesn't support slash commands in threads. Use @SpinBot instead!\n\n*Q: Can the bot select itself?*\nA: No! The bot is automatically excluded from selection.\n\n*Q: Do I have to write a message to participate?*\nA: No! You can also just react with 👍, ➕, or ✅ to be included in the selection.\n\n*Q: How does status filtering work?*\nA: When mentioned directly in a channel, users with :palm_tree: (vacation), :face_with_thermometer: (sick), :kids: (parental leave), or :school: (school/training) status are excluded. In threads, everyone is eligible.\n\n*Q: What's the difference between channel and thread mode?*\nA: Channel mode selects from all members (with status filtering). Thread mode selects from participants who wrote OR reacted (no filtering).\n\n*Q: Does it work with large channels?*\nA: Yes! No member limits - the bot works efficiently with channels of any size.\n\n*Q: How fair is the selection?*\nA: The bot uses weighted randomness based on selection history. Users recently selected have lower chances - the most recent selection gets 50% lower chance, with the penalty decreasing over time. Everyone still has a chance, but it's fairer!\n\n*Q: What if my message has extra text?*\nA: No problem! The bot only processes text between @SpinBot and the first \"?\". Everything before/after is ignored."
      }
    },
    {
      type: "divider"
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*📊 Statistics*"
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "Usage statistics are available for authorized administrators only. If you need access to statistics, please contact your workspace administrator.\n\nStatistics include usage counts, most active channels, and user activity data."
      }
    },
    {
      type: "divider"
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: "💙 SpinBot - Who's Turn? | Made with Node.js & Slack Bolt"
        }
      ]
    }
  );
  
  return blocks;
}

module.exports = {
  buildWelcomeView,
};

