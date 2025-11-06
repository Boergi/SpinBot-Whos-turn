# Smart Message Parsing 💬

SpinBot uses intelligent message parsing to extract only the relevant task description from complex messages. This is especially useful when the bot is mentioned in messages that contain additional context or instructions.

## Problem

In many real-world scenarios, the bot mention appears in the middle of a longer message:

```
Please change the moderators: Berkant -> Boryana -> Florian -> Jannik -> Kai -> Lennart -> Lorena -> Maren -> Marvin -> Olli -> Tobi
@SpinBot, who moderates the Daily today?
Let's walk the board → Right ➡️ Left
1️⃣ What moved to ✅ DONE since the last Daily?
2️⃣ What's 🟡 ALMOST DONE (QA/CR/In Progress)?
3️⃣ Any 🚧 BLOCKERS or small hurdles?
4️⃣ Any 📋 UPDATES or ODLY topics?
```

**Without smart parsing,** the bot would process the entire message:
```
❌ "Please change the moderators: Berkant -> ... who moderates the Daily today Let's walk the board..."
```

**With smart parsing,** the bot extracts only the relevant part:
```
✅ "moderates the Daily today"
```

## How It Works

The parsing happens in **5 steps**:

### Step 1: Find the Bot Mention

```javascript
const mentionMatch = event.text.match(/<@[A-Z0-9]+>/);
if (mentionMatch) {
  const mentionIndex = event.text.indexOf(mentionMatch[0]);
  relevantText = event.text.substring(mentionIndex);
}
```

**Example:**
```
Input:  "Please change moderators: Alice -> Bob @SpinBot who moderates? Let's go!"
After:  "@SpinBot who moderates? Let's go!"
```

### Step 2: Cut at Question Mark

```javascript
const questionMarkIndex = relevantText.indexOf('?');
if (questionMarkIndex !== -1) {
  relevantText = relevantText.substring(0, questionMarkIndex);
}
```

**Example:**
```
Input:  "@SpinBot who moderates? Let's go!"
After:  "@SpinBot who moderates"
```

### Step 3: Remove Bot Mention Tag

```javascript
let task = relevantText.replace(/<@[A-Z0-9]+>/g, '').trim();
```

**Example:**
```
Input:  "@SpinBot who moderates"
After:  "who moderates"
```

### Step 4: Remove Leading Punctuation

```javascript
task = task.replace(/^[,\s]+/, '').trim();
```

This handles cases like `@SpinBot, who` (comma after mention).

**Example:**
```
Input:  ", who moderates"
After:  "who moderates"
```

### Step 5: Remove "who" or "wer"

```javascript
task = task.replace(/^(wer|who)\s+/i, '').trim();
```

**Example:**
```
Input:  "who moderates"
After:  "moderates"
```

### Final Result

```
🎲 @Username moderates the Daily today
```

## Examples

### Example 1: Complex Daily Message

**Input:**
```
Please change the moderators: Alice -> Bob -> Charlie
@SpinBot, who moderates the Daily today?
Let's walk the board → Right ➡️ Left
```

**Parsing steps:**
1. From mention: `@SpinBot, who moderates the Daily today? Let's walk...`
2. Cut at `?`: `@SpinBot, who moderates the Daily today`
3. Remove tag: `, who moderates the Daily today`
4. Remove comma: `who moderates the Daily today`
5. Remove "who": `moderates the Daily today`

**Output:**
```
🎲 @Username moderates the Daily today
```

### Example 2: Simple Thread Message

**Input:**
```
@SpinBot who has to get coffee?
```

**Parsing steps:**
1. From mention: `@SpinBot who has to get coffee?` (no change)
2. Cut at `?`: `@SpinBot who has to get coffee`
3. Remove tag: `who has to get coffee`
4. Remove comma: `who has to get coffee` (no comma)
5. Remove "who": `has to get coffee`

**Output:**
```
🎲 @Username has to get coffee
```

### Example 3: German with Extra Context

**Input:**
```
Heute ist Meeting-Tag!
@SpinBot wer muss das Protokoll schreiben?
Bitte pünktlich anfangen!
```

**Parsing steps:**
1. From mention: `@SpinBot wer muss das Protokoll schreiben? Bitte pünktlich...`
2. Cut at `?`: `@SpinBot wer muss das Protokoll schreiben`
3. Remove tag: `wer muss das Protokoll schreiben`
4. Remove comma: `wer muss das Protokoll schreiben` (no comma)
5. Remove "wer": `muss das Protokoll schreiben`

**Output:**
```
🎲 @Username muss das Protokoll schreiben
```

### Example 4: No Question Mark

**Input:**
```
@SpinBot wer macht heute sauber
```

**Parsing steps:**
1. From mention: `@SpinBot wer macht heute sauber` (no change)
2. Cut at `?`: `@SpinBot wer macht heute sauber` (no `?` found)
3. Remove tag: `wer macht heute sauber`
4. Remove comma: `wer macht heute sauber` (no comma)
5. Remove "wer": `macht heute sauber`

**Output:**
```
🎲 @Username macht heute sauber
```

## Benefits

