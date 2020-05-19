var express = require('express');
var router = express.Router();
var jwt = require("jsonwebtoken");
var multer = require('multer');
var user = require('../controllers/userControllers');
var Models = require('../models');
var Constants = require('../config/appConstants');
var RESPONSE_MESSAGES = require('../config/response-messages')

//DESCRYPTION
if (process.env.ENABLE_ENCRYPTION == "1") {
  var aesWrapper = require('../Lib/aes-wrapper');
  var rsaWrapper = require('../Lib/rsa-wrapper');
}
//DESCRYPTION

router.use(function (req, res, next) {
  global.encryptionType = "mobile";
  let token = req.headers['authorization'];
  console.log("-------", token)
  let language = "en";
  if (req.headers['language'] != undefined && req.headers['language'] != "") {
    language = req.headers['language'];
  }
  if (token) {
    let authToken = token.split(" ")
    jwt.verify(authToken[1], gRouter.get(Constants.SERVER.JWT_SECRET_KEY).toString(), async function (err, decoded) {
      if (err) {
        if (authToken[1] == Constants.SERVER.GUEST_TOKEN) {

          //DESCRYPTION
          if (process.env.ENABLE_ENCRYPTION == "1") {
            if (req.body != undefined) {
              req.body = await decryptData(req.body);
            }
            if (req.query != undefined) {
              req.query = await decryptData(req.query);
            }
          }
          //DESCRYPTION
          global.userData = "";
          next();
        } else {
          res.status(401).json({
            status: 0,
            message: RESPONSE_MESSAGES.STATUS_MSG.ERROR.ERROR_TOKEN_AUTH.customMessage
          });
          return;
        }
      } else {
        //DESCRYPTION
        if (process.env.ENABLE_ENCRYPTION == "1") {
          if (req.body != undefined) {
            req.body = await decryptData(req.body);
          }
          if (req.query != undefined) {
            req.query = await decryptData(req.query);
          }
        }
        //DESCRYPTION
        Models.Users.findOne({
          "_id": decoded._id
        }, {}, function (err, result) {
          if (!result || (result.accessToken == "") || (result.accessToken != authToken[1])) return res.status(401).json({
            status: 0,
            message: RESPONSE_MESSAGES.STATUS_MSG.ERROR.ERROR_TOKEN_AUTH.customMessage
          });

          if (result.isBlocked == true) {
            return res.status(403).json({
              status: 0,
              message: RESPONSE_MESSAGES.STATUS_MSG.ERROR.BLOCK_USER.customMessage
            });
          } else if (result.isDeleted == true) {
            return res.status(403).json({
              status: 0,
              message: RESPONSE_MESSAGES.STATUS_MSG.ERROR.NO_USER_EXISTS.customMessage
            });
          } else {
            global.userData = result;
            global.language = language;
            req.credentials = result;
            next();
          }
        });
      }
    });
  } else {
    res.status(403).json({
      status: 0,
      message: RESPONSE_MESSAGES.STATUS_MSG.ERROR.EMPTY_TOKEN.customMessage
    });
    return;
  }
});

router.post('/updateProfile', user.updateProfile);
router.post('/updateProfessionalProfile', user.updateProfessionalProfile);
router.post('/updateFacilityProfile', user.updateFacilityProfile);
router.get('/usersList', user.usersList);
router.get('/countryList', user.countryList);
router.post('/updateUserRole', user.updateUserRole);
router.put('/updatePushNotificationDeviceToken', user.updatePushNotificationDeviceToken);
router.post('/editUserProfile', user.editUserProfile);
router.post('/editProfessionalProfile', user.editProfessionalProfile);
router.post('/editFacilityProfile', user.editFacilityProfile);
/*router.get('/professionalTypes',user.professionalTypes);*/
router.get('/professionalSpecialityList', user.professionalSpecialityList);
router.get('/insuranceCompanyList', user.insuranceCompanyList);
router.post('/saveAddress', user.saveAddress);
router.get('/addressList', user.addressList);
router.post('/setDefaultAddress', user.setDefaultAddress);
router.post('/deleteAddress', user.deleteAddress);
router.post('/createFolder', user.createFolder);
router.get('/foldersList', user.foldersList);
router.post('/deleteFolder', user.deleteFolder);
router.post('/addFileToFolder', user.addFileToFolder);
router.get('/getFilesByFolder', user.getFilesByFolder);
router.get('/deleteFileFromFolder', user.deleteFileFromFolder);
router.put('/moveFileToFolder', user.moveFileToFolder);
router.post('/serviceCategoryList', user.serviceCategoryList);
router.post('/getUserDetailsById', user.getUserDetailsById);
router.post('/getUserRoleAndUnavailabilityById', user.getUserRoleAndUnavailabilityById);
///router.get('/getUserDetailsById/:id',user.getUserRelatedAllData);
router.post('/getProfessionalsList', user.getProfessionalsList);
router.post('/getFacilitysByService', user.getFacilitysByService);
router.post('/joinFacility', user.joinFacility);
router.put('/updateProfessionalFacility', user.addEditProfessionalFacility);
router.put('/workingHours', user.workingHours);
router.put('/manageAvailability', user.manageAvailability);
router.get('/facilityProfessionals', user.facilityProfessionals);
router.post('/createProfessionalAccount', user.createProfessionalAccount);
router.get('/professionalFacilities', user.getProfessionalFacilities);
router.get('/dashboardData', user.dashboardData);
router.get('/dashboardSearch', user.dashboardSearch);
router.get('/dashboardDataCustomCounts', user.dashboardDataCustomCounts);
router.put('/addUserDependent', user.addUserDependent);
router.get('/listUserDependents', user.listUserDependents);
router.put('/deleteUserDependent', user.deleteUserDependent);
router.put('/logout', user.logout);
router.get('/getNotifications', user.getNotifications);
router.get('/help', user.help);
router.get('/partnersAppointment', user.partnersAppointment);
router.get('/partnersPastTasks', user.partnersPastTasks);

router.get('/getProfessionalReports', user.getProfessionalReports);
router.get('/getPrescriptionsList', user.getPrescriptionsList);

//router.put('/updateDeviceToken',user.updateDeviceToken);
//router.get('/help',user.help);
router.post('/testapiSave', user.testapiSave);
router.get('/testapiGet', user.testapiGet);

async function decryptData(data) {
  if (!data.encryptionKey) return {};
  await rsaWrapper.initLoadKeys(__dirname + '/../utils');
  var decryptedKey = await rsaWrapper.decrypt(rsaWrapper.serverPrivate, data.encryptionKey);
  /*let descryptedPayload = JSON.parse(await aesWrapper.decrypt(Buffer.from(decryptedKey, 'base64'), data.encryptionData));*/

  let descryptedPayload = {};
  /*if(data.type && data.type=="web"){
      global.encryptionType = "web";
      descryptedPayload = await aesWrapper.webDecrypt(Buffer.from(decryptedKey, 'base64'), data.encryptionData);
  }else{*/
  descryptedPayload = JSON.parse(await aesWrapper.decrypt(Buffer.from(decryptedKey, 'base64'), data.encryptionData));
  //}
  return descryptedPayload;
}

module.exports = router;