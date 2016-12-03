'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('favorites', function(table) {
    // id
    table.increments();
    // book_id
    table.integer('book_id').notNullable().references('books.id').onDelete('CASCADE').index();
    // user_id
    table.integer('user_id').notNullable().references('users.id').onDelete('CASCADE').index();
    // created_at, updated_at
    table.timestamps(true, true);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('favorites');
};