✅ **Ignore preamble:** Text before the mention is automatically ignored
✅ **Ignore postamble:** Text after the `?` is automatically ignored
✅ **Clean output:** Removes "who/wer" and trailing `?` for natural language
✅ **Flexible format:** Works with or without commas, question marks, extra text
✅ **Multi-paragraph safe:** Only processes the relevant sentence

## Edge Cases

### Multiple Bot Mentions

If the message contains multiple bot mentions, only the **first one** is processed:

```
@SpinBot test 1 @SpinBot test 2
```

Result: Uses only `@SpinBot test 1`

### Multiple Question Marks

Only the **first** `?` is used as the cutoff:

```
@SpinBot who moderates? What about tomorrow?
```

Result: Uses only `who moderates`

### No Question Mark

If there's no `?`, the entire text from the mention onward is used:

```
@SpinBot who has to clean up
```

Result: `has to clean up` (works fine!)

### Empty Task

If nothing remains after parsing:

```
@SpinBot ?
```

Result: Uses default task `"has to complete the task"`

```javascript
if (!task) {
  task = 'has to complete the task';
}
```

## Technical Implementation

### Location

The parsing logic is in **`src/handlers/appMentionHandler.js`** (lines 20-49):

```javascript
// Extract task from message
// Step 1: Find the bot mention and extract everything from there
const mentionMatch = event.text.match(/<@[A-Z0-9]+>/);
let relevantText = event.text;

if (mentionMatch) {
  const mentionIndex = event.text.indexOf(mentionMatch[0]);
  relevantText = event.text.substring(mentionIndex);
}

// Step 2: Cut off everything after the first question mark
const questionMarkIndex = relevantText.indexOf('?');
if (questionMarkIndex !== -1) {
  relevantText = relevantText.substring(0, questionMarkIndex);
}

// Step 3: Remove the bot mention tag
let task = relevantText.replace(/<@[A-Z0-9]+>/g, '').trim();

// Step 4: Remove leading comma and whitespace
task = task.replace(/^[,\s]+/, '').trim();

// Step 5: Remove "wer" or "who" from the beginning
task = task.replace(/^(wer|who)\s+/i, '').trim();

// Default task if nothing is provided
if (!task) {
  task = 'has to complete the task';
}
```

### Slack Message Format

Slack sends bot mentions as special tags:
```
<@U12345ABCDE>
```

Where `U12345ABCDE` is the bot's user ID. The regex `/<@[A-Z0-9]+>/` matches this format.

### Case Insensitivity

The "who/wer" removal is **case-insensitive** (the `i` flag):

```javascript
task.replace(/^(wer|who)\s+/i, '').trim();
```

This means `Who`, `WHO`, `wer`, `WER`, `WeR` all work.

## Limitations

### Nested Questions

If the task description itself contains a `?`, it will be cut off:

```
@SpinBot who has to answer the question "Why is the sky blue?"
```

Result: `has to answer the question "Why is the sky blue"` ❌

**Workaround:** Don't use `?` inside the task description, or place it after the `?`:

```
@SpinBot who has to answer the question about the sky?
More details: "Why is the sky blue?"
```

### Multiple Languages Mixed

If both "who" and "wer" appear, only the first one is removed:

```
@SpinBot who wer has to do this
```

Result: `wer has to do this` (only first "who" removed)

This is unlikely in practice but technically possible.

## Configuration

### Allowed Question Marks

Currently, only `?` (standard question mark) is recognized. You could extend this to support other punctuation:

```javascript
// Support both ? and ! as cutoff
const cutoffIndex = Math.min(
  relevantText.indexOf('?') !== -1 ? relevantText.indexOf('?') : Infinity,
  relevantText.indexOf('!') !== -1 ? relevantText.indexOf('!') : Infinity
);
```

### Additional Language Support

To support more languages, extend the regex:

```javascript
// Add French "qui" and Spanish "quién"
task = task.replace(/^(wer|who|qui|quién)\s+/i, '').trim();
```

### Custom Punctuation Cleanup

To remove additional punctuation (e.g., leading dashes):

```javascript
// Remove leading comma, whitespace, and dashes
task = task.replace(/^[,\s\-]+/, '').trim();
```

## Testing

### Manual Testing

Send these test messages to verify parsing:

1. **Complex message:**
   ```
   Some context here
   @SpinBot who does task?
   More context here
   ```
   Expected: `does task`

2. **No question mark:**
   ```
   @SpinBot wer macht das
   ```
   Expected: `macht das`

3. **Comma after mention:**
   ```
   @SpinBot, who is next
   ```
   Expected: `is next`

4. **Empty task:**
   ```
   @SpinBot ?
   ```
   Expected: `has to complete the task` (default)

### Automated Testing

You could add unit tests for the parsing logic:

```javascript
describe('Message Parsing', () => {
  it('should extract text between mention and ?', () => {
    const input = 'Context @SpinBot who moderates? More context';
    const result = parseMessage(input);
    expect(result).toBe('moderates');
  });
  
  // Add more test cases...
});
```

## Debugging

The bot logs the parsed task for debugging:

```javascript
console.log(`Mention received: channel=${channelId}, thread=${threadTs}, task="${task}"`);
```

Check the console output to see what task was extracted.

---

**Questions or suggestions?** Open an issue on the repository!

