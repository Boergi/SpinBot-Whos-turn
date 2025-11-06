# Performance Optimizations ⚡

SpinBot is optimized for fast response times and minimal API usage. This document explains the performance features and their impact.

## User List Caching

### Problem

Every time the bot needs to check user information (status, bot flag, deleted state), it must fetch the complete user list from the Slack API. For workspaces with hundreds of users, this can be slow:

- **API call time:** 200-1000ms depending on workspace size
- **Rate limits:** Slack limits API calls per minute
- **Redundant calls:** Multiple bot invocations within minutes fetch the same data

### Solution: 10-Minute Cache

The user list is cached in memory for **10 minutes**:

```javascript
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
let usersCache = {
  data: null,      // Map of userId -> user object
  timestamp: null, // When cache was last updated
};
```

### How It Works

1. **First request:** Fetches user list from Slack API (slow)
2. **Cache storage:** Stores result in memory with timestamp
3. **Subsequent requests:** Uses cached data (fast!)
4. **Cache expiry:** After 10 minutes, fetches fresh data

### Implementation

Located in **`src/utils/channelUtils.js`**:

```javascript
async function getAllUsers(client) {
  const now = Date.now();
  
  // Check if cache is still valid
  if (usersCache.data && usersCache.timestamp && (now - usersCache.timestamp) < CACHE_DURATION) {
    const cacheAge = Math.round((now - usersCache.timestamp) / 1000);
    console.log(`📦 Using cached users list (${cacheAge}s old, ${usersCache.data.size} users)`);
    return usersCache.data;
  }
  
  // Cache expired or doesn't exist - fetch fresh data
  console.log('🔄 Fetching fresh users list from Slack API...');
  const usersMap = await fetchUsersFromSlack(client);
  
  // Update cache
  usersCache.data = usersMap;
  usersCache.timestamp = now;
  
  return usersMap;
}
```

### Console Output

**First request (cache miss):**
```
🔄 Fetching fresh users list from Slack API...
✅ Loaded 127 users with profiles (cached for 10 minutes)
```

**Subsequent requests (cache hit):**
```
📦 Using cached users list (45s old, 127 users)
```

**After expiry (10+ minutes):**
```
🔄 Fetching fresh users list from Slack API...
✅ Loaded 128 users with profiles (cached for 10 minutes)
```

### Performance Impact

| Scenario | Before Caching | After Caching | Improvement |
|----------|---------------|---------------|-------------|
| 50 users | ~300ms | ~2ms | **150x faster** |
| 200 users | ~800ms | ~2ms | **400x faster** |
| 500 users | ~2000ms | ~2ms | **1000x faster** |

**API calls reduced:** From potentially hundreds per hour to just **6 per hour** (one every 10 minutes).

### Cache Invalidation

#### Automatic Expiry

The cache automatically expires after 10 minutes. This ensures:
- ✅ New users joining the workspace appear within 10 minutes
- ✅ Status changes (vacation emoji, etc.) are reflected within 10 minutes
- ✅ Deleted users are removed from selection within 10 minutes

#### Manual Cache Clearing

You can manually clear the cache:

```javascript
const { clearUsersCache } = require('./src/utils/channelUtils');
clearUsersCache();
```

This is useful for:
- Testing
- Debugging
- Forcing immediate refresh after workspace changes

Console output:
```
🗑️  Users cache cleared
```

### Cache Scope

The cache is **global** across all channels:
- ✅ **Benefit:** Single cache for entire workspace (more efficient)
- ⚠️ **Tradeoff:** Not per-channel (but user data is workspace-wide anyway)

### Memory Usage

For a typical workspace:
- **50 users:** ~50 KB
- **200 users:** ~200 KB
- **1000 users:** ~1 MB

**Conclusion:** Memory usage is negligible even for large workspaces.

## Batch User Fetching

Instead of fetching user information one by one, the bot fetches **all users in one batch** and stores them in a Map for O(1) lookup.

### Before (Individual Lookups)

```javascript
// ❌ Bad: N API calls for N users
for (const userId of userIds) {
  const user = await client.users.info({ user: userId });
  if (!user.is_bot) {
    validUsers.push(userId);
  }
}
```

**Time:** O(n) API calls = 100-1000ms per user!

### After (Batch Lookup)

```javascript
// ✅ Good: 1 API call for all users, then O(1) lookups
const usersMap = await getAllUsers(client); // Cached!

for (const userId of userIds) {
  const user = usersMap.get(userId); // O(1) lookup
  if (!user.is_bot) {
    validUsers.push(userId);
  }
}
```

**Time:** 1 API call (or cache hit) + O(1) lookups = 2ms!

## Usage Statistics Query Optimization

The fair selection algorithm queries the database for recent selections:

```javascript
const recentSelections = await db('bot_usage')
  .where('channel_id', channelId)
  .orderBy('created_at', 'desc')
  .limit(20)
  .pluck('selected_user_id');
```

### Database Indexes

The migration creates indexes for fast queries:

```javascript
table.index('channel_id');
table.index('created_at');
```

**Impact:**
- Without indexes: ~100-500ms (table scan)
- With indexes: ~5-20ms (index lookup)

### Query Optimization

