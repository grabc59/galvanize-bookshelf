'use strict';

const express = require('express');
var route = express.Router();
// var bcrypt = require('bcrypt');

// eslint-disable-next-line new-cap
const router = express.Router();

// YOUR CODE HERE
// Matts example code, might be useful example of error handling
// route.use(function (req,res,next) {
//   if (!req.user) {
//     res.sendStatus(401)
//   } else {
//     next();
//   }
// });

// books GET for reference
// router.get('/', function(req, res, next) {
//     knex('books')
//         .orderBy('title')
//         .then((result) => {
//             const book = camelizeKeys(result);
//             res.send(book);
//         })
//         .catch((err) => {
//             next(err);
//         });
// });

router.get('/', function (req, res, next) {
  res.send(false);  
});

module.exports = router;
