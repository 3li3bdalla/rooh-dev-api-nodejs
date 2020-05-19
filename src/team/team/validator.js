'use strict';

// constants
const CONSTANTS = require("../../../config/appConstants");

// npm modules
const joi = require('joi');

// local modules
const UniversalFunctions = require("../../../utils").universalFunctions;

const validator = {},
    failAction = UniversalFunctions.failActionFunction,
    authHeaderObj = UniversalFunctions.authorizationHeaderObj;

validator.hireProfessional = {
  payload: {
      professionalId: joi.string().length(24).required(),
      //hiringDuration: joi.string().required(),
      startTime:      joi.string().optional(),
      endTime:        joi.string().optional(),
      templateId:     joi.string().optional(),
      /*idNumber:       joi.string().required(),
      registrationNumber: joi.string().required(),
      representativeName: joi.string().required(),
      commercialRegistration: joi.string().required(),
      procurationNumber: joi.string().required(),*/
      //postalCode:     joi.string().required(),
      workingHours:   joi.string().required(),
      shift:          joi.string().required(),
      services:       joi.string().optional(),
      workingDays:    joi.string().required(),
      description:    joi.string().required(),
      termCondition:  joi.string().required(),
      /*bankName:       joi.string().required(),
      iban:           joi.string().required(),
      swiftCode:      joi.string().required(),
      bankCity:       joi.string().required(),
      bankCountry:    joi.string().required(),
      currency:       joi.string().required()*/
  },
  headers: authHeaderObj
};
validator.viewContract = {
  query: {
      type: joi.string().required(),
      id: joi.string().required(),
  },
  headers: authHeaderObj
};
validator.cancelContract = {
  payload: {
      cancelDescription: joi.string().required(),
      id: joi.string().required(),
  },
  headers: authHeaderObj
};
validator.renewContract = {
  payload: {
      startDate: joi.string().required(),
      endDate: joi.string().required(),
      startTime: joi.string().required(),
      endTime: joi.string().required(),
      id: joi.string().required(),
  },
  headers: authHeaderObj
};

/*validator.editContractCheck = {
  query: {
      professionalId: joi.string().required(),
      teamManagerId: joi.string().required()
  },
  headers: authHeaderObj
};*/
validator.editContract = {
  payload: {
      id:             joi.string().required(),
      startDate:      joi.string().optional(),
      endDate:        joi.string().optional(),
      startTime:      joi.string().optional(),
      endTime:        joi.string().optional(),
      workingHours:   joi.string().required(),
      shift:          joi.string().required(),
      services:       joi.string().optional(),
      workingDays:    joi.string().required(),
      description:    joi.string().required(),
      termCondition:  joi.string().required()
  },
  headers: authHeaderObj
};

validator.createTask = {
  payload: {
      patiendId:      joi.string().optional(),
      facilityId:     joi.string().optional(),
      professionalId: joi.string().required(),
      assignedById:   joi.string().required(),//added as asked by Ankit IOS
      taskType:       joi.string().required(),
      description:    joi.string().required(),
      duration:       joi.string().required(),
      date:           joi.string().required(),
      time:           joi.string().required(),
      location:       joi.string().optional(),
      address:        joi.string().optional(),
      fees:           joi.string().required()
  },
  headers: authHeaderObj
};
validator.approveHiring = {
  payload: {
      status: joi.string().required(),
      signature: joi.string().required()
  },
  headers: authHeaderObj
};
validator.getTeam = {
  query: {
      status: joi.string().required(),
      count: joi.string().optional(),
      lastId: joi.string().optional(),
      keyword: joi.string().optional()
  },
  headers: authHeaderObj
};
validator.getSingleTeamMember = {
  query: {
      id: joi.string().required()
  },
  headers: authHeaderObj
};

validator.myTasks = {
  query: {
      type: joi.string().required(),
      count: joi.string().optional(),
      lastId: joi.string().optional(),
      taskType: joi.string().optional(),
      sortBy: joi.string().optional()
  },
  headers: authHeaderObj
};
validator.myTeamTasks = {
  query: {
      type: joi.string().required(),
      count: joi.string().optional(),
      lastId: joi.string().optional(),
      taskType: joi.string().optional(),
      sortBy: joi.string().optional()
  },
  headers: authHeaderObj
};
validator.acceptRejectTask = {
  payload: {
      taskId: joi.string().required(),
      action: joi.string().required()
  },
  headers: authHeaderObj
};
validator.taskDetails = {
  query: {
      taskId: joi.string().required()
  },
  headers: authHeaderObj
};


module.exports = validator;