const db = require('./db');

/**
 * Get usage statistics
 */
async function getStats() {
  try {
    // Total usage count
    const totalUsage = await db('bot_usage').count('id as count').first();
    
    // Usage by channel
    const usageByChannel = await db('bot_usage')
      .select('channel_id', 'channel_name')
      .count('id as usage_count')
      .groupBy('channel_id', 'channel_name')
      .orderBy('usage_count', 'desc')
      .limit(10);
    
    // Most active users (who invoke the bot)
    const mostActiveUsers = await db('bot_usage')
      .select('user_id')
      .count('id as times_invoked')
      .groupBy('user_id')
      .orderBy('times_invoked', 'desc')
      .limit(10);
    
    // Most selected users (unlucky ones)
    const mostSelectedUsers = await db('bot_usage')
      .select('selected_user_id')
      .count('id as times_selected')
      .groupBy('selected_user_id')
      .orderBy('times_selected', 'desc')
      .limit(10);
    
    // Usage over time (last 30 days)
    const usageOverTime = await db('bot_usage')
      .select(db.raw('DATE(created_at) as date'))
      .count('id as count')
      .where('created_at', '>=', db.raw('DATE_SUB(NOW(), INTERVAL 30 DAY)'))
      .groupBy(db.raw('DATE(created_at)'))
      .orderBy('date', 'desc');
    
    // Average participants per spin
    const avgParticipants = await db('bot_usage')
      .avg('participants_count as avg')
      .first();

    return {
      total: totalUsage.count || 0,
      byChannel: usageByChannel || [],
      mostActiveUsers: mostActiveUsers || [],
      mostSelectedUsers: mostSelectedUsers || [],
      usageOverTime: usageOverTime || [],
      avgParticipants: avgParticipants?.avg ? Math.round(avgParticipants.avg * 10) / 10 : 0,
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
}

/**
 * Get stats for a specific channel
 */
async function getChannelStats(channelId) {
  try {
    const stats = await db('bot_usage')
      .where('channel_id', channelId)
      .count('id as total')
      .first();
    
    const topUsers = await db('bot_usage')
      .where('channel_id', channelId)
      .select('user_id')
      .count('id as count')
      .groupBy('user_id')
      .orderBy('count', 'desc')
      .limit(5);
    
    const topSelected = await db('bot_usage')
      .where('channel_id', channelId)
      .select('selected_user_id')
      .count('id as count')
      .groupBy('selected_user_id')
      .orderBy('count', 'desc')
      .limit(5);

    return {
      total: stats.total,
      topUsers: topUsers,
      topSelected: topSelected,
    };
  } catch (error) {
    console.error('Error fetching channel stats:', error);
    throw error;
  }
}

module.exports = {
  getStats,
  getChannelStats,
};

