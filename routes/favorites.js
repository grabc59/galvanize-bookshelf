'use strict';

const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const privateKey = 'my_awesome_cookie_signing_key';
const knex = require('../knex');
const boom = require('boom'); // error logging module
const morgan = require('morgan'); // req/res logging module
const {
    camelizeKeys,
    decamelizeKeys
} = require('humps'); // camel case module to properly format results for tests. special es6 syntax

// YOUR CODE HERE
router.get('/', function(req, res, next) {
    jwt.verify(req.cookies.token, privateKey, function(err, decoded) {
        if (err) {
          next(boom.create(401, 'Unauthorized'));
          return;
        } else {
            console.log(decoded); // jkrowling@gmail.com
            knex('favorites')
                .join('users', 'favorites.user_id', '=', 'users.id')
                .join('books', 'favorites.book_id', '=', 'books.id')
                .select('favorites.id', 'favorites.book_id', 'favorites.user_id', 'books.created_at', 'books.updated_at', 'books.title', 'books.author', 'books.genre', 'books.description', 'books.cover_url')
                .where('users.email', decoded)
                .then((result) => {
                    res.send(camelizeKeys(result));
                });
        }
    });
});

// '/favorites/check?bookId=1'
router.get('/check', function(req, res, next) {
    // decode the token
    // console.log(req.cookies.token);
    jwt.verify(req.cookies.token, privateKey, function(err, decoded) {
        if (err) {
          next(boom.create(401, 'Unauthorized'));
          return;
        } else {
            // check the db for favorites matching the user
            // console.log(decoded); jkrowling@gmail.com
            knex('favorites')
                .join('users', 'favorites.user_id', '=', 'users.id')
                .join('books', 'favorites.book_id', '=', 'books.id')
                .select('favorites.id', 'favorites.book_id', 'favorites.user_id', 'books.created_at', 'books.updated_at', 'books.title', 'books.author', 'books.genre', 'books.description', 'books.cover_url')
                .where('users.email', decoded)
                .where('books.id', req.query.bookId)
                .then((result) => {
                    if (result.length > 0) {
                        // res.send(camelizeKeys(result));
                        res.send(true);

                    } else {
                        res.send(false);
                    }
                });
        }
    });
});



//req body { "bookId": 2 }
router.post('/', (req, res, next) => {
    // decode the token to find the username
    jwt.verify(req.cookies.token, privateKey, function(err, decoded) {
        if (err) {
          next(boom.create(401, 'Unauthorized'));
          return;
        } else {
            // query 'users' for the username that submitted the favorite 'post' request
            knex('users')
                .select('users.id')
                .where('users.email', decoded)
                .first()
                .then((result) => {
                    if (result.id) {
                        var newFavorite = {
                            book_id: req.body.bookId,
                            user_id: result.id
                        };
                        // insert the book to the favorites table
                        return knex('favorites')
                            .insert(newFavorite, '*')
                            .then((insertResult) => {
                                delete insertResult[0].created_at;
                                delete insertResult[0].updated_at;
                                const book = camelizeKeys(insertResult[0]);
                                res.send(book);
                            });
                    } else {
                        next(err);
                    }
                })
                .catch((err) => {
                    next(err);
                });
        }
    });
});


// req.body { "bookId": 1 }
// res body { "bookId": 1, "userId": 1, ... }
router.delete('/', function(req, res, next) {
    // decode the token to find the username
    jwt.verify(req.cookies.token, privateKey, function(err, decoded) {
        if (err) {
          next(boom.create(401, 'Unauthorized'));
          return;
        } else {
            // query 'users' for the username that submitted the favorite 'post' request
            knex('users')
                .select('users.id')
                .where('users.email', decoded)
                .first()
                .then((result) => {
                  // console.log(result); // { id: 1 }
                    if (result.id) {
                        let book;
                        // delete the book from the favorites table
                        return knex('favorites')
                          .where('user_id', result.id)
                          .where('book_id', req.body.bookId)
                          .then((favorite) => {
                              if (favorite[0].id) {
                                book = camelizeKeys(favorite[0]);
                                return knex('favorites')
                                  .del()
                                  .where('id', favorite[0].id);
                              } else {
                                return next();
                              }
                              // delete deleteResult[0].created_at;
                              // delete deleteResult[0].updated_at;
                              // const book = camelizeKeys(deleteResult[0]);
                              // res.send(book);
                          })
                          .then(() => {
                            delete book.id;
                            res.send(book);
                          });
                    } else {
                        next(err);
                    }
                })
                .catch((err) => {
                    next(err);
                });
        }
    });
});



module.exports = router;
