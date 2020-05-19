'use strict';

// constants
const DB_CONSTANTS = require("../config/appConstants").DATABASE;

// npm modules
let mongoose= require('mongoose');
let async = require('async'),
    //randomstring = require("randomstring"),
    appointment_plugin = require("../plugins").appointmentPlugin;
let Schema= mongoose.Schema;                // mongoose schema

// enums
const appointment_types = [
  DB_CONSTANTS.APPOINTMENT.HOME,
  DB_CONSTANTS.APPOINTMENT.ONLINE,
  DB_CONSTANTS.APPOINTMENT.ONSITE,
  DB_CONSTANTS.APPOINTMENT.SELF,
], status = [
    DB_CONSTANTS.APPOINTMENT_STATUS.PLACED,
    DB_CONSTANTS.APPOINTMENT_STATUS.STARTED,
    DB_CONSTANTS.APPOINTMENT_STATUS.REJECTED,
    DB_CONSTANTS.APPOINTMENT_STATUS.CONFIRMED,
    DB_CONSTANTS.APPOINTMENT_STATUS.COMPLETED,
    DB_CONSTANTS.APPOINTMENT_STATUS.CANCELLED,
], appointment_home =[
    DB_CONSTANTS.APPOINTMENT_HOME.CUSTOM,
    DB_CONSTANTS.APPOINTMENT_HOME.WEEKLY,
    DB_CONSTANTS.APPOINTMENT_HOME.EVERYDAY
];

// staic pbject schema
const scheduled = {
    date:             {type: String},           // YYYY-MM-DD "2019-07-10"
    clinicHospital:   {type: Schema.ObjectId, ref: 'Users'},
    slots:            {type: [String]} // ["10:00 AM", "10:30 AM"]
}, homeService =      {
    weekly:           {type: [Boolean], max: 7},                   // days true or false from sun-0 to sat-6 index
    weeklyRepeat:     {type: Boolean},
    //weekStartDate:    {type: String, default: ""},
    weeklyDates:      {
        startDate:    {type: String, default: ""},
        endDate:      {type: String, default: ""},
        dayWiseDates: {type: [String]}
    },
    type:             {type: String, enum: appointment_home}, //EVERYDAY | CUSTOM | WEEKLY
    /*address:        {type: String},
    location:         {type:[Number]},*/
    address:          {
        location:     {type:[Number]},
        locationName: {type: String},
        houseNumber:  {type: String},
        addressName:  {type: String}
    },
    endTime:          {type: String},
    startTime:        {type: String},
    description:      {type: String},
    everyDayOrCustom: {type: [String]},                     // dates selected in case of every day or custom dates
}, selfAppointment =  {
    dates:            {type: [String], default: []},   // ["YYYY-MM-DD"],
    endTime:          {type: String, default: ""},
    isAllDay:         {type: Boolean},
    startTime:        {type: String, default: ""}
};

let appointmentSchema =  new Schema({
    fileId: {type: String, default:"000001"},//fileId will be same for same user and doctor and different for different doctor and user
    appointmentNumber:{type: String, default:"000001"},//Unique identification number
    type:   {type: String, enum: appointment_types, default: appointment_types[0], required: true, index: true},
    user:   {type: Schema.ObjectId, ref: "Users", required: true, index: true},
    createdByRole: {type: String, enum: ['USER', 'PROFESSIONAL','FACILITY'], default: 'USER', index: true},
    slots:  {type: [Number]},                                          // ["10:00 AM", "10:30 AM"] -> [600, 630] in mins
    utcDateTime:      {type: String},
    status: {type: String, enum: status, default: status[0], required: true},
    reason: {type: String, default: ""}, // in case or cancelled or rejected appointments
    doctor: {type: Schema.ObjectId, ref: "Users", required: true, index: true},
    //slots: [Number], // time slots top validating the whole appointment thing ['10:20 AM'] -> [620]

    // online and onsite appointment
    scheduledService: scheduled,

    // home appointment
    homeService: homeService,
    selfAppointment: selfAppointment, // Profession user's self appointment for unavailable time

    updatedAt: {type: Number, required: true, default: Date.now()},
    createdAt: {type: Number, required: true, default: Date.now(), index: true},
    followUpAppointment: { type: Number, enum: [
            DB_CONSTANTS.FOLLOW_UP_APPOINTMENT.FREE,
            DB_CONSTANTS.FOLLOW_UP_APPOINTMENT.PAID
        ],
        default: 0
    },
    isAlreadyReportGenerate: { type: Boolean, default: false },
    reportType: { type: Number, default: 1 },
    timeZone: {type: String, default: ""}, // in case or cancelled or rejected appointments
    consultationType: {type: String, default: ""}, // required only in case of instant consultation // AUDIO, VIDEO, CHAT
    isPushGenerated: { type: Boolean, default: false },
    isUserConfirmed: { type: Boolean, default: false },
    isUserModified: { type: Boolean, default: false },
    isDoctorConfirmed: { type: Boolean, default: false },
    isDoctorModified: { type: Boolean, default: false },
/*},{timestamps:true*/});

//module.exports = mongoose.model('appointment', appointment);

appointmentSchema.plugin(appointment_plugin);

const appointment = mongoose.model('appointment',appointmentSchema);
module.exports = appointment;
