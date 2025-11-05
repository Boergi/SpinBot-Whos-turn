# Slack App Manifest

This directory contains a `slack-manifest.json` file that can be used to quickly create and configure your Slack app with all the necessary permissions and settings.

## What is a Slack App Manifest?

A Slack App Manifest is a JSON configuration file that defines all aspects of your Slack app, including:
- Display information (name, description, colors)
- Bot user configuration
- OAuth scopes and permissions
- Slash commands
- Socket mode settings

## How to Use the Manifest

### Creating a New App

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps)
2. Click **"Create New App"**
3. Select **"From an app manifest"**
4. Choose your workspace
5. Select the **JSON** tab
6. Copy and paste the entire contents of `slack-manifest.json`
7. Click **"Next"**
8. Review the app configuration
9. Click **"Create"**

### What's Included in This Manifest

The manifest automatically configures:

✅ **Display Information**
- App name: SpinBot
- Description and branding
- Background color

✅ **Bot User**
- Display name: SpinBot
- Always online status

✅ **Slash Command**
- Command: `/spinbot`
- Description and usage hints

✅ **OAuth Scopes**
- `app_mentions:read` - Receive @mentions in threads
- `chat:write` - Send messages
- `commands` - Receive slash commands
- `channels:history` - Read channel thread messages
- `groups:history` - Read private channel thread messages

✅ **Settings**
- Socket mode enabled (events come via WebSocket, no webhook URL needed)
- Token rotation disabled

> 💡 **Note:** Event Subscriptions are not needed in the manifest when using Socket Mode. Events are received automatically via WebSocket when you have the `app_mentions:read` scope.

## After Creating the App

After creating your app with the manifest, you still need to:

1. **Generate an App-Level Token** (for Socket Mode)
   - Go to **"Socket Mode"** (it's already enabled)
   - Generate a token with `connections:write` scope

2. **Install the App to Your Workspace**
   - Go to **"Install App"**
   - Click **"Install to Workspace"**
   - Copy the Bot User OAuth Token

3. **Get Your Signing Secret**
   - Go to **"Basic Information"**
   - Copy the Signing Secret

4. **Configure Your `.env` File**
   - Add all three tokens to your `.env` file

See `SETUP.md` for detailed step-by-step instructions.

## Updating an Existing App

If you need to update an existing app with this manifest:

1. Go to your app's page on [https://api.slack.com/apps](https://api.slack.com/apps)
2. Click **"App Manifest"** in the left sidebar
3. Replace the existing manifest with the contents of `slack-manifest.json`
4. Click **"Save Changes"**

## Customization

You can customize the manifest before creating your app:

```json
{
  "display_information": {
    "name": "Your Custom Name",
    "background_color": "#YOUR_COLOR"
  }
}
```

Common customizations:
- Change the app name
- Modify the background color
- Update descriptions
- Add additional scopes if needed

## Manifest Validation

Slack will automatically validate your manifest when you try to create or update an app. If there are any errors, you'll see specific messages about what needs to be fixed.

## Benefits of Using a Manifest

- ⚡ **Faster Setup** - One-click configuration instead of clicking through multiple screens
- ✅ **No Mistakes** - All settings are pre-configured correctly
- 🔄 **Reproducible** - Easy to recreate the app in different workspaces
- 📝 **Documentation** - The manifest serves as documentation of your app's configuration
- 🚀 **Version Control** - Track changes to your app configuration over time

## Resources

- [Slack App Manifest Documentation](https://api.slack.com/reference/manifests)
- [App Manifest Schema](https://api.slack.com/reference/manifests#schema)

