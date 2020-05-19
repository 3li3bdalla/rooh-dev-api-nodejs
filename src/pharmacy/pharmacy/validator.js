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

validator.createRequest = {
  payload: {
      pharmacyId: joi.string().required(),
      file:       joi.string().required(),
      deliveryType:joi.string().required(),
      address:joi.string().required(),
      location:joi.string().required(),
      facilityType:joi.string().required(),
      medicationId: joi.string().optional()
  },
  headers: authHeaderObj
};
validator.myList = {
  query: {
      type: joi.string().required(),
      count: joi.string().optional().allow(""),
      lastId: joi.string().optional().allow("")
  },
  headers: authHeaderObj
};
validator.requestList = {
  query: {
      type: joi.string().required(),
      count: joi.string().optional().allow(""),
      lastId: joi.string().optional().allow("")
  },
  headers: authHeaderObj
};
validator.acceptRejectRequest = {
  payload: {
      type: joi.string().required(),
      requestId: joi.string().required(),
      pharmacyId: joi.string().optional().allow("")
  },
  headers: authHeaderObj
};
validator.requestDetail = {
  query: {
      requestId: joi.string().required()
  },
  headers: authHeaderObj
};






/*
validator.courseDetail = {
  query: {
      id: joi.string().required()
  },
  headers: authHeaderObj
};
validator.cmeList = {
  query: {
      type: joi.string().required()
  },
  headers: authHeaderObj
};
validator.buyCourse = {
  payload: {
      courseId:   joi.string().required()
  },
  headers: authHeaderObj
};
validator.myCourses = {
  query: {
      type: joi.string().required()
  },
  headers: authHeaderObj
};*/
/*validator.viewContract = {
  query: {
      userId: joi.string().optional()
  },
  headers: authHeaderObj
};
validator.createTask = {
  payload: {
      patiendId:      joi.string().optional(),
      facilityId:     joi.string().optional(),
      professionalId: joi.string().optional(),
      taskType:       joi.string().optional(),
      description:    joi.string().optional(),
      duration:       joi.string().optional(),
      date:           joi.string().optional(),
      time:           joi.string().optional(),
      location:       joi.string().optional(),
      address:        joi.string().optional(),
      fees:           joi.string().optional()
  },
  headers: authHeaderObj
};
validator.approveHiring = {
  payload: {
      status: joi.string().optional(),
      signature: joi.string().optional()
  },
  headers: authHeaderObj
};
validator.getTeam = {
  payload: {
      status: joi.string().optional(),
      count: joi.string().optional().allow(""),
      lastId: joi.string().optional().allow("")
  },
  headers: authHeaderObj
};

validator.myTasks = {
  payload: {
      type: joi.string().optional(),
      count: joi.string().optional().allow(""),
      lastId: joi.string().optional().allow("")
  },
  headers: authHeaderObj
};*/


module.exports = validator;