The query is optimized to fetch only what's needed:
- ✅ **WHERE clause:** Filters by channel_id (indexed)
- ✅ **ORDER BY:** Sorts by created_at (indexed)
- ✅ **LIMIT 20:** Returns only recent records
- ✅ **PLUCK:** Returns only selected_user_id (not full rows)

## Socket Mode vs HTTP Mode

SpinBot uses **Socket Mode** (WebSocket) instead of HTTP webhooks:

### Benefits

✅ **No public server needed:** Bot runs behind firewall
✅ **Real-time:** Instant message delivery
✅ **Connection reuse:** WebSocket stays open (no handshake overhead)
✅ **Lower latency:** ~50-100ms vs ~200-400ms for HTTP

### Tradeoff

⚠️ **Persistent connection:** Must keep process running (use PM2 or systemd)

## Overall Performance

### Response Time Breakdown

For a typical bot invocation in a channel with 100 users:

| Step | Time (First Request) | Time (Cached) |
|------|---------------------|---------------|
| WebSocket receive | 50ms | 50ms |
| Fetch user list | 500ms | **2ms** ⚡ |
| Filter by status | 5ms | 5ms |
| Database query | 10ms | 10ms |
| Weighted selection | 1ms | 1ms |
| Send response | 100ms | 100ms |
| **Total** | ~666ms | **168ms** |

**Improvement:** ~75% faster with cache! 🚀

### Rate Limit Considerations

Slack imposes rate limits on API calls:
- **Tier 1 methods** (users.list): 20 requests per minute
- **Tier 2 methods** (conversations.members): 60 requests per minute

**Without caching:** 1 bot invocation = 1 users.list call
- Max: 20 invocations per minute

**With caching (10 min):** 1 users.list call serves many invocations
- Max: Effectively unlimited (limited by other factors)

## Configuration

### Cache Duration

To change the cache duration, edit **`src/utils/channelUtils.js`**:

```javascript
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Examples:
const CACHE_DURATION = 5 * 60 * 1000;   // 5 minutes (more fresh data)
const CACHE_DURATION = 30 * 60 * 1000;  // 30 minutes (less API calls)
const CACHE_DURATION = 60 * 1000;       // 1 minute (nearly real-time)
```

**Recommendations:**
- **Small workspace (< 50 users):** 5 minutes (status changes matter more)
- **Medium workspace (50-200 users):** 10 minutes (default, good balance)
- **Large workspace (> 200 users):** 15-30 minutes (reduce API load)

### History Depth

The fair selection algorithm looks at the last 20 selections by default. To change this:

```javascript
const recentSelections = await getRecentSelections(channelId, 20); // Change 20
```

**Performance impact:** Minimal (database query with LIMIT is fast)

## Monitoring Performance

### Enable Detailed Logging

The bot already logs cache hits/misses. For more details, add timing logs:

```javascript
const start = Date.now();
const usersMap = await getAllUsers(client);
const duration = Date.now() - start;
console.log(`⏱️  Fetched users in ${duration}ms`);
```

### Database Query Performance

Monitor slow queries:

```javascript
const start = Date.now();
const recentSelections = await getRecentSelections(channelId);
const duration = Date.now() - start;
if (duration > 50) {
  console.warn(`⚠️  Slow database query: ${duration}ms`);
}
```

### Memory Monitoring

Check cache size:

```javascript
const cacheSize = usersCache.data ? usersCache.data.size : 0;
console.log(`📊 Cache: ${cacheSize} users in memory`);
```

## Best Practices

✅ **Don't clear cache unnecessarily:** Let it expire naturally
✅ **Monitor logs:** Watch for slow API calls or database queries
✅ **Use indexes:** Ensure database indexes exist (run migrations!)
✅ **Socket Mode:** Keep WebSocket connection stable (use PM2)
✅ **Database connection pooling:** Knex handles this automatically

## Troubleshooting

### Cache Not Working

**Symptom:** Every request shows "🔄 Fetching fresh users list..."

**Causes:**
1. Cache duration is too short
2. Bot is restarting frequently (cache is in-memory)
3. Multiple bot instances running (each has its own cache)

**Solution:**
- Check `CACHE_DURATION` value
- Use PM2 or systemd to keep bot running
- Run only one bot instance per workspace

### Slow Database Queries

**Symptom:** Selection takes > 1 second

**Causes:**
1. Database indexes missing
2. Large `bot_usage` table (millions of rows)
3. Database server is slow or far away

**Solution:**
1. Run migrations: `npm run migrate`
2. Add database cleanup job (delete old records)
3. Use local database or optimize connection

### High Memory Usage

**Symptom:** Bot process uses several GB of RAM

**Cause:** Likely not the cache (cache is < 1 MB)

**Solution:**
- Check for memory leaks in other code
- Monitor Node.js heap size
- Restart bot periodically (PM2 can do this)

## Future Optimizations

Possible improvements for the future:

- [ ] Redis cache for multi-instance deployments
- [ ] Selective cache invalidation (only refresh changed users)
- [ ] Background cache refresh (proactive updates before expiry)
- [ ] Compressed cache storage (smaller memory footprint)
- [ ] CDN-style TTL headers from Slack API (respect upstream cache hints)

---

**Questions or suggestions?** Open an issue on the repository!

