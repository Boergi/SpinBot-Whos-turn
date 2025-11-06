/**
 * App Home Event Handler
 */

const { isAuthorizedUser } = require('../utils/authUtils');
const { buildStatsView } = require('../views/statsView');
const { buildWelcomeView } = require('../views/welcomeView');

/**
 * Handle app_home_opened event
 */
async function handleAppHomeOpened({ event, client }) {
  const userId = event.user;
  
  try {
    console.log(`App Home opened by user: ${userId}`);

    // Check if user is authorized to view stats
    const isAuthorized = isAuthorizedUser(userId);
    
    // Show welcome view for all users (authorized users get a stats button)
    console.log(`User ${userId} - authorized: ${isAuthorized} - showing welcome screen`);
    
    const blocks = buildWelcomeView(isAuthorized);
    
    await client.views.publish({
      user_id: userId,
      view: {
        type: 'home',
        blocks: blocks
      }
    });
    
    console.log(`Welcome view published for user: ${userId}`);
    
  } catch (error) {
    console.error('Error publishing App Home:', error);
    
    // Try to publish an error view as fallback
    try {
      await client.views.publish({
        user_id: userId,
        view: {
          type: 'home',
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: "📊 SpinBot",
                emoji: true
              }
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "❌ *Error loading App Home*\n\nPlease try again later or contact your administrator."
              }
            }
          ]
        }
      });
    } catch (fallbackError) {
      console.error('Failed to publish fallback view:', fallbackError);
    }
  }
}

/**
 * Handle view_stats button click (switch to statistics view)
 */
async function handleViewStatsAction({ body, client, ack }) {
  await ack();
  
  const userId = body.user.id;
  
  try {
    console.log(`User ${userId} clicked "View Statistics" button`);
    
    // Check authorization
    if (!isAuthorizedUser(userId)) {
      console.log(`User ${userId} is not authorized for stats`);
      return;
    }
    
    // Load stats with loading indicator
    const statsBlocks = await buildStatsView(client, null);
    
    await client.views.publish({
      user_id: userId,
      view: {
        type: 'home',
        blocks: statsBlocks
      }
    });
    
    // Load channels in background
    const { getBotChannels } = require('../utils/channelUtils');
    const botChannels = await getBotChannels(client);
    
    // Update with full stats
    const finalBlocks = await buildStatsView(client, botChannels);
    
    await client.views.publish({
      user_id: userId,
      view: {
        type: 'home',
        blocks: finalBlocks
      }
    });
    
    console.log(`Switched to stats view for user: ${userId}`);
    
  } catch (error) {
    console.error('Error handling view_stats action:', error);
  }
}

/**
 * Handle view_readme button click (switch to documentation view)
 */
async function handleViewReadmeAction({ body, client, ack }) {
  await ack();
  
  const userId = body.user.id;
  
  try {
    console.log(`User ${userId} clicked "View Documentation" button`);
    
    // Check authorization (to decide if we show the stats button)
    const showStatsButton = isAuthorizedUser(userId);
    
    const blocks = buildWelcomeView(showStatsButton);
    
    await client.views.publish({
      user_id: userId,
      view: {
        type: 'home',
        blocks: blocks
      }
    });
    
    console.log(`Switched to README view for user: ${userId}`);
    
  } catch (error) {
    console.error('Error handling view_readme action:', error);
  }
}

module.exports = {
  handleAppHomeOpened,
  handleViewStatsAction,
  handleViewReadmeAction,
};

