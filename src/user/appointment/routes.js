'use strict';

const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();


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


// appointment routes
router.post('/appointment', validator(routeValidators.create), controller.create);
router.get('/appointment', validator(routeValidators.get), controller.get);
router.get('/appointmentDetails', controller.appointmentDetails);
router.post('/cancelAppointment', controller.cancelAppointment);
router.put('/confirmAppointment', controller.confirmAppointment);
router.post('/confirmAppointment', controller.confirmAppointment);
//router.put('/updateAppointment', controller.updateAppointment);
router.get('/receivedAppointment', controller.receivedAppointment);
router.get('/bookedProfessionalsList', controller.bookedProfessionalsList);
router.get('/getConsultantPriceList', controller.getConsultantPriceList);
router.get('/getImage', controller.getImage);
router.post('/uploadFile', multipartMiddleware, controller.uploadFile);
router.post('/uploadFiles', multipartMiddleware, controller.uploadFiles);
router.get('/getCommonService', controller.getCommonService);
router.get('/getProfessionalAndFacilityList', controller.getProfessionalAndFacilityList);

router.post('/createEReport', controller.createEReport);
router.post('/ereportUpdate', controller.ereportUpdate);
router.get('/getReports', controller.getReports);

router.post('/createLabReport', controller.createLabReport);
router.get('/getLabReports', controller.getLabReports);

router.post('/addFeedback', controller.addFeedback);
router.get('/feedbacksList', controller.feedbacksList);
router.post('/createInstantConsultationAppointment', controller.createInstantConsultationAppointment);
router.get('/getMedicalReportsDiagnostics', controller.getMedicalReportsDiagnostics);
router.get('/getMedicalReports', controller.getMedicalReports);

router.get('/medicationListForAddMedication', controller.medicationListForAddMedication);

router.get('/getCheckoutId', controller.getCheckoutId);
router.post('/makePayment', controller.makePayment);
router.post('/makeRecurringPayment', controller.makeRecurringPayment);
router.post('/transactionSearchByMerchantTransactionId', controller.transactionSearchByMerchantTransactionId);
router.post('/checkPaymentStatus', controller.checkPaymentStatus);
router.post('/manageWallet', controller.manageWallet);
router.post('/callPayment', controller.callPayment);
router.post('/removeCard', controller.removeCard);
router.get('/getTransactionsListWithFilters', controller.getTransactionsListWithFilters);
router.get('/getTransactionsList', controller.getTransactionsList);
router.get('/getTransactionsListMonthWise', controller.getTransactionsListMonthWise);


router.post('/addCSFContract', controller.addCSFContract);
router.get('/getCSFContract', controller.getCSFContract);
/*
router.get('/getProfessionalReports', controller.getProfessionalReports);
router.get('/getPrescriptionsList', controller.getPrescriptionsList);*/


module.exports = router;