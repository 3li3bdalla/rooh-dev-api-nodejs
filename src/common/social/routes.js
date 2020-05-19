'use strict';

// npm modules
const express 			= require('express');
const validator 		= require('express-joi-validator');
const router 			= express.Router();
const controller 		= require('./controller');
const routeValidators 	= require('./validator');

require('../../auth').auth_Fn(router);
// appointment routes
router.get('/homeData', validator(routeValidators.homeData), controller.homeData);
router.post('/createPost', validator(routeValidators.createPost), controller.createPost);
router.put('/deletePost', controller.deletePost);
router.get('/getTagsByUser', controller.getTagsByUser);
router.get('/getPostsByTag', validator(routeValidators.getPostsByTag), controller.getPostsByTag);
router.get('/listSpeakouts', validator(routeValidators.listSpeakouts), controller.listSpeakouts);
router.get('/listExplorePosts', validator(routeValidators.listExplorePosts), controller.listExplorePosts);
router.post('/followUnfollowUser', validator(routeValidators.followUnfollowUser), controller.followUnfollowUser);
router.get('/followList', validator(routeValidators.followList), controller.followList);
router.post('/postComment', validator(routeValidators.postComment), controller.postComment);
router.put('/deleteComment', validator(routeValidators.deleteComment), controller.deleteComment);
router.post('/likeUnlike', validator(routeValidators.likeUnlike), controller.likeUnlike);
router.post('/sharePost', validator(routeValidators.sharePost), controller.sharePost);
router.get('/postDetails', validator(routeValidators.postDetails), controller.postDetails);
router.put('/viewPost', validator(routeValidators.viewPost), controller.viewPost);
router.post('/reportPost', validator(routeValidators.reportPost), controller.reportPost);
router.post('/addRemoveContact', validator(routeValidators.addRemoveContact), controller.addRemoveContact);
router.get('/contactsList', controller.contactsList);
router.put('/addRemoveFavourite', validator(routeValidators.addRemoveFavourite), controller.addRemoveFavourite);
router.get('/getFavouritesList', controller.getFavouritesList);
router.get('/getFavouritesLikeList', controller.getFavouritesLikeList);
router.put('/addRemoveRescuer', validator(routeValidators.addRemoveRescuer), controller.addRemoveRescuer);
router.get('/getMyRescuer', controller.getMyRescuer);
router.put('/changePassword', controller.changePassword);
//router.post('/social', validator(routeValidators.create), controller.create);


module.exports = router;
