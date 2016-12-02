'use strict';

const express = require('express');
const router = express.Router(); // express.Router can be used to create modular, mountable route handlers. AKA mini app
const knex = require('../knex');
const boom = require('boom'); // error logging module
const morgan = require('morgan'); // req/res logging module
const {
    camelizeKeys,
    decamelizeKeys
} = require('humps'); // camel case module to properly format results for tests. special es6 syntax

router.use(morgan('short')); // use morgan and format it's output

// eslint-disable-next-line new-cap

router.get('/', function(req, res, next) {
    knex('books')
        .orderBy('title')
        .then((result) => {
            const book = camelizeKeys(result);
            res.send(book);
        })
        .catch((err) => {
            next(err);
        });
});


router.get('/:id', function(req, res, next) {
  console.log('hit');
    knex('books')
        .max('id')
        .then((result) => {
            // console.log(result[0]); // anonymous { max: 12 }
            // test for out of bounds and valid type id input
            if (req.params.id <= result[0].max && req.params.id > 0 && !isNaN(req.params.id)) {
                return knex('books')
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
            } else {
                next(boom.create(404, 'Not Found'));
                return;
            }
        });
});


router.post('/', (req, res, next) => {
    const bodyObj = {
      title: req.body.title,
      author: req.body.author,
      genre: req.body.genre,
      description: req.body.description,
      cover_url: req.body.coverUrl
    };
    var errObj = {
      title: boom.create(400, 'Title must not be blank'),
      author: boom.create(400, 'Author must not be blank'),
      genre: boom.create(400, 'Genre must not be blank'),
      description: boom.create(400, 'Description must not be blank'),
      cover_url: boom.create(400, 'Cover URL must not be blank')
    };
    for (var key in bodyObj) {
      if (!(bodyObj[key])) {
        next(errObj[key]);
        return;
      }
    }
   knex('books')
      .insert( bodyObj, '*')
      .then((result) => {
          const book = camelizeKeys(result[0]);
          res.send(book);
      })
      .catch((err) => {
          next(err);
      });
});



router.patch('/:id', (req, res, next) => {
    return knex('books')
        .max('id')
        .then((result) => {
            // check for out of bounds and valid type id input
            if (req.params.id <= result[0].max && req.params.id > 0 && !isNaN(req.params.id)) {
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
                        const book = camelizeKeys(result[0]);
                        res.send(book);
                    })
                    .catch((err) => {
                        next(err);
                    });
            } else {
                next(boom.create(404, 'Not Found'));
                return;
            }
        });
});



router.delete('/:id', (req, res, next) => {
    return knex('books')
        .max('id')
        .then((result) => {
            // check for out of bounds and valid type id input
            if (req.params.id <= result[0].max && req.params.id > 0 && !isNaN(req.params.id)) {
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
                    .then(() => {
                        delete book.id;
                        res.send(book);
                    })
                    .catch((err) => {
                        next(err);
                    });
            } else {
                next(boom.create(404, 'Not Found'));
                return;
            }
        });
});



module.exports = router;
