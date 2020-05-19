'use strict';

//npm modules
const async = require('async'),
    moment = require('moment'),
    momentTimezone = require('moment-timezone');
const is = require("is_js");
const path = require('path');
const Joi = require('joi');
const paymentStatuses = require('./paymentStatuses.js')
const schedule = require('node-schedule');
if(process.env.ENABLE_DB_ENCRYPTION=="1"){
    var rsaWrapper          = require('../../../Lib/rsa-wrapper');
    //var aesWrapper          = require('../Lib/aes-wrapper');
}


// local modules
const Models = require('../../../models'),
    Dao = require('../../../dao').queries,
    controllerUtil = require('./controllerUtil'),
    APP_CONSTANTS = require('../../../config/appConstants'),
    RESPONSE_MESSAGES = require('../../../config/response-messages'),
    UniversalFunctions = require('../../../utils').universalFunctions,
    commonFunctions = require('../../../utils').commonController,
    NotificationManager = require('../../../Lib/NotificationManager'),
    CommonController = require('../../commonController'),
    sendResponse = require('../../sendResponse'),
    paymentGateway = require('../../paymentGateway');


async function createFollowUpAppointment (payload, language, timeZone, res) {
    try {
        console.log(" payload ", JSON.stringify(payload));
        let homeserviceDates = [];
        // payload.user = payload.;
        //CHECK PROFESSIONALS SETTINGS
        let userSettings = await Models.Users.findOne({"_id":ObjectId(payload.doctor)},{homeConsultation:1,onlineConsultation:1});
        if((payload.type=="HOME" && userSettings != null && userSettings.homeConsultation == false) || (payload.type=="ONLINE" && userSettings != null && userSettings.onlineConsultation == false)){

            let message = "";
            let message1 = "";

            message1 = `Sorry, professional not available for ${ RESPONSE_MESSAGES.STATUS_MSG.APPOINTMENT_TYPE[payload.type][language] } consultation`;
            message = ` تشاور ${ RESPONSE_MESSAGES.STATUS_MSG.APPOINTMENT_TYPE[payload.type][language] } عذرا ، المهنية غير متوفرة ل `

           throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT = {
               statusCode: 400,
               message: {
                   en : message1
               },
               type: 'DEFAULT'
           }

          //  return sendResponse.sendErrorMessage(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, language, , res );
            // return res.status(400).json({
            //     status: 0,
            //     message: "Sorry, professional not available for "+payload.type+" consultation",
            //     data: {}
            // });
        }

        //CHECK PROFESSIONALS SETTINGS
        //CHECK TODAY'S TIME
     //   console.log(payload.type == "HOME" , (payload.homeService.type=="CUSTOM" || payload.homeService.type=="EVERYDAY") , timeZone);
        if(payload.type == "HOME" && (payload.homeService.type=="CUSTOM" || payload.homeService.type=="EVERYDAY") && timeZone){
            let startTime = await controllerUtil.convertTimeStringInMins([payload.homeService.startTime]);            
            //let currentTime = await controllerUtil.convertTimeStringInMins([momentTimezone(new Date()).tz(timeZone).format('hh:mm A')]);
            //let currentTime = await controllerUtil.convertTimeStringInMins([moment(new Date().toLocaleString("en-US", {timeZone: timeZone})).format('hh:mm A')]);
            let currentTime = await controllerUtil.convertTimeStringInMins([momentTimezone(new Date()).tz(req.headers.timezone).format('hh:mm A')]);
            let currentDate = momentTimezone(new Date()).tz(timeZone).format('YYYY-MM-DD');
            console.log(payload.homeService.everyDayOrCustom[0] , currentDate , startTime[0] , currentTime[0]);
            if((payload.homeService.everyDayOrCustom[0] == currentDate) && (startTime[0] < currentTime[0])){
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.TIME_SLOT_NOT_AVAILABLE;
            }
        }

        //CHECK PROFESSIONALS SETTINGS
        if(payload.type=="HOME"){

            if(payload.homeService && payload.homeService.type=="WEEKLY"){ //if homeservice and is weekly then add a week start Date
                payload.homeService.weeklyDates = {};

                payload.homeService.weeklyDates.startDate = moment().add(1, 'week').day(0).format('YYYY-MM-DD')
                if(payload.homeService.weeklyRepeat){
                    payload.homeService.weeklyDates.endDate = moment().add(4, 'week').day(6).format('YYYY-MM-DD')//month end date //28days
                }else{
                    payload.homeService.weeklyDates.endDate = moment().add(1, 'week').day(6).format('YYYY-MM-DD') //week end date
                }
                payload.homeService.weeklyDates.dayWiseDates = await checkHomeWeeklyAppointments(payload.homeService.weekly,payload.homeService.weeklyRepeat);
                homeserviceDates = payload.homeService.weeklyDates.dayWiseDates
            }
        }
        if (payload.homeService && payload.homeService.endTime && payload.homeService.startTime){


            let startTime = payload.homeService.startTime;
            let endTime = payload.homeService.endTime;

            var start = moment(startTime, 'hh:mm A');
            var end = moment(endTime, 'hh:mm A');
            start.minutes(Math.ceil(start.minutes() / 30) * 30);
            var result = [];
            var current = moment(start);
            let i =0;
            while (current <= end) {
                result.push(current.format('hh:mm A'));
                current.add(30, 'minutes');
                i++;
            }
            let data = await controllerUtil.convertTimeStringInMins(result);
            data.splice(-1,1)
            payload.slots = data;
            if(payload.homeService.type=="EVERYDAY" || payload.homeService.type=="CUSTOM"){
                homeserviceDates = payload.homeService.everyDayOrCustom;
            }
            let professionalsWorkingHours = await getProfessionalsWorkingHours(payload.doctor,payload.slots,homeserviceDates); // check homeservice slots
            if(professionalsWorkingHours.status == 0){


                let message = "";
                let message1 = "";

                message1 = `This professional works between ${professionalsWorkingHours.startTime} - ${professionalsWorkingHours.endTime} on ${professionalsWorkingHours.day}`;
                message = `هذه الأعمال المهنية بين.  ${professionalsWorkingHours.startTime} - ${professionalsWorkingHours.endTime} على ${professionalsWorkingHours.day}`;

                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT = {
                    statusCode: 400,
                    message: {
                        en : message1
                    },
                    type: 'DEFAULT'
                }

                // return res.status(400).json({
                //     data: {},
                //     status: 0,
                //     message: "This professional works between "+professionalsWorkingHours.startTime+" - "+professionalsWorkingHours.endTime+" on "+professionalsWorkingHours.day
                // });
            }else if(professionalsWorkingHours.status == 3){
                return res.status(400).json({
                    status: 1,
                    message: "Selected professional have not added any working hours",
                    data: {}
                });
            }
        }
        if (payload.scheduledService && payload.scheduledService.slots && payload.scheduledService.slots.length){
            payload.slots = await controllerUtil.convertTimeStringInMins(payload.scheduledService.slots);
        }


        let aptStatus  = await checkAppointmentConflict(payload);
        if(aptStatus.status == 1){ // return unavailable date and slot
            return {
                "isSuccessful":false,"date":aptStatus.date,"slot":aptStatus.slot
            }
        }
        if(!payload.checkAvailability){
            await saveAppointment(Models.Appointment, payload);
            //await Dao.saveData(Models.Appointment, payload);
        }

        return {
            isSuccessful: true
        };
    }
    catch (err) {
        console.log("err");
        throw err;
        // console.log("********************** ERROR IN FOLLOW UP APPOINTMENT ****************", err);
        // return sendResponse.sendErrorMessage(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, language, err, res);
    }
}

async function checkAppointmentConflict(obj) {

 //   console.log( "obj", obj);

    let checkDate, criteria, aptStatus,weeklyAptStatus;
    let returnObject = {};
    if(obj.type=="HOME"){
        if(obj.homeService.type == "EVERYDAY" || obj.homeService.type == "CUSTOM"){
            checkDate = obj.homeService.everyDayOrCustom // array of dates
        }else{//WEEKLY //--> if weeklyRepeat is true then check of next 1 month dates else check for 1 week only
            let weekly = obj.homeService.weekly;
            let weeklyRepeat = obj.homeService.weeklyRepeat;
            checkDate = await checkHomeWeeklyAppointments(weekly,weeklyRepeat) // array of dates
        }

        if(obj.appointmentId != undefined && obj.appointmentId != "" ){ // checking single date in case of updation
            checkDate = [obj.updatedDate]
        }
        for(let singleDate of checkDate){
            aptStatus = await checkAppointments(singleDate,obj.slots, obj.doctor);

            if(aptStatus.status == 1){
                return aptStatus;
            }else{
                weeklyAptStatus = await checkWeeklyAppointments(singleDate,obj.slots, obj.doctor)
                if(weeklyAptStatus.status == 1){
                    return weeklyAptStatus;
                }
            }
        }
        returnObject = {"status":0,"date":"", "slot":""} //status 0 means date and slot is available for appointment
        return returnObject;
    }else{ //ONLINE/ONSITE
        checkDate = obj.scheduledService.date // single date

        if(obj.appointmentId != undefined && obj.appointmentId != "" ){ // checking single date in case of updation
            checkDate = obj.updatedDate
        }
        aptStatus = await checkAppointments(checkDate,obj.slots, obj.doctor);
        if(aptStatus.status == 0){
            weeklyAptStatus = await checkWeeklyAppointments(checkDate,obj.slots, obj.doctor)
            return weeklyAptStatus;
        }else{
            return aptStatus
        }
    }
};

async function checkAppointments(checkDate,checkSlots,doctorId){
    let returnObject = {};
    let criteria = {
        $or: [
            {"scheduledService.date":checkDate},
            {"homeService.everyDayOrCustom": {$in: checkDate}},
            {"selfAppointment.dates": {$in: checkDate}}
        ],
        "status" : "PLACED",
        "doctor":ObjectId(doctorId)
    }
    let appntments = await Models.Appointment.find(criteria, {}, {lean: true});

    if(appntments.length > 0){
        for(let apts of appntments){

            for(let slot of checkSlots){

                if (apts.slots.indexOf(slot) != -1) {
                    returnObject = {"status":1,"date":checkDate, "slot":slot} //status 1 means date and slot is not available for appointment
                    return returnObject;
                }
            }
        }
        returnObject = {"status":0,"date":checkDate, "slot":""} //status 0 means date and slot is available for appointment
        return returnObject;
    }else{
        returnObject = {"status":0,"date":checkDate, "slot":""} //status 0 means date and slot is available for appointment
        return returnObject;
    }

}

async function checkWeeklyAppointments(checkDate,checkSlots,doctorId){
    let returnObject = {};
    let datesList;
    let criteria = {
        "homeService.weeklyDates.startDate":{$gte: checkDate},
        "homeService.weeklyDates.endDate":{$lt: checkDate},
        "homeservice.type":"WEEKLY",
        "status" : "PLACED",
        "doctor":ObjectId(doctorId)
    };
    let appntments = await Models.Appointment.find(criteria, {}, {lean: true});
    if(appntments.length > 0){
        for(let apts of appntments){
            if(apts.weekly && apts.weekly.length > 0){
                const indices = apts.weekly.reduce(
                  (out, bool, index) => bool ? out.concat(index) : out,
                  []
                )
            }
            //indices  = example [0,1,.5]
            if(weeklyRepeat){
                datesList = await dateFromWeekNumber(indices,4);
            }else{
                datesList = await dateFromWeekNumber(indices,1);
            }
            if (datesList.indexOf(checkDate) != -1) {
                for(let slot of checkSlots){
                    if (apts.slots.indexOf(slot) != -1) {
                        returnObject = {"status":1,"date":checkDate, "slot":slot} //status 1 means date and slot is not available for appointment
                        return returnObject;
                    }
                }
                returnObject = {"status":0,"date":checkDate, "slot":""} //status 0 means date and slot is available for appointment
                return returnObject;
            }else{
                returnObject = {"status":0,"date":checkDate, "slot":""} //status 0 means date and slot is available for appointment
                return returnObject;
            }
        }
        returnObject = {"status":0,"date":checkDate, "slot":""} //status 0 means date and slot is available for appointment
        return returnObject;
    }else{
        returnObject = {"status":0,"date":checkDate, "slot":""} //status 0 means date and slot is available for appointment
        return returnObject;
    }
}

async function checkHomeWeeklyAppointments(weekly,weeklyRepeat){

    let datesList;
    let indices;
    if(weekly && weekly.length > 0){
        indices = weekly.reduce(
          (out, bool, index) => bool ? out.concat(index) : out,
          []
        )
    }
    //indices  = example [0,1,.5]
    if(weeklyRepeat){
        datesList = await dateFromWeekNumber(indices,4);
    }else{
        datesList = await dateFromWeekNumber(indices,1);
    }
    return datesList;
}

function dayNumber(date){
    var date = moment(date);
    var dow = date.day();
    if(dow == 7){dow = 0;}
    return dow;
}

function dateFromWeekNumber(weekNumberArray, week){
    let dateArray = [];
    for(let i=1;i <= week; i++){
        for(let number of weekNumberArray){
            dateArray.push(moment().add(i, 'week').day(number).format('YYYY-MM-DD'));
        }
    }
    return dateArray;
}

async function getProfessionalsWorkingHours(doctorId, slots, dates){
    let data = await Models.Users.findOne({"_id":ObjectId(doctorId),"professional.workingHours": { $gt: [] }},{"professional.workingHours":1,_id:0});
    if(data == null ) {
        return {"status":3}
    }
    for(let date of dates){
        let dow = await dayNumber(date);
        if(data.professional.workingHours[dow].working == true){
            let startTime = data.professional.workingHours[dow].slots[0];
            let endTime = data.professional.workingHours[dow].slots[(data.professional.workingHours[dow].slots.length - 1)];
            let response = slots.some(el => el < startTime || el > endTime)
            if(response == true){
                return {"status":0, "startTime":data.professional.workingHours[dow].startTime, "endTime":data.professional.workingHours[dow].endTime, "day":moment().day(dow).format('dddd')}
            }
        }
    }
    return {"status":1}
/*
    if(data != null){
        let hours = data.professional.workingHours;
        for(let hour of hours){
            if(hour.working == false){
                hours[i].slots = []
            }else{
                hours[i].slots = hour.slots
            }
        }
    }*/
}

async function saveAppointment(model, payload){

    let appointmentData = [];
    //let appointmentId = [];

    let dateAr = []
    if(payload.type=="HOME"){
        if(payload.homeService && payload.homeService.type=="WEEKLY"){
            dateAr = payload.homeService.weeklyDates.dayWiseDates
        }else{
            dateAr = payload.homeService.everyDayOrCustom
        }
        for(let singleDate of dateAr){
            let convertSingleDateToArray = []
            convertSingleDateToArray.push(singleDate);
            if(payload.homeService && payload.homeService.type=="WEEKLY"){
                payload.homeService.weeklyDates.dayWiseDates = convertSingleDateToArray;
            }else{
                payload.homeService.everyDayOrCustom = convertSingleDateToArray;
            }
            let appointment = await Dao.saveData(Models.Appointment, payload);
            //appointmentId.push(appointment._id);
            appointmentData.push(appointment);
        }
    }else{
        let appointment = await Dao.saveData(Models.Appointment, payload);
        //appointmentId.push(appointment._id);
        appointmentData.push(appointment);
    }
    //await Dao.saveData(Models.Appointment, payload);
    /*let dateArray = [];
    for(let i=1;i <= week; i++){
        for(let number of weekNumberArray){
            dateArray.push(moment().add(i, 'week').day(number).format('YYYY-MM-DD'));
        }
    }
    return dateArray;*/
    return appointmentData;
    //return appointmentId;
}

function checkTodaySlots(slots,timezone){

    if(timezone==""){
        var m = moment(new Date());
    }else{
        let currentTime = new Date().toLocaleString("en-US", {timeZone: timezone})
        var m = moment(new Date(currentTime))
        //var m = momentTimezone(new Date(currentTime)).tz(timeZone);
    }
    var minutes = (m.hour()*60) + m.minute() + 30;//added 30mins to remove slot available within 30mins from now.
    var updatedSlots = slots.filter(function(x) {
        return x.slot > minutes;
    });
    return updatedSlots;
}

