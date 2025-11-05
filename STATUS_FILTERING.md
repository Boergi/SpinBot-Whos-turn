# Status Filtering Guide

## Overview

When SpinBot is mentioned directly in a channel (not in a thread), it can filter out users based on their Slack status. This is useful to automatically exclude people who are on vacation, sick, or otherwise unavailable.

## How It Works

### Channel Mentions
When you use `@SpinBot` directly in a channel (max 20 members):
1. Bot checks if channel has ≤20 members
2. Bot fetches all channel members
3. Checks each member's Slack status
4. Excludes members whose status contains configured emojis
5. Selects randomly from remaining members

> ⚠️ **Important:** Status filtering only works in channels with up to 20 members to avoid API rate limits. For larger channels, use the bot in a thread instead.

### Thread Mentions
When you use `@SpinBot` in a thread:
- No status filtering
- Selects from thread participants only
- Everyone who participated is eligible
- No member limit

## Configuration

### Setting Up Excluded Emojis

Add to your `.env` file:

```env
EXCLUDED_STATUS_EMOJIS=🏖️,🤒,🏠,🌴,✈️
```

**Common examples:**
- 🏖️ - Vacation/Holiday
- 🤒 - Sick/Ill
- 🏠 - Working from home (if not available)
- 🌴 - On holiday
- ✈️ - Traveling
- 🎄 - Christmas break
- 🏥 - Medical leave
- 👶 - Parental leave
- 📚 - Training/Conference

### How Emojis Are Matched

The bot checks if the emoji appears in:
1. **Status emoji field** (the emoji next to the status)
2. **Status text field** (the text description)

**Example matches:**
- Status: "🏖️ On vacation until Friday" → ✅ Excluded (if 🏖️ is configured)
- Status: "🤒 Feeling sick" → ✅ Excluded (if 🤒 is configured)
- Status: "💻 Working" → ❌ Not excluded (💻 not in config)

## Usage Examples

### Example 1: Daily Standup

**Scenario:**
- Channel: #engineering
- Members: Alice, Bob, Charlie, David
- Alice's status: "🏖️ Vacation"
- Charlie's status: "🤒 Sick"

**Command:**
```
@SpinBot who moderates today's daily?
```

**Result:**
```
🎲 @Bob moderates today's daily
```
or
```
🎲 @David moderates today's daily
```

Alice and Charlie are automatically excluded!

### Example 2: Code Review Assignment

**Scenario:**
- Channel: #dev-team
- All members available (no vacation/sick status)

**Command:**
```
@SpinBot who reviews the pull request?
```

**Result:**
```
🎲 @AnyTeamMember reviews the pull request
```

All members are eligible.

### Example 3: Thread Usage (No Filtering)

**Scenario:**
- Thread with 5 participants
- One has vacation status

**Command in thread:**
```
@SpinBot who has to pre-order lunch?
```

**Result:**
```
🎲 @AnyThreadParticipant has to pre-order lunch
```

Status is ignored - all thread participants are eligible!

## Best Practices

### 1. Consistent Status Emojis

Encourage your team to use consistent emojis:
- Create a team convention
- Document which emojis to use
- Add them to channel description

**Example team convention:**
```
Use these status emojis:
🏖️ - Vacation
🤒 - Sick day
🏠 - WFH (unavailable for meetings)
✈️ - Business travel
```

### 2. Update Configuration

Review and update `EXCLUDED_STATUS_EMOJIS` regularly:
- Add new emojis as needed
- Remove unused ones
- Keep it simple (5-10 emojis max)

### 3. Communication

Let your team know:
- Which emojis trigger exclusion
- That status filtering only applies to channel mentions
- How to set their Slack status

## Troubleshooting

### Bot selects users who should be excluded

**Check:**
1. Is the emoji exactly the same?
   - "🏖" vs "🏖️" might be different Unicode characters
2. Is the emoji in `EXCLUDED_STATUS_EMOJIS`?
3. Did you restart the bot after changing `.env`?
4. Check bot logs for status checks

**Debug:**
```bash
# Bot logs show:
User U12345678 excluded due to status: 🏖️ On vacation
```

### No users available

**Error message:**
```
❌ No available users in the channel. Everyone seems to be busy! 😅
```

**Possible causes:**
1. Everyone has an excluded status
2. Too many emojis in `EXCLUDED_STATUS_EMOJIS`
3. Bot is the only member without excluded status

**Solutions:**
- Remove some emojis from config
- Ask team to update their status
- Use in a thread instead (no filtering)

### Status not checked in threads

**This is by design!**
- Thread mode: Selects from participants (no status check)
- Channel mode: Checks status (max 20 members)

To use status filtering, mention the bot directly in a channel with ≤20 members.

### Channel too large error

**Error message:**
```
⚠️ Channel too large for direct selection

This channel has 45 members. For performance reasons, channel-level selection 
only works in channels with up to 20 members.

💡 Please use me in a thread instead
```

**Solution:**
Use SpinBot in a thread instead of directly in the channel. Thread mode has no member limit.

## Advanced Configuration

### Multiple Environments

**Development:**
```env
EXCLUDED_STATUS_EMOJIS=🏖️,🤒
```

**Production:**
```env
EXCLUDED_STATUS_EMOJIS=🏖️,🤒,🏠,🌴,✈️,🎄,🏥,👶
```

### Testing

Test without excluding anyone:
```env
EXCLUDED_STATUS_EMOJIS=
```

Or with unlikely emojis:
```env
EXCLUDED_STATUS_EMOJIS=🦄,🐉
```

## Technical Details

### Scope Required
The bot needs the `users:read` scope to access user profiles and status.

### API Calls
- `users.profile.get` - Fetches user status
- Called once per channel member
- Only on channel-level mentions

### Performance
- Status checks are sequential (to avoid rate limits)
- Typically takes 1-2 seconds for 10 users
- Cached per request (not across requests)
- Limited to channels with ≤20 members

### Rate Limits
Slack API limits:
- Tier 3: 50+ requests per minute
- Status checks count toward this limit
- Bot includes error handling for rate limits
- Channel size limit of 20 members prevents rate limit issues

You can configure the maximum channel size in `.env`:
```env
MAX_CHANNEL_SIZE=20
```

## Privacy Considerations

### What the bot sees:
- User status emoji
- User status text
- Public profile information

### What the bot does NOT see:
- Private/DM conversations
- User's online/away status
- User's activity logs

### Data storage:
- Status is NOT stored in database
- Only checked at selection time
- Logs may include user IDs and exclusion reasons

## FAQ

**Q: Does status filtering work in private channels?**
A: Yes, as long as the bot has `groups:history` scope.

**Q: Can I use text instead of emojis?**
A: No, currently only emojis are supported. Status text is checked for emoji presence.

**Q: What if someone has multiple emojis in status?**
A: If ANY of their status emojis match the exclusion list, they're excluded.

**Q: Can users bypass this?**
A: Yes, by removing the emoji from their status. Status is voluntary.

**Q: Does this work with custom emojis?**
A: Yes! Custom workspace emojis work too, e.g., `:vacation:`

**Q: How often is status checked?**
A: Every time the bot is mentioned in a channel (not cached).

**Q: Can I disable status filtering?**
A: Yes, leave `EXCLUDED_STATUS_EMOJIS` empty or don't set it.

**Q: Can I change the 20 member limit?**
A: Yes, set `MAX_CHANNEL_SIZE` in `.env`. However, higher values may cause API rate limit issues.

**Q: Why the 20 member limit?**
A: Each channel member requires a separate API call to check their status. Too many calls can hit rate limits.

