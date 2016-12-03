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

// router.post('/', (req, res, next) => {
//     const bodyObj = {
//       title: req.body.title,
//       author: req.body.author,
//       genre: req.body.genre,
//       description: req.body.description,
//       cover_url: req.body.coverUrl
//     };
//     var errObj = {
//       title: boom.create(400, 'Title must not be blank'),
//       // title: 'Title must not be blank',
//       author: boom.create(400, 'Author must not be blank'),
//       // author: 'Author must not be blank',
//       genre: boom.create(400, 'Genre must not be blank'),
//       // genre: 'Genre must not be blank',
//       description: boom.create(400, 'Description must not be blank'),
//       // description: 'Description must not be blank',
//       cover_url: boom.create(400, 'Cover URL must not be blank')
//       // cover_url: 'Cover URL must not be blank',
//     };
//     for (var key in bodyObj) {
//       if (!(bodyObj[key])) {
//         next(errObj[key]);
//         return;
//       }
//     }
//    knex('books')
//       .insert( bodyObj, '*')
//       .then((result) => {
//           const book = camelizeKeys(result[0]);
//           res.send(book);
//       })
//       .catch((err) => {
//           next(err);
//       });
// });


router.post('/users', (req, res, next) => {
  const {
      firstName,
      lastName,
      email,
      password
  } = req.body;
  // const bodyObj = {
  //       firstName: req.body.firstName,
  //       lastName: req.body.firstName,
  //       email: req.body.email,
  //       password: req.body.password,
  //     };


  if (email && password) {
    if (password.length > 7) {
    knex('users')
      .where({email: email})
      .then(function (results) {

        console.log(results);
        if (results.length === 0) {
          // console.log(results);
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
