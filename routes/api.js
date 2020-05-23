var express = require('express');
var router = express.Router();
var user = require('../controllers/userControllers');
const auth = require('../middleware/auth');

router.use(auth.validateToken);

router.post('/updateProfile', user.updateProfile);
router.put('/updateChatStatus', user.updateChatStatus);
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



module.exports = router;