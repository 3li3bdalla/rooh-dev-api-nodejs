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


// create appointment
validator.create = {
    body: {
        type: joi.string().valid([
            CONSTANTS.DATABASE.APPOINTMENT.HOME,
            CONSTANTS.DATABASE.APPOINTMENT.ONLINE,
            CONSTANTS.DATABASE.APPOINTMENT.ONSITE
        ]).required(),
        doctor: joi.string().required().description('doctor id'),
        scheduledService: joi.object().keys({
            date: joi.string().description("date in YYYY-MM-DD format"),
            slots: joi.array().items(joi.string()).description("time like 10:00 AM"),
            clinicHospital: joi.string().description("id of clinic or hospital for meeting")
        }),
        homeService: joi.object().keys({
            address: joi.string().description("patient address where doctor have to visit for appointment"),
            location: joi.array().ordered(
                joi.number().min(-180).max(180).required(),
                joi.number().min(-90).max(90).required()
            ).length(2),
            weekly: joi.array().items(joi.boolean()).description("days true or false from sun-0 to sat-6 index"),
            description: joi.string(),
            weeklyRepeat: joi.boolean().description("key to indicate days should be reapted or not in upcoming weeks"),
            type: joi.string().valid([
                CONSTANTS.DATABASE.APPOINTMENT_HOME.CUSTOM,
                CONSTANTS.DATABASE.APPOINTMENT_HOME.WEEKLY,
                CONSTANTS.DATABASE.APPOINTMENT_HOME.EVERYDAY
            ]),
            endTime: joi.string().description('end time of meeting like 12:00 PM'),
            startTime: joi.string().description('start time of meeting like 10:00 AM'),
            everyDayOrCustom: joi.array().items(joi.string()).description("dates selected in case of every day or custom dates"),
        })
    },
    headers: authHeaderObj
};


//validator to get facility or slots
validator.facility_slots = {
  query: {
      type: joi.string().valid([
          CONSTANTS.DATABASE.APPOINTMENT.HOME,
          CONSTANTS.DATABASE.APPOINTMENT.ONLINE,
          CONSTANTS.DATABASE.APPOINTMENT.ONSITE
      ]).required().description("appointment type -> HOME/ONLINE/ONSITE"),
      lat: joi.number().min(-180).max(180),
      long: joi.number().min(-90).max(90),
      date: joi.string().optional().description('date for which facility/slots required-> "YYYY-MM-DD"'),
      weeks: joi.array().items(joi.boolean()).description('weeks array--max 7---"[true, false, true,....]"').length(7),
      facility: joi.string().length(24).description("id of facility for which slots required"),
      professional: joi.string().length(24).description("id of facility for which slots required"),
      timeZone: joi.string().description("timezone"),
  },
  headers: authHeaderObj
};

module.exports = validator;