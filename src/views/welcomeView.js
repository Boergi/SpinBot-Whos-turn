/**
 * Welcome view builder for App Home (non-authorized users)
 */

/**
 * Build default App Home view with README
 * @returns {Array} Array of Slack blocks
 */
function buildWelcomeView() {
  return [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "👋 Welcome to SpinBot!",
        emoji: true
      }
    },
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
        text: "1️⃣ Go to any channel where SpinBot is installed\n2️⃣ Create a message or reply to an existing thread\n3️⃣ Make sure multiple people have participated in the thread\n4️⃣ Mention the bot with your task:"
      }
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "```@SpinBot who has to pre-order lunch?```\nor\n```@SpinBot wer muss Kaffee holen?```"
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
        text: "🧵 *Works in Threads*\nUse @mentions directly in any thread - slash commands don't work in threads!\n\n🌍 *Bilingual Support*\nUse \"who\" (English) or \"wer\" (German) - both work perfectly!\n\n🤖 *Fair Selection*\nThe bot will never select itself, only real users from the thread.\n\n❓ *Smart Cleanup*\n\"who/wer\" at the start and \"?\" at the end are automatically removed from the output."
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
        text: "• Built with Slack Bolt for Node.js\n• Uses Socket Mode (WebSocket) - no public server needed\n• Analyzes all thread participants\n• Selects randomly from all active users\n• Bilingual: English & German"
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
        text: "*Q: Why can't I use /spinbot in threads?*\nA: Slack doesn't support slash commands in threads. Use @SpinBot instead!\n\n*Q: Can the bot select itself?*\nA: No! The bot is automatically excluded from selection.\n\n*Q: How random is the selection?*\nA: Completely random - everyone has an equal chance!\n\n*Q: Do I need to be in the thread?*\nA: Yes, only users who participated in the thread can be selected."
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
  ];
}

module.exports = {
  buildWelcomeView,
};

