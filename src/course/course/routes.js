'use strict';

// npm modules
const express 			= require('express');
const validator 		= require('express-joi-validator');
const router 			= express.Router();
const controller 		= require('./controller');
const routeValidators 	= require('./validator');

require('../../auth').auth_Fn(router);
// COURSE routes
/*router.post('/addCourse', validator(routeValidators.addCourse), controller.addCourse);*/
router.get('/listCourses', controller.listCourses);
router.get('/courseDetail',validator(routeValidators.courseDetail), controller.courseDetail);
router.get('/cmeList', validator(routeValidators.cmeList), controller.cmeList);
router.post('/buyCourse', validator(routeValidators.buyCourse), controller.buyCourse);
router.get('/myCourses', validator(routeValidators.myCourses), controller.myCourses);
//router.get('/cmeTabs', controller.cmeTabs);
/*router.get('/addCourse', controller.addCourse);
router.get('/viewContract', validator(routeValidators.viewContract), controller.viewContract);
router.post('/hireProfessional', validator(routeValidators.hireProfessional), controller.hireProfessional);
router.put('/approveHiring', validator(routeValidators.approveHiring), controller.approveHiring);
//router.get('/getAddToTeamNewRequests', controller.getAddToTeamNewRequests);
router.get('/getTeam', validator(routeValidators.getTeam), controller.getTeam);
router.post('/createTask', validator(routeValidators.createTask), controller.createTask);
router.get('/myTasks', controller.myTasks);//hired professional's tasks
*/


module.exports = router;