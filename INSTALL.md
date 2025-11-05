# Installation Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Create a `.env` file in the project root:

```bash
cp env.example .env
```

Fill in your Slack tokens (see [SETUP.md](SETUP.md) for how to get these):

```env
SLACK_APP_TOKEN=xapp-your-token
SLACK_BOT_TOKEN=xoxb-your-token
SLACK_SIGNING_SECRET=your-secret
```

### 3. Setup Database (Optional)

If you want usage statistics:

```bash
# Create database
mysql -u root -p
CREATE DATABASE spinbot;
exit;

# Add to .env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=spinbot

# Run migrations
npm run migrate
```

### 4. Start the Bot

```bash
npm start
```

## Development Setup

For development with auto-reload:

```bash
npm run dev
```

## Production Deployment

### Environment Variables

Make sure all environment variables are set:

```env
# Slack
SLACK_APP_TOKEN=xapp-...
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...

# Database
DB_HOST=your-db-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=spinbot

# Environment
NODE_ENV=production
```

### Database Migration

Run migrations in production:

```bash
NODE_ENV=production npm run migrate
```

### Start the Bot

```bash
NODE_ENV=production npm start
```

Or use a process manager like PM2:

```bash
npm install -g pm2
pm2 start index.js --name spinbot
pm2 save
pm2 startup
```

## Docker Deployment (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t spinbot .
docker run -d --name spinbot --env-file .env spinbot
```

## Troubleshooting

### Bot doesn't start
- Check if Node.js is installed: `node --version` (requires v14+)
- Verify `.env` file exists and has correct values
- Check console for error messages

### Database connection fails
- Verify MySQL is running: `mysql -u root -p`
- Check database credentials in `.env`
- Ensure database exists: `CREATE DATABASE spinbot;`
- Run migrations: `npm run migrate`

### Slack connection fails
- Verify all tokens are correct
- Check if Socket Mode is enabled
- Ensure app is installed to workspace

## Update Guide

To update to the latest version:

```bash
git pull
npm install
npm run migrate
npm start
```

## Uninstallation

To remove the bot:

1. Stop the bot process
2. Remove the app from Slack workspace
3. Delete the database: `DROP DATABASE spinbot;`
4. Delete project files: `rm -rf SpinBot-Whos-turn`

