'use strict';

// npm modules
const express 			= require('express');
const validator 		= require('express-joi-validator');
const router 			= express.Router();
const controller 		= require('./controller');
const routeValidators 	= require('./validator');

require('../../auth').auth_Fn(router);
// team routes
router.get('/getEContractTemplates', controller.getEContractTemplates);
router.get('/getEContractServices', controller.getEContractServices);
router.get('/viewContract', validator(routeValidators.viewContract), controller.viewContract);
router.put('/cancelContract', validator(routeValidators.cancelContract), controller.cancelContract);
router.post('/renewContract', validator(routeValidators.renewContract), controller.renewContract);
//router.get('/editContractCheck', controller.editContractCheck);
router.put('/editContract', validator(routeValidators.editContract), controller.editContract);
router.post('/hireProfessional', validator(routeValidators.hireProfessional), controller.hireProfessional);
router.put('/approveHiring', validator(routeValidators.approveHiring), controller.approveHiring);
//router.get('/getAddToTeamNewRequests', controller.getAddToTeamNewRequests);
router.get('/getTeam', validator(routeValidators.getTeam), controller.getTeam);
router.get('/getSingleTeamMember', validator(routeValidators.getSingleTeamMember), controller.getSingleTeamMember);
router.post('/createTask', validator(routeValidators.createTask), controller.createTask);
router.get('/myTasks', validator(routeValidators.myTasks), controller.myTasks);//hired professional's tasks
router.get('/myTeamTasks', validator(routeValidators.myTeamTasks), controller.myTeamTasks);//hired professional's tasks
router.get('/taskTypes', controller.taskTypes);//hired professional's tasks
router.put('/acceptRejectTask', validator(routeValidators.acceptRejectTask), controller.acceptRejectTask);
router.get('/taskDetails', controller.taskDetails);//hired professional's tasks











/*router.post('/createPost', validator(routeValidators.createPost), controller.createPost);
router.get('/getPostsByTag', validator(routeValidators.getPostsByTag), controller.getPostsByTag);
router.get('/listSpeakouts', validator(routeValidators.listSpeakouts), controller.listSpeakouts);
router.get('/listExplorePosts', validator(routeValidators.listExplorePosts), controller.listExplorePosts);
router.post('/followUnfollowUser', validator(routeValidators.followUnfollowUser), controller.followUnfollowUser);
router.get('/followList', validator(routeValidators.followList), controller.followList);
router.post('/postComment', validator(routeValidators.postComment), controller.postComment);
router.post('/likeUnlike', validator(routeValidators.likeUnlike), controller.likeUnlike);
router.post('/sharePost', validator(routeValidators.sharePost), controller.sharePost);
router.get('/postDetails', validator(routeValidators.postDetails), controller.postDetails);
router.post('/reportPost', validator(routeValidators.reportPost), controller.reportPost);*/
//router.post('/social', validator(routeValidators.create), controller.create);


module.exports = router;