module.exports = {
    // create an appoinment for user -> HOME/ONLINE/ONSITE
    create: async (req, res, next) => {
        let payload = req.body;
        //console.log(JSON.stringify(payload), "payload -------");
        let homeserviceDates = [];
        try {

            payload.user = userData._id;
            var appointmentDate = "";
            if (userData.role.indexOf("PROFESSIONAL") != -1) {// to check it user who is creating appointment is a professional then create medication folders here.
                await createUserFolders();
            }
            //CHECK PROFESSIONALS SETTINGS
                let userSettings = await Models.Users.findOne({"_id":ObjectId(payload.doctor)},{homeConsultation:1,onlineConsultation:1, deviceType: 1, deviceToken: 1, language: 1});
                if((payload.type=="HOME" && userSettings != null && userSettings.homeConsultation == false) || (payload.type=="ONLINE" && userSettings != null && userSettings.onlineConsultation == false)){
                    return res.status(400).json({
                        status: 0,
                        message: "Sorry, professional not available for "+payload.type+" consultation",
                        data: {}
                    });
                }
            //CHECK PROFESSIONALS SETTINGS
            //CHECK TODAY'S TIME
            //console.log("type check --------- ")
            //CHECK TODAY'S TIME
                if(payload.type == "HOME" && (payload.homeService.type=="CUSTOM" || payload.homeService.type=="EVERYDAY") && payload.timeZone){
                    let startTime = await controllerUtil.convertTimeStringInMins([payload.homeService.startTime]);

                    let currentTime = await controllerUtil.convertTimeStringInMins([momentTimezone(new Date()).tz(req.headers.timezone).format('hh:mm A')]);
                    let currentDate = momentTimezone(new Date()).tz(req.headers.timezone).format('YYYY-MM-DD');
                    /*let currentTime = await controllerUtil.convertTimeStringInMins([moment(new Date().toLocaleString("en-US", {timeZone: payload.timeZone})).format('hh:mm A')]);
                    let currentDate = moment(new Date().toLocaleString("en-US", {timeZone: payload.timeZone})).format('YYYY-MM-DD');*/
                    //if((payload.homeService.everyDayOrCustom[0] == currentDate) && (startTime[0] < currentTime[0])){
                    appointmentDate = payload.homeService.everyDayOrCustom[0];
                    //console.log(payload.homeService.everyDayOrCustom[0]," <==== ",currentDate,") ||||||||||||||||| (",payload.homeService.everyDayOrCustom[0]," ================== ",currentDate," &&&&&&&& ",startTime[0]," <<<<<<<<< ",currentTime[0])
                    if((payload.homeService.everyDayOrCustom[0] < currentDate) || (payload.homeService.everyDayOrCustom[0] == currentDate && startTime[0] < currentTime[0])){
                        return res.status(400).json({
                            data: {},
                            status: 0,
                            message: "You can't choose a past time for your appointment"
                        });
                    }
                }else if(payload.type == "ONLINE" || payload.type == "ONSITE"){
                    let startTime = await controllerUtil.convertTimeStringInMins(payload.scheduledService.slots);
                    /*let currentTime = await controllerUtil.convertTimeStringInMins([moment(new Date().toLocaleString("en-US", {timeZone: payload.timeZone})).format('hh:mm A')]);
                    let currentDate = moment(new Date().toLocaleString("en-US", {timeZone: payload.timeZone})).format('YYYY-MM-DD');*/
                    
                    let currentTime = await controllerUtil.convertTimeStringInMins([momentTimezone(new Date()).tz(req.headers.timezone).format('hh:mm A')]);
                    let currentDate = momentTimezone(new Date()).tz(req.headers.timezone).format('YYYY-MM-DD');

                    //if((payload.scheduledService.date == currentDate) && (startTime[0] < currentTime[0])){
                    appointmentDate = payload.scheduledService.date;
                    //console.log(payload.scheduledService.date," <==== ",currentDate,") ||||||||||||||||| (",payload.scheduledService.date," ================== ",currentDate," &&&&&&&& ",startTime[0]," <<<<<<<<< ",currentTime[0])
                    if((payload.scheduledService.date < currentDate) || (payload.scheduledService.date == currentDate && startTime[0] < currentTime[0])){
                        return res.status(400).json({
                            data: {},
                            status: 0,
                            message: "You can't choose a past time for your appointment"
                        });
                    }
                }
            //CHECK TODAY'S TIME

            if(payload.type=="HOME" && (payload.appointmentId==undefined || payload.appointmentId=="" )){

                if(payload.homeService && payload.homeService.type=="WEEKLY"){ //if homeservice and is weekly then add a week start Date
                    payload.homeService.weeklyDates = {};

                    payload.homeService.weeklyDates.startDate = moment().add(1, 'week').day(0).format('YYYY-MM-DD')
                    if(payload.homeService.weeklyRepeat){
                        payload.homeService.weeklyDates.endDate = moment().add(4, 'week').day(6).format('YYYY-MM-DD')//month end date //28days
                    }else{
                        payload.homeService.weeklyDates.endDate = moment().add(1, 'week').day(6).format('YYYY-MM-DD') //week end date
                    }
                    payload.homeService.weeklyDates.dayWiseDates = await checkHomeWeeklyAppointments(payload.homeService.weekly,payload.homeService.weeklyRepeat);
                    homeserviceDates = payload.homeService.weeklyDates.dayWiseDates                    
                    appointmentDate = payload.homeService.weeklyDates.dayWiseDates[0];
                }
            }
            
            if (payload.homeService && payload.homeService.endTime && payload.homeService.startTime){


                let startTime = payload.homeService.startTime;
                let endTime = payload.homeService.endTime;

                var start = moment(startTime, 'hh:mm A');
                var end = moment(endTime, 'hh:mm A');
                start.minutes(Math.ceil(start.minutes() / 30) * 30);
                var result = [];
                var current = moment(start);
                let i =0;
                while (current <= end) {
                    result.push(current.format('hh:mm A'));
                    current.add(30, 'minutes');
                    i++;
                }
                let data = await controllerUtil.convertTimeStringInMins(result);
                data.splice(-1,1)
                payload.slots = data;
                if(payload.homeService.type=="EVERYDAY" || payload.homeService.type=="CUSTOM"){
                    homeserviceDates = payload.homeService.everyDayOrCustom;
                }
                if(payload.appointmentId != undefined && payload.appointmentId != "" ){ // checking single date in case of updation
                    homeserviceDates = [payload.updatedDate]
                }
                let professionalsWorkingHours = await getProfessionalsWorkingHours(payload.doctor,payload.slots,homeserviceDates); // check homeservice slots
                if(professionalsWorkingHours.status == 0){
                    return res.status(400).json({
                        data: {},
                        status: 0,
                        message: "This professional works between "+professionalsWorkingHours.startTime+" - "+professionalsWorkingHours.endTime+" on "+professionalsWorkingHours.day
                    });
                }else if(professionalsWorkingHours.status == 3){
                    return res.status(400).json({
                        status: 1,
                        message: "Selected professional have not added any working hours",
                        data: {}
                    });
                }
            }
            
            if (payload.scheduledService && payload.scheduledService.slots && payload.scheduledService.slots.length){
                payload.slots = await controllerUtil.convertTimeStringInMins(payload.scheduledService.slots);
            }

            
            let aptStatus  = await checkAppointmentConflict(payload);
            if(aptStatus.status == 1){ // return unavailable date and slot
                /*return res.status(200).json({
                    data: {"isSuccessful":false,"date":aptStatus.date,"slot":aptStatus.slot},
                    status: 0,
                    message: RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.SUCCESS.message.en
                });*/
                return sendResponse.sendSuccessData({"isSuccessful":false,"date":aptStatus.date,"slot":aptStatus.slot}, APP_CONSTANTS.STATUSCODE.SUCCESS,req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.SUCCESS, res);
            }

            
            if(!payload.checkAvailability){
                
                if(!payload.timeZone){
                    payload.timeZone = req.headers.timezone;
                }
                payload.createdByRole = userData.defaultLoginRole;
                let appointmentId = "";
                var apptmentDetails = {};
                
                if(payload.appointmentId != undefined && payload.appointmentId != "" ){ // checking single date in case of updation
                    var dataToUpdate = {
                        homeService : payload.homeService,/*{
                            "weeklyDates" : {
                                "dayWiseDates" : []
                            },
                            everyDayOrCustom:[],
                            startTime:payload.homeService.startTime,
                            endTime:payload.homeService.endTime
                        }*/
                        "scheduledService" : payload.scheduledService,/*{
                            "slots" : payload.scheduledService.slots, 
                            "date" : ""
                        },*/
                        slots:payload.slots,
                        isPushGenerated:true
                    }
                    if(payload.type=="HOME"){
                        if(payload.homeService && payload.homeService.type=="WEEKLY"){
                            dataToUpdate.homeService.weeklyDates.dayWiseDates = payload.updatedDate;
                        }else{
                            dataToUpdate.homeService.everyDayOrCustom = payload.updatedDate;
                        }
                    }else{
                        dataToUpdate.scheduledService.date = payload.updatedDate;
                    }
                    if(payload.userType == "0"){
                        dataToUpdate.isUserModified = true;
                    }else if(payload.userType == "1"){
                        dataToUpdate.isDoctorModified = true;
                    }
                    dataToUpdate.isUserConfirmed = false;
                    dataToUpdate.isDoctorConfirmed = false;
                    dataToUpdate.utcDateTime = await UtcConversion(payload.slots[0],payload.updatedDate,req.headers.timezone);
                    apptmentDetails = await Models.Appointment.findOneAndUpdate({"_id":ObjectId(payload.appointmentId)}, dataToUpdate)
                    
                    appointmentId = payload.appointmentId;
                }else{
                    payload.utcDateTime = await UtcConversion(payload.slots[0],appointmentDate,req.headers.timezone);
                    var apptmentDetailsTest = await saveAppointment(Models.Appointment, payload);
                    apptmentDetails = apptmentDetailsTest[0]
                    

                    appointmentId = apptmentDetails._id;
                    var firstDate = moment(new Date(appointmentDate)).format('YYYY-MM-DD');
                    var secondDate = moment(new Date()).format('YYYY-MM-DD');
                    if((firstDate).toString == (secondDate).toString){
                        var pushTime = moment(new Date(payload.utcDateTime));
                        var pushHour = pushTime.format("HH");
                        var pushMin = pushTime.format("mm");
                        await sendPushToPatient(apptmentDetails,pushHour,pushMin);
                        await sendPushToDoctor(apptmentDetails,pushHour,pushMin);
                    }
                }
                







                
                var pushTitle = "", pushType= "",pushMsg="",pushMessage="",recId="",apptId="";
                if(payload.appointmentId != undefined && payload.appointmentId != "" ){
                    if(payload.userType == "0"){
                        recId = apptmentDetails.doctor;
                    }else if(payload.userType == "1"){
                        recId = apptmentDetails.user;
                    }
                    pushTitle = APP_CONSTANTS.NOTIFICATION_TITLE.UPDATE_APPOINTMENT
                    pushType= APP_CONSTANTS.NOTIFICATION_TYPE.UPDATE_APPOINTMENT
                    pushMsg=APP_CONSTANTS.NOTIFICATION_MESSAGE.UPDATE_APPOINTMENT
                    pushMessage = APP_CONSTANTS.NOTIFICATION_MESSAGE.UPDATE_APPOINTMENT
                    apptId = payload.appointmentId;
                }else{
                    pushTitle = APP_CONSTANTS.NOTIFICATION_TITLE.CREATE_APPOINMENT
                    pushType= APP_CONSTANTS.NOTIFICATION_TYPE.CREATE_APPOINTMENT
                    pushMsg=APP_CONSTANTS.NOTIFICATION_MESSAGE.CREATE_APPOINMENT;
                    pushMessage = APP_CONSTANTS.NOTIFICATION_MESSAGE.CREATE_APPOINMENT
                    recId = payload.doctor;
                    apptId = appointmentId;
                }
                let userSettingsNew = await Models.Users.findOne({"_id":ObjectId(recId)},{deviceType: 1, deviceToken: 1, language: 1});
                pushMsg = pushMsg[userSettingsNew.language]
                pushTitle = pushTitle[userSettingsNew.language]
                    var usernm = userData.name ? userData.name: '';
                    let notificationData = {
                        "name": usernm,
                        "appointmentId": apptId.toString(),
                        "type": pushType,
                        "title": pushTitle,
                        "message": pushMsg + usernm,
                        "userId": recId.toString()
                    };

                    let notificationDataInsert = {
                        senderId: req.credentials._id,
                        receiverId: recId,
                        //propertyId: payload.propertyId,
                        appointmentId: apptId,
                        timeStamp: (new Date()).getTime(),
                        "type": pushType,
                        "title": pushTitle,
                        "message": {
                            'en': pushMessage['en'] + usernm,
                            'ar': pushMessage['ar'] + usernm
                        }
                    };

                    CommonController.sendPushNotification({
                        deviceType: userSettingsNew.deviceType,
                        deviceToken: userSettingsNew.deviceToken
                    }, notificationData);
                    CommonController.notificationUpdate(notificationDataInsert);
            }

            /*return res.status(200).json({
                data: {"isSuccessful":true},
                status: 1,
                message: RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.SUCCESS.message.en
            });*/
            return sendResponse.sendSuccessData({"isSuccessful":true}, APP_CONSTANTS.STATUSCODE.SUCCESS,req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.SUCCESS, res);
        } catch (err) {
            console.log("error in create funciton in controller under appointment in user under src---", err);
            next(err);
        }
    },

    /* list appointments of particular user, if id -> single appointment all details else -> list all appointment of user
    list appointments -> upcoming/past */
    get: async (req, res, next) => {
        const model = Models.Appointment, query = req.query, params = req.params;
        try {
            let finalResponse = {};

            let [ upComingAppointments, pastAppointments ] = await Promise.all([
                getAppointmentList(query, "1",req),
                getAppointmentList(query, "2",req)
            ]);
            /*if(process.env.ENABLE_DB_ENCRYPTION=="1" && upComingAppointments.appointment && upComingAppointments.appointment.length){
                if(process.env.ENABLE_DB_ENCRYPTION=="1"){
                    await decryptDBData(fileResult[i], ['fileName']);
                }
            }
            if(process.env.ENABLE_DB_ENCRYPTION=="1" && pastAppointments.appointment && pastAppointments.appointment.length){
                
            }*/
            

            if(query.type=="1"){ finalResponse = {"upcoming":upComingAppointments.appointment, count:upComingAppointments.count} }
            else if(query.type=="2") { finalResponse = {"past":pastAppointments.appointment, count:pastAppointments.count} }
            else { finalResponse = {"upcoming":upComingAppointments.appointment, "past":pastAppointments.appointment} } // added upcoming appointments to "past" object just for app testing - asked by Rishi on 2Aug

            return sendResponse.sendSuccessData(finalResponse, APP_CONSTANTS.STATUSCODE.SUCCESS,req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.SUCCESS, res);

        } catch (e) {
            console.log("error in get function in appointment under user in src----", e);
            next(e);
        }
    },
    appointmentDetails: async (req, res, next) => {
        const model = Models.Appointment, query = req.query, params = req.params;
        try {
            let criteria = {}
            var decryptColumns = ['fileId','reason','appointmentNumber'];
            var decryptColumns2 = ['feedback'];
            if (is.undefined(query.appointmentId) || is.empty(query.appointmentId)) {
                return res.status(400).json({status: 0, message: "Appointment Id is required"});
            }
            let todayDate = moment(new Date()).format('YYYY-MM-DD');
            if(req.headers.timezone!=undefined && req.headers.timezone!=""){
                todayDate = momentTimezone(new Date()).tz(req.headers.timezone).format('YYYY-MM-DD');
                //todayDate = moment(new Date().toLocaleString("en-US", {timeZone: query.timeZone})).format('YYYY-MM-DD')
            }
            criteria = { "_id":ObjectId(query.appointmentId) };
            let aggregate = [
                {
                    $match: criteria
                },
                {
                    "$lookup": {
                        from: "users",
                        foreignField: "_id",
                        localField: "doctor",
                        as: 'doctor'
                    }
                },
                { "$unwind": {
                        "path": "$doctor",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$lookup": {
                        from: "professionalspecialities",
                        foreignField: "_id",
                        localField: "doctor.professional.professionalSpeciality",
                        as: 'doctor.professional.professionalSpeciality'
                    }
                },{ "$unwind": {
                        "path": "$doctor.professional.professionalSpeciality",
                        "preserveNullAndEmptyArrays": true
                    }
                },

                {
                    "$lookup": {
                        from: "users",
                        foreignField: "_id",
                        localField: "user",
                        as: 'user'
                    }
                },
                { "$unwind": {
                        "path": "$user",
                        "preserveNullAndEmptyArrays": true
                    }
                },

                {
                    "$lookup": {
                        from: "apointmentfeedbacks",
                        foreignField: "appointmentId",
                        localField: "_id",
                        as: 'rating'
                    }
                },
                { "$unwind": {
                        "path": "$rating",
                        "preserveNullAndEmptyArrays": true
                    }
                },                
                            
                //RATING
                {
                    "$lookup": {
                        from: "apointmentfeedbacks",
                        foreignField: "userId",
                        localField: "doctor._id",
                        as: 'doctorRating'
                    }
                },
                //RATING

                {
                    $project: {
                        _id: 1,
                        scheduledService: 1,
                        homeService: 1,
                        selfAppointment: 1,
                        type: 1,
                        slots: 1,
                        status: 1,
                        createdAt: 1,
                        fileId: 1,
                        appointmentNumber:1,
                        reason:1,
                        followUpAppointment:1,
                        isAlreadyReportGenerate:1,
                        reportType:1,
                        createdByRole:1,
                        isPushGenerated:1,
                        isUserConfirmed:1,
                        isUserModified:1,
                        isDoctorConfirmed:1,
                        isDoctorModified:1,
                        consultationType:1,
                        utcDateTime:1,
                        doctor:{
                            _id:1,
                            profilePic:1,
                            coverPic:1,
                            name:1,
                            professional: {
                                professionalSpeciality: {
                                    specialityName:"$doctor.professional.professionalSpeciality.specialityName."+req.headers.language,
                                    specialist:"$doctor.professional.professionalSpeciality.specialist."+req.headers.language,
                                    serviceType:1
                                }

                            },
                            "feedbackRating": {
                                "$cond": {
                                    if: {
                                        "$gte": [{$size: "$doctorRating.rating"}, 1]
                                    }, then: {
                                        "$divide": [
                                            { $sum: "$doctorRating.rating" },
                                            { $size: "$doctorRating.rating" }
                                        ]
                                    }, else: 0
                                }
                            }
                        },
                        user:{
                            _id:1,
                            profilePic:1,
                            coverPic:1,
                            name:1,
                            defaultLoginRole:1,
                            user:{
                                dob:1
                            }
                        },
                        rating:{
                            "isRating": {$cond: [{$not: "$rating.rating"}, false, true]},
                            rating:{$cond: 
                                [{$not: "$rating.rating"}, 0, "$rating.rating"]},
                            feedback:{$cond: 
                                [{$not: "$rating.feedback"}, "", "$rating.feedback"]},

                        }
                    }
                }
            ];
            let appntments = await Models.Appointment.aggregate(aggregate);
            var curDate = moment(new Date()).format('YYYY-MM-DD');
            var appointmentDate = moment(new Date(appntments[0].utcDateTime)).format('YYYY-MM-DD');
            //console.log("if((",curDate,").toString == (",appointmentDate,").toString){");
            if((curDate).toString == (appointmentDate).toString){
                var curTime = moment(new Date()).format('HH:mm:ss')
                var appointmentTime = moment(new Date(appntments[0].utcDateTime)).format('HH:mm:ss')
                var timeDiff = moment.utc(appointmentTime,'HH:mm:ss').diff(moment.utc(curTime,'HH:mm:ss'), 'minutes')

                //console.log("if(",timeDiff," < 30){")
                if(timeDiff < 30){
                    Models.Appointment.updateOne({"_id": ObjectId(appntments[0]._id)},{"isPushGenerated":true}, function (updateErr, updateCheck) {});
                    appntments[0].isPushGenerated = true;
                }
            }
            //console.log("appntments[0] ============================= ",appntments[0])
            var appointmentTimeAhead = true;
            let canCreate = false;
            if(appntments[0].type == "HOME" && (appntments[0].homeService.type=="CUSTOM" || appntments[0].homeService.type=="EVERYDAY")){
                let startTime = await controllerUtil.convertTimeStringInMins([appntments[0].homeService.startTime]);
                /*let currentTime = await controllerUtil.convertTimeStringInMins([moment(new Date().toLocaleString("en-US", {timeZone: req.headers.timezone})).format('hh:mm A')]);
                let currentDate = moment(new Date().toLocaleString("en-US", {timeZone: req.headers.timezone})).format('YYYY-MM-DD');*/

                let currentTime = await controllerUtil.convertTimeStringInMins([momentTimezone(new Date()).tz(req.headers.timezone).format('hh:mm A')]);
                let currentDate = momentTimezone(new Date()).tz(req.headers.timezone).format('YYYY-MM-DD');

                //if((appntments[0].homeService.everyDayOrCustom[0] <= currentDate) && (startTime[0] < currentTime[0])){
                if((appntments[0].homeService.everyDayOrCustom[0] < currentDate) || (appntments[0].homeService.everyDayOrCustom[0] == currentDate && startTime[0] < currentTime[0])){
                    appointmentTimeAhead = false
                }
                if((appntments[0].homeService.everyDayOrCustom[0] < currentDate) || (appntments[0].homeService.everyDayOrCustom[0] == currentDate && startTime[0] < currentTime[0])){
                    appointmentTimeAhead = false
                }

                if((appntments[0].homeService.everyDayOrCustom[0] < currentDate) || (appntments[0].homeService.everyDayOrCustom[0] == currentDate && (startTime[0]-30) < currentTime[0])){
                    canCreate = true
                }
            }else if(appntments[0].type == "ONLINE" || appntments[0].type == "ONSITE"){
                let startTime = await controllerUtil.convertTimeStringInMins(appntments[0].scheduledService.slots);
                let currentTime = await controllerUtil.convertTimeStringInMins([/*moment(new Date().toLocaleString("en-US", {timeZone: appntments[0].timeZone})).format('hh:mm A')*/momentTimezone(new Date()).tz(req.headers.timezone).format('hh:mm A')]);
                let currentDate = momentTimezone(new Date()).tz(req.headers.timezone).format('YYYY-MM-DD')
                //moment(new Date().toLocaleString("en-US", {timeZone: appntments[0].timeZone})).format('YYYY-MM-DD');

                //console.log(appntments[0].scheduledService.slots,"++++++++++++++++++++++++++++++",appntments[0].scheduledService.date," ======== ",currentDate,") &&&&&&& (",startTime[0]," <<<<<<<<<<< ",currentTime[0])

                if((appntments[0].scheduledService.date < currentDate) || (appntments[0].scheduledService.date == currentDate && startTime[0] < currentTime[0])){
                    appointmentTimeAhead = false
                }
                if((appntments[0].scheduledService.date < currentDate) || (appntments[0].scheduledService.date == currentDate && (startTime[0]-30) < currentTime[0])){
                    canCreate = true
                }

                        
            }
            appntments[0].appointmentTimeAhead = appointmentTimeAhead;
            appntments[0].canCreate = canCreate;

            if(process.env.ENABLE_DB_ENCRYPTION=="1" && appntments[0] != undefined){
                await decryptDBData(appntments[0].rating, decryptColumns2);
            }
            //console.log("appntments[0] =----------------- ",appntments[0])

            return sendResponse.sendSuccessData(appntments[0], APP_CONSTANTS.STATUSCODE.SUCCESS,req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.SUCCESS, res,decryptColumns);
        } catch (e) {
            console.log("error in get function in appointment under user in src----", e);
            next(e);
        }
    },
    receivedAppointment: async (req, res, next) => {
        const model = Models.Appointment, query = req.query, params = req.params;
        let searchDate = {}
        try {
            let criteria = {};
            var decryptColumns = ['fileId','appointmentNumber'/*,'houseNumber','addressName'*/];
            var decryptColumns2 = ['feedback'];
            criteria = {
                doctor: ObjectId(userData._id),
                //status : "PLACED",
                type:{$ne:"SELF"},
            };
            console.log("query--------------- ",JSON.stringify(query))
            let checkDate = moment(new Date().toLocaleString("en-US", {timeZone: req.headers.timezone})).format('YYYY-MM-DD');
            if(query.bookingType && query.bookingType!=""){ criteria.type = query.bookingType }// ONLINE,ONSITE,HOME
            if(query.userId && query.userId!=""){ criteria.user = query.userId } //beneficiary ID
            if(query.appointmentType && query.appointmentType=="1"){ // today
                //let checkDate = moment().format('YYYY-MM-DD');
                criteria.$or =  [
                    {"type":"HOME",
                        $or: [
                            {   "homeService.type":"EVERYDAY",
                                "homeService.everyDayOrCustom": {$in: [checkDate]} },
                            {   "homeService.type":"CUSTOM",
                                "homeService.everyDayOrCustom": {$in: [checkDate]} },
                            {   "homeService.type":"WEEKLY",
                                "homeService.weeklyDates.dayWiseDates": {$in: [checkDate]} }
                        ]
                    },
                    {   "type":"ONLINE",
                        "scheduledService.date": checkDate },
                    {   "type":"ONSITE",
                        "scheduledService.date": checkDate }]
            }else if(query.appointmentType && query.appointmentType=="2"){ // all upcoming
                //let checkDate = moment().format('YYYY-MM-DD');
                criteria.$or =  [
                    {"type":"HOME",
                        $or: [
                            {   "homeService.type":"EVERYDAY",
                                "homeService.everyDayOrCustom": {$gt:checkDate} },
                            {   "homeService.type":"CUSTOM",
                                "homeService.everyDayOrCustom": {$gt:checkDate} },
                            {   "homeService.type":"WEEKLY",
                                "homeService.weeklyDates.dayWiseDates": {$gt:checkDate} }
                        ]
                    },
                    {   "type":"ONLINE",
                        "scheduledService.date": {$gt:checkDate} },
                    {   "type":"ONSITE",
                        "scheduledService.date": {$gt:checkDate} }]
            }
            if((query.startDate && query.startDate!="") && (query.endDate && query.endDate!="")){
                searchDate = {$gte:query.startDate,$lte:query.endDate}
            }
            else if(query.startDate && query.startDate!=""){
                searchDate = {$gte:query.startDate}
            }
            else if(query.endDate && query.endDate!=""){
                searchDate = {$lte:query.endDate}
            }
            if(searchDate && Object.keys(searchDate).length > 0){
                criteria.$or = [
                  {"homeService.weeklyDates.dayWiseDates":searchDate},
                  {"homeService.everyDayOrCustom":searchDate},
                  {"scheduledService.date":searchDate}
                ]
            }

            let appntmentsCount = await Models.Appointment.countDocuments(criteria);

            if(query.lastId && query.lastId!=""){ criteria._id = {$lt:ObjectId(query.lastId)} } //FOR PAGINATION
            if (is.undefined(query.count) || is.empty(query.count)) { query.count = 100; }
            else{ query.count = Number(query.count); } //FOR PAGINATION
            console.log("criteria --------------------- ",criteria)
            
            /*let appntments = await Models.Appointment.find(criteria, {doctor:0}, {lean: true})

            .populate({
                path : 'user',
                select:'_id profilePic coverPic name user.dob'
            }).sort({"_id":-1}).limit(query.count)

            .exec();*/
            let aggregate = [
                {
                    $match: criteria
                },
                {
                    "$lookup": {
                        from: "users",
                        foreignField: "_id",
                        localField: "user",
                        as: 'user'
                    }
                },
                { "$unwind": {
                        "path": "$user",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$lookup": {
                        from: "apointmentfeedbacks",
                        foreignField: "appointmentId",
                        localField: "_id",
                        as: 'rating'
                    }
                },
                { "$unwind": {
                        "path": "$rating",
                        "preserveNullAndEmptyArrays": true
                    }
                },

                {
                    $project: {
                        _id: 1,
                        scheduledService: 1,
                        homeService: 1,
                        selfAppointment: 1,
                        type: 1,
                        slots: 1,
                        status: 1,
                        createdAt: 1,
                        fileId: 1,
                        appointmentNumber: 1,
                        consultationType:1,
                        user:{
                            _id:1,
                            profilePic:1,
                            coverPic:1,
                            name:1,
                            user:{
                                dob:1
                            }
                        },
                        rating:{
                            "isRating": {$cond: [{$not: "$rating.rating"}, false, true]},
                            rating:{$cond: 
                                [{$not: "$rating.rating"}, 0, "$rating.rating"]},
                            feedback:{$cond: 
                                [{$not: "$rating.feedback"}, "", "$rating.feedback"]},

                        }
                    }
                },
                {$sort: {_id: -1}},
                {$limit: query.count}
            ];
            let appntments = await Models.Appointment.aggregate(aggregate);
            /*return res.status(200).json({
                status: 1,
                message: RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.SUCCESS.message.en,
                data: {"upcoming":appntments, count:appntmentsCount}
            });*/
            if(process.env.ENABLE_DB_ENCRYPTION=="1" && appntments.length > 0){
                for(let x in appntments){
                    await decryptDBData(appntments[x], decryptColumns);
                    await decryptDBData(appntments[x].rating, decryptColumns2);
                }
            }
            return sendResponse.sendSuccessData({"upcoming":appntments, count:appntmentsCount}, APP_CONSTANTS.STATUSCODE.SUCCESS,req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.SUCCESS, res);
        } catch (e) {
            console.log("error in get function in appointment under user in src----", e);
            next(e);
        }
    },
    cancelAppointment: async (req, res, next) => {
        const query = req.body;
        try {
            if (is.undefined(query.appointmentId) || is.empty(query.appointmentId)) {
                return res.status(400).json({status: 0, message: "Appointment Id is required"});
            }
            if (is.undefined(query.reason) || is.empty(query.reason)) {
                return res.status(400).json({status: 0, message: "Reason is required"});
            }
            var encryptColumns = ['reason'];
            let criteria = {"_id":ObjectId(query.appointmentId)}
            if(process.env.ENABLE_DB_ENCRYPTION=="1"){
                await encryptDBData(query, encryptColumns);
            }
            let dataToSet = {
                $set: {
                    status: APP_CONSTANTS.DATABASE.APPOINTMENT_STATUS.CANCELLED,
                    reason: query.reason
                }
            }
            Models.Appointment.findOneAndUpdate(criteria, dataToSet, function (errUpdate, resultUpdate) {
                if (errUpdate) {
                    return sendResponse.sendErrorMessageData(400,req.headers.language,APP_CONSTANTS.STATUS_MSG.ERROR.DEFAULT,errUpdate,res);
                } else {
                    var scheduledJob = schedule.scheduledJobs[resultUpdate._id];
                    console.log("scheduledJob ======== ",scheduledJob)
                    if(scheduledJob){
                        scheduledJob.cancel();
                    }
                    var recId = resultUpdate.user;
                    if((req.credentials._id).toString() == (resultUpdate.user).toString()){
                        recId = resultUpdate.doctor;
                    }
                    sendPush(
                        Constants.NOTIFICATION_TYPE.CANCEL_APPOINTMENT,
                        Constants.NOTIFICATION_TITLE.CANCEL_APPOINTMENT,
                        Constants.NOTIFICATION_MESSAGE.CANCEL_APPOINTMENT,
                        recId, //rec
                        query.appointmentId, //content
                        query.appointmentId, //content
                        req.credentials._id //sender
                    )
                    return res.status(200).json({
                        status: 1,
                        message: RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.SUCCESS.message.en,
                        data: {}
                    });
                }
            });
        } catch (e) {
            console.log("error in get function in appointment under user in src----", e);
            next(e);
        }
    },
    confirmAppointment: async (req, res, next) => {
        const query = req.body;
        try {
            if (is.undefined(query.appointmentId) || is.empty(query.appointmentId)) {
                return res.status(400).json({status: 0, message: "Appointment Id is required"});
            }
            if (is.undefined(query.userType) || is.empty(query.userType)) {
                return res.status(400).json({status: 0, message: "userType is required"});
            }
            let criteria = {"_id":ObjectId(query.appointmentId)}
            let dataToSet = { $set: { isUserConfirmed : true}}
            if(query.userType == "1"){
                dataToSet = { $set: { isDoctorConfirmed : true}}
            }
            Models.Appointment.findOneAndUpdate(criteria, dataToSet, function (errUpdate, resultUpdate) {
                if (errUpdate) {
                    return sendResponse.sendErrorMessageData(400,req.headers.language,APP_CONSTANTS.STATUS_MSG.ERROR.DEFAULT,errUpdate,res);
                } else {
                    var recId = ""
                    if(query.userType == "0"){
                        recId = resultUpdate.doctor;
                    }else if(query.userType == "1"){
                        recId = resultUpdate.user;
                    }
                    sendPush(
                        Constants.NOTIFICATION_TYPE.APPOINTMENT_CONFIRMATION,
                        Constants.NOTIFICATION_TITLE.APPOINTMENT_CONFIRMATION,
                        Constants.NOTIFICATION_MESSAGE.APPOINTMENT_CONFIRMATION,
                        recId, //rec
                        query.appointmentId, //content
                        query.appointmentId, //content
                        req.credentials._id //sender
                    )
                    return res.status(200).json({
                        status: 1,
                        message: RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.SUCCESS.message.en,
                        data: {}
                    });
                }
            });
        } catch (e) {
            console.log("error in get function in appointment under user in src----", e);
            next(e);
        }
    },
    /*updateAppointment: async (req, res, next) => {
        const payload = req.body;
        try {
            if (is.undefined(payload.appointmentId) || is.empty(payload.appointmentId)) {
                return res.status(400).json({status: 0, message: "Appointment Id is required"});
            }
            if (is.undefined(payload.userType) || is.empty(payload.userType)) {
                return res.status(400).json({status: 0, message: "userType is required"});
            }
            if (is.undefined(payload.newDate) || is.empty(payload.newDate)) {
                return res.status(400).json({status: 0, message: "newDate is required"});
            }
            if (is.undefined(payload.newTime) || is.empty(payload.newTime)) {
                return res.status(400).json({status: 0, message: "newTime is required"});
            }
            if (is.undefined(payload.appointmentType) || is.empty(payload.appointmentType)) {
                return res.status(400).json({status: 0, message: "appointmentType is required"});
            }
            let criteria = {"_id":ObjectId(payload.appointmentId)}
            Models.Appointment.findOne(criteria, function (err, result) {
                if (err) {
                    return sendResponse.sendErrorMessageData(400,req.headers.language,APP_CONSTANTS.STATUS_MSG.ERROR.DEFAULT,err,res);
                } else {
                    var recId = ""
                    if(payload.userType == "0"){
                        recId = result.user;
                    }else if(payload.userType == "1"){
                        recId = result.doctor;
                    }
                    sendPush(
                        Constants.NOTIFICATION_TYPE.APPOINTMENT_CONFIRMATION,
                        Constants.NOTIFICATION_TITLE.APPOINTMENT_CONFIRMATION,
                        Constants.NOTIFICATION_MESSAGE.APPOINTMENT_CONFIRMATION,
                        recId, //rec
                        payload.appointmentId, //content
                        req.credentials._id //sender
                    )
                    return res.status(200).json({
                        status: 1,
                        message: RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.SUCCESS.message.en,
                        data: {}
                    });
                }
            });
        } catch (e) {
            console.log("error in get function in appointment under user in src----", e);
            next(e);
        }
    },*/
    bookedProfessionalsList: async (req, res, next) => {
        const model = Models.Appointment,
                    query = req.query,
                    params = req.params;
        try {
            let criteria = {};
            criteria = {
                user: ObjectId(userData._id),
                status : "PLACED"
            };
            let doctors = await Models.Appointment.find(criteria, {doctor:1}, {lean: true}).distinct('doctor');
            let professionals = await Models.Users.find({'_id':{$in : doctors}}, {_id:1, profilePic:1, coverPic:1, name:1, "professional.professionalSpeciality":1,})
            .populate({
                path : 'professional.professionalSpeciality',
                select:'specialityName'
            })
            .exec();

            let queryPromises = [];
            professionals = JSON.parse(JSON.stringify(professionals));
            for (let ress of professionals){
                ress.professional.professionalSpeciality.specialityName = ress.professional.professionalSpeciality.specialityName[req.headers.language]
                queryPromises.push(ress);
            }
            professionals = queryPromises;

            /*return res.status(200).json({
                status: 1,
                message: RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.SUCCESS.message.en,
                data: {"professionals":professionals}
            });*/
            return sendResponse.sendSuccessData({"professionals":professionals}, APP_CONSTANTS.STATUSCODE.SUCCESS,req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.SUCCESS, res);
        } catch (e) {
            console.log("error in get function in appointment under user in src----", e);
            next(e);
        }
    },
    getConsultantPriceList: async (req, res, next) => {
        try {
            let language = req.headers.language || 'en';
            let obj = req.query;
            let role = "PROFESSIONAL";
            if (userData.role.indexOf("USER") != -1) {
                role = "USER";
            }
            if (userData.role.indexOf("FACILITY") != -1) {
                role = "FACILITY";
            }
            let doctorData = await Models.Users.findOne( {"_id": ObjectId(obj.doctorId)},{"professional.professionalSpeciality":1,"professional.professionalType":1} );
            let criteria = {};
            criteria = {
                isActive: true,
                consultType: APP_CONSTANTS.DATABASE.CONSULT_TYPES.ONLINE,
                type:role,
                speciality:ObjectId(doctorData.professional.professionalSpeciality),
                level:ObjectId(doctorData.professional.professionalType)
            };

            //let user = await Dao.findOne(Models.Users, { _id: ObjectId(req.query.doctorId) })

            /*let professionalType = user && user.professional && user.professional.professionalType ?
                user.professional.professionalType : '';*/

            //console.log(language, professionalType);

            //criteria.level = { $in: [professionalType] };

            let aggregateForOnline = [
                {
                    $match: criteria
                },
                { $unwind: "$title"},
				{ $unwind: "$currency"},
                {
                    "$match": {
                        "title.type": language,
                        "currency.type":language
                    }
                },
                {
                    $group: {
                        _id: {"type": '$consult'},
                        consultData: {
                            $push: {
                                "_id": "$_id",
                                "name": "$title.name",
                                "consult": "consult",
                                "price" : "$price",
                                "minute" : "$minute",
                                "currency": "$currency.name",
                                //"currency": "$currency"
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        "type": "$_id.type",
                        "consultData": "$consultData"
                    }
                },
                {
                    "$sort": {"createdAt": -1}
                }
            ];
            console.log("aggregateForOnline---------",JSON.stringify(aggregateForOnline))

            let getOffSiteAndHome = [
                {
                    $match: {
                        consultType: {$in: [ APP_CONSTANTS.DATABASE.CONSULT_TYPES.OFFSITE, APP_CONSTANTS.DATABASE.CONSULT_TYPES.HOME ]},
                        "isActive": true,
                        //level: { $in: [professionalType] }
		                type:role,
		                speciality:ObjectId(doctorData.professional.professionalSpeciality),
		                level:ObjectId(doctorData.professional.professionalType)

        }
                },
                { $unwind: "$title" },
                {
                    "$match": {
                        "title.type": language
                    }
                },
                {
                    $group: {
                        _id: {"type": '$consultType'},
                        consultData: {
                            $push: {
                                "_id": "$_id",
                                "name": "$title.name",
                                "consult": "consult",
                                "price" : "$price",
                                "minute" : "$minute",
                                "currency": "$currency"
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        "type": "$_id.type",
                        "consultData": "$consultData"
                    }
                },
                {
                    "$sort": {"createdAt": -1}
                }
            ];

            console.log("getOffSiteAndHome---------",JSON.stringify(getOffSiteAndHome))


            let [ onlineConsult, offlineAndHomeConsult ] = await Promise.all([
                Dao.aggregateData(Models.Consultation, aggregateForOnline),
                Dao.aggregateData(Models.Consultation, getOffSiteAndHome)
            ]);

            let offlineData = [];
            let homeData = [];

            offlineAndHomeConsult.map((item) => {
                if (item.type === APP_CONSTANTS.DATABASE.CONSULT_TYPES.OFFSITE) {
                    offlineData = item && item.consultData ? item.consultData : [];
                }
                else if (item.type === APP_CONSTANTS.DATABASE.CONSULT_TYPES.HOME) {
                    homeData = item && item.consultData ? item.consultData : [];
                }
            });

            console.log(offlineAndHomeConsult,"11111111------------------------+ ",onlineConsult)

            /*return res.status(200).json({
                status: 1,
                message: RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.SUCCESS.message.en,
                data: { onlineConsult, offlineData, homeData }
            });*/
            return sendResponse.sendSuccessData({ onlineConsult, offlineData, homeData }, APP_CONSTANTS.STATUSCODE.SUCCESS,req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.SUCCESS, res);
        } catch (e) {
            console.log("error in get function in appointment under user in src----", e);
            next(e);
        }
    },
    getImage: async (req, res, next) => {
        let newPath = path.join(__dirname, '/../../../public/private_uploads/', req.query.name);

        console.log(newPath);

        return res.status(200).sendFile(newPath);
    },
    uploadFile: async (req, res)=> {

        // console.log("************* uploadFile ******************");
        // console.log(req.body);

        let payload = req.body;
        try {
            if (req.files.image && req.files.image.name) {
                let url = await commonFunctions.privateFileFolderUpload(req.files.image, "FILE", payload.type);
                url.type = payload.type;
                /*return res.status(200).json({
                    status: 1,
                    message: 'Successufully',
                    data: url
                });*/
                return sendResponse.sendSuccessData(url, APP_CONSTANTS.STATUSCODE.SUCCESS,req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.SUCCESS, res);
            }
            else {
                console.log(req.files.image)
                return sendResponse.sendErrorMessage(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
            }
        }
        catch (err) {
            console.log(err);
            return sendResponse.sendErrorMessage(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
            // return res.status(400).json({status: 0, message: "Something went wrong"});
        }
    },
    uploadFiles: async (req, res)=> {

        // console.log("************* uploadFile ******************");
         console.log(req.files);

        let payload = req.body;
        try {
            if (Array.isArray(req.files.image)) {
                if (req.files.image && req.files.image.length > 0) {
                    let filesUpload = [];

                    for (let i = 0; i < req.files.image.length; i++) {
                        let url = await commonFunctions.privateFileFolderUpload(req.files.image[i], "FILE", payload.type);
                        url.type = payload.type;
                        if (payload.imgtype) {
                            url.imgtype = payload.imgtype;
                        }
                        if (payload.duration) {
                            url.duration = payload.duration;
                        }
                        filesUpload.push(url);
                    }
                    /*return res.status(200).json({
                        status: 1,
                        message: 'Successufully',
                        data: filesUpload
                    });*/
                    return sendResponse.sendSuccessData(filesUpload, APP_CONSTANTS.STATUSCODE.SUCCESS,req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                }
                else {
                    //console.log(req.files.image, req.files.image.name)
                    return sendResponse.sendErrorMessage(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
                }
            }
            else if (req.files.image && req.files.image.name) {
                let url = await commonFunctions.privateFileFolderUpload(req.files.image, "FILE", payload.type);
                url.type = payload.type;
              //  console.log(url);
                if (payload.imgtype) {
                    url.imgtype = payload.imgtype;
                }
                /*return res.status(200).json({
                    status: 1,
                    message: 'Successufully',
                    data: [url]
                });*/
                return sendResponse.sendSuccessData([url], APP_CONSTANTS.STATUSCODE.SUCCESS,req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
            }
            else {
                //console.log(req.files.image, req.files.image.name)
                return sendResponse.sendErrorMessage(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
            }
        }
        catch (err) {
            console.log(err);
            return sendResponse.sendErrorMessage(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
            // return res.status(400).json({status: 0, message: "Something went wrong"});
        }
    },
    getCommonService: async (req, res, next) => {
        try {
            let schema =  Joi.object().keys({
                type: Joi.string().required().valid([
                    APP_CONSTANTS.DATABASE.COMMON_SERVICE_TYPE.Diagnosis,
                    APP_CONSTANTS.DATABASE.COMMON_SERVICE_TYPE.Radiology,
                    APP_CONSTANTS.DATABASE.COMMON_SERVICE_TYPE.Labs,
                    APP_CONSTANTS.DATABASE.COMMON_SERVICE_TYPE.Special_Test
                ]),
                limit: Joi.number().optional().default(500),
                lastId: Joi.string().optional().length(24),
                skip: Joi.number().optional(),
                search: Joi.string().optional().allow('')
            });

            // if(query.lastId && query.lastId!=""){ criteria._id = {$lt:ObjectId(query.lastId)} }

            let payload = await UniversalFunctions.validateSchema(req.query, schema, {presence: "required"});

            let criteria = { isActive: true, type: payload.type };

            if (payload.lastId) {
                criteria._id = { $lt: ObjectId(payload.lastId) };
            }

            if (payload.search) {
                let keyword ={$regex:commonFunctions.escapeRegExp(payload.search),$options:'i'};
                criteria['title.name'] = keyword;
            }

            let aggregate = [
                {
                    $match: criteria
                },
                { $unwind: "$title"},
                {
                    "$match": {
                        "title.type": req.headers.language || 'en'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        "type": "$title.type",
                        "name": "$title.name"
                    }
                },
                {
                    "$sort": {"_id": -1}
                }
            ];

            if (payload.limit) {
                aggregate.push({ "$limit": payload.limit });
            }

          //  console.log(JSON.stringify(aggregate));

            let [ commonData, count ] = await Promise.all([
                Dao.aggregateData(Models.CommonServiceType, aggregate),
                Dao.count(Models.CommonServiceType, criteria)
            ]);

            return sendResponse.sendSuccessData({ commonData, count }, APP_CONSTANTS.STATUSCODE.SUCCESS,
                req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);

        }
        catch (err) {
             console.log(err);
            if (err.isJoi) {
                return sendResponse.sendError(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, err.message, req.headers.language, res);
            }
            else {
                return sendResponse.sendErrorMessage(APP_CONSTANTS.STATUSCODE.BAD_REQUEST,
                    req.headers.language, err, res);
            }
        }
    },
    createEReport: async (req, res, next) =>  {
        try {
            let schema =  Joi.object().keys({
                appointmentId: Joi.string().required().length(24),
                allergies: Joi.string().required(),
                chiefComplaint: Joi.string().required(),
                diagnostics: Joi.array().items(Joi.string().required().length(24)),
                history: Joi.string().required(),
                examinationDiagnosticsResult: Joi.string().required(),
                managementPlanRecommendation: Joi.string().required()
            });

            let payload = await UniversalFunctions.validateSchema(req.body, schema, {presence: "required"});

            var encryptColumns = ['allergies','chiefComplaint','history','examinationDiagnosticsResult','managementPlanRecommendation'];
            if(process.env.ENABLE_DB_ENCRYPTION=="1"){
                await encryptDBData(payload, encryptColumns);
            }
            let checkAppointment = await Dao.findOne(Models.Appointment, { "_id": ObjectId(payload.appointmentId) },
                { "_id": 1, user: 1, doctor: 1 }, {lean: true})

            if (!checkAppointment) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID;

            payload.userId = checkAppointment.user;
            payload.professionalId = checkAppointment.doctor;

            // console.log("payload", JSON.stringify(payload));

            let saveData = await Dao.saveData(Models.PatientAppointmentReport, payload);

            return sendResponse.sendSuccessData({ "reportId": saveData._id }, APP_CONSTANTS.STATUSCODE.SUCCESS,
                req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);

        }
        catch (err) {
            console.log(err);
            if (err.isJoi) {
                return sendResponse.sendError(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, err.message, req.headers.language, res);
            }
            else {
                return sendResponse.sendErrorMessage(APP_CONSTANTS.STATUSCODE.BAD_REQUEST,
                    req.headers.language, err, res);
            }
        }
    },
    ereportUpdate: async (req, res, next) => {
        try {

          //  console.log(req.headers);

            let schema =  Joi.object().keys({
                appointmentId: Joi.string().when('stepwise', { is: APP_CONSTANTS.DATABASE.REPORTS_STEPWISE.E_REPORT,
                    then: Joi.string().required().length(24), otherwise: Joi.optional() }),
                dependentId: Joi.string().optional().length(24),
                allergies:Joi.string().when('stepwise', { is: APP_CONSTANTS.DATABASE.REPORTS_STEPWISE.E_REPORT,
                    then: Joi.string().optional().allow(''), otherwise: Joi.optional().allow('') }),
                chiefComplaint: Joi.string().when('stepwise', { is: APP_CONSTANTS.DATABASE.REPORTS_STEPWISE.E_REPORT,
                    then: Joi.string().required(), otherwise: Joi.optional() }),
                diagnostics: Joi.array().when('stepwise', { is: APP_CONSTANTS.DATABASE.REPORTS_STEPWISE.E_REPORT,
                    then: Joi.array().items(Joi.string().required().length(24)), otherwise: Joi.optional() }),
                history: Joi.string().when('stepwise', { is: APP_CONSTANTS.DATABASE.REPORTS_STEPWISE.E_REPORT,
                    then: Joi.string().required(), otherwise: Joi.optional() }),
                examinationDiagnosticsResult: Joi.string().when('stepwise', { is: APP_CONSTANTS.DATABASE.REPORTS_STEPWISE.E_REPORT,
                    then: Joi.string().required(), otherwise: Joi.optional() }),
                managementPlanRecommendation: Joi.string().when('stepwise', { is: APP_CONSTANTS.DATABASE.REPORTS_STEPWISE.E_REPORT,
                    then: Joi.string().required(), otherwise: Joi.optional() }),
                "reportId": Joi.string().optional().length(24),
                "tests": Joi.array().when('stepwise', { is: APP_CONSTANTS.DATABASE.REPORTS_STEPWISE.TEST_REQ,
                    then: Joi.array().items(Joi.string().required().length(24)), otherwise: Joi.optional() }),
                "testComments": Joi.string().when('stepwise', { is: APP_CONSTANTS.DATABASE.REPORTS_STEPWISE.TEST_REQ,
                    then: Joi.string().optional().allow(''), otherwise:  Joi.optional().allow('') }),
                "medications": Joi.array().when('stepwise', { is: APP_CONSTANTS.DATABASE.REPORTS_STEPWISE.E_PRESCRIPTION,
                    then: Joi.array().items( Joi.object().keys({
                        name: Joi.string().required(),
                        dose: Joi.string().required(),
                        frequency: Joi.string().required(),
                        duration: Joi.string().required()
                    })), otherwise: Joi.optional() }),
                medicationsComments: Joi.string().when('stepwise', { is: APP_CONSTANTS.DATABASE.REPORTS_STEPWISE.E_PRESCRIPTION,
                    then: Joi.string().optional().allow(''), otherwise: Joi.optional().allow('') }),
                followUpDate: Joi.string().when('stepwise', { is: APP_CONSTANTS.DATABASE.REPORTS_STEPWISE.FOLLOW_UP_APPOINTMENT,
                    then: Joi.string().required(), otherwise: Joi.optional().allow('') }),
                startTime: Joi.string().when('stepwise', { is: APP_CONSTANTS.DATABASE.REPORTS_STEPWISE.FOLLOW_UP_APPOINTMENT,
                    then: Joi.string().optional().allow(''), otherwise: Joi.optional().allow('') }),
                endTime: Joi.string().when('stepwise', { is: APP_CONSTANTS.DATABASE.REPORTS_STEPWISE.FOLLOW_UP_APPOINTMENT,
                    then: Joi.string().optional().allow(''), otherwise: Joi.optional().allow('') }),
                slots: Joi.array().when('stepwise', { is: APP_CONSTANTS.DATABASE.REPORTS_STEPWISE.FOLLOW_UP_APPOINTMENT,
                    then: Joi.array().optional(), otherwise: Joi.optional() }),
                referDoctorId: Joi.string().when('stepwise', { is: APP_CONSTANTS.DATABASE.REPORTS_STEPWISE.PROFESSIONAL_FACILTY,
                    then: Joi.string().required().length(24), otherwise: Joi.optional().allow('') }),
                stepwise: Joi.number().required().valid([
                    APP_CONSTANTS.DATABASE.REPORTS_STEPWISE.E_REPORT,
                    APP_CONSTANTS.DATABASE.REPORTS_STEPWISE.PROFESSIONAL_FACILTY,
                    APP_CONSTANTS.DATABASE.REPORTS_STEPWISE.FOLLOW_UP_APPOINTMENT,
                    APP_CONSTANTS.DATABASE.REPORTS_STEPWISE.E_PRESCRIPTION,
                    APP_CONSTANTS.DATABASE.REPORTS_STEPWISE.TEST_REQ,
                    APP_CONSTANTS.DATABASE.REPORTS_STEPWISE.SKIP,
                    APP_CONSTANTS.DATABASE.REPORTS_STEPWISE.VALIDATE
                ])
            });


            let payload = await UniversalFunctions.validateSchema(req.body, schema, {presence: "required"});

            var encryptColumns = ['allergies','chiefComplaint','history','examinationDiagnosticsResult','managementPlanRecommendation','testComments','medicationsComments','followUpDate'];
            if(process.env.ENABLE_DB_ENCRYPTION=="1"){
                await encryptDBData(payload, encryptColumns);
            }

            if (payload.reportId) {

                let checkReport = await Dao.populateData(Models.PatientAppointmentReport, {"_id": ObjectId(payload.reportId)},
                    {"_id": 1, stepwise: 1, followUpDate: 1, startTime: 1, endTime: 1, slots: 1,}, {lean: true}, [{
                        path : 'appointmentId',
                        select:'_id appointmentNumber type status user doctor scheduledService homeService'
                    }]);
                if (checkReport.length === 0) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID;

                checkReport = checkReport[0];

                if (payload.referDoctorId === "") {
                    payload.referDoctorId = null;
                }

                if (payload.dependentId) {
                    payload.dependentId = payload.dependentId;
                }
                else {
                    payload.dependentId = null;
                }


                if (payload.stepwise === APP_CONSTANTS.DATABASE.REPORTS_STEPWISE.SKIP) {
                    payload = {
                        "tests": [],
                        "testComments": "",
                        "medications": [],
                        startTime: "",
                        endTime: "",
                        slots: [],
                        medicationsComments: "",
                        followUpDate: "",
                        referDoctorId: null,
                        stepwise: 6,
                        reportId: payload.reportId
                    };
                }
                else if (payload.stepwise === APP_CONSTANTS.DATABASE.REPORTS_STEPWISE.VALIDATE) {
                    if (checkReport.followUpDate) {
                        let appointData = {
                            "doctor": checkReport.appointmentId.doctor,
                            "user": checkReport.appointmentId.user,
                            "type": checkReport.appointmentId.type,
                            "checkAvailability": false
                        }

                        if (checkReport.appointmentId.type === "ONLINE") {
                            appointData.scheduledService = {
                                date: checkReport.followUpDate,
                                "slots": checkReport.slots
                            }
                            let getDiffDays = (moment(checkReport.appointmentId.scheduledService.date) - moment());
                            appointData.getDiffDays = getDiffDays;
                        }
                        else if (checkReport.appointmentId.type === "ONSITE") {
                            appointData.scheduledService = {
                                date: checkReport.followUpDate,
                                "slots": checkReport.slots,
                                clinicHospital: checkReport.appointmentId.scheduledService.clinicHospital
                            }
                            let getDiffDays = (moment(checkReport.appointmentId.scheduledService.date) - moment());

                            appointData.getDiffDays = getDiffDays;

                            console.log("getDiffDays  ", getDiffDays);

                        }
                        else if (checkReport.appointmentId.type === "HOME") {
                            appointData.homeService = {
                                startTime: checkReport.startTime,
                                endTime: checkReport.endTime,
                                everyDayOrCustom: [checkReport.followUpDate],
                                "type": "CUSTOM",
                                "weeklyRepeat": false
                            }
                        }

                        let data = await createFollowUpAppointment(appointData, req.headers.language, req.headers.timezone, res);
                        if (!data.isSuccessful) {
                            throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.TIME_SLOT_NOT_FOUND;
                        }
                    }
                    var aptid = payload.appointmentId;
                    payload = {
                        isVerified: true,
                        reportId: payload.reportId
                    };
                    var apptdata = await Dao.findAndUpdate(Models.Appointment, { "_id": ObjectId( checkReport.appointmentId._id)},
                        { "isAlreadyReportGenerate": true,  "status": APP_CONSTANTS.DATABASE.APPOINTMENT_STATUS.COMPLETED  }, {lean: true});
                    

                    let checkAppointment = await Dao.findOne(Models.Appointment, { "_id": ObjectId(aptid) },
                    { "_id": 1, user: 1, doctor: 1, isAlreadyReportGenerate: 1, status: 1 }, {lean: true})

                    console.log("***********************************************",payload,"checkAppointment----------",checkAppointment)
                    payload.userId = checkAppointment.user;


                    sendPush(
                        Constants.NOTIFICATION_TYPE.CREATE_REPORT,
                        Constants.NOTIFICATION_TITLE.CREATE_REPORT,
                        Constants.NOTIFICATION_MESSAGE.CREATE_REPORT,
                        payload.userId, //rec
                        aptid, //content
                        aptid, //content
                        req.credentials._id //sender
                    )
                }
                else if (payload.stepwise === APP_CONSTANTS.DATABASE.REPORTS_STEPWISE.FOLLOW_UP_APPOINTMENT) {

                    let appointData = {
                        "doctor": checkReport.appointmentId.doctor,
                        "user": checkReport.appointmentId.user,
                        "type": checkReport.appointmentId.type,
                        "checkAvailability": true
                    }

                    if (checkReport.appointmentId.type === "ONLINE") {
                        appointData.scheduledService = {
                            date: payload.followUpDate,
                            "slots": payload.slots
                        }
                        let getDiffDays = (moment(checkReport.appointmentId.scheduledService.date) - moment() );
                        appointData.getDiffDays = getDiffDays;
                    }
                    else if (checkReport.appointmentId.type === "ONSITE") {
                        appointData.scheduledService = {
                            date: payload.followUpDate,
                            "slots": payload.slots,
                            clinicHospital: checkReport.appointmentId.scheduledService.clinicHospital
                        }
                        let getDiffDays = (moment(checkReport.appointmentId.scheduledService.date) - moment() );

                        appointData.getDiffDays = getDiffDays;

                        console.log("getDiffDays  ", getDiffDays);

                    }
                    else if (checkReport.appointmentId.type === "HOME") {
                        appointData.homeService = {
                            startTime: payload.startTime,
                            endTime: payload.endTime,
                            everyDayOrCustom: [payload.followUpDate],
                            "type":"CUSTOM",
                            "weeklyRepeat":false
                        }
                    }

                     let data = await createFollowUpAppointment(appointData, req.headers.language, req.headers.timezone, res);
                     console.log(data.isSuccessful);
                     if (!data.isSuccessful) {
                         throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.TIME_SLOT_NOT_FOUND;
                     }

                }

                if (checkReport.stepwise > payload.stepwise) {
                    delete payload.stepwise;
                }

                await Dao.findAndUpdate(Models.PatientAppointmentReport, {"_id": ObjectId(payload.reportId) }, payload, { lean: true });
            }
            else {
                let checkAppointment = await Dao.findOne(Models.Appointment, { "_id": ObjectId(payload.appointmentId) },
                    { "_id": 1, user: 1, doctor: 1, isAlreadyReportGenerate: 1, status: 1 }, {lean: true})

                if (!checkAppointment) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID;

                if (checkAppointment.status == "CANCELLED") throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.ALREADY_CANCELED_APPOINTMENT;

                if (checkAppointment.isAlreadyReportGenerate) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.ALREADY_GENERATE_REPORT;

                payload.userId = checkAppointment.user;
                payload.professionalId = checkAppointment.doctor;

                let saveData = await Dao.saveData(Models.PatientAppointmentReport, payload);
                payload.reportId = saveData._id;
            }

            let [appointmentData] = await Promise.all([
                getReportData(payload.reportId, req),
                Dao.findAndUpdate(Models.Appointment, { "_id": ObjectId(payload.appointmentId)},
                    { "reportType": 2 }, {lean: true})

        ]);

            /*sendPush(
                Constants.NOTIFICATION_TYPE.CREATE_REPORT,
                Constants.NOTIFICATION_TITLE.CREATE_REPORT,
                Constants.NOTIFICATION_MESSAGE.CREATE_REPORT,
                payload.userId, //rec
                payload.appointmentId, //content
                payload.appointmentId, //content
                req.credentials._id //sender
            )*/

            return sendResponse.sendSuccessData({ appointmentData }, APP_CONSTANTS.STATUSCODE.SUCCESS,
                req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
        }
        catch (err) {
            console.log(err);
            if (err.isJoi) {
                return sendResponse.sendError(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, err.message, req.headers.language, res);
            }
            else {
                return sendResponse.sendErrorMessage(APP_CONSTANTS.STATUSCODE.BAD_REQUEST,
                    req.headers.language, err, res);
            }
        }
    },
    getReports: async (req, res, next) => {
        req.headers.language = req.headers.language || 'en';
        try {
            let schema =  Joi.object().keys({
                appointmentId: Joi.string().optional().length(24),
                reportId: Joi.string().optional().length(24),
            });
            var decryptColumns = ['fileId','appointmentNumber'];
            var decryptColumns2 = ['allergies','chiefComplaint','history','examinationDiagnosticsResult','managementPlanRecommendation','testComments','medicationsComments','followUpDate'];
            let payload = await UniversalFunctions.validateSchema(req.query, schema, {presence: "required"});

            let criteria = {};

            if (payload.appointmentId) {
                criteria = { appointmentId: ObjectId(payload.appointmentId) };
            }
            else if (payload.reportId) {
                criteria = { _id: ObjectId(payload.reportId) };
            }
            else {
               throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID;
            }

            let aggregateData = [{
                $match: criteria
            }, {
                "$lookup": {
                    from: "appointments",
                    foreignField: "_id",
                    localField: "appointmentId",
                    as: 'appointments'
                }
            },{
                "$lookup": {
                    from: "users",
                    foreignField: "_id",
                    localField: "userId",
                    as: 'userData'
                }
            },{
                "$lookup": {
                    from: "users",
                    foreignField: "_id",
                    localField: "professionalId",
                    as: 'professionalData'
                }
            },{
                "$lookup": {
                    from: "users",
                    foreignField: "_id",
                    localField: "referDoctorId",
                    as: 'referDoctorData'
                }
            },{
                "$lookup": {
                    from: "commonservicetypes",
                    foreignField: "_id",
                    localField: "diagnostics",
                    as: 'diagnosticsData'
                }
            },{
                "$lookup": {
                    from: "commonservicetypes",
                    foreignField: "_id",
                    localField: "tests",
                    as: 'testData'
                }
            },{ "$unwind": {
                    "path": "$appointments",
                    "preserveNullAndEmptyArrays": true
                }
            },{ "$unwind": {
                    "path": "$userData",
                    "preserveNullAndEmptyArrays": true
                }
            },{ "$unwind": {
                    "path": "$professionalData",
                    "preserveNullAndEmptyArrays": true
                }
            },{ "$unwind": {
                    "path": "$referDoctorData",
                    "preserveNullAndEmptyArrays": true
                }
            },{
                "$lookup": {
                    from: "professionalspecialities",
                    foreignField: "_id",
                    localField: "professionalData.professional.professionalSpeciality",
                    as: 'professionalData.professional.professionalSpeciality'
                }
            },{ "$unwind": {
                    "path": "$professionalData.professional.professionalSpeciality",
                    "preserveNullAndEmptyArrays": true
                }
            },{
                "$lookup": {
                    from: "professionalspecialities",
                    foreignField: "_id",
                    localField: "referDoctorData.professional.professionalSpeciality",
                    as: 'referDoctorData.professional.professionalSpeciality'
                }
            },{ "$unwind": {
                    "path": "$referDoctorData.professional.professionalSpeciality",
                    "preserveNullAndEmptyArrays": true
                }
            }, {
                $project: {
                    allergies: 1,
                    chiefComplaint: 1,
                    history: 1,
                    examinationDiagnosticsResult: 1,
                    managementPlanRecommendation: 1,
                    stepwise: 1,
                    testData: 1,
                    testComments: 1,
                    medications: 1,
                    medicationsComments: 1,
                    followUpDate: 1,
                    referDoctorId: 1,
                    isVerified: 1,
                    diagnostics: 1,
                    tests: 1,
                    appointmentId: 1,
                    startTime: 1,
                    endTime: 1,
                    slots: 1,
                    dependentId: 1,
                    diagnosticsData: 1,
                    professionalData: {
                        _id: 1,
                        profilePic: 1,
                        coverPic: 1,
                        name: 1,
                        defaultLoginRole:1,
                        professional: {
                            professionalSpeciality: {
                                //specialityName: 1,
                                specialityName:"$professional.professionalSpeciality.specialityName."+req.headers.language,
                                //specialist: 1
                                specialist:"$professional.professionalSpeciality.specialist."+req.headers.language
                            }

                        }
                    },
                    userData: {
                        _id: 1,
                        profilePic: 1,
                        coverPic: 1,
                        name: 1,
                        defaultLoginRole:1,
                        user: {
                            dob: 1,
                            dependents: 1
                        }
                    },
                    referDoctorData : {
                        _id: 1,
                        profilePic: 1,
                        coverPic: 1,
                        name: 1,
                        defaultLoginRole:1,
                        professional: {
                            professionalSpeciality: {
                                specialityName:"$professional.professionalSpeciality.specialityName."+req.headers.language,
                                specialist:"$professional.professionalSpeciality.specialist."+req.headers.language
                                /*specialityName: 1,
                                specialist: 1*/
                            }
                        }
                    },
                    appointments: {
                        _id: 1,
                        appointmentNumber: 1,
                        type: 1,
                        status: 1,
                        "scheduledService": 1,
                        fileId: 1,
                        reportType: 1
                    }
                }
            }];

            let populateOptions = [{
                path : 'appointmentId',
                select:'_id appointmentNumber type status',
            },{
                path : 'userId',
                select:'_id profilePic coverPic name',
            },{
                path : 'professionalId',
                select:'_id profilePic coverPic name professional.professionalSpeciality',
            }, {

            }]

            let [ appointmentData ] = await Promise.all([
              //  Dao.populateData(Models.PatientAppointmentReport, criteria, { }, { lean: true }, populateOptions)
                Dao.aggregateData(Models.PatientAppointmentReport, aggregateData)
            ]);

            appointmentData = appointmentData[0] || {};

           //console.log("appointmentData", JSON.stringify(appointmentData));

            req.headers.language = req.headers.language || "en";

            let testsData = [];

            if ( appointmentData && appointmentData.diagnosticsData && appointmentData.diagnosticsData.length > 0) {
                let diagnosticData = [];

                appointmentData.diagnosticsData.map((item1) => {
                    item1.title.map((item) => {
                        if (item.type == req.headers.language) {
                            diagnosticData.push({
                                "_id": item1._id,
                                "name": item.name
                            })
                        }
                    })
                })

                appointmentData.diagnosticsData = diagnosticData
            }

            if ( appointmentData && appointmentData.testData && appointmentData.testData.length  > 0) {
                appointmentData.testData.map((item1) => {
                    item1.title.map((item) => {
                        if (item.type == req.headers.language) {
                            testsData.push({
                                "_id": item1._id,
                                "name": item.name
                            });
                        }
                    })
                });
                appointmentData.testData = testsData;
            }
            if ( appointmentData && appointmentData.userData && appointmentData.userData.user && appointmentData.userData.user.dependents.length > 0) {
                let data1 =appointmentData.userData.user.dependents.filter(item => {
                    console.log(item._id.toString() , appointmentData.dependentId);
                    return (item._id.toString() == appointmentData.dependentId)
                })
                appointmentData.dependents = data1.length > 0 ? data1[0] : undefined;

                appointmentData.userData.user.dependents = {};
            }
            if(process.env.ENABLE_DB_ENCRYPTION=="1" && appointmentData && appointmentData.appointments && appointmentData.appointments.fileId!=undefined && appointmentData.appointments.fileId!="" ){
                await decryptDBData(appointmentData.appointments, decryptColumns);
            }
            return sendResponse.sendSuccessData({ appointmentData }, APP_CONSTANTS.STATUSCODE.SUCCESS,
                req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res,decryptColumns2);

        }
        catch (err) {
            console.log(err, "--------err");
            if (err.isJoi) {
                return sendResponse.sendError(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, err.message, req.headers.language, res);
            }
            else {
                return sendResponse.sendErrorMessage(APP_CONSTANTS.STATUSCODE.BAD_REQUEST,
                    req.headers.language, err, res);
            }
        }
    },
    getProfessionalAndFacilityList: async (req, res, next) => {
        req.headers.language = req.headers.language || 'en';
        try {
            let schema =  Joi.object().keys({
                type: Joi.string().required().valid([
                    APP_CONSTANTS.DATABASE.USER_ROLES.FACILITY,
                    APP_CONSTANTS.DATABASE.USER_ROLES.PROFESSIONAL,
                    APP_CONSTANTS.DATABASE.USER_ROLES.TEAM,
                    APP_CONSTANTS.DATABASE.USER_ROLES.TEAM_HIRE,
                    APP_CONSTANTS.DATABASE.USER_ROLES.TEAM_HIRE_BY,
                    APP_CONSTANTS.DATABASE.USER_ROLES.PATIENT
                ]),
                limit: Joi.number().optional().default(500),
                lastId: Joi.string().optional().length(24),
                skip: Joi.number().optional(),
                search: Joi.string().optional().allow("")
            });

            // if(query.lastId && query.lastId!=""){ criteria._id = {$lt:ObjectId(query.lastId)} }

            let payload = await UniversalFunctions.validateSchema(req.query, schema, {presence: "required"});

            let criteria = { isBlocked: false, "role": { $in: [payload.type] } };

            if (payload.lastId) {
                criteria._id = { $lt: ObjectId(payload.lastId) };
            }

            if (payload.search) {
                let keyword ={$regex:commonFunctions.escapeRegExp(payload.search),$options:'i'};
                criteria.name = keyword;
            }


            let aggregate = [];

            if (payload.type === APP_CONSTANTS.DATABASE.USER_ROLES.PROFESSIONAL) {
                criteria._id = {$ne : ObjectId(userData._id)};
                aggregate = [
                    {
                        $match: criteria
                    },
                    {
                        $lookup: {
                            from: "professionalspecialities",
                            foreignField: "_id",
                            localField: "professional.professionalSpeciality",
                            as: 'professional.professionalSpeciality'
                        }
                    },
                    { "$unwind": {
                            "path": "$professional.professionalSpeciality",
                            "preserveNullAndEmptyArrays": true
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            "profilePic": 1,
                            name: 1,
                            professional: {
                                professionalSpeciality: {
                                    specialityName:"$professional.professionalSpeciality.specialityName."+req.headers.language,
                                    specialist:"$professional.professionalSpeciality.specialist."+req.headers.language
                                    /*specialityName: 1,
                                    specialist: 1*/
                                }
                            }
                        }
                    },
                    {
                        "$sort": {"_id": -1}
                    }
                ];
            }
            else if (payload.type === APP_CONSTANTS.DATABASE.USER_ROLES.FACILITY) {
                aggregate = [
                    {
                        $match: criteria
                    },
                    {
                        $project: {
                            _id: 1,
                            "profilePic": 1,
                            name: 1,
                            "specialityName": "$professionalData.specialityName."+req.headers.language,
                            address: 1
                            //specialityName:"$professional.professionalSpeciality.specialityName."+language,
                        }
                    },
                    {
                        "$sort": {"_id": -1}
                    }
                ];
            }
            else if (payload.type === APP_CONSTANTS.DATABASE.USER_ROLES.TEAM){

                aggregate.push({"$match": {
                            "status": "3"
                        }},{
                        "$group": {
                            "_id": {
                                "professionalId": "$professionalId",
                                "teamManagerId": "$teamManagerId"
                            }
                        }
                    }, {
                        $lookup: {
                            from: "users",
                            foreignField: "_id",
                            localField: "_id.professionalId",
                            as: 'professionalData'
                        }
                    },{
                        $lookup: {
                            from: "users",
                            foreignField: "_id",
                            localField: "_id.teamManagerId",
                            as: 'teamMemberData'
                        }
                    },
                    { "$unwind": {
                            "path": "$professionalData",
                            "preserveNullAndEmptyArrays": true
                        }
                    },{ "$unwind": {
                            "path": "$teamMemberData",
                            "preserveNullAndEmptyArrays": true
                        }
                    }, {
                        "$lookup": {
                            from: "professionalspecialities",
                            foreignField: "_id",
                            localField: "professionalData.professional.professionalSpeciality",
                            as: 'professionalData.professional.professionalSpeciality'
                        }
                    },{ "$unwind": {
                            "path": "$professionalData.professional.professionalSpeciality",
                            "preserveNullAndEmptyArrays": true
                        }
                    }, {
                        "$lookup": {
                            from: "professionalspecialities",
                            foreignField: "_id",
                            localField: "teamMemberData.professional.professionalSpeciality",
                            as: 'teamMemberData.professional.professionalSpeciality'
                        }
                    },{ "$unwind": {
                            "path": "$teamMemberData.professional.professionalSpeciality",
                            "preserveNullAndEmptyArrays": true
                        }
                    }, {
                        $project: {
                            "_id": "$_id.professionalId",
                            professionalData: {
                                _id: 1,
                                profilePic: 1,
                                coverPic: 1,
                                address: 1,
                                name: 1,
                                professional: {
                                    professionalSpeciality: {
                                        /*specialityName: 1,
                                        specialist: 1*/
                                        specialityName:"$professionalData.professional.professionalSpeciality.specialityName." + req.headers.language,
                                        specialist:"$professionalData.professional.professionalSpeciality.specialist." + req.headers.language
                                    }
                                }
                            },
                            teamMemberData: {
                                _id: 1,
                                profilePic: 1,
                                coverPic: 1,
                                name: 1,
                                professional: {
                                    professionalSpeciality: {
                                        /*specialityName: 1,
                                        specialist: 1*/
                                        specialityName:"$teamMemberData.professional.professionalSpeciality.specialityName."+ req.headers.language,
                                        specialist:"$teamMemberData.professional.professionalSpeciality.specialist."+ req.headers.language
                                    }
                                }
                            },
                        }
                    });

                let aggregateWithoutLimit = [];

                aggregateWithoutLimit = aggregate;

                if (payload.limit) {
                    aggregateWithoutLimit.push({ "$limit": payload.limit });
                }

                //   console.log("aggregate", JSON.stringify(aggregate));

                let [ commonData, commonData1 ] = await Promise.all([
                    Dao.aggregateData(Models.Team, aggregateWithoutLimit),
                    Dao.aggregateData(Models.Team, aggregate)
                ]);
                commonData1 = commonData1.length;
                return sendResponse.sendSuccessData({ commonData, commonData1 }, APP_CONSTANTS.STATUSCODE.SUCCESS,
                    req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
            }
            else if (payload.type === APP_CONSTANTS.DATABASE.USER_ROLES.TEAM_HIRE) {
                criteria = {
                    "teamManagerId": req.credentials._id,
                    "status": "3"
                }

                if (payload.lastId) {
                    criteria._id = { $lt: ObjectId(payload.lastId) };
                }

                let criteriaSearch = { };
                if (payload.search) {
                    let keyword ={$regex:commonFunctions.escapeRegExp(payload.search),$options:'i'};
                    criteriaSearch.name = keyword;
                }

                aggregate.push({"$match": criteria
                    },
                    {
                        "$group": {
                            "_id": "$professionalId",
                            "professionalId": {$first: "$professionalId"}
                        }
                    },
                    {
                        $graphLookup: {
                            from: "users",
                            startWith: "$professionalId",
                            connectFromField: "_id",
                            connectToField: "_id",
                            restrictSearchWithMatch: criteriaSearch,
                            as: "teamMemberData"
                        }
                    },
                    { "$unwind": "$teamMemberData" }, {
                        "$lookup": {
                            from: "professionalspecialities",
                            foreignField: "_id",
                            localField: "teamMemberData.professional.professionalSpeciality",
                            as: 'teamMemberData.professional.professionalSpeciality'
                        }
                    },{ "$unwind": {
                            "path": "$teamMemberData.professional.professionalSpeciality",
                            "preserveNullAndEmptyArrays": true
                        }
                    }, {
                        $project: {
                            _id: "$teamMemberData._id",
                            profilePic: "$teamMemberData.profilePic",
                            coverPic: "$teamMemberData.coverPic",
                            name: "$teamMemberData.name",
                            professional: {
                                professionalSpeciality: {
                                    /*specialityName: 1,
                                    specialist: 1*/
                                    specialityName:"$teamMemberData.professional.professionalSpeciality.specialityName."+ req.headers.language,
                                    specialist:"$teamMemberData.professional.professionalSpeciality.specialist."+ req.headers.language
                                }
                            }
                        }
                    },{
                       $sort: {
                           name: -1
                       }
                    });

                let aggregateWithLimit = aggregate;

                if (payload.limit) {
                    aggregate.push({ "$limit": payload.limit });
                }

                //   console.log("aggregate", JSON.stringify(aggregate));

                let [ commonData, count ] = await Promise.all([
                    Dao.aggregateData(Models.Team, aggregateWithLimit),
                    Dao.aggregateData(Models.Team, aggregate)
                ]);

                count = count.length;

                return sendResponse.sendSuccessData({ commonData, count }, APP_CONSTANTS.STATUSCODE.SUCCESS,
                    req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
            }
            else if (payload.type === APP_CONSTANTS.DATABASE.USER_ROLES.TEAM_HIRE_BY) {
                criteria = {
                    "professionalId": req.credentials._id,
                    "status": "3"
                }

                if (payload.lastId) {
                    criteria._id = { $lt: ObjectId(payload.lastId) };
                }


                let criteriaSearch = {};
                if (payload.search) {
                    let keyword ={$regex:commonFunctions.escapeRegExp(payload.search),$options:'i'};
                    criteriaSearch.name = keyword;
                }

                aggregate.push({"$match": criteria
                }, {
                        "$group": {
                            "_id": "$teamManagerId",
                            "teamManagerId": {$first: "$teamManagerId"}
                        }
                    },{
                    $graphLookup: {
                        from: "users",
                        startWith: "$teamManagerId",
                        connectFromField: "_id",
                        connectToField: "_id",
                        restrictSearchWithMatch: criteriaSearch,
                        as: "teamMemberData"
                    }
                }, { "$unwind": "$teamMemberData" }, {
                    "$lookup": {
                        from: "professionalspecialities",
                        foreignField: "_id",
                        localField: "teamMemberData.professional.professionalSpeciality",
                        as: 'teamMemberData.professional.professionalSpeciality'
                    }
                },{ "$unwind": {
                        "path": "$teamMemberData.professional.professionalSpeciality",
                        "preserveNullAndEmptyArrays": true
                    }
                }, {
                    $project: {
                        _id: "$teamMemberData._id",
                        profilePic: "$teamMemberData.profilePic",
                        coverPic: "$teamMemberData.coverPic",
                        name: "$teamMemberData.name",
                        professional: {
                            professionalSpeciality: {
                                /*specialityName: 1,
                                specialist: 1*/
                                specialityName:"$teamMemberData.professional.professionalSpeciality.specialityName."+ req.headers.language,
                                specialist:"$teamMemberData.professional.professionalSpeciality.specialist."+ req.headers.language
                            }
                        }
                    }
                },{
                    $sort: {
                        name: -1
                    }
                });

                let aggregateWithoutLimit = aggregate;

                if (payload.limit) {
                    aggregate.push({ "$limit": payload.limit });
                }

                //   console.log("aggregate", JSON.stringify(aggregate));

                let [ commonData, count ] = await Promise.all([
                    Dao.aggregateData(Models.Team, aggregateWithoutLimit),
                    Dao.aggregateData(Models.Team, aggregate)
                ]);

                count = count.length;

                return sendResponse.sendSuccessData({ commonData, count }, APP_CONSTANTS.STATUSCODE.SUCCESS,
                    req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
            }
            else if (payload.type === APP_CONSTANTS.DATABASE.USER_ROLES.PATIENT) {
                criteria = {
                    status: { $nin: [APP_CONSTANTS.DATABASE.APPOINTMENT_STATUS.COMPLETED] },
                    doctor: ObjectId(userData._id)
                }

                if (payload.lastId) {
                    criteria._id = { $lt: ObjectId(payload.lastId) };
                }
                let criteriaSearch = {};
                if (payload.search) {
                    let keyword ={$regex:commonFunctions.escapeRegExp(payload.search),$options:'i'};
                    criteriaSearch.name = keyword;
                }

                aggregate.push({
                    "$match": criteria
                }, {
                    "$group": {
                        "_id": "$user",
                        "fileId": { $first: "$fileId" }
                    }
                }, {
                    $graphLookup: {
                        from: "users",
                        startWith: "$_id",
                        connectFromField: "_id",
                        connectToField: "_id",
                        restrictSearchWithMatch: criteriaSearch,
                        as: "teamMemberData"
                    }
                }, { "$unwind": "$teamMemberData" }, {
                    $project: {
                        _id: "$teamMemberData._id",
                        profilePic: "$teamMemberData.profilePic",
                        coverPic: "$teamMemberData.coverPic",
                        name: "$teamMemberData.name",
                        fileId: 1

                    }
                },{
                    $sort: {
                        name: -1
                    }
                });

                let aggregateWithoutLimit = aggregate;

                if (payload.limit) {
                    aggregate.push({ "$limit": payload.limit });
                }

                //   console.log("aggregate", JSON.stringify(aggregate));

                let [ commonData, count ] = await Promise.all([
                    Dao.aggregateData(Models.Appointment, aggregateWithoutLimit),
                    Dao.aggregateData(Models.Appointment, aggregate)
                ]);

                count = count.length;

                return sendResponse.sendSuccessData({ commonData, count }, APP_CONSTANTS.STATUSCODE.SUCCESS,
                    req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
            }

            if (payload.limit) {
                aggregate.push({ "$limit": payload.limit });
            }

         //   console.log("aggregate", JSON.stringify(aggregate));

            let [ commonData, count ] = await Promise.all([
                Dao.aggregateData(Models.Users, aggregate),
                Dao.count(Models.Users, criteria)
            ]);

            return sendResponse.sendSuccessData({ commonData, count }, APP_CONSTANTS.STATUSCODE.SUCCESS,
                req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);

        }
        catch (err) {
            console.log(err);
            if (err.isJoi) {
                return sendResponse.sendError(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, err.message, req.headers.language, res);
            }
            else {
                return sendResponse.sendErrorMessage(APP_CONSTANTS.STATUSCODE.BAD_REQUEST,
                    req.headers.language, err, res);
            }
        }
    },
    createLabReport: async (req, res, next) => {
        try {
            let schema =  Joi.object().keys({
                "testType": Joi.array().required().items(Joi.string().required().length(24)),
                "allergies": Joi.string().optional().allow(""),
                "technic": Joi.string().required().allow(""),
                "results": Joi.string().optional().allow(""),
                "attachments": Joi.array().optional().items(Joi.object().keys({
                    "original": Joi.string().required().allow(''),
                    "thumbnail": Joi.string().required().allow(''),
                    "fileName": Joi.string().required().allow(''),
                    "type": Joi.string().required().allow('')
                })),
                "conclusion": Joi.string().optional().allow(""),
                "appointmentId": Joi.string().required().length(24),
                "attachmentType": Joi.string().optional().allow(""),
                "folderId": Joi.string().optional().allow(""),
                "dependentId": Joi.string().optional().length(24)

            });
            var encryptColumns = ['allergies','technic','results','conclusion','attachmentType'];

            let payload = await UniversalFunctions.validateSchema(req.body, schema, {presence: "required"});

            if(process.env.ENABLE_DB_ENCRYPTION=="1"){
                await encryptDBData(payload, encryptColumns);
            }
            let checkAppointment = await Dao.findOne(Models.Appointment, { "_id": ObjectId(payload.appointmentId) },
                { "_id": 1, "user": 1, "doctor": 1 }, { lean: true });

            if (!checkAppointment) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID;

            let checkReport = await Dao.findOne(Models.PatientLabsReport,
                { "appointmentId": ObjectId(payload.appointmentId) }, { "_id": 1 },
                { lean: true });

            if (checkReport) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.REPORT_ALREADY_GENERATED;

            payload.userId = checkAppointment.user;
            payload.professionalId = checkAppointment.doctor;

            if (!payload.folderId) {
                payload.folderId = APP_CONSTANTS.DATABASE.FOLDERS.LABS['en'];
            }

            await Promise.all([
                Dao.findAndUpdate(Models.Appointment, { "_id": ObjectId(payload.appointmentId)},
                    { "reportType": 1,  "status": APP_CONSTANTS.DATABASE.APPOINTMENT_STATUS.COMPLETED  }, {lean: true}),
                Dao.saveData(Models.PatientLabsReport, payload)
            ])
            sendPush(
                Constants.NOTIFICATION_TYPE.CREATE_LAB_REPORT,
                Constants.NOTIFICATION_TITLE.CREATE_LAB_REPORT,
                Constants.NOTIFICATION_MESSAGE.CREATE_LAB_REPORT,
                payload.userId, //rec
                payload.appointmentId, //content
                payload.appointmentId, //content
                req.credentials._id //sender
            )
            return sendResponse.sendSuccessData({}, APP_CONSTANTS.STATUSCODE.SUCCESS,
                req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);

        }
        catch (err) {
            console.log(err);
            if (err.isJoi) {
                return sendResponse.sendError(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, err.message, req.headers.language, res);
            }
            else {
                return sendResponse.sendErrorMessage(APP_CONSTANTS.STATUSCODE.BAD_REQUEST,
                    req.headers.language, err, res);
            }
        }
    },
    getLabReports: async (req, res, next) => {
        req.headers.language = req.headers.language || 'en';
        try {
            let schema =  Joi.object().keys({
                appointmentId: Joi.string().optional().length(24),
                reportId: Joi.string().optional().length(24),
            });
            var decryptColumns = ['fileId','appointmentNumber'/*,'houseNumber','addressName'*/];
            var decryptColumns2 = ['allergies','technic','results','conclusion','attachmentType'];
            let payload = await UniversalFunctions.validateSchema(req.query, schema, {presence: "required"});

            let criteria = {};

            if (payload.appointmentId) {
                criteria = { appointmentId: ObjectId(payload.appointmentId) };
            }
            else if (payload.reportId) {
                criteria = { _id: ObjectId(payload.reportId) };
            }
            else {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID;
            }

            let aggregateData = [{
                $match: criteria
            }, {
                "$lookup": {
                    from: "appointments",
                    foreignField: "_id",
                    localField: "appointmentId",
                    as: 'appointments'
                }
            },{
                "$lookup": {
                    from: "users",
                    foreignField: "_id",
                    localField: "userId",
                    as: 'userData'
                }
            },{
                "$lookup": {
                    from: "users",
                    foreignField: "_id",
                    localField: "professionalId",
                    as: 'professionalData'
                }
            },{
                "$lookup": {
                    from: "commonservicetypes",
                    foreignField: "_id",
                    localField: "testType",
                    as: 'testTypeData'
                }
            },{ "$unwind": {
                    "path": "$appointments",
                    "preserveNullAndEmptyArrays": true
                }
            },{ "$unwind": {
                    "path": "$userData",
                    "preserveNullAndEmptyArrays": true
                }
            },{ "$unwind": {
                    "path": "$professionalData",
                    "preserveNullAndEmptyArrays": true
                }
            },{
                "$lookup": {
                    from: "professionalspecialities",
                    foreignField: "_id",
                    localField: "professionalData.professional.professionalSpeciality",
                    as: 'professionalData.professional.professionalSpeciality'
                }
            },{ "$unwind": {
                    "path": "$professionalData.professional.professionalSpeciality",
                    "preserveNullAndEmptyArrays": true
                }
            },{
                $project: {
                    "appointmentId": 1,
                    "userId": 1,
                    "professionalId": 1,
                    "testType": 1,
                    "allergies": 1,
                    "technic": 1,
                    "results": 1,
                    "attachmentType": 1,
                    "attachments": 1,
                    "conclusion": 1,
                    dependentId: 1,
                    professionalData: {
                        _id: 1,
                        profilePic: 1,
                        coverPic: 1,
                        name: 1,
                        professional: {
                            professionalSpeciality: {
                                /*specialityName: 1,
                                specialist: 1*/
                                specialityName:"$professional.professionalSpeciality.specialityName."+req.headers.language,
                                specialist:"$professional.professionalSpeciality.specialist."+req.headers.language
                            }
                        }
                    },
                    userData: {
                        _id: 1,
                        profilePic: 1,
                        coverPic: 1,
                        name: 1,
                        user: {
                            dob: 1,
                            dependents: 1
                        }
                    },
                    appointments: {
                        _id: 1,
                        appointmentNumber: 1,
                        type: 1,
                        status: 1,
                        "scheduledService": 1,
                        fileId: 1,
                        reportType: 1
                    },
                    testTypeData: 1
                }
            }];

          //  console.log(" aggregateData ", JSON.stringify(aggregateData));

            let [ appointmentData ] = await Promise.all([
                //  Dao.populateData(Models.PatientAppointmentReport, criteria, { }, { lean: true }, populateOptions)
                Dao.aggregateData(Models.PatientLabsReport, aggregateData)
            ]);

            appointmentData = appointmentData[0] || {};

           // console.log("appointmentData", JSON.stringify(appointmentData));

            req.headers.language = req.headers.language || "en";

            let testsData = [];

          //  console.log(appointmentData && appointmentData.testTypeData)

            if ( appointmentData && appointmentData.testTypeData && appointmentData.testTypeData.length  > 0) {

                appointmentData.testTypeData.map((item1) => {
                   // console.log(item1, req.headers.language);
                    item1.title.map((item) => {
                        if (item.type == req.headers.language) {
                            testsData.push({
                                "_id": item1._id,
                                "name": item.name
                            });
                        }
                    })
                });
            //    console.log(testsData);
                appointmentData.testTypeData = testsData;
            }

            if ( appointmentData && appointmentData.userData && appointmentData.userData.user && appointmentData.userData.user.dependents.length > 0) {
                let data1 =appointmentData.userData.user.dependents.filter(item => {
                    console.log(item._id.toString() , appointmentData.dependentId);
                    return (item._id.toString() == appointmentData.dependentId)
                })
                appointmentData.dependents = data1.length > 0 ? data1[0] : undefined;

                appointmentData.userData.user.dependents = {};
            }
            if(process.env.ENABLE_DB_ENCRYPTION=="1" && appointmentData && appointmentData.appointments && appointmentData.appointments.fileId!=undefined && appointmentData.appointments.fileId!="" ){
                await decryptDBData(appointmentData.appointments, decryptColumns);
            }

            return sendResponse.sendSuccessData({ appointmentData }, APP_CONSTANTS.STATUSCODE.SUCCESS,
                req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res,decryptColumns2);

        }
        catch (err) {
            console.log(err);
            if (err.isJoi) {
                return sendResponse.sendError(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, err.message, req.headers.language, res);
            }
            else {
                return sendResponse.sendErrorMessage(APP_CONSTANTS.STATUSCODE.BAD_REQUEST,
                    req.headers.language, err, res);
            }
        }
    },

    getMedicalReportsDiagnostics: async (req, res, next) => {
        let diagnosis = await Models.PatientAppointmentReport.find({"userId" : ObjectId(userData._id),"isDeleted":false},{diagnostics:1,_id:0});
        var diagnosisList =[]
        for(let x in diagnosis){
            diagnosisList = diagnosisList.concat(diagnosis[x].diagnostics);
        }
        diagnosisList = diagnosisList.filter((item, pos) => diagnosisList.indexOf(item) === pos)
        let aggregate = [
                {
                    $match: {
                        "type": "diagnosis",
                        "_id": {$in: diagnosisList}                        
                    }
                },
                { $unwind: "$title"},
                {
                    "$match": {
                        "title.type": req.headers.language || 'en'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        "name": "$title.name"
                    }
                },
                {
                    "$sort": {"_id": -1}
                }
            ];
            Models.CommonServiceType.aggregate(aggregate, (err, result) => {
                if (err) {
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,err,res);
                } else {
                    return sendResponse.sendSuccessData({result, count:result.length},200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });
    },
    getMedicalReports: async (req, res, next) => {
        req.headers.language = req.headers.language || 'en';
        var timeZone = req.headers.timezone;
        try {
            let schema =  Joi.object().keys({
                folderId: Joi.string().required().length(24),
                diagnosticsId: Joi.string().optional(),
                type: Joi.number().required().valid([
                    APP_CONSTANTS.DATABASE.REPORT_TYPE.RECEIVED,
                    APP_CONSTANTS.DATABASE.REPORT_TYPE.SCANED
                ]),
                limit: Joi.number().optional().default(500),
                lastId: Joi.string().optional().length(24),
                search: Joi.string().optional(),
                dependentId: Joi.string().optional().length(24),
                userId: Joi.string().optional(),
                duration: Joi.number().optional().valid([
                    "1", // All 
                    "2", // this week
                    "3", //this month
                    "4", //last 3 months
                    "5"  // last 6 months
                ])
            });
            var userId = req.credentials._id
            let payload = await UniversalFunctions.validateSchema(req.query, schema, {presence: "required"});
            if(payload.userId!=undefined && payload.userId!="" ){
                userId = payload.userId;
            }
            let criteria = {};

            if(payload.lastId && payload.lastId!="") {
                criteria._id = { $lt: ObjectId(payload.lastId) }
            }

            let checkFolderId = await Dao.findOne(Models.Folder, { "_id": ObjectId(payload.folderId) },
                {_id: 1, folderName: 1}, { lean: true });

            if (!checkFolderId) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID;

            let data = [];
            let count = 0;
            let aggregate = [];
            switch(checkFolderId.folderName) {
                case APP_CONSTANTS.DATABASE.FOLDERS.MEDICATIONS['en']:
                case APP_CONSTANTS.DATABASE.FOLDERS.REQUESTS['en']:
                case APP_CONSTANTS.DATABASE.FOLDERS.REPORTS['en']:{

                    if (payload.type === APP_CONSTANTS.DATABASE.REPORT_TYPE.SCANED) {

                        criteria.folderId = ObjectId(payload.folderId);
                        if (payload.dependentId) {
                            criteria.dependentId = ObjectId(payload.dependentId);
                        }
                        else {
                            criteria.userId = ObjectId(userId);
                            criteria.dependentId = null;
                        }
                        //criteria.userId = ObjectId(req.credentials._id);
                        console.log("111111111111111111",criteria)

                       let [data1,count1] = await Promise.all([
                            Dao.getData(Models.File, criteria, { }, { lean: true, sort: { createdAt: -1 } }),
                            Dao.count(Models.File, criteria)
                        ]);
                        data = data1;
                        count =count1;
                    }
                    else {
                        if (payload.dependentId) {
                            criteria.dependentId = ObjectId(payload.dependentId);
                        }
                        else {
                            criteria.userId = ObjectId(userId);
                            criteria.dependentId = null;
                        }
                        criteria.isVerified = true;

                        if (checkFolderId.folderName === APP_CONSTANTS.DATABASE.FOLDERS.MEDICATIONS['en']) {
                            criteria.medications = {$ne: []};
                        }
                        else  if (checkFolderId.folderName === APP_CONSTANTS.DATABASE.FOLDERS.REQUESTS['en']) {
                            criteria.tests = {$ne: []};
                        }

                        if(payload.diagnosticsId){
                            criteria.diagnostics  =  { $in: [ObjectId(payload.diagnosticsId)] };
                        }
                        if(payload.duration && payload.duration!="1"){
                            let filterDate = momentTimezone(new Date()).tz(timeZone).subtract(7,'days').toDate();
                            if(payload.duration == "3"){
                                filterDate = momentTimezone(new Date()).tz(timeZone).subtract(1,'months').toDate();
                            }else if(payload.duration == "4"){
                                filterDate = momentTimezone(new Date()).tz(timeZone).subtract(3,'months').toDate();
                            }else if(payload.duration == "5"){
                                filterDate = momentTimezone(new Date()).tz(timeZone).subtract(6,'months').toDate();
                            }
                            criteria.createdAt = {$gte:filterDate}
                        }
                        aggregate.push({$match: criteria}, {
                                "$lookup": {
                                    from: "users",
                                    foreignField: "_id",
                                    localField: "professionalId",
                                    as: 'professionalData'
                                }
                            }, {
                                "$lookup": {
                                    from: "appointments",
                                    foreignField: "_id",
                                    localField: "appointmentId",
                                    as: 'appointments'
                                }
                            },{
                                "$lookup": {
                                    from: "commonservicetypes",
                                    foreignField: "_id",
                                    localField: "diagnostics",
                                    as: 'diagnosticsData'
                                }
                            },{
                                "$lookup": {
                                    from: "commonservicetypes",
                                    foreignField: "_id",
                                    localField: "tests",
                                    as: 'testData'
                                }
                            }, {
                                "$match": {
                                    "diagnosticsData.title.type": req.headers.language || 'en'
                                }
                            },
                            {
                                "$unwind": {
                                    "path": "$professionalData",
                                    "preserveNullAndEmptyArrays": true
                                }
                            }, {
                                "$lookup": {
                                    from: "professionalspecialities",
                                    foreignField: "_id",
                                    localField: "professionalData.professional.professionalSpeciality",
                                    as: 'professionalData.professional.professionalSpeciality'
                                }
                            },{
                                "$lookup": {
                                    from: "users",
                                    foreignField: "_id",
                                    localField: "userId",
                                    as: 'userData'
                                }
                            },{ "$unwind": {
                                    "path": "$appointments",
                                    "preserveNullAndEmptyArrays": true
                                }
                            },{ "$unwind": {
                                    "path": "$userData",
                                    "preserveNullAndEmptyArrays": true
                                }
                            }, {
                                "$unwind": {
                                    "path": "$professionalData.professional.professionalSpeciality",
                                    "preserveNullAndEmptyArrays": true
                                }
                            },
                            {
                                $project: {
                                    professionalData: {
                                        _id: 1,
                                        profilePic: 1,
                                        defaultLoginRole:1,
                                        coverPic: 1,
                                        name: 1,
                                        professional: {
                                            professionalSpeciality: {
                                                /*specialityName: 1,
                                                specialist: 1*/
                                                specialityName:"$professional.professionalSpeciality.specialityName."+req.headers.language,
                                                specialist:"$professional.professionalSpeciality.specialist."+req.headers.language
                                            }
                                        }
                                    },
                                    diagnosticsData: 1,
                                    medications: 1,
                                    appointmentId: 1,
                                    testData: 1,
                                    chiefComplaint: 1,
                                    createdAt: 1,
                                    userData: {
                                        _id: 1,
                                        profilePic: 1,
                                        coverPic: 1,
                                        name: 1,
                                        defaultLoginRole:1,
                                        user: {
                                            dob: 1,
                                            dependents: 1
                                        }
                                    },
                                    appointments: {
                                        _id: 1,
                                        appointmentNumber: 1,
                                        type: 1,
                                        status: 1,
                                        scheduledService: 1,
                                        reportType: 1,
                                        fileId: 1
                                    }
                                }
                            },
                            {$sort: {_id: -1}},
                            {$limit: payload.limit}
                        );

                        [data, count] = await Promise.all([
                            Dao.aggregateData(Models.PatientAppointmentReport, aggregate),
                            Dao.count(Models.PatientAppointmentReport, criteria)
                        ]);

                      //  console.log("data", JSON.stringify(data));

                        for (let i = 0; i < data.length; i++ ) {
                            if (data[i] && data[i].diagnosticsData && data[i].diagnosticsData.length > 0) {
                                let diagnosticData = [];


                                data[i].diagnosticsData.map((item1) => {
                                    item1.title.map((item) => {
                                        if (item.type == req.headers.language) {
                                            diagnosticData.push({
                                                "_id": item1._id,
                                                "name": item.name
                                            })
                                        }
                                    })
                                });

                                data[i].diagnosticsData = diagnosticData
                            }
                            if ( data[i] && data[i].testData && data[i].testData.length  > 0) {
                                let testsData = [];
                                data[i].testData.map((item1) => {
                                    item1.title.map((item) => {
                                        if (item.type == req.headers.language) {
                                            testsData.push({
                                                "_id": item1._id,
                                                "name": item.name
                                            });
                                        }
                                    })
                                });
                                data[i].testData = testsData;
                            }
                            if ( data[i] && data[i].userData && data[i].userData.user && data[i].userData.user.dependents.length > 0) {
                                let data1 = data[i].userData.user.dependents.filter(item => {
                                    console.log(item._id.toString() , payload.dependentId);
                                    return (item._id.toString() == payload.dependentId)
                                })
                                data[i].dependents = data1.length > 0 ? data1[0] : undefined;

                                data[i].userData.user.dependents = {};
                            }

                        }

                    }
                    break;
                }
                case APP_CONSTANTS.DATABASE.FOLDERS.LABS['en']: {
                    if (payload.type === APP_CONSTANTS.DATABASE.REPORT_TYPE.SCANED) {

                        criteria.folderId = ObjectId(payload.folderId);
                        if (payload.dependentId) {
                            criteria.dependentId = ObjectId(payload.dependentId);
                        }
                        else {
                            criteria.userId = ObjectId(userId);
                            criteria.dependentId = null;
                        }

                      //  criteria.userId = ObjectId(req.credentials._id);
                        console.log("33333333333333333",criteria)

                        let [ data1, count1 ] = await Promise.all([
                            Dao.getData(Models.File, criteria, { }, { lean: true, sort: { createdAt: -1 }  }),
                            Dao.count(Models.File, criteria)
                        ]);
                        data = data1;
                        count = count1;
                    }
                    else {
                        if (payload.dependentId) {
                            criteria.dependentId = ObjectId(payload.dependentId);
                        }
                        else {
                            criteria.userId = ObjectId(userId);
                            criteria.dependentId = null;
                        }
                       // criteria.userId = ObjectId(req.credentials._id);
                        criteria.folderId = { $ne: APP_CONSTANTS.DATABASE.FOLDERS.RADIOLOGY['en'] };
                        console.log("4444444444444444",criteria)

                        if(payload.duration && payload.duration!="1"){
                            let filterDate = momentTimezone(new Date()).tz(timeZone).subtract(7,'days').toDate();
                            if(payload.duration == "3"){
                                filterDate = momentTimezone(new Date()).tz(timeZone).subtract(1,'months').toDate();
                            }else if(payload.duration == "4"){
                                filterDate = momentTimezone(new Date()).tz(timeZone).subtract(3,'months').toDate();
                            }else if(payload.duration == "5"){
                                filterDate = momentTimezone(new Date()).tz(timeZone).subtract(6,'months').toDate();
                            }
                            criteria.createdAt = {$gte:filterDate}
                        }

                      //  criteria.medications = {$ne: []};
                        aggregate.push({$match: criteria},{
                                "$lookup": {
                                    from: "appointments",
                                    foreignField: "_id",
                                    localField: "appointmentId",
                                    as: 'appointments'
                                }
                            }, {
                                "$lookup": {
                                    from: "users",
                                    foreignField: "_id",
                                    localField: "professionalId",
                                    as: 'professionalData'
                                }
                            }, {
                                "$lookup": {
                                    from: "commonservicetypes",
                                    foreignField: "_id",
                                    localField: "testType",
                                    as: 'testTypeData'
                                }
                            },{
                                "$match": {
                                    "testTypeData.title.type": req.headers.language || 'en'
                                }
                            },
                            {
                                "$unwind": {
                                    "path": "$professionalData",
                                    "preserveNullAndEmptyArrays": true
                                }
                            }, { "$unwind": {
                                    "path": "$appointments",
                                    "preserveNullAndEmptyArrays": true
                                }
                            },{
                                "$lookup": {
                                    from: "professionalspecialities",
                                    foreignField: "_id",
                                    localField: "professionalData.professional.professionalSpeciality",
                                    as: 'professionalData.professional.professionalSpeciality'
                                }
                            },  {
                                "$lookup": {
                                    from: "users",
                                    foreignField: "_id",
                                    localField: "userId",
                                    as: 'userData'
                                }
                            },{ "$unwind": {
                                    "path": "$userData",
                                    "preserveNullAndEmptyArrays": true
                                }
                            }, {
                                "$unwind": {
                                    "path": "$professionalData.professional.professionalSpeciality",
                                    "preserveNullAndEmptyArrays": true
                                }
                            },
                            {
                                $project: {
                                    professionalData: {
                                        _id: 1,
                                        profilePic: 1,
                                        coverPic: 1,
                                        name: 1,
                                        defaultLoginRole:1,
                                        professional: {
                                            professionalSpeciality: {
                                                /*specialityName: 1,
                                                specialist: 1*/
                                                specialityName:"$professional.professionalSpeciality.specialityName."+req.headers.language,
                                                specialist:"$professional.professionalSpeciality.specialist."+req.headers.language
                                            }
                                        }
                                    },
                                    testTypeData: 1,
                                    createdAt: 1,
                                    technic: 1,
                                    appointmentId: 1,
                                    attachmentType: 1,
                                    userData: {
                                        _id: 1,
                                        profilePic: 1,
                                        coverPic: 1,
                                        name: 1,
                                        defaultLoginRole:1,
                                        user: {
                                            dob: 1,
                                            dependents: 1
                                        }
                                    },
                                    appointments: {
                                        _id: 1,
                                        appointmentNumber: 1,
                                        type: 1,
                                        status: 1,
                                        scheduledService: 1,
                                        reportType: 1,
                                        fileId: 1
                                    }
                                }
                            },
                            {$sort: {_id: -1}},
                            {$limit: payload.limit}
                        );

                        [data, count] = await Promise.all([
                            Dao.aggregateData(Models.PatientLabsReport, aggregate),
                            Dao.count(Models.PatientLabsReport, criteria)
                        ]);

                        for (let i = 0; i < data.length; i++ ) {
                            if (data[i] && data[i].testTypeData && data[i].testTypeData.length > 0) {
                                let testTypeData = [];


                                data[i].testTypeData.map((item1) => {
                                    item1.title.map((item) => {
                                        if (item.type == req.headers.language) {
                                            testTypeData.push({
                                                "_id": item1._id,
                                                "name": item.name
                                            })
                                        }
                                    })
                                });

                                data[i].testTypeData = testTypeData
                            }
                            if ( data[i] && data[i].userData && data[i].userData.user && data[i].userData.user.dependents.length > 0) {
                                let data1 = data[i].userData.user.dependents.filter(item => {
                                    console.log(item._id.toString() , payload.dependentId);
                                    return (item._id.toString() == payload.dependentId)
                                })
                                data[i].dependents = data1.length > 0 ? data1[0] : undefined;

                                data[i].userData.user.dependents = {};
                            }
                        }
                        break;
                    }
                }
                case APP_CONSTANTS.DATABASE.FOLDERS.RADIOLOGY['en']: {
                    if (payload.type === APP_CONSTANTS.DATABASE.REPORT_TYPE.SCANED) {

                        criteria.folderId = ObjectId(payload.folderId);

                        if (payload.dependentId) {
                            criteria.dependentId = ObjectId(payload.dependentId);
                        }
                        else {
                            criteria.userId = ObjectId(userId);
                            criteria.dependentId = null;
                        }
                        console.log("55555555555555555555",criteria)

                      //  criteria.userId = ObjectId(req.credentials._id);

                        let [data1, count1] = await Promise.all([
                            Dao.getData(Models.File, criteria, {}, {lean: true,  sort: { createdAt: -1 } }),
                            Dao.count(Models.File, criteria)
                        ]);
                        data = data1;
                        count = count1;
                    }
                    else {
                        // criteria.userId = ObjectId(req.credentials._id);
                        if (payload.dependentId) {
                            criteria.dependentId = ObjectId(payload.dependentId);
                        }
                        else {
                            criteria.userId = ObjectId(userId);
                            criteria.dependentId = null;
                        }
                        criteria.folderId =  APP_CONSTANTS.DATABASE.FOLDERS.RADIOLOGY['en'];
                        console.log("66666666666666666666",criteria)

                        if(payload.duration && payload.duration!="1"){
                            let filterDate = momentTimezone(new Date()).tz(timeZone).subtract(7,'days').toDate();
                            if(payload.duration == "3"){
                                filterDate = momentTimezone(new Date()).tz(timeZone).subtract(1,'months').toDate();
                            }else if(payload.duration == "4"){
                                filterDate = momentTimezone(new Date()).tz(timeZone).subtract(3,'months').toDate();
                            }else if(payload.duration == "5"){
                                filterDate = momentTimezone(new Date()).tz(timeZone).subtract(6,'months').toDate();
                            }
                            criteria.createdAt = {$gte:filterDate}
                        }
                       // criteria.medications = {$ne: []};
                        aggregate.push({$match: criteria}, {
                                "$lookup": {
                                    from: "appointments",
                                    foreignField: "_id",
                                    localField: "appointmentId",
                                    as: 'appointments'
                                }
                            }, {
                                "$lookup": {
                                    from: "users",
                                    foreignField: "_id",
                                    localField: "professionalId",
                                    as: 'professionalData'
                                }
                            }, {
                                "$lookup": {
                                    from: "commonservicetypes",
                                    foreignField: "_id",
                                    localField: "testType",
                                    as: 'testTypeData'
                                }
                            }, {
                                "$match": {
                                    "testTypeData.title.type": req.headers.language || 'en'
                                }
                            },
                            {
                                "$unwind": {
                                    "path": "$professionalData",
                                    "preserveNullAndEmptyArrays": true
                                }
                            }, {
                                "$unwind": {
                                    "path": "$appointments",
                                    "preserveNullAndEmptyArrays": true
                                }
                            }, {
                                "$lookup": {
                                    from: "professionalspecialities",
                                    foreignField: "_id",
                                    localField: "professionalData.professional.professionalSpeciality",
                                    as: 'professionalData.professional.professionalSpeciality'
                                }
                            }, {
                                "$lookup": {
                                    from: "users",
                                    foreignField: "_id",
                                    localField: "userId",
                                    as: 'userData'
                                }
                            }, {
                                "$unwind": {
                                    "path": "$userData",
                                    "preserveNullAndEmptyArrays": true
                                }
                            }, {
                                "$unwind": {
                                    "path": "$professionalData.professional.professionalSpeciality",
                                    "preserveNullAndEmptyArrays": true
                                }
                            },
                            {
                                $project: {
                                    professionalData: {
                                        _id: 1,
                                        profilePic: 1,
                                        coverPic: 1,
                                        name: 1,
                                        defaultLoginRole:1,
                                        professional: {
                                            professionalSpeciality: {
                                                /*specialityName: 1,
                                                specialist: 1*/
                                                specialityName: "$professional.professionalSpeciality.specialityName." + req.headers.language,
                                                specialist: "$professional.professionalSpeciality.specialist." + req.headers.language
                                            }
                                        }
                                    },
                                    testTypeData: 1,
                                    createdAt: 1,
                                    technic: 1,
                                    appointmentId: 1,
                                    attachmentType: 1,
                                    userData: {
                                        _id: 1,
                                        profilePic: 1,
                                        coverPic: 1,
                                        name: 1,
                                        defaultLoginRole:1,
                                        user: {
                                            dob: 1,
                                            dependents: 1
                                        }
                                    },
                                    appointments: {
                                        _id: 1,
                                        appointmentNumber: 1,
                                        type: 1,
                                        status: 1,
                                        scheduledService: 1,
                                        reportType: 1,
                                        fileId: 1
                                    }
                                }
                            },
                            {$sort: {_id: -1}},
                            {$limit: payload.limit}
                        );

                        [data, count] = await Promise.all([
                            Dao.aggregateData(Models.PatientLabsReport, aggregate),
                            Dao.count(Models.PatientLabsReport, criteria)
                        ]);

                        for (let i = 0; i < data.length; i++) {
                            if (data[i] && data[i].testTypeData && data[i].testTypeData.length > 0) {
                                let testTypeData = [];


                                data[i].testTypeData.map((item1) => {
                                    item1.title.map((item) => {
                                        if (item.type == req.headers.language) {
                                            testTypeData.push({
                                                "_id": item1._id,
                                                "name": item.name
                                            })
                                        }
                                    })
                                });

                                data[i].testTypeData = testTypeData
                            }
                            if ( data[i] && data[i].userData && data[i].userData.user && data[i].userData.user.dependents.length > 0) {
                                let data1 = data[i].userData.user.dependents.filter(item => {
                                    console.log(item._id.toString() , payload.dependentId);
                                    return (item._id.toString() == payload.dependentId)
                                })
                                data[i].dependents = data1.length > 0 ? data1[0] : undefined;

                                data[i].userData.user.dependents = {};
                            }
                        }
                        break;
                    }
                    break;
                }
            }

           // console.log(data, count);
            return sendResponse.sendSuccessData({ data, count }, APP_CONSTANTS.STATUSCODE.SUCCESS,
                req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);

        }
        catch (err) {
            console.log(err);
            if (err.isJoi) {
                return sendResponse.sendError(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, err.message, req.headers.language, res);
            }
            else {
                return sendResponse.sendErrorMessage(APP_CONSTANTS.STATUSCODE.BAD_REQUEST,
                    req.headers.language, err, res);
            }
        }
    },
    medicationListForAddMedication: async (req, res, next) => {
        req.headers.language = req.headers.language || 'en';
        try {
            let schema =  Joi.object().keys({
                //folderId: Joi.string().required().length(24),
                /*type: Joi.number().required().valid([
                    APP_CONSTANTS.DATABASE.REPORT_TYPE.RECEIVED,
                    APP_CONSTANTS.DATABASE.REPORT_TYPE.SCANED
                ]),*/
                limit: Joi.number().optional().default(500),
                lastId: Joi.string().optional().length(24),
                /*search: Joi.string().optional(),
                dependentId: Joi.string().optional().length(24)*/
            });
            var decryptColumns = ['fileId','appointmentNumber'/*,'houseNumber','addressName'*/];
            let payload = await UniversalFunctions.validateSchema(req.query, schema, {presence: "required"});

            let criteria = {};

            if(payload.lastId && payload.lastId!="") {
                criteria._id = { $lt: ObjectId(payload.lastId) }
            }

            /*let checkFolderId = await Dao.findOne(Models.Folder, { "_id": ObjectId(payload.folderId) },
                {_id: 1, folderName: 1}, { lean: true });

            if (!checkFolderId) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID;*/

            //let data = [];
            //let count = 0;
            let aggregate = [];

                        /*criteria.folderId = ObjectId(payload.folderId);

                        criteria.userId = ObjectId(req.credentials._id);
                        let scannedList = await Dao.getData(Models.File, criteria, { }, { lean: true, sort: { createdAt: -1 } });
                        delete criteria.folderId;*/

                        criteria.userId = ObjectId(req.credentials._id);
                        criteria.isVerified = true;
                        criteria.medications = {$ne: []};

                        //console.log("22222222222222222",criteria)
                        aggregate.push({$match: criteria}, {
                                "$lookup": {
                                    from: "users",
                                    foreignField: "_id",
                                    localField: "professionalId",
                                    as: 'professionalData'
                                }
                            }, {
                                "$lookup": {
                                    from: "appointments",
                                    foreignField: "_id",
                                    localField: "appointmentId",
                                    as: 'appointments'
                                }
                            },{
                                "$lookup": {
                                    from: "commonservicetypes",
                                    foreignField: "_id",
                                    localField: "diagnostics",
                                    as: 'diagnosticsData'
                                }
                            },{
                                "$lookup": {
                                    from: "commonservicetypes",
                                    foreignField: "_id",
                                    localField: "tests",
                                    as: 'testData'
                                }
                            },/* {
                                "$match": {
                                    "diagnosticsData.title.type": req.headers.language || 'en'
                                }
                            },*/
                            {
                                "$unwind": {
                                    "path": "$professionalData",
                                    "preserveNullAndEmptyArrays": true
                                }
                            }, {
                                "$lookup": {
                                    from: "professionalspecialities",
                                    foreignField: "_id",
                                    localField: "professionalData.professional.professionalSpeciality",
                                    as: 'professionalData.professional.professionalSpeciality'
                                }
                            },{
                                "$lookup": {
                                    from: "users",
                                    foreignField: "_id",
                                    localField: "userId",
                                    as: 'userData'
                                }
                            },{ "$unwind": {
                                    "path": "$appointments",
                                    "preserveNullAndEmptyArrays": true
                                }
                            },{ "$unwind": {
                                    "path": "$userData",
                                    "preserveNullAndEmptyArrays": true
                                }
                            }, {
                                "$unwind": {
                                    "path": "$professionalData.professional.professionalSpeciality",
                                    "preserveNullAndEmptyArrays": true
                                }
                            },
                            {
                                $project: {
                                    professionalData: {
                                        _id: 1,
                                        profilePic: 1,
                                        coverPic: 1,
                                        name: 1,
                                        professional: {
                                            professionalSpeciality: {
                                                /*specialityName: 1,
                                                specialist: 1*/
                                                specialityName:"$professional.professionalSpeciality.specialityName."+req.headers.language,
                                                specialist:"$professional.professionalSpeciality.specialist."+req.headers.language
                                            }
                                        }
                                    },
                                    diagnosticsData: 1,
                                    medications: 1,
                                    appointmentId: 1,
                                    testData: 1,
                                    chiefComplaint: 1,
                                    createdAt: 1,
                                    userData: {
                                        _id: 1,
                                        profilePic: 1,
                                        coverPic: 1,
                                        name: 1,
                                        user: {
                                            dob: 1,
                                            dependents: 1
                                        }
                                    },
                                    appointments: {
                                        _id: 1,
                                        appointmentNumber: 1,
                                        type: 1,
                                        status: 1,
                                        scheduledService: 1,
                                        reportType: 1,
                                        fileId: 1
                                    }
                                }
                            },
                            {$sort: {_id: -1}},
                            {$limit: payload.limit}
                        );
//console.log("aggregate --- ",JSON.stringify(aggregate))

                        /*[data, count] = await Promise.all([
                            Dao.aggregateData(Models.PatientAppointmentReport, aggregate),
                            Dao.count(Models.PatientAppointmentReport, criteria)
                        ]);*/
                        let data = await Dao.aggregateData(Models.PatientAppointmentReport, aggregate)

                        //console.log("data", JSON.stringify(data));

                        for (let i = 0; i < data.length; i++ ) {
                            if(process.env.ENABLE_DB_ENCRYPTION=="1" && data.appointments && data.appointments.fileId != undefined && data.appointments.fileId!=""){
                                await decryptDBData(data.appointments, decryptColumns);
                            }
                            if (data[i] && data[i].diagnosticsData && data[i].diagnosticsData.length > 0) {
                                let diagnosticData = [];


                                data[i].diagnosticsData.map((item1) => {
                                    item1.title.map((item) => {
                                        if (item.type == req.headers.language) {
                                            diagnosticData.push({
                                                "_id": item1._id,
                                                "name": item.name
                                            })
                                        }
                                    })
                                });

                                data[i].diagnosticsData = diagnosticData
                            }
                            if ( data[i] && data[i].testData && data[i].testData.length  > 0) {
                                let testsData = [];
                                data[i].testData.map((item1) => {
                                    item1.title.map((item) => {
                                        if (item.type == req.headers.language) {
                                            testsData.push({
                                                "_id": item1._id,
                                                "name": item.name
                                            });
                                        }
                                    })
                                });
                                data[i].testData = testsData;
                            }
                            if ( data[i] && data[i].userData && data[i].userData.user && data[i].userData.user.dependents != undefined && data[i].userData.user.dependents.length > 0) {
                                let data1 = data[i].userData.user.dependents.filter(item => {
                                    console.log(item._id.toString() , payload.dependentId);
                                    return (item._id.toString() == payload.dependentId)
                                })
                                data[i].dependents = data1.length > 0 ? data1[0] : undefined;

                                data[i].userData.user.dependents = {};
                            }

                        }

                    //}
                    /*break;
                }                
            }*/

           // console.log(data, count);
           let datatosend = {
                //receivedList : {"data":data,"count":count},
                receivedList : data
                //scannedList : scannedList
                //scannedList : {"data":scannedList,"count":scannedCount}
           }
           APP_CONSTANTS.DATABASE.REPORT_TYPE.RECEIVED,
                    APP_CONSTANTS.DATABASE.REPORT_TYPE.SCANED
            return sendResponse.sendSuccessData(datatosend, APP_CONSTANTS.STATUSCODE.SUCCESS,
                req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);

        }
        catch (err) {
            console.log(err);
            if (err.isJoi) {
                return sendResponse.sendError(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, err.message, req.headers.language, res);
            }
            else {
                return sendResponse.sendErrorMessage(APP_CONSTANTS.STATUSCODE.BAD_REQUEST,
                    req.headers.language, err, res);
            }
        }
    },
    addFeedback: async (req, res, next) => {
        try {
            let schema =  Joi.object().keys({
                "rating": Joi.number().optional().default(1),
                "feedback": Joi.string().optional().allow(""),
                "userId": Joi.string().required().length(24),//professionalId/facilityId
                //"professionalId": Joi.string().required().length(24),
                "appointmentId": Joi.string().optional().length(24)
            });
            var encryptColumns = ['feedback'];
            let payload = await UniversalFunctions.validateSchema(req.body, schema, {presence: "required"});
            payload.beneficiaryId = ObjectId(userData._id);
            let userRole = await Models.Users.findOne( {"_id": ObjectId(payload.userId)},{role:1} );

            if(process.env.ENABLE_DB_ENCRYPTION=="1"){
                await encryptDBData(payload, encryptColumns);
            }
            if(userRole!=null){
                if((userRole.role).indexOf("PROFESSIONAL") != -1){
                    if(payload.appointmentId == undefined || payload.appointmentId == ""){
                        return res.status(400).json({
                            status: 0,
                            message: "Appointment Id is required",
                            data: {}
                        });

                    }else{
                        var feedbackData = await Dao.saveData(Models.ApointmentFeedback, payload);
                        sendPush(
                            Constants.NOTIFICATION_TYPE.ADD_FEEDBACK,
                            Constants.NOTIFICATION_TITLE.ADD_FEEDBACK,
                            Constants.NOTIFICATION_MESSAGE.ADD_FEEDBACK,
                            payload.userId, //rec
                            feedbackData._id, //content
                            "",
                            req.credentials._id //sender
                        )
                    }
                }else{
                    var feedbackData = await Models.ApointmentFeedback.findOneAndUpdate({"beneficiaryId": ObjectId(userData._id),"userId": ObjectId(payload.userId)},payload,{ upsert: true }  );
                        sendPush(
                            Constants.NOTIFICATION_TYPE.ADD_FEEDBACK,
                            Constants.NOTIFICATION_TITLE.UPDATE_FEEDBACK,
                            Constants.NOTIFICATION_MESSAGE.UPDATE_FEEDBACK,
                            payload.userId, //rec
                            feedbackData._id, //content
                            "",
                            req.credentials._id //sender
                        )
                }
            }
            return sendResponse.sendSuccessData({}, APP_CONSTANTS.STATUSCODE.SUCCESS,
                req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
        }
        catch (err) {
            console.log(err);
            if (err.isJoi) {
                return sendResponse.sendError(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, err.message, req.headers.language, res);
            }
            else {
                return sendResponse.sendErrorMessage(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, req.headers.language, err, res);
            }
        }
    },
    feedbacksList: async (req, res, next) => {
        try {
            let schema =  Joi.object().keys({
                "userId": Joi.string().required().length(24),
                count: Joi.number().optional().default(500),
                lastId: Joi.string().optional().length(24)
            });
            var decryptColumns = ['feedback'];
            let payload = await UniversalFunctions.validateSchema(req.query, schema, {presence: "required"});
            let criteria = {"userId":ObjectId(payload.userId)}
            if(payload.lastId && payload.lastId!=""){ criteria._id = {$lt:ObjectId(payload.lastId)} } //FOR PAGINATION
            if (is.undefined(payload.count) || is.empty(payload.count)) { payload.count = 100; }
            else{ payload.count = Number(payload.count); } //FOR PAGINATION

            let appntments = await Models.ApointmentFeedback.find(criteria, {}, {lean: true})
            .populate({
                path : 'beneficiaryId',
                select:'_id profilePic coverPic name'
            })
            //.sort({"_id":-1})
            .sort({"_id":-1}).limit(payload.count)
            .exec();
            return sendResponse.sendSuccessData(appntments, APP_CONSTANTS.STATUSCODE.SUCCESS, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res,decryptColumns);
        }
        catch (err) {
            console.log(err);
            if (err.isJoi) {
                return sendResponse.sendError(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, err.message, req.headers.language, res);
            }
            else {
                return sendResponse.sendErrorMessage(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, req.headers.language, err, res);
            }
        }
    },
    createInstantConsultationAppointment: async (req, res, next) => {
        try {
            let schema =  Joi.object().keys({
                "doctor": Joi.string().optional().default(1),
                "duration": Joi.string().optional().allow(""),
                "userRole": Joi.string().optional().allow(""),
                "consultationType": Joi.string().optional().allow("") // audio, video, chat
            });
            let payload = await UniversalFunctions.validateSchema(req.body, schema, {presence: "required"});

            var utcDate = moment(new Date()).subtract(payload.duration, 'minutes').format('YYYY-MM-DD');
            console.log("currentDate ---- ",utcDate)
            var utcSlotTime = moment(new Date()).subtract(payload.duration, 'minutes').format('h:mm A');
            console.log("currentSlotTime ---- ",utcSlotTime)
            var utcSlots = await controllerUtil.convertTimeStringInMins([utcSlotTime]);
            console.log("slots ---- ",utcSlots)
            var utcTime = await UtcConversion(utcSlots[0],utcDate,req.headers.timezone,"1");

            var currentDate = moment(new Date(utcTime)).subtract(payload.duration, 'minutes').format('YYYY-MM-DD');
            console.log("currentDate ---- ",currentDate)
            var currentSlotTime = moment(new Date(utcTime)).subtract(payload.duration, 'minutes').format('h:mm A');
            console.log("currentSlotTime ---- ",currentSlotTime)
            var slots = await controllerUtil.convertTimeStringInMins([currentSlotTime]);
            var appointmentData = Models.Appointment({
                "type" : "ONLINE",
                "slots" : slots,
                "timeZone":req.headers.timezone,
                "createdByRole" : payload.userRole,
                "status" : APP_CONSTANTS.DATABASE.APPOINTMENT_STATUS.PLACED,
                "doctor" : ObjectId(payload.doctor),
                "user" : ObjectId(userData._id),
                "scheduledService" : {
                    "slots" : [currentSlotTime], //current time
                    "date" : currentDate // current date
                },
                "followUpAppointment" : APP_CONSTANTS.DATABASE.FOLLOW_UP_APPOINTMENT.PAID,
                "isAlreadyReportGenerate" : false,
                //"reportType" : "",
                "isPushGenerated" : true,
                "isUserConfirmed" : true,
                "isUserModified" : true,
                "isDoctorConfirmed" : true,
                "isDoctorModified" : true, 
                "consultationType" : payload.consultationType
            })
            // let paymentsData = new Models.Appointment(criteria);
            appointmentData.save(function (err, result) {
                if(err){
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.PAYMENT_ERROR,err,res);
                }else{
                    return sendResponse.sendSuccessData({}, APP_CONSTANTS.STATUSCODE.SUCCESS,
                    req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                }
            });
        }
        catch (err) {
            console.log(err);
            if (err.isJoi) {
                return sendResponse.sendError(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, err.message, req.headers.language, res);
            }
            else {
                return sendResponse.sendErrorMessage(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, req.headers.language, err, res);
            }
        }
    },
    getCheckoutId: async (req, res, next) => {
        try {
            let schema = Joi.object().keys({
                "amount": Joi.string().required(),
                "currency": Joi.string().required(),                
                "recurringType": Joi.string().optional(),
                "createRegistration": Joi.string().optional()
            });
            let payload = await UniversalFunctions.validateSchema(req.query, schema, {presence: "required"});
            //var payload = req.body;
            let user = await Models.Users.findOne( {"_id": ObjectId(userData._id)},{paymentRegistrationIds:1, email:1, _id:0} );
            console.log("==================")
            console.log("payload ====== ",payload)
            console.log("==================")
            /*if(user.paymentRegistrationIds == undefined || user.paymentRegistrationIds.length == 0){
                return sendResponse.sendSuccessData({}, APP_CONSTANTS.STATUSCODE.SUCCESS, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
            }*/
            payload.amount = parseFloat(payload.amount).toFixed(2);
            let checkoutId = await paymentGateway.createCheckoutId(user, payload);

            checkoutId = JSON.parse(checkoutId);
            if (checkoutId.result.code == "000.200.100") {
                return sendResponse.sendSuccessData({"checkoutId": checkoutId.id}, APP_CONSTANTS.STATUSCODE.SUCCESS, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
            }
            else {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.PAYMENT_ERROR;
            }
        }
        catch (err) {
            console.log(err);
            if (err.isJoi) {
                return sendResponse.sendError(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, err.message, req.headers.language, res);
            }
            else {
                return sendResponse.sendErrorMessage(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, req.headers.language, err, res);
            }
        }
    },


    checkPaymentStatus: async (req, res, next) => {
        try {
            let schema = Joi.object().keys({
                "checkoutId": Joi.string().required()
            });
            let payload = await UniversalFunctions.validateSchema(req.body, schema, {presence: "required"});

            let paymentDetails = await paymentGateway.checkPaymentStatus(payload);

            console.log(paymentDetails);

            paymentDetails = JSON.parse(paymentDetails);
            if (paymentDetails.result.code == "000.000.000" || paymentDetails.result.code == "000.100.110" || paymentDetails.result.code == "000.100.111" || paymentDetails.result.code == "000.100.112" || paymentDetails.result.code == "000.200.100") {
                if(paymentDetails.registrationId){
                    console.log("/////////////////////")
                    console.log("-----paymentDetails.registrationId -- ",paymentDetails.registrationId)
                    console.log("/////////////////////")
                    var resp = await Models.Users.updateOne({"_id": ObjectId(userData._id)},{$addToSet: {paymentRegistrationIds:paymentDetails.registrationId}});
                    console.log("resp - ",resp)
                }
                return sendResponse.sendSuccessData(paymentDetails, APP_CONSTANTS.STATUSCODE.SUCCESS, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
            } else {
                return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.PAYMENT_ERROR,paymentDetails,res);
            }

        }
        catch (err) {
            console.log(err);
            if (err.isJoi) {
                return sendResponse.sendError(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, err.message, req.headers.language, res);
            }
            else {
                return sendResponse.sendErrorMessage(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, req.headers.language, err, res);
            }
        }
    },



    manageWallet: async (req, res, next) => {
        try {
            let schema = Joi.object().keys({
                "amount": Joi.string().required(),
                "action": Joi.string().required(),
                "type": Joi.string().optional(),
                "consultType": Joi.string().optional(),
                "id": Joi.string().optional()
            });
            let payload = await UniversalFunctions.validateSchema(req.body, schema, {presence: "required"});
            let dataToSet = {}
            if(payload.action == "1"){
                dataToSet = {            
                    $inc: { 
                        "wallet.balance": payload.amount, 
                        "wallet.transactionsCount": 1, 
                        "wallet.totalAmountAdded": payload.amount
                    },
                    "wallet.recentTransactionDate" : new Date()
                }
            }else if(payload.action == "0"){
                dataToSet = {            
                    $inc: { 
                        "wallet.balance": - payload.amount                        
                    },
                    "wallet.recentTransactionDate" : new Date()
                }
                let checkBalance = await Models.Users.findOne({"_id": ObjectId(userData._id)},{"wallet.balance":1,"_id":0});
                if(checkBalance == null || checkBalance.wallet == undefined || checkBalance.wallet.balance == undefined || checkBalance.wallet.balance < payload.amount){
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.NOT_ENOUGH_WALLET_AMOUNT,{},res);
                }
            }
            Models.Users.updateOne({"_id": ObjectId(userData._id)},dataToSet, async function (updateErr, updateCheck) {
                if (updateErr) {
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,updateErr,res);
                } else {
                    var walletSuccessMessage;
                    let paymentData;
                    if(payload.action == "1"){
                        walletSuccessMessage = RESPONSE_MESSAGES.PAYMENT_MESSAGES.ADD_WALLET;
                        paymentData = await savePaymentDetails({},{ "type":"2", "amount":payload.amount, "paymentMode":"Wallet"},walletSuccessMessage.message.en,walletSuccessMessage,payload.action);

                    }else if(payload.action == "0"){
                        if(payload.type == "1"){
                            var apptdata = await Models.Appointment.findOne({"_id":Objectid(payload.id)}, {"doctor":1});
                            payload.professionalId = apptdata.doctor
                            walletSuccessMessage = RESPONSE_MESSAGES.PAYMENT_MESSAGES.APPOINTMENT                        
                        }else if(payload.type == "3"){
                            walletSuccessMessage = RESPONSE_MESSAGES.PAYMENT_MESSAGES.COURSE
                        }else if(payload.type == "4"){
                            walletSuccessMessage = RESPONSE_MESSAGES.PAYMENT_MESSAGES.APPOINTMENT
                        }
                        payload.paymentMode = "Wallet";
                        paymentData = await savePaymentDetails({},payload,walletSuccessMessage.message.en,walletSuccessMessage,payload.action);
                    }
                    return sendResponse.sendSuccessData({}, APP_CONSTANTS.STATUSCODE.SUCCESS, req.headers.language, walletSuccessMessage, res);
                }
            });
        }
        catch (err) {
            console.log(err);
            if (err.isJoi) {
                return sendResponse.sendError(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, err.message, req.headers.language, res);
            } else {
                return sendResponse.sendErrorMessage(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, req.headers.language, err, res);
            }
        }
    },
    callPayment: async (req, res, next) => {
        try {
            let schema = Joi.object().keys({
                "paymentMode": Joi.string().required(), // wallet, card
                "duration": Joi.string().required(),
                "sessionCost": Joi.string().required(),
                "currency": Joi.string().required(),

                //for saving call details in case of recurring payment
                "type": Joi.string().optional(), //1 - appointment, , 4 - Instant Consultation
                "consultType": Joi.string().optional(), // 1 - Audio Call, 2 - Video Call,3-Chat
                "id": Joi.string().optional(), // appointment id or professionalid

                //registeration id for recurring payment
                //"registrationId": Joi.string().optional(),

                //below parameters for rebill a payment
                //"previousSessionCost": Joi.string().optional(),
                "transactionId": Joi.string().optional(),
                "isRecurring": Joi.string().optional(),
                "action": Joi.string().optional()

            });
            let payload = await UniversalFunctions.validateSchema(req.body, schema, {presence: "required"});
            console.log("payload ---- ",payload)
            var setDefaultSessionTime = 30;
            payload.amount = payload.sessionCost;

            if(Number(payload.duration) != 0){
                if(payload.consultType=="1" || payload.consultType=="2"){
                    payload.amount = payload.sessionCost * Math.ceil(payload.duration);
                    //payload.amount = (payload.amount).toFixed(2);
                }
                if(payload.consultType=="3"){
                    /*if(payload.duration != setDefaultSessionTime){
                         payload.amount = (payload.sessionCost/setDefaultSessionTime) * payload.duration;
                         payload.amount = (payload.amount).toFixed(2);
                    }*/
                }
                //payload.amount = Number(payload.amount)
            }else{
                payload.amount = 0
            }
            payload.amount = parseFloat(payload.amount).toFixed(2);
            console.log("payload ---- ",payload)
            let responseMessage

            // if(payload.type=="1"){                        
            //     var apptdata = await Models.Appointment.findOne({"_id":Objectid(payload.id)}, {"doctor":1});
            //     payload.professionalId = apptdata.doctor
            // }

            if(payload.paymentMode == "wallet"){
                let dataToSet = {
                    $inc: { 
                        "wallet.balance": - payload.amount
                    },
                    "wallet.recentTransactionDate" : new Date()
                }
                responseMessage = RESPONSE_MESSAGES.PAYMENT_MESSAGES.APPOINTMENT;
                /*if(payload.action == "1"){
                     dataToSet = {
                        $inc: { 
                            "wallet.balance": Number(payload.sessionCost), 
                            "wallet.transactionsCount": 1, 
                            "wallet.totalAmountAdded": payload.sessionCost
                        },
                        "wallet.recentTransactionDate" : new Date()
                    }   
                    responseMessage = RESPONSE_MESSAGES.PAYMENT_MESSAGES.ADD_WALLET;
                    payload.amount = payload.sessionCost
                }else{*/
                    let checkBalance = await Models.Users.findOne({"_id": ObjectId(userData._id)},{"wallet.balance":1,"_id":0});
                    if(checkBalance == null || checkBalance.wallet == undefined || checkBalance.wallet.balance == undefined || checkBalance.wallet.balance < payload.amount){
                        return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.NOT_ENOUGH_WALLET_AMOUNT,{},res);
                    }
                //}
                console.log("dataToSet ---- ",dataToSet)

                let paymentDetails = await Models.Users.updateOne({"_id": ObjectId(userData._id)},dataToSet);
                console.log("paymentDetails ---- ",paymentDetails)
                
                if(paymentDetails && /*(*/Number(payload.duration)!=0/* || payload.action=="1")*/){
                    let paymentData = await savePaymentDetails({},payload,responseMessage.message.en,responseMessage,0);
                }
            }else{
                if(payload.action!=undefined && payload.action == "1"){
                    responseMessage = RESPONSE_MESSAGES.PAYMENT_MESSAGES.ADD_WALLET;
                    payload.amount = payload.sessionCost;
                }else{
                    responseMessage = RESPONSE_MESSAGES.PAYMENT_MESSAGES.APPOINTMENT;
                }
                let paymentDetails = await paymentGateway.rebillPayment(payload);
                console.log("paymentDetails ---- ",paymentDetails)
                if(paymentDetails && Number(payload.duration)!=0){
                    let paymentData = await savePaymentDetails({},payload,responseMessage.message.en,responseMessage,0);
                }
            }
            return sendResponse.sendSuccessData(payload, APP_CONSTANTS.STATUSCODE.SUCCESS, req.headers.language, responseMessage, res);
        }
        catch (err) {
            console.log(err);
            if (err.isJoi) {
                return sendResponse.sendError(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, err.message, req.headers.language, res);
            } else {
                return sendResponse.sendErrorMessage(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, req.headers.language, err, res);
            }
        }
    },

    getTransactionsListWithFilters: async (req, res, next) => {
        try {
            let obj = req.query;
            let err = [];
            let criteria = {
                "isDeleted": false/*,
                "userId": ObjectId(userData._id)*/
            }
            if(obj.type != "0"){
                criteria.type = obj.type;
            }
            var addToField = {
              "amountNew":{"$toDouble":"$amount"}
            }
            if(obj.userType && obj.userType == "2"){
                criteria.professionalId = ObjectId(userData._id);
                addToField = {
                  "amountNew":{"$toDouble":"$professionalAmount"}
                }
            }else{
                criteria.userId = ObjectId(userData._id);
            }

            if((obj.startDate && obj.startDate!="") && (obj.endDate && obj.endDate!="")){
                criteria.createdAt = {$gte:new Date(obj.startDate),$lte:new Date(obj.endDate)}
            }
            else if(obj.startDate && obj.startDate!=""){
                criteria.createdAt = {$gte:new Date(obj.startDate)}
            }
            else if(obj.endDate && obj.endDate!=""){
                criteria.createdAt = {$lte:new Date(obj.endDate)}
            }

            var aggregate = [
                {$match: criteria},
                {"$addFields":addToField},
                {
                    $group: {
                        _id: '',
                        amountNew:{ $sum:"$amountNew"},
                    }
                 },
                {$project:{
                    totalAmount:"$amountNew" 
                }}
            ];
            var totalAmount = await Models.Payments.aggregate(aggregate)
            console.log("totalAmount ==== ",totalAmount)


            if(obj.lastId && obj.lastId!=""){ criteria._id = {$lt:ObjectId(obj.lastId)} } //FOR PAGINATION
            if (is.undefined(obj.count) || is.empty(obj.count)) { obj.count = 100; }
            else{ obj.count = Number(obj.count); } //FOR PAGINATION

            Models.Payments.aggregate([
                {$match: criteria},
                {"$addFields":addToField},
                {$lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "userId",
                        as: 'userId'
                    }
                },
                { "$unwind": {
                    "path": "$userId",
                    "preserveNullAndEmptyArrays": true
                } },

                {$lookup: {
                        from: "appointments",
                        foreignField: "_id",
                        localField: "appointmentId",
                        as: 'appointmentId'
                    }
                },
                { "$unwind": {
                    "path": "$appointmentId",
                    "preserveNullAndEmptyArrays": true
                } },

                {$lookup: {
                        from: "courses",
                        foreignField: "_id",
                        localField: "courseId",
                        as: 'courseId'
                    }
                },
                { "$unwind": {
                    "path": "$courseId",
                    "preserveNullAndEmptyArrays": true
                } },


                {$lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "professionalId",
                        as: 'professionalId'
                    }
                },
                { "$unwind": {
                    "path": "$professionalId",
                    "preserveNullAndEmptyArrays": true
                } },

                {$project:{
                    _id:1,
                    message:"$message."+req.headers.language,
                    type:1,
                    consultType:1,
                    userId:{
                        name:1,
                        profilePic:1,
                        coverPic:1,
                        defaultLoginRole:1
                    },
                    paymentMode:1,
                    paymentStatus:1,
                    paymentStatusMsg:1,
                    amount:1                ,
                    transactionId:1,
                    registrationId: 1,
                    action:1,
                    createdAt:1,
                    courseId:1,
                    //professionalAmount:1,
                    professionalAmount: {
                        "$cond": {
                            if: {"$gte": ["$professionalAmount", 0]}, 
                            then: "$professionalAmount", 
                            else: "0"
                        }
                    },
                    appointmentId:{
                        type:1
                    },
                    professionalId:{
                        name:1,
                        profilePic:1,
                        coverPic:1,
                        defaultLoginRole:1
                    },
                }},
                {$sort: {_id: -1}},
                {$limit: obj.count}
            ],function (err, result) {
                //console.log(result)
                if (err) {
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,err,res);
                } else {                    
                    return sendResponse.sendSuccessData({transactionsList:result,totalAmount:(totalAmount.length > 0 && totalAmount[0].totalAmount) ? totalAmount[0].totalAmount : 0 },200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },    
    getTransactionsList: async (req, res, next) => {
        try {
            let obj = req.query;
            let err = [];
            let criteria = {
                "isDeleted": false,
                "userId": ObjectId(userData._id)
            }
            if(obj.type != "0"){
                criteria.type = obj.type;
            }
            if(obj.userType && obj.userType == "2"){
                criteria.professionalId = ObjectId(userData._id);
            }else{
                criteria.userId = ObjectId(userData._id);
            }
            if(obj.lastId && obj.lastId!=""){ criteria._id = {$lt:ObjectId(obj.lastId)} } //FOR PAGINATION
            if (is.undefined(obj.count) || is.empty(obj.count)) { obj.count = 100; }
            else{ obj.count = Number(obj.count); } //FOR PAGINATION

            if((obj.startDate && obj.startDate!="") && (obj.endDate && obj.endDate!="")){
                criteria.createdAt = {$gte:new Date(obj.startDate),$lte:new Date(obj.endDate)}
            }
            else if(obj.startDate && obj.startDate!=""){
                criteria.createdAt = {$gte:new Date(obj.startDate)}
            }
            else if(obj.endDate && obj.endDate!=""){
                criteria.createdAt = {$lte:new Date(obj.endDate)}
            }
            Models.Payments.aggregate([
                {$match: criteria},
                {$lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "userId",
                        as: 'userId'
                    }
                },
                { "$unwind": {
                    "path": "$userId",
                    "preserveNullAndEmptyArrays": true
                } },

                {$lookup: {
                        from: "appointments",
                        foreignField: "_id",
                        localField: "appointmentId",
                        as: 'appointmentId'
                    }
                },
                { "$unwind": {
                    "path": "$appointmentId",
                    "preserveNullAndEmptyArrays": true
                } },

                {$lookup: {
                        from: "courses",
                        foreignField: "_id",
                        localField: "courseId",
                        as: 'courseId'
                    }
                },
                { "$unwind": {
                    "path": "$courseId",
                    "preserveNullAndEmptyArrays": true
                } },


                {$lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "professionalId",
                        as: 'professionalId'
                    }
                },
                { "$unwind": {
                    "path": "$professionalId",
                    "preserveNullAndEmptyArrays": true
                } },

                {$project:{
                    _id:1,
                    message:"$message."+req.headers.language,
                    type:1,
                    consultType:1,
                    userId:{
                        name:1,
                        profilePic:1,
                        coverPic:1,
                        defaultLoginRole:1
                    },
                    paymentMode:1,
                    paymentStatus:1,
                    paymentStatusMsg:1,
                    amount:1                ,
                    transactionId:1,
                    registrationId: 1,
                    action:1,
                    createdAt:1,
                    courseId:1,
                    appointmentId:{
                        type:1
                    },
                    professionalId:{
                        name:1,
                        profilePic:1,
                        coverPic:1,
                        defaultLoginRole:1
                    },
                }},
                {$sort: {_id: -1}},
                {$limit: obj.count}
            ],function (err, result) {
                //console.log(result)
                if (err) {
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,err,res);
                } else {                    
                    return sendResponse.sendSuccessData(result,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },    
    getTransactionsListMonthWise: async (req, res, next) => {
        try {
            let obj = req.query;
            let err = [];


            var oneYearAgoDate = moment(new Date()).subtract('years', 7).toDate()
            let criteria = {
                "isDeleted": false,
                "professionalId": ObjectId(userData._id),
                "createdAt": {$gte: oneYearAgoDate}
            }
            var aggregate = [
                {$match: criteria},
                {"$addFields":{
                  "amountNew":{"$toDouble":"$professionalAmount"}
                }},
                {
                    $group: {
                        _id: '',
                        amountNew:{ $sum:"$amountNew"},
                    }
                 },
                {$project:{
                    totalAmount:"$amountNew" 
                }}
            ];
            var totalAmount = await Models.Payments.aggregate(aggregate)

            Models.Payments.aggregate([
                {$match:criteria},
                {"$addFields":{
                    "amountNew":{"$toDouble":"$professionalAmount"}
                }},
                {$group: {
                    _id: {$substr: ['$createdAt', 5, 2]},
                    numberofTransactions: {$sum: 1},
                    amountNew:{ $sum:"$amountNew"},
                    createdAtDate: {$first: "$createdAt"}
                    
                }},
                {$project:{
                    numberOfTransactions:"$numberofTransactions" ,
                    totalAmount: "$amountNew", 
                    createdAtDate: "$createdAtDate", 
                    
                }},
                {$sort: {createdAtDate: 1}}
            ],function (err, result) {
                //console.log(result)
                if (err) {
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,err,res);
                } else {                    
                    return sendResponse.sendSuccessData({transactionsList:result,totalAmount:(totalAmount.length > 0 && totalAmount[0].totalAmount) ? totalAmount[0].totalAmount : 0 },200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },    
    makeRecurringPayment: async (req, res, next) => {
        try {
            let schema = Joi.object().keys({
                "amount": Joi.string().required(),
                "currency": Joi.string().required(),
                "registrationId": Joi.string().optional(),
                "consultType": Joi.string().optional()
            });

            let payload = await UniversalFunctions.validateSchema(req.body, schema, {presence: "required"});            
            var setDefaultSessionTime = 30;
            console.log("payload----",payload)
            if(payload.consultType=="1" || payload.consultType=="2"){
                payload.amount = payload.amount * setDefaultSessionTime;
                payload.amount = (payload.amount).toFixed(2);
            }
            if(payload.consultType=="3"){
                //payload.amount = (payload.amount).toFixed(2);
            }
            //payload.amount = Math.ceil(payload.amount);            
            payload.amount = parseFloat(payload.amount).toFixed(2);
            let paymentDetails = await paymentGateway.RecurringPayment(payload);
            paymentDetails = JSON.parse(paymentDetails);
            console.log("===========================================================")
            console.log("paymentDetails----",JSON.stringify(paymentDetails))
            if (paymentDetails.result.code == "000.000.000" || paymentDetails.result.code == "000.100.110" || paymentDetails.result.code == "000.100.111" || paymentDetails.result.code == "000.100.112") {
                return sendResponse.sendSuccessData(paymentDetails, APP_CONSTANTS.STATUSCODE.SUCCESS, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
            }
            else {
                //throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.PAYMENT_ERROR;
                return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.PAYMENT_ERROR,paymentDetails,res);
            }
        }
        catch (err) {
            console.log(err);
            if (err.isJoi) {
                return sendResponse.sendError(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, err.message, req.headers.language, res);
            }
            else {
                return sendResponse.sendErrorMessage(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, req.headers.language, err, res);
            }
        }
    },

    removeCard: async (req, res, next) => {
        try {
            let schema = Joi.object().keys({
                "registrationId": Joi.string().optional()
            });

            var payload = await UniversalFunctions.validateSchema(req.body, schema, {presence: "required"});
            let paymentDetails = await paymentGateway.removeCard(payload);
            paymentDetails = JSON.parse(paymentDetails);
            console.log("===========================================================")
            console.log("paymentDetails----",JSON.stringify(paymentDetails))
            if (paymentDetails.result.code == "000.000.000" || paymentDetails.result.code == "000.100.110" || paymentDetails.result.code == "000.100.111" || paymentDetails.result.code == "000.100.112") {
                Models.Users.updateOne({"_id": ObjectId(userData._id)},{$pull: {paymentRegistrationIds:payload.registrationId}});
                return sendResponse.sendSuccessData({}, APP_CONSTANTS.STATUSCODE.SUCCESS, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
            }
            else {
                //throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.PAYMENT_ERROR;
                return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.PAYMENT_ERROR,paymentDetails,res);
            }
        }
        catch (err) {
            console.log(err);
            if (err.isJoi) {
                return sendResponse.sendError(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, err.message, req.headers.language, res);
            }
            else {
                return sendResponse.sendErrorMessage(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, req.headers.language, err, res);
            }
        }
    },





















    makePayment: async (req, res, next) => {
        try {
            let schema = Joi.object().keys({
                "amount": Joi.string().required(),
                "currency": Joi.string().required(),
                "paymentMode": Joi.string().required(),
                "paymentBrand": Joi.string().required(),
                "cardNumber": Joi.string().required(),
                "cardHolderName": Joi.string().required(),
                "expiryMonth": Joi.string().required(),
                "expiryYear": Joi.string().required(),
                "cvv": Joi.string().required(),
                "recurringType": Joi.string().optional(),
                "createRegistration": Joi.string().optional(),
                "type": Joi.string().required(),
                "consultType": Joi.string().optional(),
                "id": Joi.string().optional()
            });

            let payload = await UniversalFunctions.validateSchema(req.body, schema, {presence: "required"});

            //let paymentDetails = await paymentGateway.makePayment(payload);
            let paymentDetails = await paymentGateway.InitialPayment(payload);
            
            paymentDetails = JSON.parse(paymentDetails);
            if (paymentDetails.result.code == "000.000.000" || paymentDetails.result.code == "000.100.110" || paymentDetails.result.code == "000.100.111" || paymentDetails.result.code == "000.100.112") {
                let paymentStatusMsg = await paymentStatusCheck(paymentDetails)
                let languageMessage = {}
                let paymentAction = "0"
                if(payload.type == "1"){
                    languageMessage = RESPONSE_MESSAGES.PAYMENT_MESSAGES.APPOINTMENT
                }else if(payload.type == "2"){
                    paymentAction = "1"
                    languageMessage = RESPONSE_MESSAGES.PAYMENT_MESSAGES.ADD_WALLET
                }else if(payload.type == "3"){
                    languageMessage = RESPONSE_MESSAGES.PAYMENT_MESSAGES.COURSE
                }else if(payload.type == "4"){
                    languageMessage = RESPONSE_MESSAGES.PAYMENT_MESSAGES.APPOINTMENT
                }
                let paymentData = await savePaymentDetails(paymentDetails,payload,paymentStatusMsg,languageMessage,paymentAction);
                if(payload.createRegistration && paymentData.registrationId){
                    await Models.Users.updateOne({"_id": ObjectId(userData._id)},{$addToSet: {paymentRegistrationIds:paymentData.registrationId}});
                }

                return sendResponse.sendSuccessData(paymentDetails, APP_CONSTANTS.STATUSCODE.SUCCESS, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
            }

            else {
                //throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.PAYMENT_ERROR;
                return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.PAYMENT_ERROR,paymentDetails,res);
            }
        }
        catch (err) {
            console.log(err);
            if (err.isJoi) {
                return sendResponse.sendError(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, err.message, req.headers.language, res);
            }
            else {
                return sendResponse.sendErrorMessage(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, req.headers.language, err, res);
            }
        }
    },

    transactionSearchByMerchantTransactionId: async (req, res, next) => {
        try {
            let schema = Joi.object().keys({
                "merchantTransactionId": Joi.string().required()
            });
            let payload = await UniversalFunctions.validateSchema(req.body, schema, {presence: "required"});

            let paymentDetails = await paymentGateway.transactionSearchByMerchantTransactionId(payload);

            console.log(paymentDetails);

            paymentDetails = JSON.parse(paymentDetails);

            return sendResponse.sendSuccessData(paymentDetails, APP_CONSTANTS.STATUSCODE.SUCCESS, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);

        }
        catch (err) {
            console.log(err);
            if (err.isJoi) {
                return sendResponse.sendError(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, err.message, req.headers.language, res);
            }
            else {
                return sendResponse.sendErrorMessage(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, req.headers.language, err, res);
            }
        }
    },
    addCSFContract: async (req, res, next) => {
        try {
            let schema = Joi.object().keys({
                idNumber: Joi.string().required(),
                registrationNumber: Joi.string().required(),
                representativeName: Joi.string().required(),
                commercialRegistration: Joi.string().required(),
                procurationNumber: Joi.string().required(),
                postalCode: Joi.string().required(),
                bankName: Joi.string().required(),
                iban: Joi.string().required(),
                swiftCode: Joi.string().required(),
                bankCity: Joi.string().required(),
                bankCountry: Joi.string().required(),
                currency: Joi.string().required(),
                templateId: Joi.string().required(),
                teamSignature: Joi.object().optional().keys({
                    original: Joi.string().optional().allow(''),
                    thumbnail: Joi.string().optional().allow(''),
                    fileName: Joi.string().optional().allow(''),
                    type: Joi.string().optional().allow('')
                })
            });
            let payload = await UniversalFunctions.validateSchema(req.body, schema, {presence: "required"});

            let checkTemplate = await Dao.findOne(Models.CommonServiceType, { "_id": payload.templateId, "type":
                APP_CONSTANTS.DATABASE.COMMON_SERVICE_TYPE.CSFCONTRACT }, { }, { lean: true });

            if (!checkTemplate) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_TEMPLATE_ID;

            let checkContract = await Dao.findOne(Models.Contract, { "professionalId": req.credentials._id,
            "contractExpireDate": { $gt: (new Date().getTime()) }}, { }, { lean: true });

            if (checkContract) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.ALREADY_CONTRACT_PERIOD;

            payload.contract = checkTemplate.template;
            payload.duration = checkTemplate.duration;
            payload.professionalId = req.credentials._id;
            payload.status = '1';
            payload.teamManagerType = req.credentials.defaultLoginRole;

            let currentDate = new Date();
            payload.contractSignDate = currentDate.getTime();
            payload.contractExpireDate = currentDate.setFullYear(currentDate.getFullYear() +
                (checkTemplate.duration ? checkTemplate.duration : 1) );

            await Promise.all([
                Dao.update(Models.Users, { "_id": req.credentials._id }, { "csfContract": true }, { lean:true }),
                Dao.saveData(Models.Contract, payload)
            ]);

           // console.log(payload, req.credentials._id, req.credentials);

            return sendResponse.sendSuccessData({}, APP_CONSTANTS.STATUSCODE.SUCCESS, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);

        }
        catch (err) {
            console.log(err);
            if (err.isJoi) {
                return sendResponse.sendError(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, err.message, req.headers.language, res);
            }
            else {
                return sendResponse.sendErrorMessage(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, req.headers.language, err, res);
            }
        }
    },
    getCSFContract: async (req, res, next) => {
        req.headers.language = req.headers.language || 'en';
        try {

            let schema = Joi.object().keys({
               // type: Joi.number().required()
            });
            let payload = await UniversalFunctions.validateSchema(req.query, schema, {presence: "required"});

            let template = "";
            let tags = {};
            let finalResult = { "contract": {

                }};

            if (!(req.credentials && req.credentials.csfContract)) {

                let checkTemplate = await Dao.findOne(Models.CommonServiceType, {
                   "type":
                    APP_CONSTANTS.DATABASE.COMMON_SERVICE_TYPE.CSFCONTRACT
                }, {}, {lean: true});

                if (!checkTemplate) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_TEMPLATE_ID;

                template = checkTemplate.template;
                checkTemplate.title.map((item) => { if (item.type == req.headers.language) {
                    finalResult.contract.name = item.name;
                }});
                finalResult.contract._id = checkTemplate._id;
                tags.facilityName = req.credentials.name;
            }
            else {
                let populateData = [];

                populateData.push({
                    path : 'professionalId',
                    select:'_id name email phone address professional.professionalSpeciality professional.city professional.country professional.license',
                    populate : {
                        path : 'professional.professionalSpeciality',
                        select:'specialityName specialist'
                    },
                    populate : {
                        path : 'professional.city',
                        select:'locationName'
                    },
                    populate : {
                        path : 'professional.country',
                        select:'locationName'
                    }
                },{
                    path : 'bankCountry',
                    select: "locationName"
                },{
                    path : 'bankCity',
                    select: "locationName",
                },{
                    path : 'templateId',
                    select: "title _id",
                })

                //, "contractExpireDate": {$gte: (new Date().getTime())}

                let checkTemplate = await Dao.populateData(Models.Contract, {
                    "professionalId": req.credentials._id, "contractExpireDate": { $gt: (new Date().getTime()) }
                }, {}, { lean: true }, populateData);


                if (checkTemplate.length == 0) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_TEMPLATE_ID;

                checkTemplate = checkTemplate[0];

           //     console.log(checkTemplate)

                template = checkTemplate.contract;

                tags.name = checkTemplate.professionalId.name;
                tags.emailAddress = checkTemplate.professionalId.email;
                tags.phoneNumber = checkTemplate.professionalId.phone;
                if(checkTemplate.professionalId.professional.professionalSpeciality!=null && checkTemplate.professionalId.professional.professionalSpeciality.specialityName!=undefined){
                    tags.positionEnglish = checkTemplate.professionalId.professional.professionalSpeciality.specialityName.en;
                    tags.positionArabic = checkTemplate.professionalId.professional.professionalSpeciality.specialityName.ar;
                }
                if(checkTemplate.professionalId.professional.country!=null && checkTemplate.professionalId.professional.country.locationName!=undefined){
                    tags.nationalityEnglish = checkTemplate.professionalId.professional.country.locationName.en;
                    tags.nationalityArabic = checkTemplate.professionalId.professional.country.locationName.ar;
                }

                if(checkTemplate.professionalId.professional.city!=null && checkTemplate.professionalId.professional.city.locationName!=undefined){
                    tags.cityEnglish = checkTemplate.professionalId.professional.city.locationName.en;
                    tags.cityArabic = checkTemplate.professionalId.professional.city.locationName.ar;
                }
                tags.fullName = checkTemplate.professionalId.name;
                tags.licenseNumber = checkTemplate.professionalId.professional.license;
                tags.address = checkTemplate.professionalId.address;

                //tags.facilityName = checkTemplate.teamManagerId.name;

                tags.idNumber = checkTemplate.idNumber;
                tags.registrationNumber = checkTemplate.registrationNumber;
                tags.representativeName = checkTemplate.representativeName;
                tags.day = checkTemplate.day;
                tags.commercialRegistration = checkTemplate.commercialRegistration;
                tags.procurationNumber = checkTemplate.procurationNumber;
                tags.postalCode = checkTemplate.postalCode;

                tags.bankName = checkTemplate.bankName;
                tags.iban = checkTemplate.iban;
                tags.swiftCode = checkTemplate.swiftCode;
                if(checkTemplate.bankCity!=null && checkTemplate.bankCity.locationName!=undefined){
                    tags.bankCity = checkTemplate.bankCity.locationName.en;
                    tags.bankCityArabic = checkTemplate.bankCity.locationName.ar;
                }
                //tags.bankCity = result.bankCity;

                if(checkTemplate.bankCountry!=null && checkTemplate.bankCountry.locationName!=undefined){
                    tags.bankCountry = checkTemplate.bankCountry.locationName.en;
                    tags.bankCountryArabic = checkTemplate.bankCountry.locationName.ar;
                }
                //tags.bankCountry = result.bankCountry;
                tags.currency = checkTemplate.currency;
                //console.log("result.professionalId.professional.city.locationName ----------- ",result.professionalId.professional.country.locationName)
                /*tags.professionalSignatureDate = "";
                tags.managerSignatureDate = "";*/
                /* NEW TEMPLATE PARAMETERS*/
                if(checkTemplate.teamSignature != "") {
                    tags.professionalSignature = "<img src='" + process.env.BASE_URL + checkTemplate.teamSignature.original + "' width='100%'>"
                }

                finalResult.idNumber = checkTemplate.idNumber;
                finalResult.registrationNumber = checkTemplate.registrationNumber;
                finalResult.representativeName = checkTemplate.representativeName;
                finalResult.day = checkTemplate.day;
                finalResult.commercialRegistration = checkTemplate.commercialRegistration;
                finalResult.procurationNumber = checkTemplate.procurationNumber;
                finalResult.postalCode = checkTemplate.postalCode;

                finalResult.bankName = checkTemplate.bankName;
                finalResult.currency = checkTemplate.currency;
                finalResult.iban = checkTemplate.iban;
                finalResult.swiftCode = checkTemplate.swiftCode;
                finalResult.teamSignature = checkTemplate.teamSignature;
                finalResult.bankCity = {
                    locationName: checkTemplate.bankCity.locationName.en,
                    _id: checkTemplate.bankCity._id
                }
                finalResult.bankCountry = {
                    locationName: checkTemplate.bankCountry.locationName.en,
                    _id: checkTemplate.bankCountry._id
                }
                checkTemplate.templateId.title.map((item) => {
                   // console.log(item.type , req.headers.language)
                    if (item.type == req.headers.language) {
                    finalResult.contract.name = item.name;
                }});
                finalResult.contract._id = checkTemplate.templateId._id;
                finalResult._id = checkTemplate._id;

                let days = (checkTemplate.contractExpireDate - new Date().getTime());
                let oneDay = 24 * 60 * 60 * 1000;

                days = (days/oneDay);

                finalResult.canrenew = (days > 0 && days < 7) ? true : false;
            }

            String.prototype.fmt = function (hash) {
                var string = this, key; for (key in hash) string = string.replace(new RegExp('\\{{' + key + '\\}}', 'gm'), hash[key]); return string
            }
            template = template.fmt(tags);
            finalResult.contract.template = template;

            return sendResponse.sendSuccessData(finalResult, APP_CONSTANTS.STATUSCODE.SUCCESS, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);

        }
        catch (err) {
            //console.log(err);
            if (err.isJoi) {
                return sendResponse.sendError(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, err.message, req.headers.language, res);
            }
            else {
                return sendResponse.sendErrorMessage(APP_CONSTANTS.STATUSCODE.BAD_REQUEST, req.headers.language, err, res);
            }
        }
    }
};

async function sendPush(type, title, message, receiverId, contentId, appointmentId, senderId){ // contentId - post id, user id,appointmentid, comment id, etc
    console.log("receiverId ---- ",receiverId)
    let userSettings = await Models.Users.findOne({"_id":ObjectId(receiverId)},{deviceType: 1, deviceToken: 1, language: 1});
    var usernm = userData.name ? userData.name: ''
    let notificationData = {
        "name": usernm, // sender's name who is owner or sender
        "contentId": (contentId).toString(), //postid / appointmentid / userid / commentid / etc
        "appointmentId": (appointmentId).toString(), //postid / appointmentid / userid / commentid / etc
        "type": type, //APP_CONSTANTS.NOTIFICATION_TYPE.CREATE_APPOINTMENT, // type of notification
        "title": title[userSettings.language], //APP_CONSTANTS.NOTIFICATION_TITLE.CREATE_APPOINMENT[userSettings.language],
        "message": usernm+" "+message[userSettings.language], //APP_CONSTANTS.NOTIFICATION_MESSAGE.CREATE_APPOINMENT[userSettings.language],
        "userId": (receiverId).toString()//payload.user // push notification receiver's id
    };
    let notificationDataInsert = {
        senderId: senderId, //
        receiverId: receiverId,//payload.doctor, //owner of post, user who posted comment in case of reply, all followers, etc
        contentId: contentId, //pharmacy request id / postid / appointmentid / userid / commentid / etc
        appointmentId: appointmentId, //pharmacy request id / postid / appointmentid / userid / commentid / etc
        timeStamp: (new Date()).getTime(),
        "type": type,//APP_CONSTANTS.NOTIFICATION_TYPE.CREATE_APPOINTMENT, //type of notification
        "title": title[userSettings.language], //APP_CONSTANTS.NOTIFICATION_TITLE.CREATE_APPOINMENT[userSettings.language],
        "message": {
            'en': usernm+" "+message['en'],//APP_CONSTANTS.NOTIFICATION_MESSAGE.CREATE_APPOINMENT['en'],
            'ar': usernm+" "+message['ar']//APP_CONSTANTS.NOTIFICATION_MESSAGE.CREATE_APPOINMENT['ar']
        }
    };

    if(type == "APPOINTMENT_CONFIRMATION"){
        notificationData.appointmentId = contentId.toString()
        notificationDataInsert.appointmentId  = contentId.toString()
    }else{
        notificationData.contentId = contentId.toString()
        notificationDataInsert.contentId  = contentId.toString()
    }
    //  console.log(notificationData, notificationDataInsert);

    CommonController.sendPushNotification({
        deviceType: userSettings.deviceType,
        deviceToken: userSettings.deviceToken
    }, notificationData);
    CommonController.notificationUpdate(notificationDataInsert);
}
async function getAppointmentList(query, type, req){
    let criteria = {}, finalResponse = {},searchDate = {};
            criteria = {
                user: ObjectId(userData._id),
                //status : "PLACED",
                type:{$ne:"SELF"},
                createdByRole: userData.defaultLoginRole
            };
            var decryptColumns = ['fileId','appointmentNumber'/*,'houseNumber','addressName'*/];            
            var decryptColumns2 = ['feedback'];
            if(type == "1"){
                criteria.$and = [
                  { status:{$ne:APP_CONSTANTS.DATABASE.APPOINTMENT_STATUS.COMPLETED} },
                  { status:{$ne:APP_CONSTANTS.DATABASE.APPOINTMENT_STATUS.CANCELLED} }
                ]
            }else{
                criteria.$or = [
                  { status : APP_CONSTANTS.DATABASE.APPOINTMENT_STATUS.COMPLETED },
                  { status : APP_CONSTANTS.DATABASE.APPOINTMENT_STATUS.CANCELLED }
                ]
            }
            if(query.appointmentType && query.appointmentType != "") {
                criteria['type'] = query.appointmentType;
            }

            if(query.bookingType && query.bookingType!=""){ criteria.type = query.bookingType }// ONLINE,ONSITE,HOME
            if(query.userId && query.userId!=""){ criteria.doctor = query.userId } //DOCTOR ID
            if((query.startDate && query.startDate!="") && (query.endDate && query.endDate!="")){
                searchDate = {$gte:query.startDate,$lte:query.endDate}
            }
            else if(query.startDate && query.startDate!=""){
                searchDate = {$gte:query.startDate}
            }
            else if(query.endDate && query.endDate!=""){
                searchDate = {$lte:query.endDate}
            }
            if(searchDate && Object.keys(searchDate).length > 0){
                criteria.$or = [
                  {"homeService.weeklyDates.dayWiseDates":{$elemMatch: searchDate}},
                  {"homeService.everyDayOrCustom":{$elemMatch: searchDate}},
                  {"scheduledService.date":searchDate}
                ]
            }

            let appntmentsCount = await Models.Appointment.countDocuments(criteria);

            if(query.lastId && query.lastId!=""){ criteria._id = {$lt:ObjectId(query.lastId)} } //FOR PAGINATION
            if (is.undefined(query.count) || is.empty(query.count)) { query.count = 100; }
            else{ query.count = Number(query.count); } //FOR PAGINATION

            let aggregate = [
                {
                    $match: criteria
                },
                {
                    "$lookup": {
                        from: "users",
                        foreignField: "_id",
                        localField: "doctor",
                        as: 'doctor'
                    }
                },
                { "$unwind": {
                        "path": "$doctor",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$lookup": {
                        from: "professionalspecialities",
                        foreignField: "_id",
                        localField: "doctor.professional.professionalSpeciality",
                        as: 'doctor.professional.professionalSpeciality'
                    }
                },{ "$unwind": {
                        "path": "$doctor.professional.professionalSpeciality",
                        "preserveNullAndEmptyArrays": true
                    }
                },

                {
                    "$lookup": {
                        from: "apointmentfeedbacks",
                        foreignField: "appointmentId",
                        localField: "_id",
                        as: 'rating'
                    }
                },
                { "$unwind": {
                        "path": "$rating",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    "$lookup": {
                        from: "apointmentfeedbacks",
                        foreignField: "userId",
                        localField: "doctor._id",
                        as: 'doctorRating'
                    }
                },
                //RATING

                {
                    $project: {
                        _id: 1,
                        scheduledService: 1,
                        homeService: 1,
                        selfAppointment: 1,
                        type: 1,
                        slots: 1,
                        status: 1,
                        createdAt: 1,
                        fileId: 1,
                        createdByRole:1,
                        appointmentNumber:1,
                        consultationType:1,
                        doctor:{
                            _id:1,
                            profilePic:1,
                            coverPic:1,
                            name:1,
                            professional: {
                                professionalSpeciality: {
                                    specialityName:"$doctor.professional.professionalSpeciality.specialityName."+req.headers.language,
                                    specialist:"$doctor.professional.professionalSpeciality.specialist."+req.headers.language
                                }

                            },
                            "feedbackRating": {
                                "$cond": {
                                    if: {
                                        "$gte": [{$size: "$doctorRating.rating"}, 1]
                                    }, then: {
                                        "$divide": [
                                            { $sum: "$doctorRating.rating" },
                                            { $size: "$doctorRating.rating" }
                                        ]
                                    }, else: 0
                                }
                            },
                        },
                        rating:{
                            "isRating": {$cond: [{$not: "$rating.rating"}, false, true]},
                            rating:{$cond: 
                                [{$not: "$rating.rating"}, 0, "$rating.rating"]},
                            feedback:{$cond: 
                                [{$not: "$rating.feedback"}, "", "$rating.feedback"]},

                        }
                    }
                },
                {$sort: {_id: -1}},
                {$limit: query.count}
            ];
            let result = await Models.Appointment.aggregate(aggregate);
            if(process.env.ENABLE_DB_ENCRYPTION=="1" && result.length > 0){
                for(let x in result){
                    await decryptDBData(result[x], decryptColumns);
                    await decryptDBData(result[x].rating, decryptColumns2);
                }
            }
            let dataToReturn = {
                count : appntmentsCount,
                appointment : result
            }
            return dataToReturn;
}

async function createUserFolders(type,data){
    let result = await Models.Folder.find({"userId": ObjectId(userData._id)},{folderName:1, _id:0});
    console.log("=====================================")
    console.log("result --------------  ",result)
    let folderNameList = await folderNames(result);
    /*if( result == null ||  (result != null && data.dependentId != undefined && data.dependentId != "" && data.dependentId != result.dependentId) ){*/
        let criteria = [];
        let dependentId = null;
        //let folderAddCheck = ["Medications","Requests","Reports","Radiology","Labs"];

        //if (folderAddCheck.indexOf("medications") != -1) {//if value exists
        //if (folderAddCheck.indexOf("medications") == -1) {//if value not exists
        //if (folderNameList.indexOf("Medications") == -1) {
        if (folderNameList.indexOf(APP_CONSTANTS.DATABASE.FOLDERS.MEDICATIONS['en']) == -1) {
            criteria.push({folderName: {'en': Constants.DATABASE.FOLDERS.MEDICATIONS['en'],'ar': Constants.DATABASE.FOLDERS.MEDICATIONS['ar']},folderIcon: "https://test.rooh.live/files/icons/ic_medications.png",folderType: "1",userId: ObjectId(userData._id), dependentId: dependentId });
        }
        //if (folderNameList.indexOf("Requests") == -1) {
        if (folderNameList.indexOf(APP_CONSTANTS.DATABASE.FOLDERS.REQUESTS['en']) == -1) {
            criteria.push({folderName: {'en': Constants.DATABASE.FOLDERS.REQUESTS['en'],'ar': Constants.DATABASE.FOLDERS.REQUESTS['ar']},folderIcon: "https://test.rooh.live/files/icons/ic_requests.png",folderType: "1",userId: ObjectId(userData._id), dependentId: dependentId })
        }
        //if (folderNameList.indexOf("Reports") == -1) {
        if (folderNameList.indexOf(APP_CONSTANTS.DATABASE.FOLDERS.REPORTS['en']) == -1) {
            criteria.push({folderName: {'en': Constants.DATABASE.FOLDERS.REPORTS['en'],'ar': Constants.DATABASE.FOLDERS.REPORTS['ar']},folderIcon: "https://test.rooh.live/files/icons/ic_reports.png",folderType: "1",userId: ObjectId(userData._id), dependentId: dependentId })
        }
        //if (folderNameList.indexOf("Radiology") == -1) {
        if (folderNameList.indexOf(APP_CONSTANTS.DATABASE.FOLDERS.RADIOLOGY['en']) == -1) {
            criteria.push({folderName: {'en': Constants.DATABASE.FOLDERS.RADIOLOGY['en'],'ar': Constants.DATABASE.FOLDERS.RADIOLOGY['ar']},folderIcon: "https://test.rooh.live/files/icons/ic_radiology.png",folderType: "1",userId: ObjectId(userData._id), dependentId: dependentId })
        }
        //if (folderNameList.indexOf("Labs") == -1) {
        if (folderNameList.indexOf(APP_CONSTANTS.DATABASE.FOLDERS.LABS['en']) == -1) {
            criteria.push({folderName: {'en': Constants.DATABASE.FOLDERS.LABS['en'],'ar': Constants.DATABASE.FOLDERS.LABS['ar']},folderIcon: "https://test.rooh.live/files/icons/ic_labs.png",folderType: "1",userId: ObjectId(userData._id), dependentId: dependentId })
        }
        Models.Folder.insertMany(criteria, function (terr, tresult) {
            console.log("tresult.................",tresult)
            return true;
        });

    /*}else{
        return true;
    }*/
}



async function savePaymentDetails(payment,payload,paymentStatusMsg,languageMessages,action){

    if(payload.type == "1"){
        var professionalData = await Models.Appointment.findOne({"_id":ObjectId(payload.id)},{doctor:1, _id:0}) 
        var doctorId = "";
        if(professionalData != null && professionalData.doctor != ""){
            doctorId = professionalData.doctor;
        }
    }
    return new Promise((resolve, reject) => {
        var englishMessage = languageMessages.message.en
        var arabicMessage = languageMessages.message.ar
        if(payload && payload.consultType){
            if(payload.consultType == "1"){
                englishMessage = "Audio Instant "+englishMessage
                arabicMessage = "الصوت الفوري "+arabicMessage
            }else if(payload.consultType == "2"){
                englishMessage = "Video Instant "+englishMessage
                arabicMessage = "فيديو فوري "+arabicMessage
            }else if(payload.consultType == "3"){
                englishMessage = "Chat Instant "+englishMessage
                arabicMessage = "الدردشة الفورية "+arabicMessage
            }
        }
        var criteria = {
            type:           payload.type,
            consultType:    payload.consultType ? payload.consultType : "0",
            amount:         payload.amount,
            paymentMode:    payload.paymentMode,
            userId:         ObjectId(userData._id),            
            paymentStatusMsg:englishMessage, 
            action:         action, //0/1 - debit/credit
            message:        {
                                'en': englishMessage,
                                'ar': arabicMessage
                            }
        }
        if(payment && payment.id){
            criteria.paymentStatus =  payment.result.code ? payment.result.code:""
            criteria.transactionId =  payment.id ? payment.id : ""
            criteria.registrationId = payment.registrationId ? payment.registrationId : ""
            criteria.response =       payment ? JSON.stringify(payment) : {}
        }
        if(payload.type == "1"){
            criteria.appointmentId = payload.id
            if(doctorId!=""){
                criteria.professionalId = doctorId;
            }
            criteria.professionalAmount = (payload.amount/100) * 80
        }
        if(payload.type == "3"){
            criteria.courseId = payload.id
        }
        if(payload.type == "4"){
            criteria.professionalId = payload.id
            criteria.professionalAmount = (payload.amount/100) * 80
        }
        let paymentsData = new Models.Payments(criteria);
        paymentsData.save(function (err, result) {
            if(err){
                console.log("err",err)
                reject(err)
            }else{
                console.log("result",result)
                resolve(result);
            }
        })
    });
}

function folderNames(folderNames){
    console.log("folderNames --------------  ",folderNames)
    let output = [];
    for(let x of folderNames){output.push(x.folderName['en'])}
    return output;
}

async function getReportData(reportId, req) {
    var decryptColumns = ['fileId','appointmentNumber'/*,'houseNumber','addressName'*/];
    var decryptColumns2 = ['allergies','chiefComplaint','history','examinationDiagnosticsResult','managementPlanRecommendation'];
    let aggregateData = [{
        $match: { "_id": ObjectId(reportId) }
    }, {
        "$lookup": {
            from: "appointments",
            foreignField: "_id",
            localField: "appointmentId",
            as: 'appointments'
        }
    },{
        "$lookup": {
            from: "users",
            foreignField: "_id",
            localField: "userId",
            as: 'userData'
        }
    },{
        "$lookup": {
            from: "users",
            foreignField: "_id",
            localField: "professionalId",
            as: 'professionalData'
        }
    },{
        "$lookup": {
            from: "users",
            foreignField: "_id",
            localField: "referDoctorId",
            as: 'referDoctorData'
        }
    },{
        "$lookup": {
            from: "commonservicetypes",
            foreignField: "_id",
            localField: "diagnostics",
            as: 'diagnosticsData'
        }
    },{
        "$lookup": {
            from: "commonservicetypes",
            foreignField: "_id",
            localField: "tests",
            as: 'testData'
        }
    },{ "$unwind": {
            "path": "$appointments",
            "preserveNullAndEmptyArrays": true
        }
    },{ "$unwind": {
            "path": "$userData",
            "preserveNullAndEmptyArrays": true
        }
    },{ "$unwind": {
            "path": "$professionalData",
            "preserveNullAndEmptyArrays": true
        }
    },{ "$unwind": {
            "path": "$referDoctorData",
            "preserveNullAndEmptyArrays": true
        }
    }, {
        "$lookup": {
            from: "professionalspecialities",
            foreignField: "_id",
            localField: "referDoctorData.professional.professionalSpeciality",
            as: 'referDoctorData.professional.professionalSpeciality'
        }
    },{ "$unwind": {
            "path": "$referDoctorData.professional.professionalSpeciality",
            "preserveNullAndEmptyArrays": true
        }
    },{
        "$lookup": {
            from: "professionalspecialities",
            foreignField: "_id",
            localField: "professionalData.professional.professionalSpeciality",
            as: 'professionalData.professional.professionalSpeciality'
        }
    },{ "$unwind": {
            "path": "$professionalData.professional.professionalSpeciality",
            "preserveNullAndEmptyArrays": true
        }
    }, {
        $project: {
            allergies: 1,
            chiefComplaint: 1,
            history: 1,
            examinationDiagnosticsResult: 1,
            managementPlanRecommendation: 1,
            stepwise: 1,
            testData: 1,
            testComments: 1,
            medications: 1,
            medicationsComments: 1,
            followUpDate: 1,
            referDoctorId: 1,
            isVerified: 1,
            diagnostics: 1,
            tests: 1,
            appointmentId: 1,
            startTime: 1,
            endTime: 1,
            slots: 1,
            diagnosticsData: 1,
            professionalData: {
                _id: 1,
                profilePic: 1,
                coverPic: 1,
                name: 1,
                professional: {
                    professionalSpeciality: {
                        /*specialityName: 1,
                        specialist: 1*/
                        specialityName:"$professional.professionalSpeciality.specialityName."+req.headers.language,
                        specialist:"$professional.professionalSpeciality.specialist."+req.headers.language
                    }
                }
            },
            referDoctorData : {
                _id: 1,
                profilePic: 1,
                coverPic: 1,
                name: 1,
                professional: {
                    professionalSpeciality: {
                        /*specialityName: 1,
                        specialist: 1*/
                        specialityName:"$professional.professionalSpeciality.specialityName."+req.headers.language,
                        specialist:"$professional.professionalSpeciality.specialist."+req.headers.language
                    }
                }
            },
            userData: {
                _id: 1,
                profilePic: 1,
                coverPic: 1,
                name: 1,
                user: {
                    dob: 1,
                    dependents: 1
                }
            },
            appointments: {
                _id: 1,
                appointmentNumber: 1,
                type: 1,
                status: 1,
                scheduledService: 1,
                reportType: 1,
                fileId: 1
            }
        }
    }];

    let [ appointmentData ] = await Promise.all([
        //  Dao.populateData(Models.PatientAppointmentReport, criteria, { }, { lean: true }, populateOptions)
        Dao.aggregateData(Models.PatientAppointmentReport, aggregateData)
    ]);

    appointmentData = appointmentData[0] || {};

    //console.log("appointmentData", JSON.stringify(appointmentData));

    req.headers.language = req.headers.language || "en";

    let testsData = [];

    if ( appointmentData && appointmentData.diagnosticsData && appointmentData.diagnosticsData.length > 0) {
        let diagnosticData = [];

        appointmentData.diagnosticsData.map((item1) => {
            item1.title.map((item) => {
                if (item.type == req.headers.language) {
                    diagnosticData.push({
                        "_id": item1._id,
                        "name": item.name
                    })
                }
            })
        })

        appointmentData.diagnosticsData = diagnosticData
    }

    if ( appointmentData && appointmentData.testData && appointmentData.testData.length  > 0) {
        appointmentData.testData.map((item1) => {
            item1.title.map((item) => {
                if (item.type == req.headers.language) {
                    testsData.push({
                        "_id": item1._id,
                        "name": item.name
                    });
                }
            })
        });
        appointmentData.testData = testsData;
    }
    // if ( appointmentData && appointmentData.userData && appointmentData.userData.user && appointmentData.userData.user.dependents.length > 0) {
    //     let data1 =appointmentData.userData.user.dependents.filter(item => {
    //         console.log(item._id.toString() , payload.dependentId);
    //         return (item._id.toString() == payload.dependentId)
    //     })
    //     appointmentData.dependents = data1.length > 0 ? data1[0] : undefined;
    //
    //     appointmentData.userData.user.dependents = {};
    // }

    if(process.env.ENABLE_DB_ENCRYPTION=="1" && appointmentData && appointmentData.appointments && appointmentData.appointments.fileId!=undefined && appointmentData.appointments.fileId!="" ){
        await decryptDBData(appointmentData.appointments, decryptColumns);
    }
    if(process.env.ENABLE_DB_ENCRYPTION=="1"){
        await decryptDBData(appointmentData, decryptColumns2);
    }
    return appointmentData;

}

function paymentStatusCheck(data){
    let paymentStatus = paymentStatuses.status;
    if(paymentStatus[data.result.code] != undefined){
        return paymentStatus[data.result.code];
    }else{
        return false;
    }
}
async function encryptDBData(data,fieldCheck){    
    for(let x of fieldCheck){
        if(data[x]!=undefined && data[x]!=""){
            data[x] = await rsaWrapper.encrypt(rsaWrapper.serverDBPub, (data[x].toString('base64')));
        }
    }
    return data;
}

//await decryptDBData(response.encryptedobj, ["facebookId","role"]);
async function decryptDBData(data,fieldCheck){
    for(let x of fieldCheck){
        if(data[x]!=undefined && data[x]!=""){
            data[x] = await rsaWrapper.decrypt(rsaWrapper.serverDBPrivate, data[x]);
        }
    }
    return data;
}
function UtcConversion(slotValueInminutes,appointmentDate,timezone, type="0"){
    var time = moment().startOf('day').add(slotValueInminutes, 'minutes').format('h:mm A');
    var dateTime = moment(new Date(appointmentDate+" "+time)).format('YYYY-MM-DD HH:mm');
    var requiredDateTime = moment(new Date(dateTime)).subtract(30,'minutes').format('YYYY-MM-DD  h:mm A');
    if(type=="1"){
        requiredDateTime = moment(new Date(dateTime)).format('YYYY-MM-DD  h:mm A');
    }
    var utcDateTime = momentTimezone(new Date(requiredDateTime)).utc().format();
    var offsetValue = momentTimezone().tz(timezone).format('Z');
    var offsetMinutes = moment(offsetValue, 'HH:mm:ss: A').diff(moment().startOf('day'), 'minutes');
    var finalDateTime = moment.utc(utcDateTime).utcOffset(-offsetMinutes).format('MM/DD/YYYY h:mm A')
    if(type=="1"){
        finalDateTime = moment.utc(utcDateTime).utcOffset(offsetMinutes).format('MM/DD/YYYY h:mm A')
    }
    return finalDateTime;
}
async function sendPushToPatient(data, pushHour, pushMin) {
console.log(moment.utc(new Date()).format('YYYY-MM-DD  h:mm A'),"-----------------",new Date(), "sendPushToPatient ----- ",data," ===== ", pushHour," ====== ", pushMin)
    var pushRule = { hour: pushHour, minute: pushMin}
    let userSettings = await Models.Users.findOne({"_id":ObjectId(data.user)},{deviceType: 1, deviceToken: 1, language: 1});

        
    console.log(" $$$$$$$$$$$$$$$$$$$$$$$ ")
    console.log(" ####################### ")
    console.log(" sending push to patient ")
    console.log(" $$$$$$$$$$$$$$$$$$$$$$$ ")
    console.log(" ####################### ")


    await schedule.scheduleJob(data._id, pushRule, function () {

        console.log(" $$$$$$$$$$$$$$$$$$$$$$$ ")
        console.log(" ####################### ")
        console.log(" sending push to patient ")
        console.log(" $$$$$$$$$$$$$$$$$$$$$$$ ")
        console.log(" ####################### ")
        let notificationData = {
            "name": '',
            "appointmentId": (data._id).toString(),
            "type": APP_CONSTANTS.NOTIFICATION_TYPE.UPCOMING_APPOINTMENT,
            "title": APP_CONSTANTS.NOTIFICATION_TITLE.UPCOMING_APPOINTMENT[userSettings.language],
            "message": APP_CONSTANTS.NOTIFICATION_MESSAGE.UPCOMING_APPOINTMENT[userSettings.language],
            "userId": (data.user).toString()
        };

        let notificationDataInsert = {
            senderId: null,
            receiverId: data.user,
            contentId: data.user,
            appointmentId: data._id,
            timeStamp: (new Date()).getTime(),
            "type": APP_CONSTANTS.NOTIFICATION_TYPE.UPCOMING_APPOINTMENT,
            "title": APP_CONSTANTS.NOTIFICATION_TITLE.UPCOMING_APPOINTMENT[userSettings.language],
            "message": {
                'en': APP_CONSTANTS.NOTIFICATION_MESSAGE.UPCOMING_APPOINTMENT['en'],
                'ar': APP_CONSTANTS.NOTIFICATION_MESSAGE.UPCOMING_APPOINTMENT['ar']
            }
        };
        console.log(notificationData,"=========notificationDataInsert==========",notificationDataInsert)
        CommonController.sendPushNotification({
            deviceType: userSettings.deviceType,
            deviceToken: userSettings.deviceToken
        }, notificationData);
        CommonController.notificationUpdate(notificationDataInsert);
    });
};
async function sendPushToDoctor(data, pushHour, pushMin) {
//console.log("sendPushToDoctor ----------- ",data," ===== ", pushHour," ====== ", pushMin)
    var pushRule = { hour: pushHour, minute: pushMin}
    
    let userSettings = await Models.Users.findOne({"_id":ObjectId(data.doctor)},{deviceType: 1, deviceToken: 1, language: 1});
    await schedule.scheduleJob(data._id, pushRule, function () {
        
        
        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$")
        console.log("#########################")
        console.log("sending push to DOCTOR")
        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$")
        console.log("#########################")


        let notificationData = {
            "name": '',
            "appointmentId": (data._id).toString(),
            "type": APP_CONSTANTS.NOTIFICATION_TYPE.UPCOMING_APPOINTMENT,
            "title": APP_CONSTANTS.NOTIFICATION_TITLE.UPCOMING_APPOINTMENT[userSettings.language],
            "message": APP_CONSTANTS.NOTIFICATION_MESSAGE.UPCOMING_APPOINTMENT[userSettings.language],
            "userId": (data.doctor).toString()
        };

        let notificationDataInsert = {
            senderId: null,
            receiverId: data.doctor,
            contentId: data.doctor,
            appointmentId: data._id,
            timeStamp: (new Date()).getTime(),
            "type": APP_CONSTANTS.NOTIFICATION_TYPE.UPCOMING_APPOINTMENT,
            "title": APP_CONSTANTS.NOTIFICATION_TITLE.UPCOMING_APPOINTMENT[userSettings.language],
            "message": {
                'en': APP_CONSTANTS.NOTIFICATION_MESSAGE.UPCOMING_APPOINTMENT['en'],
                'ar': APP_CONSTANTS.NOTIFICATION_MESSAGE.UPCOMING_APPOINTMENT['ar']
            }
        };

        console.log(notificationData,"=========notificationDataInsert==========",notificationDataInsert)
        CommonController.sendPushNotification({
            deviceType: userSettings.deviceType,
            deviceToken: userSettings.deviceToken
        }, notificationData);
        CommonController.notificationUpdate(notificationDataInsert);
    });
};