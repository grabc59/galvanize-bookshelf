  'use strict';

  const express = require('express');
  var route = express.Router();
  // var bcrypt = require('bcrypt');

  // eslint-disable-next-line new-cap
  const router = express.Router();
  const knex = require('../knex');
  const boom = require('boom'); // error logging module
  const morgan = require('morgan'); // req/res logging module
  const {camelizeKeys,decamelizeKeys} = require('humps'); // camel case module to properly format results for tests. special es6 syntax
  const bcrypt = require('bcrypt'); // password hashing module
  const jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
  const privateKey = 'my_awesome_cookie_signing_key';


  router.use(morgan('short')); // use morgan and format it's output

  // GET
  router.get('/', function (req, res, next) {
    jwt.verify(req.cookies.token, privateKey, function(err, decoded) {
      if (err) {
        res.send(false);
      } else {
        // console.log(decoded); jkrowling@gmail.com
        res.send(true);
      }
    });
  });

// POST
router.post('/', (req, res, next) => {
    // easier access to properties that we are interested in
    const bodyObj = {
      email: req.body.email,
      password: req.body.password
    };

    // POST INPUT VALIDATION
    var errObj = {
      email: boom.create(400, 'Email must not be blank'),
      password: boom.create(400, 'Password must not be blank')
    };
    for (var key in bodyObj) {
      if (!(bodyObj[key])) {
        next(errObj[key]);
        return;
      }
    }
  // compare input to database
   knex('users')
      .where( 'email', bodyObj.email )
      .first()
      .then((result) => {
        if (result) {
          if ( bcrypt.compareSync(bodyObj.password, result.hashed_password )) {
            delete result.hashed_password;
            delete result.created_at;
            var authenticated_user = camelizeKeys(result);
            var token = jwt.sign(req.body.email, privateKey);
            res.cookie('token', token, { httpOnly: true }).send(authenticated_user);
          } else {
            // bad password (says email or password to satisfy the test)
            next(boom.create(400, 'Bad email or password'));
          }
        } else {
          // bad email (says email or password to satisfy the test)
          next(boom.create(400, 'Bad email or password'));
        }
      })
      .catch((err) => {
          next(err);
      });
});

// DELETE
router.delete('/', (req, res, next) => {
  res.clearCookie('token').send(true);
});



  module.exports = router;
