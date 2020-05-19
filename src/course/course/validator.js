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

validator.addCourse = {
  payload: {
      authorId:   joi.string().required(),
      title:      joi.string().required(),
      cost:       joi.string().required(),
      about:      joi.string().required(),
      category:   joi.string().required(),
      description:joi.string().required(),
      instructions:joi.string().required(),
      curriculum: joi.string().required(),
      image:      joi.string().optional()
  },
  headers: authHeaderObj
};

validator.listCourses = {
  query: {
      searchUser: joi.string().optional(),
      category: joi.string().optional(),
      lastId: joi.string().optional(),
      count: joi.string().optional()
  },
  headers: authHeaderObj
};
validator.courseDetail = {
  query: {
      id: joi.string().required()
  },
  headers: authHeaderObj
};
validator.cmeList = {
  query: {
      type: joi.string().required(),
      searchUser: joi.string().optional(),
      lastId: joi.string().optional(),
      count: joi.string().optional()
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
      type: joi.string().optional(),
      lastId: joi.string().optional(),
      count: joi.string().optional()
  },
  headers: authHeaderObj
};
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
