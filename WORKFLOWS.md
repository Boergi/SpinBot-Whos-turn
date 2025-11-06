# Workflow Integration 🕐

SpinBot integrates seamlessly with Slack's Workflow Builder and scheduled messages, making it perfect for automating recurring tasks like daily standups, lunch orders, or meeting moderation.

## Why Use SpinBot with Workflows?

✅ **Fully automated** - No manual intervention needed  
✅ **Fair distribution** - Weighted selection prevents the same person repeatedly  
✅ **Smart parsing** - Ignores workflow boilerplate text  
✅ **Channel-wide** - Selects from all available team members  
✅ **Status-aware** - Automatically excludes people on vacation, sick, etc.  

## Example: Daily Standup Moderator

### The Problem

Your team has daily standups and you need someone to moderate each day. Manually picking someone or using a rotation list is tedious and unfair when people are on vacation.

### The Solution

Create a scheduled workflow that automatically picks a moderator every morning!

### Step-by-Step Setup

#### 1. Create a Workflow

1. Go to your Slack workspace
2. Click on your workspace name → **Tools** → **Workflow Builder**
3. Click **Create Workflow**
4. Name it: `"Daily Standup - Pick Moderator"`

#### 2. Set the Trigger

1. Choose trigger: **Scheduled date & time**
2. Set schedule:
   - **Frequency:** Every weekday (Monday-Friday)
   - **Time:** 9:00 AM
   - **Timezone:** Your team's timezone
3. Click **Next**

#### 3. Add a Send Message Step

1. Click **Add Step** → **Send a message**
2. **Send to:** Choose your standup channel (e.g., `#team-standup`)
3. **Message:** Add this content:

```
Good morning team! 🌅
Time for our daily standup.

@SpinBot, who moderates the Daily today?

Let's walk the board → Right ➡️ Left
1️⃣ What moved to ✅ DONE since yesterday?
2️⃣ What's 🟡 IN PROGRESS today?
3️⃣ Any 🚧 BLOCKERS?
```

4. Click **Save**

#### 4. Publish the Workflow

1. Click **Publish**
2. The workflow is now active!

### How It Works

Every weekday at 9:00 AM:
1. ✅ Workflow posts the message to your channel
2. 🤖 SpinBot detects the mention
3. 🎯 Extracts only: "who moderates the Daily today"
4. ⚖️ Selects someone fairly (recently selected people have lower chances)
5. 🏖️ Automatically excludes people with vacation/sick status
6. 📢 Posts: `🎲 @Username moderates the Daily today`

## More Examples

### Example 2: Weekly Lunch Order Manager

**Workflow:** Every Friday at 11:00 AM

```
🍕 Lunchtime! It's Friday and we're ordering pizza.

@SpinBot, who has to collect orders and place the order?

Please send your orders to the selected person by 11:30 AM!
```

**Result:** SpinBot picks someone to manage the lunch order

### Example 3: Monthly Meeting Note-Taker

**Workflow:** First Monday of each month at 9:00 AM

```
📝 All-hands meeting today at 10:00 AM!

@SpinBot, who takes notes for today's meeting?

Remember: Upload notes to the shared drive after!
```

**Result:** SpinBot assigns a note-taker for the meeting

### Example 4: Weekly Code Review Lead

**Workflow:** Every Monday at 10:00 AM

```
👨‍💻 New week, new code reviews!

@SpinBot, who is the code review lead this week?

Responsibilities:
• Ensure all PRs get reviewed
• Distribute reviews fairly
• Escalate blockers
```

**Result:** SpinBot assigns a weekly code review coordinator

### Example 5: Daily Office Cleanup

**Workflow:** Every weekday at 5:00 PM

```
🧹 End of day cleanup time!

@SpinBot, who tidies up the office today?

Tasks: Empty coffee machine, load dishwasher, take out trash
```

**Result:** SpinBot assigns someone to clean up before leaving

## Advanced: Using Workflow Variables

You can make workflows even more dynamic using Slack's workflow variables:

```
Good morning {{day_of_week}}! 🌅
Today is {{current_date}}.

@SpinBot, who moderates the Daily today?

Sprint day: {{sprint_day}}/10
```

Variables like `{{day_of_week}}` and `{{current_date}}` are automatically replaced by Slack.

## Smart Parsing in Action

SpinBot's smart parsing is crucial for workflows. It extracts **only** the relevant task:

### Input (Workflow Message):
```
Good morning team! 🌅
Time for our daily standup.

@SpinBot, who moderates the Daily today?

Let's walk the board → Right ➡️ Left
1️⃣ What moved to ✅ DONE?
```

### What SpinBot Sees:
```
who moderates the Daily today
```

### Output:
```
🎲 @Alice moderates the Daily today
```

Everything before `@SpinBot` and after `?` is **ignored**. Perfect!

## Best Practices

### ✅ Do's

- **Be specific:** "who moderates" is better than "who does it"
- **Use question marks:** Helps SpinBot know where to cut off
- **Keep it consistent:** Same wording helps with readability
- **Test first:** Send a manual message before scheduling
- **Set appropriate times:** Schedule before the task is needed

