var express = require('express');
//var validator 		= require('express-joi-validator');
var router = express.Router();
global.gRouter = router;
var user = require('../controllers/userControllers');

var rsaWrapper = require('../Lib/rsa-wrapper');
if (process.env.ENABLE_ENCRYPTION == "1") {
	var aesWrapper = require('../Lib/aes-wrapper');
	rsaWrapper.initLoadKeys(__dirname + "/../utils");
}
if (process.env.ENABLE_DB_ENCRYPTION == "1") {
	rsaWrapper.initDBLoadKeys(__dirname + "/../utils");
}
//var routeValidators	= require('./validator');
router.use(async function (req, res, next) {
	global.encryptionType = "mobile";
	console.log("req.body ----------- ", req.body)
	console.log("req.query ----------- ", req.query)
	if (process.env.ENABLE_ENCRYPTION == "1") {
		if (req.body != undefined) {
			req.body = await decryptData(req.body);
		}
		if (req.query != undefined) {
			req.query = await decryptData(req.query);
		}
	}
	let language = "en";
	if (req.headers['language'] != undefined && req.headers['language'] != "") {
		language = req.headers['language'];
	}
	global.language = language;
	next();
});

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

async function decryptData(data) {
	if (!data.encryptionKey) return {};
	var decryptedKey = await rsaWrapper.decrypt(rsaWrapper.serverPrivate, data.encryptionKey);
	let descryptedPayload = {};
	if (data.type && data.type == "web") {
		global.encryptionType = "web";
		descryptedPayload = await aesWrapper.webDecrypt(Buffer.from(decryptedKey, 'base64'), data.encryptionData);
	} else {
		descryptedPayload = JSON.parse(await aesWrapper.decrypt(Buffer.from(decryptedKey, 'base64'), data.encryptionData));
	}
	console.log("descryptedPayload==============", descryptedPayload)
	return descryptedPayload;
}

module.exports = router;