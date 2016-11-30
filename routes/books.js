'use strict';

const express = require('express');
const router = express.Router(); // express.Router can be used to create modular, mountable route handlers. AKA mini app
const knex = require('../knex');
// const boom = require('boom'); // error logging module
const morgan = require('morgan'); // req/res logging module
const { camelizeKeys, decamelizeKeys } = require('humps'); // camel case module to properly format results for tests. special es6 syntax

router.use(morgan('short')); // use morgan and format it's output



// eslint-disable-next-line new-cap


router.get('/books', function(req, res, next) {
  knex('books')
    .orderBy('title')
    .then((result) => {
      const book = camelizeKeys(result);
      res.send(book);
      // res.send(result);
    })
    .catch((err) => {
      next(err);
    });
});


router.get('/books/:id', function(req,res, next) {
  knex('books')
    .where('id', req.params.id)
    .first()
    .then((result) => {
      if (!result) {
        return next();
      }
      const book = camelizeKeys(result);
      res.send(book);
    })
    .catch((err) => {
      next(err);
    });
});


router.post('/books', (req,res,next) => {
   knex('books')
    .insert({
      title: req.body.title,
      author: req.body.author,
      genre: req.body.genre,
      description: req.body.description,
      cover_url: req.body.coverUrl
    }, '*')
    .then((result) => {
      // console.log(result[0]);
      // console.log(req.body); // NOT THIS
      const book = camelizeKeys(result[0]);
      res.send(book);
   })
     .catch((err) => {
     next(err);
   });
});



router.patch('/books/:id', (req, res, next) => {
  return knex('books')
    .where('id', req.params.id)
    .first()
    .update({
      title: req.body.title,
      author: req.body.author,
      genre: req.body.genre,
      description: req.body.description,
      cover_url: req.body.coverUrl
    }, '*')
    .then((result) => {
      // console.log(result);
      const book = camelizeKeys(result[0]);
      res.send(book);
    })
    .catch((err) => {
      next(err);
    });
});

router.delete('/books/:id', (req, res, next) => {
  let book;
  knex('books')
  .where('id', req.params.id)
  .first()
  .then((result) => {
    if (!result) {
      return next();
    }
    book = camelizeKeys(result);
    return knex('books')
      .del()
      .where('id', req.params.id);
  })
  .then (() => {
    delete book.id;
    res.send(book);
  })
  .catch((err) => {
    next(err);
  });
});



module.exports = router;