### ❌ Don'ts

- **Multiple questions:** Don't ask two things in one workflow
- **Nested questions:** Avoid questions within the task description
- **Too early:** Don't schedule at 6 AM if nobody's online
- **Weekends:** Adjust schedule for your team's work days
- **Wrong channel:** Make sure SpinBot has access

## Troubleshooting

### Bot Doesn't Respond

**Problem:** Workflow posts but bot doesn't select anyone

**Solutions:**
1. ✅ Ensure SpinBot is **invited to the channel**
2. ✅ Check that bot is **running** (contact admin)
3. ✅ Verify message includes **@SpinBot** mention
4. ✅ Make sure channel has **at least 2 members**

### Same Person Repeatedly Selected

**Problem:** One person gets picked too often

**Solutions:**
1. ✅ This should be rare due to fair weighting
2. ✅ Check if other members have **excluded status emojis**
3. ✅ Verify other members are **in the channel**
4. ✅ Check database is connected (history-based fairness requires DB)

### Bot Includes Workflow Text

**Problem:** Bot output includes parts of the workflow message

**Solutions:**
1. ✅ Add a **question mark** after the task: `@SpinBot who...?`
2. ✅ Put extra text **before** the mention or **after** the `?`
3. ✅ Test with a manual message first to verify parsing

### Nobody Available

**Problem:** "No available users in the channel"

**Solutions:**
1. ✅ Check if everyone has **excluded status emojis** (vacation, sick, etc.)
2. ✅ Verify it's a **channel-level** workflow (not thread)
3. ✅ Ensure channel has **human members** (not just bots)
4. ✅ Temporarily remove some status emojis from `.env`

## Workflow + Threads

You can also create workflows that work in threads!

**Workflow:** Every weekday at 4:00 PM, post to `#retrospective` channel

```
📋 Time for our weekly retro prep!

Please add your points to this thread. React with 👍 if you added something.

@SpinBot, who facilitates the retro on Friday?
```

When people reply in the thread and react:
- 🧵 Thread participants are eligible
- 👍 Reaction participants are included
- 🎯 SpinBot picks from everyone who engaged

## Integration with Other Tools

### Zapier

You can trigger workflows via Zapier to create even more complex automations:

```
Zapier: When new sprint starts in Jira
  → Slack Workflow: Post to #dev channel
    → SpinBot: Pick sprint master
```

### Google Calendar

Sync with your team calendar:

```
Google Calendar: Team meeting in 30 minutes
  → Slack Workflow: Post reminder
    → SpinBot: Assign meeting facilitator
```

### GitHub

Automate PR reviews:

```
GitHub: New PR opened
  → Slack Workflow: Post to #code-review
    → SpinBot: Assign initial reviewer
```

## Statistics Tracking

All workflow-triggered selections are tracked in the database:
- **Total selections** per channel
- **User selection history** for fair distribution
- **Most active times** for analytics

Authorized users can view these stats in the **App Home** tab.

## Customization

### Custom Status Emojis

Edit `.env` to customize which status emojis exclude users:

```bash
EXCLUDED_STATUS_EMOJIS=:palm_tree:,:face_with_thermometer:,:kids:,:school:
```

Anyone with these emojis in their status will be automatically excluded from channel-level workflows.

### Custom Reaction Emojis

If you want workflow threads to count specific reactions:

```bash
ALLOWED_REACTION_EMOJIS=:+1:,:plus1:,:thumbsup:,:heavy_plus_sign:
```

## FAQ

**Q: Can I use the same workflow in multiple channels?**  
A: Yes! Just duplicate the workflow and change the target channel.

**Q: Will it work on weekends?**  
A: Yes, if you schedule it. Just adjust your workflow schedule.

**Q: Can I test before publishing?**  
A: Yes! Send the message manually first to verify it works.

**Q: What if nobody is available due to vacations?**  
A: The bot will say "No available users" - you may need to manually pick someone or adjust status filters.

**Q: Can I use multiple bots in one workflow?**  
A: Yes! Just mention each bot separately with their own tasks.

**Q: Does it cost extra?**  
A: No! Slack Workflow Builder is included in all paid plans. SpinBot is free to use.

## Resources

- 📖 [Slack Workflow Builder Guide](https://slack.com/help/articles/360035692513-Guide-to-Workflow-Builder)
- 📖 [MESSAGE_PARSING.md](MESSAGE_PARSING.md) - How SpinBot parses messages
- 📖 [FAIR_SELECTION.md](FAIR_SELECTION.md) - How fair selection works
- 📖 [STATUS_FILTERING.md](STATUS_FILTERING.md) - How status filtering works

## Need Help?

If you're having trouble setting up workflows with SpinBot:
1. Check this guide and the FAQ
2. Test with a manual message first
3. Review the console logs (if you're the admin)
4. Contact your workspace administrator
5. Open an issue on the GitHub repository

---

**Happy automating! 🤖🎉**

