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
        appointmentId: joi.string().optional(),
        updatedDate: joi.string().optional(),
        userType: joi.string().optional(),
        timeZone: joi.string().optional().description(' timezone ').allow(""),
        scheduledService: joi.object().keys({
            date: joi.string().description("date in YYYY-MM-DD format").allow(""),
            slots: joi.array().items(joi.string()).description("time like 10:00 AM").allow(null),
            clinicHospital: joi.string().description("id of clinic or hospital for meeting").allow("")
        }),
        checkAvailability: joi.boolean().description("check availability of dates and slots"),
        homeService: joi.object().keys({
            address: joi.object().keys({
                locationName: joi.string().description("patient address where doctor have to visit for appointment").allow(""),
                location: joi.array().ordered(
                    joi.number().min(-180).max(180).required(),
                    joi.number().min(-90).max(90).required()
                ).allow(null),
                addressName: joi.string().allow(""),
                houseNumber: joi.string().allow(""),
                isDefault: joi.boolean().allow("")
            }),
            /*address: joi.string().description("patient address where doctor have to visit for appointment").allow(""),
            location: joi.array().ordered(
                joi.number().min(-180).max(180).required(),
                joi.number().min(-90).max(90).required()
            ).allow(null),*/
            weekly: joi.array().items(joi.boolean()).description("days true or false from sun-0 to sat-6 index").allow(null),
            description: joi.string().allow(""),
            weeklyRepeat: joi.boolean().description("key to indicate days should be reapted or not in upcoming weeks"),
            type: joi.string().valid([
                "",
                CONSTANTS.DATABASE.APPOINTMENT_HOME.CUSTOM,
                CONSTANTS.DATABASE.APPOINTMENT_HOME.WEEKLY,
                CONSTANTS.DATABASE.APPOINTMENT_HOME.EVERYDAY
            ]),
            endTime: joi.string().description('end time of meeting like 12:00 PM').allow(""),
            startTime: joi.string().description('start time of meeting like 10:00 AM').allow(""),
            everyDayOrCustom: joi.array().items(joi.string()).description("dates selected in case of every day or custom dates").allow(null).allow(""),
        })
    },
    headers: authHeaderObj
};


//validator to list appointments
/*validator.get = {
  query: {
      type: joi.number().description("appointment -> 1: upcoming, 2: past, default: both").valid([1, 2]),
      listType: joi.number().description("[1 - booking I created, 2 - bookings I received]").valid([1, 2]),
      lastId: joi.string().description("last id for pagination").allow(""),
      count: joi.number().description("pagination count").allow("")
  },
  headers: authHeaderObj
};*/

module.exports = validator;
