let DAO = require('../dao').queries,
    Models = require('../models'),
    APP_CONSTANTS  = require('../config/appConstants'),
    schedule = require('node-schedule'),
    moment = require("moment"),
    momentTimezone = require('moment-timezone'),
    CommonController = require('../src/commonController');

exports.scheduleAppointmentNotifications=()=>{
    try{
        /*schedule.scheduleJob('* * * * * *', function(){ 

            var curDate = new Date("2020-01-21  12:07 PM");
            var offset = momentTimezone().tz("Asia/Kolkata").format('Z');
            var utcDate = momentTimezone(new Date(curDate)).utc().format();
            var offsetMinutes = moment(offset, 'HH:mm:ss: A').diff(moment().startOf('day'), 'minutes');

            console.log("current ----==============================",new Date());
            console.log("curDate ----==============================",curDate);
            console.log("offset ----==============================",offset);
            console.log("utcDate ----==============================",utcDate);
            console.log("offsetMinutes ----==============================",offsetMinutes);
            console.log("newTime7 ----==============================",moment.utc(utcDate).utcOffset(-offsetMinutes).format('MM/DD/YYYY h:mm A'));

        });*/
        schedule.scheduleJob('0 0 * * *', function(){//everyday at midnight
        //schedule.scheduleJob('0 * * * *', function(){ //every hour
        //schedule.scheduleJob('* * * * *', function(){ //every minute
        //schedule.scheduleJob('*/3 * * * *', function(){ //every 5 minutes
        //schedule.scheduleJob('*/10 * * * * *', function(){ //every second
            
            let checkDate = moment(new Date()).format('YYYY-MM-DD');
            console.log("checkDate ------ ",checkDate)

            var criteria = {"status" : "PLACED"}
            var project = {"homeService.startTime":1,"scheduledService.slots":1,type:1, user:1,doctor:1,utcDateTime:1 }
            criteria.$or =  [
                {   "type":"HOME",
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
                    "scheduledService.date": checkDate }
            ]
            Models.Appointment.find(criteria, project, async function (err, result) {
                if (err) {
                    console.log("push error ---- ",err)
                    return;
                } else {
                    result = JSON.parse(JSON.stringify(result))
                    var dataToSave = []
                    let output = [];
                    for(let x of result){
                        if(x.utcDateTime!=undefined){
                            var dataObj = {
                                time: x.utcDateTime,
                                message: {
                                    "en":APP_CONSTANTS.NOTIFICATION_MESSAGE.UPCOMING_APPOINTMENT['en'],
                                    "ar":APP_CONSTANTS.NOTIFICATION_MESSAGE.UPCOMING_APPOINTMENT['ar']
                                },
                                receiverId: ObjectId(x.user), 
                                appointmentId: ObjectId(x._id),
                                doctor: ObjectId(x.doctor)
                            }
                            console.log("dataObj ----------- ",dataObj)
                            dataToSave.push(dataObj);
                            var pushTime = moment(new Date(x.utcDateTime));
                            var pushHour = pushTime.format("HH");
                            var pushMin = pushTime.format("mm");/*momentTimezone(time, ["h:mm A"])*/
                            await sendPushToPatient(x,pushHour,pushMin);
                            await sendPushToDoctor(x,pushHour,pushMin);
                        }
                    }
                    Models.ScheduledPushNotifications.insertMany(dataToSave, function (terr, tresult) {});
                }
            });
        });        
    }
    catch(err){
            console.log(err);
    }
}

exports.rescheduleTodayAppointmentPushNotificationsFromDb=()=>{
    try{
            let checkDate = moment(new Date()).format('YYYY-MM-DD');
            var criteria = {"status" : "PLACED"}
            var project = {"homeService.startTime":1,"scheduledService.slots":1,type:1, user:1,doctor:1,utcDateTime:1 }
            criteria.$or =  [
                {   "type":"HOME",
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
                    "scheduledService.date": checkDate }
            ]
            Models.Appointment.find(criteria, project, async function (err, result) {
                if (err) {
                    console.log("push error ---- ",err)
                    return;
                } else {
                    result = JSON.parse(JSON.stringify(result))
                    var dataToSave = []
                    let output = [];
                    for(let x of result){
                        if(x.utcDateTime!=undefined){
                            var pushTime = moment(new Date(x.utcDateTime));
                            var pushHour = pushTime.format("HH");
                            var pushMin = pushTime.format("mm");
                            await sendPushToPatient(x,pushHour,pushMin);
                            await sendPushToDoctor(x,pushHour,pushMin);
                        }
                    }
                }
            });     
    }
    catch(err){
            console.log(err);
    }
}

exports.renewAgreement = async (req, res, next) => {

    let currentDate = new Date();
    let startDate = currentDate.setHours(0,0,0,0);
    let endDate = currentDate.setHours(23,59,59,999);

    startDate = new Date (startDate);
    endDate = new Date (endDate);

    startDate = startDate.setDate(startDate.getDate() + 7);
    endDate = endDate.setDate(endDate.getDate() + 7);

    try {
        let aggregate = [{
            $match: {
                contractExpireDate: { $gte: startDate, $lte: endDate }
            }
        },{
            $lookup: {
                from: 'users',
                foreignField: "_id",
                localField: "professionalId",
                as: 'professionalId'
            }
        }];

        let contractRenewData = await DAO.aggregateData(Models.Contract, aggregate);

        if (contractRenewData.length > 0) {

        }
        else {
            console.log("****************** Contract Renew Agreement *******************", contractRenewData);
        }

        return null;

    }
    catch (err) {
        console.log("********************* renewAgreement ******************", err);
    }
}

async function sendPushToPatient(data, pushHour, pushMin) {
console.log(moment.utc(new Date()).format('YYYY-MM-DD  h:mm A'),"-----------------",new Date(), "sendPushToPatient ----- ",data," ===== ", pushHour," ====== ", pushMin)
    var pushRule = { hour: pushHour, minute: pushMin}
    let userSettings = await Models.Users.findOne({"_id":ObjectId(data.user)},{deviceType: 1, deviceToken: 1, language: 1});
    await schedule.scheduleJob(data._id, pushRule, function () {
        
        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$")
        console.log("#########################")
        console.log("sending push to patient")
        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$")
        console.log("#########################")
        let notificationData = {
            "name": '',
            "appointmentId": (data._id).toString(),
            "type": APP_CONSTANTS.NOTIFICATION_TYPE.UPCOMING_APPOINTMENT,
            "title": APP_CONSTANTS.NOTIFICATION_TITLE.UPCOMING_APPOINTMENT[userSettings.language],
            "message": APP_CONSTANTS.NOTIFICATION_MESSAGE.UPCOMING_APPOINTMENT[userSettings.language],
            "userId": (data.user).toString(),
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
        console.log("sending push to doctor")
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
        CommonController.sendPushNotification({
            deviceType: userSettings.deviceType,
            deviceToken: userSettings.deviceToken
        }, notificationData);
        CommonController.notificationUpdate(notificationDataInsert);
    });
};