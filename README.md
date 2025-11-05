# SpinBot - Who's Turn? 🎲

A Slack bot that randomly selects a user from a thread to decide who has to perform a specific task.

> 📣 **Important:** Use `@SpinBot` in threads, not `/spinbot`. Slack doesn't support slash commands in threads. See [MIGRATION.md](MIGRATION.md) if upgrading from an older version.

## Features

- 🎯 Works in threads AND channels via @mentions
- 🧵 Thread mode: Analyzes all thread participants
- 📢 Channel mode: Selects from all channel members
- 🏖️ Smart status filtering: Excludes users on vacation, sick, etc.
- 🎲 Randomly selects a user (excluding the bot itself)
- 🔌 Uses WebSocket (Socket Mode) for real-time communication
- 📝 Flexible task description
- 🌍 Bilingual support: "who" or "wer"
- 📊 Usage tracking with MySQL database
- 📈 Built-in statistics command
- ⚡ Also supports `/spinbot` command in main channels

## Example Usage

### In a Thread
**Mention the bot in a thread:**
```
@SpinBot who has to pre-order lunch?
```
or
```
@SpinBot wer muss essen vorbestellen?
```

**Response:**
```
🎲 @Username has to pre-order lunch
```

The bot selects randomly from **thread participants**.

### Directly in a Channel
**Mention the bot directly in the channel:**
```
@SpinBot who moderates today's daily?
```
or
```
@SpinBot wer moderiert heute das Daily?
```

**Response:**
```
🎲 @Username moderates today's daily
```

The bot selects randomly from **all channel members** (excluding users with specific status emojis).

> 💡 **Note:** You can use "who" or "wer" at the beginning and add a "?" at the end - the bot will automatically clean it up for the output!

## Setup

### 1. Create Slack App

#### Option A: Using the Manifest (Recommended ⚡)

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps)
2. Click **"Create New App"** → **"From an app manifest"**
3. Select your workspace
4. Copy the contents of `slack-manifest.json` and paste it
5. Review the configuration and click **"Create"**
6. Done! All permissions and commands are pre-configured ✅

> 📖 For detailed manifest usage, see [MANIFEST.md](MANIFEST.md)

#### Option B: Manual Setup

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps)
2. Click **"Create New App"** → **"From scratch"**
3. Give your app a name (e.g. "SpinBot") and select your workspace

### 2. Enable Socket Mode

1. Go to **"Socket Mode"** in the left menu of your app
2. Enable Socket Mode
3. Create an **App-Level Token** with the scope `connections:write`
4. Save the token (starts with `xapp-`)

### 3. Add Bot Token Scopes

1. Go to **"OAuth & Permissions"**
2. Add the following **Bot Token Scopes**:
   - `app_mentions:read` - To receive @mentions
   - `channels:history` - To read thread messages
   - `channels:read` - To get channel members
   - `chat:write` - To send messages
   - `commands` - To receive slash commands
   - `groups:history` - To read thread messages in private channels
   - `users:read` - To read user profiles and status

### 4. Create Slash Command

1. Go to **"Slash Commands"**
2. Click **"Create New Command"**
3. Command: `/spinbot`
4. Short Description: `Randomly selects a user from the thread`
5. Usage Hint: `has to pre-order lunch`
6. Save

### 5. Install Bot

1. Go to **"Install App"**
2. Click **"Install to Workspace"**
3. Authorize the app
4. Copy the **Bot User OAuth Token** (starts with `xoxb-`)

### 6. Configure Environment Variables

1. Copy `env.example` to `.env`:
   ```bash
   cp env.example .env
   ```

2. Fill out the `.env` file:
   ```
   SLACK_APP_TOKEN=xapp-your-app-token
   SLACK_BOT_TOKEN=xoxb-your-bot-token
   SLACK_SIGNING_SECRET=your-signing-secret
   ```

   The **Signing Secret** can be found under **"Basic Information"** → **"App Credentials"**

### 7. Install Dependencies

```bash
npm install
```

### 8. Setup Database (Optional but recommended)

SpinBot tracks usage statistics in a MySQL database.

1. Create a MySQL database:
   ```sql
   CREATE DATABASE spinbot;
   ```

2. Add database credentials to your `.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your-password
   DB_NAME=spinbot
   
   # Optional: Authorize users to view stats (comma-separated User IDs)
   AUTHORIZED_STATS_USERS=U12345678,U87654321
   
   # Optional: Exclude users with specific status emojis (channel-level only)
   EXCLUDED_STATUS_EMOJIS=🏖️,🤒,🏠,🌴,✈️
   ```
   
   > 💡 To find a User ID: Right-click user → View Profile → More → Copy Member ID
   
   > 💡 Status filtering only applies when using SpinBot directly in a channel. In threads, all participants are eligible.

3. Run migrations to create tables:
   ```bash
   npm run migrate
   ```

See [DATABASE.md](DATABASE.md) for detailed setup and usage information.

> 💡 **Note:** The bot works without a database, but you won't have usage statistics.

### 9. Start Bot

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Usage

### In Threads (Primary Usage)

1. Create a message in a Slack channel
2. Have other users reply to this message in a thread
3. In the thread, mention the bot with a task description:
   ```
   @SpinBot <task description>
   ```

**Examples:**
```
@SpinBot who has to pre-order lunch?
@SpinBot wer muss Kaffee holen?
@SpinBot who is up for cleaning?
@SpinBot wer muss das nächste Meeting moderieren?
```

The bot randomly selects one of the users from the thread and returns:
```
🎲 @Username <task description>
```

### In Channels (Alternative)

You can also use the slash command in the main channel:
```
/spinbot has to pre-order lunch
```

The bot will provide instructions on how to use it properly in threads.

### View Statistics

Statistics are available in the **App Home** tab for authorized users only.

**To access:**
1. Click on SpinBot in your Slack sidebar
2. Go to the **Home** tab
3. View comprehensive usage statistics (if authorized)

**Statistics include:**
- Total number of spins
- Average participants per spin
- Top 5 most active channels
- Most active users (who invoke the bot)
- Most selected users (the "unlucky" ones)
- Usage over the last 7 days

**Authorization:**
Only users specified in the `AUTHORIZED_STATS_USERS` environment variable can view statistics. Contact your administrator to request access.

See [DATABASE.md](DATABASE.md) for more details on tracked data and how to add authorized users.

## Technical Details

- **Framework:** Slack Bolt for Node.js
- **Communication:** Socket Mode (WebSocket) - no public server required
- **Language:** JavaScript (Node.js)
- **Dependencies:**
  - `@slack/bolt` - Slack Bot Framework
  - `dotenv` - Environment Variables Management
  - `knex` - SQL Query Builder
  - `mysql2` - MySQL Database Driver

## Troubleshooting

### Bot doesn't respond
- Check if the bot is running (`npm start`)
- Check console logs for errors
- Ensure all environment variables are set correctly

### "No users found in thread"
- The command must be used in a thread with at least one message
- Ensure the bot scopes `channels:history` and `groups:history` are set

### Socket Mode errors
- Check if Socket Mode is enabled in the Slack app
- Ensure the App-Level Token is correct and starts with `xapp-`
- The token needs the scope `connections:write`

## License

MIT

