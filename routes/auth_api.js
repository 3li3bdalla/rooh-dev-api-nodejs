var express = require('express');
//var validator 		= require('express-joi-validator');
var router = express.Router();
global.gRouter = router;
var user = require('../controllers/userControllers');
const bodyContentParser = require('../middleware/bodyContent')
//var routeValidators	= require('./validator');
router.use(bodyContentParser);

router.post('/registerUser', user.registerUser);
router.post('/verifyOtp', user.verifyOtp);
router.post('/userLogin', user.userLogin);
router.post('/socialLogin', user.socialLogin);
router.post('/socialLoginMerge', user.socialLoginMerge);
router.post('/facebookLoginMerge', user.facebookLoginMerge);
router.post('/forgotPassword', user.forgotPassword);
router.post('/resendOtp', user.resendOtp);
router.post('/updatePassword', user.updatePassword);
router.post('/uploadLabsTest', user.uploadLabsTest);
router.get('/appVersioning', user.appVersioning);
router.get('/testdata', user.testapi);
router.post('/testEncryption', user.testEncryption);


module.exports = router;