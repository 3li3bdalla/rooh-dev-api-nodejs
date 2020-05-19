'use strict';

// npm modules
const express = require('express'),
    validator = require('express-joi-validator');

// router
const router = express.Router();

// auth in router
require('../../auth').auth_Fn(router);

// local modules
const controller = require('./controller'),
    routeValidators = require('./validator');


// routes
router.get('/facility/slots', validator(routeValidators.facility_slots), controller.facility_slots);
// router.post('/appointment', validator(routeValidators.create), controller.create);


module.exports = router;