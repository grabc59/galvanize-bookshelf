'use strict';

const express = require('express');
// eslint-disable-next-line new-cap
const router = express.Router();
const knex = require('../knex');
const boom = require('boom'); // error logging module
const morgan = require('morgan'); // req/res logging module
router.use(morgan('short')); // use morgan and format it's output
const {
    camelizeKeys,
    decamelizeKeys
} = require('humps');
var bcrypt = require('bcrypt');


router.post('/users', (req, res, next) => {
  const {
      firstName,
      lastName,
      email,
      password
  } = req.body;

  var errObj = {
      emailBlank: boom.create(400, 'Email must not be blank'),
      password: boom.create(400, 'Password must be at least 8 characters long')
  };


  if (email && password) {
    if (password.length > 7) {
    knex('users')
      .where({email: email})
      .then(function (results) {
        if (results.length === 0) {
            knex('users')
                .insert({
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                    hashed_password: bcrypt.hashSync(password, 8)
                }, '*')
                .then((result) => {
                    const user = camelizeKeys(result[0]);
                    delete user.hashedPassword;
                    res.send(user);
                })
                .catch((err) => {
                    next(err);
                });

            } else {
              next(boom.create(400, 'Email already exists'));
              return;
            }
          });
        } else {
              next(boom.create(400, 'Password must be at least 8 characters long'));
              return;
        }
      } else {
        if (!email) {
            next(boom.create(400, 'Email must not be blank'));
            return;
        } else if (!password) {
          next(boom.create(400, 'Password must be at least 8 characters long'));
          return;
        }
      }
});

module.exports = router;
