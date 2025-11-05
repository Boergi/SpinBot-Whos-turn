/**
 * Slash Command Handler
 */

/**
 * Handle /spinbot slash command
 */
async function handleSlashCommand({ command, ack, say }) {
  await ack();
  
  await say({
    text: '💡 *Tip:* Slash commands don\'t work in threads. Instead, mention me in a thread like this:\n`@SpinBot who has to pre-order lunch?`\nor\n`@SpinBot wer muss essen vorbestellen?`',
    thread_ts: command.message_ts,
  });
}

module.exports = {
  handleSlashCommand,
};

