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

    knex('users')
        .insert({
            first_name: req.body.firstName,
            last_name: req.body.lastName,
            email: req.body.email,
            hashed_password: bcrypt.hashSync(req.body.password, 8)
        }, '*')
        .then((result) => {
            const user = camelizeKeys(result[0]);
            delete user.hashedPassword;
            res.send(user);
        })
        .catch((err) => {
            next(err);
        });
});

module.exports = router;
