/**
 * Initial database schema migration
 * Creates all tables for E-PGW application
 */

exports.up = function(knex) {
  return knex.schema
    // Users table
    .createTable('users', table => {
      table.increments('id').primary();
      table.string('email').unique().notNullable();
      table.string('password').notNullable();
      table.string('name').notNullable();
      table.string('role').defaultTo('client');
      table.string('user_role').defaultTo('client');
      table.integer('client_id').references('id').inTable('clients').onDelete('SET NULL');
      table.string('initials');
      table.string('avatar');
      table.string('status').defaultTo('offline');
      table.timestamp('last_seen');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    })

    // Clients table
    .createTable('clients', table => {
      table.increments('id').primary();
      table.string('first_name').notNullable();
      table.string('last_name').notNullable();
      table.string('company_name');
      table.string('email');
      table.string('phone');
      table.string('pesel');
      table.string('nip');
      table.string('address_street');
      table.string('address_city');
      table.string('address_postal');
      table.string('address_country').defaultTo('Polska');
      table.text('notes');
      table.string('status').defaultTo('active');
      table.integer('assigned_to').references('id').inTable('users');
      table.integer('created_by').notNullable();
      table.integer('updated_by');
      table.text('custom_fields');
      table.timestamps(true, true);
    })

    // Cases table
    .createTable('cases', table => {
      table.increments('id').primary();
      table.integer('client_id').notNullable().references('id').inTable('clients');
      table.string('case_number').unique().notNullable();
      table.string('title').notNullable();
      table.text('description');
      table.string('case_type').notNullable();
      table.string('case_subtype');
      table.string('status').defaultTo('open');
      table.string('priority').defaultTo('medium');
      table.string('court_name');
      table.string('court_id');
      table.string('court_signature');
      table.string('court_address');
      table.string('court_phone');
      table.string('court_email');
      table.string('court_website');
      table.text('court_coordinates');
      table.string('court_type');
      table.string('court_department');
      table.string('judge_name');
      table.string('referent');
      table.string('prosecutor_id');
      table.string('prosecutor_name');
      table.string('prosecutor_office');
      table.string('prosecutor_address');
      table.string('prosecutor_phone');
      table.string('prosecutor_email');
      table.string('prosecutor_website');
      table.string('auxiliary_prosecutor');
      table.string('indictment_number');
      table.string('police_id');
      table.string('police_case_number');
      table.string('police_address');
      table.string('police_phone');
      table.string('police_email');
      table.string('police_website');
      table.string('investigation_authority');
      table.string('opposing_party');
      table.decimal('value_amount', 15, 2);
      table.string('value_currency').defaultTo('PLN');
      table.integer('assigned_to').references('id').inTable('users');
      table.integer('additional_caretaker').references('id').inTable('users');
      table.integer('case_manager_id').references('id').inTable('users');
      table.integer('created_by').notNullable();
      table.string('access_password');
      table.boolean('is_collective').defaultTo(false);
      table.text('custom_fields');
      table.timestamp('closed_at');
      table.timestamps(true, true);
    })

    // Documents table
    .createTable('documents', table => {
      table.increments('id').primary();
      table.integer('case_id').notNullable().references('id').inTable('cases');
      table.integer('client_id').references('id').inTable('clients');
      table.integer('event_id').references('id').inTable('events');
      table.string('document_code');
      table.string('title').notNullable();
      table.text('description');
      table.string('file_name').notNullable();
      table.string('file_path').notNullable();
      table.integer('file_size');
      table.string('file_type');
      table.string('category');
      table.text('metadata');
      table.integer('uploaded_by').notNullable();
      table.timestamp('uploaded_at').defaultTo(knex.fn.now());
    })

    // Notes table
    .createTable('notes', table => {
      table.increments('id').primary();
      table.integer('case_id').references('id').inTable('cases');
      table.integer('client_id').references('id').inTable('clients');
      table.string('title');
      table.text('content').notNullable();
      table.string('note_type').defaultTo('general');
      table.boolean('is_important').defaultTo(false);
      table.integer('created_by').notNullable();
      table.timestamps(true, true);
    })

    // Events table
    .createTable('events', table => {
      table.increments('id').primary();
      table.integer('case_id').references('id').inTable('cases');
      table.integer('client_id').references('id').inTable('clients');
      table.string('event_code');
      table.string('title').notNullable();
      table.text('description');
      table.string('event_type').notNullable();
      table.string('location');
      table.timestamp('start_date').notNullable();
      table.timestamp('end_date');
      table.integer('reminder_minutes').defaultTo(60);
      table.boolean('is_all_day').defaultTo(false);
      table.string('status').defaultTo('scheduled');
      table.text('extra_fields');
      table.integer('created_by').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })

    // Chat messages
    .createTable('chat_messages', table => {
      table.increments('id').primary();
      table.integer('sender_id').notNullable().references('id').inTable('users');
      table.integer('receiver_id').notNullable().references('id').inTable('users');
      table.text('message').notNullable();
      table.text('attachments');
      table.boolean('read').defaultTo(false);
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })

    // Case comments
    .createTable('case_comments', table => {
      table.increments('id').primary();
      table.integer('case_id').notNullable().references('id').inTable('cases');
      table.integer('user_id').notNullable().references('id').inTable('users');
      table.integer('parent_comment_id').references('id').inTable('case_comments');
      table.text('content').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })

    // Case witnesses
    .createTable('case_witnesses', table => {
      table.increments('id').primary();
      table.integer('case_id').notNullable().references('id').inTable('cases');
      table.string('witness_code');
      table.string('first_name').notNullable();
      table.string('last_name').notNullable();
      table.string('side').defaultTo('neutral');
      table.string('relation_to_case').defaultTo('neutral');
      table.string('contact_phone');
      table.string('contact_email');
      table.text('address');
      table.string('status').defaultTo('confirmed');
      table.timestamp('withdrawal_date');
      table.text('withdrawal_reason');
      table.integer('reliability_score').defaultTo(5);
      table.text('notes');
      table.integer('created_by').notNullable();
      table.timestamps(true, true);
    })

    // Payments
    .createTable('payments', table => {
      table.increments('id').primary();
      table.integer('case_id').references('id').inTable('cases');
      table.integer('client_id').references('id').inTable('clients');
      table.string('payment_code');
      table.decimal('amount', 15, 2).notNullable();
      table.string('currency').defaultTo('PLN');
      table.string('payment_type');
      table.string('status').defaultTo('pending');
      table.text('description');
      table.timestamp('due_date');
      table.timestamp('paid_at');
      table.integer('created_by').notNullable();
      table.timestamps(true, true);
    })

    // Sessions
    .createTable('sessions', table => {
      table.increments('id').primary();
      table.integer('user_id').notNullable().references('id').inTable('users');
      table.string('token').unique().notNullable();
      table.timestamp('expires_at').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })

    // Login sessions (audit)
    .createTable('login_sessions', table => {
      table.increments('id').primary();
      table.integer('user_id').notNullable().references('id').inTable('users');
      table.string('ip_address');
      table.string('user_agent');
      table.timestamp('login_at').defaultTo(knex.fn.now());
      table.timestamp('logout_at');
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('login_sessions')
    .dropTableIfExists('sessions')
    .dropTableIfExists('payments')
    .dropTableIfExists('case_witnesses')
    .dropTableIfExists('case_comments')
    .dropTableIfExists('chat_messages')
    .dropTableIfExists('events')
    .dropTableIfExists('notes')
    .dropTableIfExists('documents')
    .dropTableIfExists('cases')
    .dropTableIfExists('clients')
    .dropTableIfExists('users');
};
