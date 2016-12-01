'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function(table) {
    // id
    table.increments();
    // first name
    table.string('first_name').notNullable().defaultTo('');
    // last name
    table.string('last_name').notNullable().defaultTo('');
    // email
    table.string('email').notNullable().unique();
    // hashed password
    table.specificType('hashed_password', 'char(60)').notNullable();
    // created_at, updated_at
    table.timestamps(true, true);
  });
};

exports.down = function(knex, Promise) {

};
