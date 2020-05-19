'use strict';

// npm modules
const express 			= require('express');
const validator 		= require('express-joi-validator');
const router 			= express.Router();
const controller 		= require('./controller');
const routeValidators 	= require('./validator');

require('../../auth').auth_Fn(router);
// PHARMACY routes

//USER-BENEFECIARY APIs
router.post('/createRequest', validator(routeValidators.createRequest), controller.createRequest);
router.get('/myList',validator(routeValidators.myList), controller.myList); //requested,upcoming,past
/*router.put('/acceptRejectPharmacyResponse',validator(routeValidators.acceptRejectPharmacyResponse), controller.acceptRejectPharmacyResponse);



//PROFESSIONAL APIs*/
router.put('/acceptRejectRequest',validator(routeValidators.acceptRejectRequest), controller.acceptRejectRequest);
router.get('/requestList', validator(routeValidators.requestList), controller.requestList); //pending,open,delivered, newrequest

router.get('/requestDetail',validator(routeValidators.requestDetail), controller.requestDetail); //requested,upcoming,past

module.exports = router;