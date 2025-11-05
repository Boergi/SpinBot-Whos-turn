# Quick Start Guide for SpinBot

## Step-by-Step Installation

### Step 1: Setup Repository
```bash
cd SpinBot-Whos-turn
npm install
```

### Step 2: Configure Slack App

#### 2.1 Create App

**Option A: Using the Manifest (Recommended - Faster! ⚡)**

1. Open [https://api.slack.com/apps](https://api.slack.com/apps)
2. **"Create New App"** → **"From an app manifest"**
3. Select your workspace
4. Copy the entire contents of `slack-manifest.json` from the project
5. Paste it into the JSON tab
6. Click **"Next"** → **"Create"**
7. ✅ Skip to Step 2.2 - everything else is already configured!

**Option B: Manual Setup**

1. Open [https://api.slack.com/apps](https://api.slack.com/apps)
2. **"Create New App"** → **"From scratch"**
3. Name: **SpinBot**
4. Select your workspace
5. Continue with steps 2.3-2.6 below

#### 2.2 Enable Socket Mode (for WebSocket)
1. Left Menu → **"Socket Mode"**
2. Toggle to **"Enable Socket Mode"**
3. **"Generate an app-level token"**
   - Token Name: `SpinBot Socket Token`
   - Scope: `connections:write`
   - **Generate**
4. ⚠️ **Copy the token** (starts with `xapp-`)

#### 2.3 Bot Permissions
1. Left Menu → **"OAuth & Permissions"**
2. Scroll to **"Scopes"** → **"Bot Token Scopes"**
3. Add:
   - `app_mentions:read`
   - `channels:history`
   - `channels:read`
   - `chat:write`
   - `commands`
   - `groups:history`
   - `users:read`

#### 2.4 Slash Command
1. Left Menu → **"Slash Commands"**
2. **"Create New Command"**
   - Command: `/spinbot`
   - Short Description: `Randomly selects a user from the thread`
   - Usage Hint: `has to pre-order lunch`
3. **Save**

#### 2.5 Install App
1. Left Menu → **"Install App"**
2. **"Install to Workspace"**
3. Authorize the permissions
4. ⚠️ **Copy the Bot User OAuth Token** (starts with `xoxb-`)

#### 2.6 Signing Secret
1. Left Menu → **"Basic Information"**
2. Scroll to **"App Credentials"**
3. ⚠️ **Copy the Signing Secret**

### Step 3: Environment Variables

Create a `.env` file in the project root:

```bash
cp env.example .env
```

Fill out the `.env` file with your values:

```env
SLACK_APP_TOKEN=xapp-1-XXXXXXXXX-XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
SLACK_BOT_TOKEN=xoxb-XXXXXXXXXXXX-XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXX
SLACK_SIGNING_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 4: Setup Database (Optional)

1. Create MySQL database:
```sql
CREATE DATABASE spinbot;
```

2. Add to your `.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=spinbot

# Authorize users to view stats (comma-separated User IDs)
AUTHORIZED_STATS_USERS=U12345678,U87654321

# Exclude users with specific status emojis (channel-level only)
EXCLUDED_STATUS_EMOJIS=🏖️,🤒,🏠,🌴,✈️
```

To get User IDs: Right-click on user → View Profile → More → Copy Member ID

Status filtering only works when mentioning the bot directly in a channel. See [STATUS_FILTERING.md](STATUS_FILTERING.md) for details.

3. Run migrations:
```bash
npm run migrate
```

See [DATABASE.md](DATABASE.md) for details.

### Step 5: Start Bot

```bash
npm start
```

You should see:
```
⚡️ SpinBot is running in Socket Mode!
🤖 Ready for /spinbot commands
```

## Testing

1. Go to a Slack channel
2. Write a message
3. Have other users (or yourself) reply to this message in a thread
4. In the thread, mention the bot:
   ```
   @SpinBot who has to pre-order lunch?
   ```
   or
   ```
   @SpinBot wer muss essen vorbestellen?
   ```
5. The bot responds with:
   ```
   🎲 @Username has to pre-order lunch
   ```

> 💡 **Tip:** Use "who" or "wer" at the beginning and add a "?" at the end - both will be automatically removed from the output!  
> 💡 **Why @mention instead of /command?** Slack doesn't support slash commands in threads, but @mentions work perfectly!

## Common Issues

### "Missing required scope"
→ Go to **"OAuth & Permissions"** and add all Bot Token Scopes, then **reinstall** the app

### "Socket mode handler not called"
→ Make sure Socket Mode is enabled and the App-Level Token has the scope `connections:write`

### "An API error occurred: invalid_auth"
→ Check if your Bot Token is correct in the `.env` file and starts with `xoxb-`

### Bot doesn't respond
→ Check the console logs and make sure the bot is running

### Database connection errors
→ The bot works without a database, but won't track statistics
→ Check database credentials in `.env`
→ Run `npm run migrate` to create tables

## Development

For auto-reload during development:
```bash
npm run dev
```

## Deployment

The bot can be hosted on various platforms:
- Heroku
- AWS EC2
- DigitalOcean
- Your own server

Since the bot uses Socket Mode, you don't need a **public webhook endpoint** - the bot connects to Slack via WebSocket.

