# Statistics Authorization Guide

## Overview

SpinBot statistics are only visible in the App Home tab and only to authorized users. This ensures that sensitive usage data is protected.

## How It Works

### App Home Access Levels

1. **Authorized Users** - Can view full statistics
2. **Regular Users** - See welcome screen with usage instructions

### What Authorized Users See

- 📊 Total number of spins
- 👥 Average participants per spin
- 📈 Top 5 most active channels
- 🏆 Top 5 most active users (who invoke the bot most)
- 🎯 Top 5 most selected users (who get selected most)
- 📅 Usage over the last 7 days

### What Regular Users See

- Welcome message
- Usage instructions
- How to use the bot

## Setting Up Authorization

### 1. Get User IDs

To authorize a user, you need their Slack User ID:

1. Right-click on the user in Slack
2. Select **View Profile**
3. Click **More** (three dots icon)
4. Select **Copy Member ID**
5. The User ID looks like: `U12345678` or `U01ABCDEFGH`

### 2. Add to Environment Variables

Edit your `.env` file:

```env
# Single user
AUTHORIZED_STATS_USERS=U12345678

# Multiple users (comma-separated)
AUTHORIZED_STATS_USERS=U12345678,U87654321,U11111111

# Multiple users (with spaces, they will be trimmed)
AUTHORIZED_STATS_USERS=U12345678, U87654321, U11111111
```

### 3. Restart the Bot

After updating `.env`, restart the bot:

```bash
# Stop the bot (Ctrl+C if running)
# Start it again
npm start
```

### 4. Test Access

1. Authorized user opens SpinBot in Slack
2. Click on the **Home** tab
3. Should see full statistics

## Managing Authorized Users

### Add a User

1. Get their User ID (see above)
2. Add to `AUTHORIZED_STATS_USERS` in `.env`
3. Restart bot

### Remove a User

1. Remove their User ID from `AUTHORIZED_STATS_USERS`
2. Restart bot

### List Current Authorized Users

Check your `.env` file:

```bash
cat .env | grep AUTHORIZED_STATS_USERS
```

## Security Best Practices

### 1. Limit Access
Only grant access to:
- Team leads
- Administrators
- People who need usage insights

### 2. Regular Audits
Periodically review who has access:
```bash
# Check who's authorized
grep AUTHORIZED_STATS_USERS .env

# Review when employees leave
# Remove their User IDs
```

### 3. Environment Variables
- Never commit `.env` to git
- Use secrets management in production
- Rotate access when team changes

### 4. Privacy Considerations
Statistics include:
- User IDs (who invoked, who was selected)
- Channel names
- Task descriptions
- Timestamps

Consider:
- Informing users that usage is tracked
- Having a data retention policy
- Allowing users to request their data

## Troubleshooting

### User can't see statistics

**Check:**
1. Is their User ID in `AUTHORIZED_STATS_USERS`?
   ```bash
   grep AUTHORIZED_STATS_USERS .env
   ```

2. Did you restart the bot after adding them?
   ```bash
   npm start
   ```

3. Are they looking in the right place?
   - Click **SpinBot** in Slack sidebar
   - Go to **Home** tab (not Messages)

4. Is the User ID correct?
   - Should start with `U`
   - Case-sensitive
   - No extra spaces (they are trimmed automatically)

### Stats show "Error loading statistics"

**Possible causes:**
1. Database not configured
2. Database connection failed
3. No migrations run

**Solution:**
```bash
# Check database connection
mysql -u root -p

# Run migrations
npm run migrate

# Check environment variables
cat .env
```

### Everyone sees "Access Denied"

**Check:**
1. Is `AUTHORIZED_STATS_USERS` set in `.env`?
2. Are there any User IDs in the list?
3. Did you restart the bot?

```bash
# Should show User IDs
echo $AUTHORIZED_STATS_USERS

# Or check .env file
grep AUTHORIZED_STATS_USERS .env
```

## Production Deployment

### Using Environment Variables

Instead of `.env` file, use your platform's secrets:

**Heroku:**
```bash
heroku config:set AUTHORIZED_STATS_USERS=U12345678,U87654321
```

**Docker:**
```bash
docker run -e AUTHORIZED_STATS_USERS=U12345678,U87654321 spinbot
```

**Kubernetes:**
```yaml
env:
  - name: AUTHORIZED_STATS_USERS
    value: "U12345678,U87654321"
```

**AWS/Azure/GCP:**
Use their secrets management services.

### Dynamic Authorization (Advanced)

For more complex authorization, you could:

1. **Store in Database:**
```javascript
// Create authorized_users table
// Check database instead of env var
const isAuthorized = await db('authorized_users')
  .where({ user_id: userId, is_active: true })
  .first();
```

2. **Slack User Groups:**
```javascript
// Check if user is in a specific user group
const userGroups = await client.usergroups.users.list({
  usergroup: 'S12345678' // Admin group ID
});
const isAuthorized = userGroups.users.includes(userId);
```

3. **Admin Panel:**
Build a web interface to manage authorized users.

## Example: Complete Setup

```bash
# 1. Get User IDs
# Alice: U12345678
# Bob: U87654321
# Charlie: U11111111

# 2. Update .env
echo "AUTHORIZED_STATS_USERS=U12345678,U87654321,U11111111" >> .env

# 3. Restart bot
npm start

# 4. Test
# - Alice opens SpinBot → Home tab → Sees stats ✅
# - David opens SpinBot → Home tab → Sees welcome screen ✅
```

## FAQ

**Q: Can I make stats public to everyone?**
A: Yes, but not recommended. You could set `AUTHORIZED_STATS_USERS=*` and modify the code to allow all users.

**Q: Can users see their own stats only?**
A: Not by default, but you could modify `buildStatsView()` to filter by user.

**Q: How do I find all admin User IDs?**
A: Unfortunately, you need to copy each one manually from their profile.

**Q: Can I use email addresses instead of User IDs?**
A: No, Slack requires User IDs. Email addresses don't work.

**Q: What happens if AUTHORIZED_STATS_USERS is empty?**
A: All users see the welcome screen. No one can view statistics.

