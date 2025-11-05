# Database Setup and Usage Tracking

SpinBot uses MySQL with Knex.js to track usage statistics.

## Database Setup

### 1. Create MySQL Database

```sql
CREATE DATABASE spinbot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configure Environment Variables

Add these to your `.env` file:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=spinbot
NODE_ENV=development
```

### 3. Run Migrations

```bash
npm run migrate
```

This creates the `bot_usage` table with the following schema:

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-incrementing ID |
| channel_id | VARCHAR(50) | Slack channel ID |
| channel_name | VARCHAR(255) | Channel name |
| thread_ts | VARCHAR(50) | Thread timestamp |
| user_id | VARCHAR(50) | User who invoked the bot |
| selected_user_id | VARCHAR(50) | User who was selected |
| task | TEXT | The task description |
| participants_count | INT | Number of participants |
| created_at | TIMESTAMP | When the spin occurred |

## Usage Tracking

Every time someone uses the bot, the following data is logged:
- Which channel it was used in
- Who invoked the bot
- Who was selected
- What the task was
- How many participants were in the thread
- Timestamp

## Viewing Statistics

### In Slack App Home

Statistics are only visible in the **App Home** tab and only for authorized users:

1. Click on **SpinBot** in your Slack sidebar
2. Go to the **Home** tab
3. View comprehensive statistics (if authorized)

**Shown statistics:**
- **📊 Total Spins** - Total number of times the bot was used
- **👥 Average Participants** - Average number of participants per spin
- **📢 Bot Channels** - Complete list of all channels where the bot is installed
  - Shows channel name, member count, and privacy status (🔒 private / 📢 public)
  - ⚠️ Warns if channel has >20 members (thread usage recommended)
- **📈 Top 5 Channels** - Channels that use the bot most frequently
- **🏆 Top 5 Most Active Users** - Users who invoke the bot most often
- **🎯 Top 5 Most Selected Users** - Users who get selected most often
- **📅 Last 7 Days** - Daily usage breakdown

### Authorizing Users

Add Slack User IDs to your `.env` file:

```env
AUTHORIZED_STATS_USERS=U12345678,U87654321,U11111111
```

**To find a User ID:**
1. Right-click on the user in Slack
2. Select **View Profile**
3. Click **More** (three dots)
4. Select **Copy Member ID**

**Important:** Only users in this list can view statistics. All others see a welcome screen.

### Via Code

```javascript
const { getStats, getChannelStats } = require('./stats');

// Get overall stats
const stats = await getStats();

// Get stats for a specific channel
const channelStats = await getChannelStats('C12345678');
```

## Available Statistics

### Overall Stats (`getStats()`)
- **Total Usage**: Total number of times the bot was used
- **Usage by Channel**: Top channels using the bot
- **Most Active Users**: Users who invoke the bot most often
- **Most Selected Users**: Users who get selected most often (the "unlucky" ones)
- **Usage Over Time**: Daily usage for the last 30 days
- **Average Participants**: Average number of people in threads

### Channel-Specific Stats (`getChannelStats(channelId)`)
- Total usage in that channel
- Top 5 users who invoke the bot
- Top 5 users who get selected

## Database Management

### Create a New Migration

```bash
npm run migrate:make migration_name
```

### Rollback Last Migration

```bash
npm run migrate:rollback
```

### Run Migrations in Production

```bash
NODE_ENV=production npm run migrate
```

## Security

- Store database credentials in `.env` file (never commit this!)
- Use `.gitignore` to exclude `.env` from version control
- Use read-only database users for production if only viewing stats
- Consider connection pooling for high-traffic scenarios

## Troubleshooting

### "Cannot connect to database"
- Check if MySQL is running
- Verify database credentials in `.env`
- Ensure the database exists
- Check if user has proper permissions

### "Table doesn't exist"
- Run `npm run migrate` to create tables

### "Stats not showing"
- Database might be empty - use the bot a few times first
- Check console logs for database errors

## Performance

The database schema includes indexes on:
- `channel_id` - Fast channel-based queries
- `user_id` - Quick user activity lookups
- `selected_user_id` - Fast selection frequency queries
- `created_at` - Efficient time-based queries

For high-traffic deployments, consider:
- Connection pooling (already configured in `knexfile.js`)
- Archiving old data (>1 year)
- Adding caching for frequently accessed stats

## Data Privacy

Consider implementing:
- Data retention policy (e.g., delete records older than 1 year)
- GDPR compliance (allow users to request data deletion)
- Anonymization options for sensitive channels

```javascript
// Example: Delete old records
await db('bot_usage')
  .where('created_at', '<', db.raw('DATE_SUB(NOW(), INTERVAL 1 YEAR)'))
  .del();
```

