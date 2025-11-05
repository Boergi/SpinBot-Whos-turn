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
  try {
    const userId = event.user;
    let blocks;

    console.log(`App Home opened by user: ${userId}`);

    // Check if user is authorized to view stats
    if (isAuthorizedUser(userId)) {
      console.log(`User ${userId} is authorized - showing stats`);
      blocks = await buildStatsView(client);
    } else {
      console.log(`User ${userId} is not authorized - showing welcome screen`);
      // Show welcome view for unauthorized users
      blocks = buildWelcomeView();
    }

    // Make sure we have blocks
    if (!blocks || blocks.length === 0) {
      console.error('No blocks to display, using default welcome view');
      blocks = buildWelcomeView();
    }

    // Publish the view
    await client.views.publish({
      user_id: userId,
      view: {
        type: 'home',
        blocks: blocks
      }
    });
    
    console.log(`App Home published successfully for user: ${userId}`);
  } catch (error) {
    console.error('Error publishing App Home:', error);
    
    // Try to publish an error view as fallback
    try {
      await client.views.publish({
        user_id: event.user,
        view: {
          type: 'home',
          blocks: [
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

module.exports = {
  handleAppHomeOpened,
};

