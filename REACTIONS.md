# Reaction Support

SpinBot supports counting reactions as participation in threads! This makes it easy for users to indicate interest without writing a message.

## How It Works

When SpinBot analyzes a thread, it counts:
1. ✅ **Users who wrote messages** in the thread
2. ✅ **Users who reacted with allowed emojis**

Both groups are combined for the random selection.

## Configuration

Add to your `.env` file:

```env
# Allowed Reaction Emojis (comma-separated)
# Users who react with these emojis will be included in the selection
ALLOWED_REACTION_EMOJIS=:+1:,:plus1:,:thumbsup:,:plus-1:,:heavy_plus_sign:
```

### Common Emoji Names

| Emoji | Slack Names | Usage |
|-------|-------------|-------|
| 👍 | `:+1:`, `:plus1:`, `:thumbsup:` | "I'm in" / "Count me in" |
| ➕ | `:heavy_plus_sign:` | "Add me" / "Plus one" |
| ✅ | `:white_check_mark:` | "Yes" / "Confirmed" |
| ❌ | `:x:`, `:cross_mark:` | "No" (if you want to count negative) |

**Important:** Slack may use different names for the same emoji. For 👍, you should include all variants: `:+1:`, `:plus1:`, and `:thumbsup:`

## Example Use Cases

### 1. Lunch Order
```
Thread: "Who wants to order lunch?"
- Alice: "I want a sandwich" ✅
- Bob reacts with 👍 ✅
- Charlie reacts with ➕ ✅
- Dave reacts with ❤️ ❌ (not in allowed list)

@SpinBot who has to place the order?
→ Selects from: Alice, Bob, Charlie
```

### 2. Meeting Attendance
```
Thread: "Daily standup at 10am?"
- Users react with ✅ to confirm
- Users react with ➕ if they're coming

@SpinBot who moderates today?
→ Selects from all who confirmed
```

### 3. Task Assignment
```
Thread: "We need someone to update the docs"
- Several people react with 👍
- No one writes a message

@SpinBot who updates the docs?
→ Selects from people who reacted
```

## Technical Details

### How Reactions Are Processed

1. Bot fetches all thread messages via `conversations.replies()`
2. Each message can have a `reactions` array
3. Each reaction has:
   - `name`: The emoji name (e.g., `"plus1"`)
   - `count`: Total number of reactions
   - `users`: Array of user IDs who reacted

4. Bot filters reactions by `name` against allowed list
5. Collects all user IDs from matching reactions
6. Combines with message authors
7. Removes duplicates (if someone wrote AND reacted)

### Bots and Deleted Users

- **Bots are excluded** even if they react
- **Deleted users are excluded** even if they reacted
- Same filtering rules as for message authors

## Debugging

Enable detailed logging to see what reactions are found:

```bash
npm start
```

Look for log output like:
```
📝 Message has 2 reaction(s):
  - :plus1: (3 reactions, 3 users)
  - :pizza: (1 reactions, 1 users)
✅ Counted 3 users with :plus1: reaction (ALLOWED)
❌ Ignored :pizza: reaction (NOT in allowed list)

📊 Summary: Found 5 unique participants (messages + reactions)
🔍 Allowed reaction emojis: [+1, plus1, thumbsup, heavy_plus_sign]
```

This shows:
- Which reactions Slack returns
- How many users reacted
- Which reactions were counted
- Which were ignored

## Disabling Reaction Support

To disable reaction counting, simply leave the environment variable empty or don't set it:

```env
ALLOWED_REACTION_EMOJIS=
```

or remove the line entirely. The bot will then only count users who wrote messages.

## FAQ

**Q: Can I use custom workspace emojis?**  
A: Yes! Just use the emoji name from your workspace, e.g., `:company-logo:`

**Q: What if someone reacts to multiple messages?**  
A: They're only counted once. Duplicates are automatically removed.

**Q: Do reactions on the parent message count?**  
A: Yes! Reactions on any message in the thread (including the first message) are counted.

**Q: Can I exclude certain reactions?**  
A: Yes, simply don't add them to `ALLOWED_REACTION_EMOJIS`. Only explicitly allowed emojis count.

**Q: How do I find the name of an emoji?**  
A: Use the emoji in Slack, then check the bot logs. It will show the exact name Slack uses.

**Q: Does this work in channel mode too?**  
A: No, reaction support only works in thread mode. Channel mode selects from all channel members directly.

