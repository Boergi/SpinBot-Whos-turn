const { App } = require('@slack/bolt');
require('dotenv').config();

// Import handlers
const { handleAppMention } = require('./src/handlers/appMentionHandler');
const { handleSlashCommand } = require('./src/handlers/slashCommandHandler');
const { handleAppHomeOpened } = require('./src/handlers/appHomeHandler');

// Initialize the app with Socket Mode (WebSocket)
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  // Socket Mode doesn't require a port
});

// Register event handlers
app.event('app_mention', handleAppMention);
app.event('app_home_opened', handleAppHomeOpened);

// Register command handlers
app.command('/spinbot', handleSlashCommand);

// Error handler
app.error(async (error) => {
  console.error('An error occurred:', error);
});

// Start the app
(async () => {
  try {
    await app.start();
    console.log('⚡️ SpinBot is running in Socket Mode!');
    console.log('🤖 Ready for /spinbot commands');
  } catch (error) {
    console.error('Error starting the app:', error);
    process.exit(1);
  }
})();
