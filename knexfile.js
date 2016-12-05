'use strict';

module.exports = {
  development: {
    client: 'pg',
    connection: 'postgres://localhost/bookshelf_dev',
    pool: {
      min: 0,
      max: 7
    }
  },

  test: {
    client: 'pg',
    connection: 'postgres://localhost/bookshelf_test',
    pool: {
      min: 0,
      max: 7
    }
  },

  production: {}
};
