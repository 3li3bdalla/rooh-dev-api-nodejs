'use strict';

const multipart = require('connect-multiparty');
const multipartMiddleware =   multipart();


// npm modules
const express = require('express'),
    validator = require('express-joi-validator');

// router
const router = express.Router();

// local modules
const controller = require('./controller');


// admin routes without login
router.post('/login', controller.login);

// admin routes with login
require('../../auth').adminAuth_Fn(router);
router.get('/details', controller.details);
router.post('/uploadFiles', multipartMiddleware, controller.uploadFiles);

module.exports = router;
