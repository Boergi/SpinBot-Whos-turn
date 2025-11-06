# Fair Selection Algorithm 🎲⚖️

SpinBot uses a **weighted random selection algorithm** to ensure fair distribution of tasks over time. Instead of purely random selection where the same person could be picked multiple times in a row, the bot considers selection history to give everyone a fair chance.

## How It Works

### 1. Selection History Tracking

Every time the bot selects someone, it records:
- Channel ID
- Selected user ID
- Timestamp
- Task description

This data is stored in the MySQL database (if configured).

### 2. Weighted Randomness

When selecting a user, the bot:

1. **Fetches recent history:** Looks at the last 20 selections in the channel
2. **Calculates weights:** Assigns each user a weight based on how recently they were selected
3. **Performs weighted selection:** Users with higher weights have better chances

### Weight Calculation

All users start with a **base weight of 100**.

For each appearance in the recent history, a penalty is applied:
- **Most recent selection:** -50 points (weight becomes 50)
- **2nd most recent:** -47.5 points (weight becomes 52.5)
- **3rd most recent:** -45 points (weight becomes 55)
- And so on... (penalty decreases by 2.5 per position)

**Minimum weight:** 1 (everyone always has at least a small chance)

### Example

Let's say we have 4 users and the last 5 selections were:
```
Most recent:  Alice
2nd:          Bob
3rd:          Alice
4th:          Charlie
5th:          Alice
```

Weight calculation:
- **Alice:** 100 - 50 (1st) - 45 (3rd) - 40 (5th) = **Weight: 1** (minimum)
- **Bob:** 100 - 47.5 (2nd) = **Weight: 52.5**
- **Charlie:** 100 - 42.5 (4th) = **Weight: 57.5**
- **David:** 100 (not in history) = **Weight: 100**

**Chances of being selected:**
- Alice: ~0.5% (very unlikely, was selected 3 times recently!)
- Bob: ~25%
- Charlie: ~27%
- David: ~47% (most likely, never selected before!)

## Benefits

✅ **Fair distribution:** Prevents the same person from being picked repeatedly
✅ **Still random:** Not round-robin - there's still an element of chance
✅ **Transparent:** Console logs show all weights before selection
✅ **Channel-specific:** History is tracked per channel independently
✅ **Graceful degradation:** Works even without database (falls back to pure random)

## Console Output

When selecting a user, you'll see logs like this:

```
🎯 User weights for fair selection:
  U12345ABC: weight=100 (selected 0 times recently)
  U67890DEF: weight=50 (selected 1 times recently)
  U11111GHI: weight=72.5 (selected 2 times recently)
✅ Selected U12345ABC using weighted randomness
```

This transparency helps debug and understand why certain users are selected.

## Technical Implementation

### Files Involved

- **`src/utils/threadUtils.js`**
  - `getRecentSelections(channelId, limit)` - Fetches history from database
  - `calculateUserWeights(users, recentSelections)` - Calculates weights
  - `selectRandomUser(users, channelId)` - Performs weighted selection

- **`src/handlers/appMentionHandler.js`**
  - Calls `selectRandomUser()` with `channelId` parameter

### Database Query

```javascript
await db('bot_usage')
  .where('channel_id', channelId)
  .orderBy('created_at', 'desc')
  .limit(20)
  .pluck('selected_user_id');
```

This efficiently fetches the last 20 selected user IDs for the channel.

### Algorithm Complexity

- **Time complexity:** O(n) where n is the number of eligible users
- **Space complexity:** O(h) where h is history size (default: 20)
- **Database queries:** 1 query per selection (cached results would be overkill here)

## Configuration

### History Depth

By default, the last **20 selections** are considered. This can be adjusted by changing the `limit` parameter in `getRecentSelections()`:

```javascript
const recentSelections = await getRecentSelections(channelId, 20); // Change 20 to desired depth
```

**Recommendation:** 
- Small teams (< 5 people): Use 10-15
- Medium teams (5-15 people): Use 20 (default)
- Large teams (> 15 people): Use 30-50

### Penalty Curve

The penalty decreases linearly by **2.5 points per position**. This can be adjusted in `calculateUserWeights()`:

```javascript
const penalty = Math.max(50 - (index * 2.5), 0); // Change 2.5 for different curve
```

**Steeper curve (faster forgiveness):** Increase from 2.5 to 5
**Gentler curve (longer memory):** Decrease from 2.5 to 1

### Maximum Penalty

The maximum penalty for the most recent selection is **-50 points** (50% reduction). Adjust in the same line:

```javascript
const penalty = Math.max(50 - (index * 2.5), 0); // Change 50 for different max penalty
```

## Fallback Behavior

If the database is not available or no channel ID is provided:

```javascript
if (!channelId) {
  console.log('⚠️  No channel ID provided, using simple random selection');
  const randomIndex = Math.floor(Math.random() * users.length);
  return users[randomIndex];
}
```

The bot falls back to **pure random selection** (equal chances for everyone).

## Privacy & Data

The selection history is stored in the `bot_usage` table:
- Channel ID (where selection happened)
- Selected user ID (who was picked)
- Timestamp (when it happened)
- Task description (what they have to do)

**No personal data** beyond Slack User IDs is stored. This is the same data already collected for statistics.

## Disabling Fair Selection

If you prefer pure random selection, you can:

1. **Remove the database:** Without database, it automatically falls back
2. **Modify the code:** Change `selectRandomUser()` to always use simple random
3. **Set all weights equal:** Modify `calculateUserWeights()` to return constant weights

Example for option 3:

```javascript
function calculateUserWeights(users, recentSelections) {
  const weights = new Map();
  users.forEach(userId => weights.set(userId, 100)); // All equal
  return weights;
}
```

## Performance Impact

- **Database query:** ~10-50ms (negligible)
- **Weight calculation:** < 1ms (simple arithmetic)
- **Selection algorithm:** < 1ms (single pass through users)

**Total overhead:** < 100ms - practically unnoticeable!

The user list caching (10 minutes) has a much bigger performance impact, saving hundreds of milliseconds on repeated requests.

## Future Enhancements

Possible improvements for the future:
- [ ] Configurable penalty curve via environment variables
- [ ] Different weights for channel mode vs thread mode
- [ ] "Cooldown" period where recently selected users are temporarily excluded
- [ ] Statistics showing fairness metrics (variance in selection counts)

## Testing

To test the fairness of the algorithm:

1. Run the bot with 3-5 test users
2. Trigger selections 50+ times in the same channel
3. Check statistics to see distribution
4. Verify that heavily selected users appear less frequently

Expected: Selection counts should be within ±20% of each other after 50+ selections.

---

**Questions or suggestions?** Open an issue on the repository!

