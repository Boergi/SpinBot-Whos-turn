/**
 * Create usage tracking table
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('bot_usage', function(table) {
    table.increments('id').primary();
    table.string('channel_id', 50).notNullable();
    table.string('channel_name', 255);
    table.string('thread_ts', 50).notNullable();
    table.string('user_id', 50).notNullable(); // User who invoked the bot
    table.string('selected_user_id', 50).notNullable(); // User who was selected
    table.text('task');
    table.integer('participants_count').unsigned().defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Indexes for better query performance
    table.index('channel_id');
    table.index('user_id');
    table.index('selected_user_id');
    table.index('created_at');
  });
};

/**
 * Drop usage tracking table
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('bot_usage');
};

