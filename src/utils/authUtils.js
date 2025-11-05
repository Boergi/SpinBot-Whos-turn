/**
 * Authorization utility functions
 */

/**
 * Check if user is authorized to view stats
 * @param {string} userId - Slack User ID
 * @returns {boolean} True if authorized
 */
function isAuthorizedUser(userId) {
  const authorizedUsers = (process.env.AUTHORIZED_STATS_USERS || '')
    .split(',')
    .map(id => id.trim())
    .filter(id => id.length > 0);
  
  return authorizedUsers.includes(userId);
}

module.exports = {
  isAuthorizedUser,
};

