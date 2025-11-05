# Migration Guide: From /spinbot to @SpinBot

## Why the Change?

Slack **does not support slash commands in threads**. When you try to use `/spinbot` in a thread, you'll get this error:
```
/spinbot wird in Threads leider nicht unterstützt. Tut uns leid!
```

To make SpinBot work properly in threads, we've updated it to use **@mentions** instead.

## What Changed?

### Old Usage (Doesn't work in threads ❌)
```
/spinbot has to pre-order lunch
```

### New Usage (Works in threads ✅)
```
@SpinBot who has to pre-order lunch?
```
or
```
@SpinBot wer muss essen vorbestellen?
```

## Migration Steps

If you already have an existing SpinBot installation:

### 1. Update the Code
Pull the latest version of the code from the repository.

### 2. Update App Permissions

Add the new required scope:
1. Go to [https://api.slack.com/apps](https://api.slack.com/apps)
2. Select your SpinBot app
3. Go to **"OAuth & Permissions"**
4. Under **"Bot Token Scopes"**, add:
   - `app_mentions:read`

### 3. Reinstall the App

After adding new scopes, you need to reinstall:
1. Go to **"Install App"**
2. Click **"Reinstall to Workspace"**
3. Authorize the new permissions

### 4. Restart Your Bot

Restart the bot to apply the changes:
```bash
# Stop the bot (Ctrl+C if running)
# Start it again
npm start
```

## New Usage Examples

### In Threads (Primary)
```
@SpinBot who has to pre-order lunch?
@SpinBot wer muss Kaffee holen?
@SpinBot who is up for cleaning?
@SpinBot wer muss das nächste Meeting moderieren?
```

### In Main Channel
The `/spinbot` command still exists but now provides helpful instructions:
```
/spinbot has to pre-order lunch
```

Response:
```
💡 Tip: Slash commands don't work in threads. Instead, mention me in a thread like this:
`@SpinBot who has to pre-order lunch?`
```

## Quick Reference

| Feature | Old | New |
|---------|-----|-----|
| **In Threads** | ❌ `/spinbot` (not supported) | ✅ `@SpinBot` (works!) |
| **In Channels** | ✅ `/spinbot` | ✅ `/spinbot` or `@SpinBot` |
| **Required Scope** | `commands` | `app_mentions:read` + `commands` |
| **Socket Mode** | Optional | Required (events via WebSocket) |

## FAQ

### Q: Can I still use `/spinbot`?
A: Yes, in main channels. But it will show instructions to use `@SpinBot` in threads instead.

### Q: Why not just use `/spinbot` everywhere?
A: Slack's limitation - slash commands simply don't work in threads. We have no control over this.

### Q: Do I need to change anything in my `.env` file?
A: No, the same tokens work for both approaches.

### Q: Will old `/spinbot` commands break?
A: No, they still work in main channels. In threads, they show helpful migration instructions.

## Benefits of the New Approach

✅ **Works in threads** - The main use case for SpinBot  
✅ **More natural** - @mentioning feels more conversational  
✅ **Backward compatible** - `/spinbot` still works in channels  
✅ **Better UX** - Users see helpful tips if they use the wrong command  

## Need Help?

If you encounter issues during migration:
1. Check that all scopes are added (especially `app_mentions:read`)
2. Verify Socket Mode is enabled
3. Make sure you reinstalled the app after adding new permissions
4. Restart your bot application
5. Check console logs for any errors

> 💡 **Note:** With Socket Mode, you don't need to manually configure Event Subscriptions. The bot receives events automatically via WebSocket when it has the correct scopes.

The bot logs will show whether it's receiving mentions correctly:
```
Mention received: channel=C123, thread=1234567890.123456, task="has to pre-order lunch"
```

