'use strict';

//npm modules
const async = require('async'),
    moment = require('moment'),
    momentTimezone = require('moment-timezone');

// local modules
const Models = require('../../../models'),
    Dao = require('../../../dao').queries,
    controllerUtil = require('./controllerUtil'),
    appointmentUtil = require('../../controllersutil').appointmentUtil,
    APP_CONSTANTS = require('../../../config/appConstants'),
    RESPONSE_MESSAGES = require('../../../config/response-messages'),
    sendResponse = require('../../sendResponse'),
    UniversalFunctions = require('../../../utils').universalFunctions;

let successRes = {
    status: 1,
    message: RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.SUCCESS.message.en,
    data: {}
};

module.exports = {
    /*// create an appoinment for user -> HOME/ONLINE/ONSITE
    create: async (req, res, next) => {
        let payload = req.body;
        try {
            payload.user = userData._id;
            console.log("---create-- appointment---", payload);

            // convert string time in minutes
            if (payload.homeService && payload.homeService.endTime) payload.homeService.endTime = (await controllerUtil.convertTimeStringInMins([payload.homeService.endTime]))[0];
            if (payload.homeService && payload.homeService.startTime) payload.homeService.startTime = (await controllerUtil.convertTimeStringInMins([payload.homeService.startTime]))[0];
            if (payload.scheduledService && payload.scheduledService.slots) payload.scheduledService.slots = await controllerUtil.convertTimeStringInMins(payload.scheduledService.slots);

            await Dao.saveData(Models.Appointment, payload);
            return res.status(200).json({
                data: {},
                status: 1,
                message: RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.SUCCESS.message.en
            });
        } catch (err) {
            console.log("error in create funciton in controller under appointment in user under src---", err);
            next(err);
        }
    },*/

    /* type-> HOME then if facility -> return slots else return facility on date
     * -> ONSITE/ONLINE then return slots on date */

    facility_slots: async (req, res, next) => {
        const model = Models.ProfessionalFacilities, query = req.query;

        console.log("query=============",query)

        var date = moment(query.date);
        var dow = date.day();
        if(dow == 7){dow = 0;}

        //ONSITE
        let professionalFacilitySlots;
        let facilityId = null;
        let facilityProject = {"facility":1}
        let facilityCriteria = await appointmentUtil.facilityCriteria(ObjectId(query.professional),ObjectId(facilityId),dow);
        if(query.facility != undefined && query.facility != "" ){
            facilityId = query.facility;
            facilityProject = {"facility":1,"workingHours":1,_id:0}
            facilityCriteria = {"professional":ObjectId(query.professional), "facility": ObjectId(facilityId)};
        }
        console.log("facilityCriteria=============",facilityCriteria)
        //ONSITE
        let slots = [];
        let isAllDayUnavailable = false;
        let availabilityStatus = true;
        let slotsToCheckIn = []; // common array for online and onsite type

        var currentTimeAsPerTimezone = "";
        if(query.timeZone!=undefined && query.timeZone!=""){
            currentTimeAsPerTimezone = query.timeZone;
        }else{
            currentTimeAsPerTimezone = req.headers.language;
        }

        let slotsQuery = {
            date: query.date,
            professional: ObjectId(query.professional)
        }, criteria = {
            professional: slotsQuery.professional
        }, response;


        try {
            // perform action as per appointment type
            switch (query.type) {
                case "ONSITE": {
                    let facilityUnavailable = await appointmentUtil.facilityUnavailable(slotsQuery);
                    if(facilityUnavailable.length > 0){ // no un-availability by doctor
                        if(facilityUnavailable[0].selfAppointment.isAllDay){
                            /*return res.status(400).json({
                                status: 1,
                                message: "No Facility available",
                                data: {"allFacilities":[],isAllDayUnavailable : true}
                            });*/
                            return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.NO_FACILITY_AVAILABLE,{"allFacilities":[],isAllDayUnavailable : true},res);

                        }
                    }
                    professionalFacilitySlots = await appointmentUtil.professionalFacilitySlots(facilityCriteria,facilityProject);
                    if(facilityId==null){
                        if(professionalFacilitySlots.length > 0){
                            /*return res.status(200).json({
                                status: 1,
                                message: "SUCCESS",
                                data: {"allFacilities":professionalFacilitySlots,isAllDayUnavailable : false}
                            });*/
                            return sendResponse.sendSuccessData({"allFacilities":professionalFacilitySlots,isAllDayUnavailable : false}, APP_CONSTANTS.STATUSCODE.SUCCESS,req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.SUCCESS, res);
                        }else{
                            /*return res.status(200).json({
                                status: 1,
                                message: "No Facility available",
                                data: {"allFacilities":professionalFacilitySlots,isAllDayUnavailable : false}
                            });*/
                            return sendResponse.sendSuccessData({"allFacilities":professionalFacilitySlots,isAllDayUnavailable : false}, APP_CONSTANTS.STATUSCODE.SUCCESS,req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.NO_FACILITY_AVAILABLE, res);
                        }
                    }else{
                        if(professionalFacilitySlots[0].workingHours[dow].working == true){
                            slotsToCheckIn = professionalFacilitySlots[0].workingHours[dow].slots
                        }else{
                            /*return res.status(200).json({
                                status: 1,
                                message: "No Slots available",
                                data: {slotStatus:[]}
                            });*/
                            return sendResponse.sendSuccessData({slotStatus:[]}, APP_CONSTANTS.STATUSCODE.SUCCESS,req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.NO_SLOTS_AVAILABLE, res);
                        }
                    }
                    break;
                }
                case "ONLINE": {
                    console.log("2222222222222222222")
                    console.log("-----slotsQuery -------- ",slotsQuery)
                    let professionalSlots = await appointmentUtil.professionalSlots(slotsQuery);
                    console.log(dow,"-----professionalSlots -------- ",JSON.stringify(professionalSlots))
                    /*if(professionalSlots.length > 0){
                        if(professionalSlots[0].professional.workingHours[dow].working == true){
                            slotsToCheckIn = professionalSlots[0].professional.workingHours[dow].slots;
                        }
                    }*/
                    if(professionalSlots.length > 0){
                        if(professionalSlots[0].professional.workingHours.length > 0){
                            if(professionalSlots[0].professional.workingHours[dow].working == true){
                                slotsToCheckIn = professionalSlots[0].professional.workingHours[dow].slots;
                            }
                        }else{
                            return res.status(400).json({
                                status: 1,
                                message: "Selected professional have not added any working hours",
                                data: {}
                            });
                        }
                    }
                    break;
                }
                case "HOME":
                    break;
            }
            console.log("1111111111 -----slotsQuery -------- ",slotsQuery)
            let slotsUnavailable = await appointmentUtil.slotsUnavailable(slotsQuery);
            console.log("slotsUnavailable -------- ",slotsUnavailable)
            if(slotsUnavailable.length > 0){ // no un-availability by doctor
                isAllDayUnavailable = slotsUnavailable[0].selfAppointment.isAllDay;
                if(isAllDayUnavailable == true){
                    slotsUnavailable = APP_CONSTANTS.DATABASE.MINUTE_SLOTS.FULL_DAY;
                }else{
                    let checkSlotsUnavailable = [];
                    for(let sunavlble of slotsUnavailable){
                        for(let i = 0; i < sunavlble.slots.length; i++){
                            checkSlotsUnavailable.push(sunavlble.slots[i]);
                        }
                    }
                    slotsUnavailable = checkSlotsUnavailable;
                    slotsUnavailable.sort();
                }
            }else{
                slotsUnavailable = []; // create empty array to find professional's slots in case there is no un-availability of professional
            }

            //console.log("+++++++++++slotsUnavailable=========== ",slotsUnavailable)
            console.log("slotsToCheckIn -------- ",slotsToCheckIn)
            for(let slot of slotsToCheckIn){
                if (slotsUnavailable.indexOf(slot) != -1) {
                    availabilityStatus = false;
                }else{
                    availabilityStatus = true;
                }
                slots.push({slot:slot,isAvailable:availabilityStatus});
            }
            console.log("slots================",slots)
            //if(query.date == moment().format('YYYY-MM-DD')){ moment(new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"})).format('YYYY-MM-DD')
            if(query.date == momentTimezone(new Date()).tz(currentTimeAsPerTimezone).format('YYYY-MM-DD')){
            //if(query.date == moment(new Date().toLocaleString("en-US", {timeZone: currentTimeAsPerTimezone})).format('YYYY-MM-DD')){
                slots = await checkTodaySlots(slots,currentTimeAsPerTimezone);
            }

            let dataToCreateSlots = {
                date: query.date,
                isAllDayUnavailable : isAllDayUnavailable,
                slotStatus: slots || []
            };

            successRes.data = dataToCreateSlots;
            /*res.status(200).json(successRes);*/
            return sendResponse.sendSuccessData(successRes.data, APP_CONSTANTS.STATUSCODE.SUCCESS,req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.SUCCESS, res);

        } catch (e) {
            console.log("error in facility_slots function in under facility_professional in src----", e);
            next(e);
        }
    }
};

function checkTodaySlots(slots,timezone){

    if(timezone==""){
        var m = moment(new Date());
    }else{
        let currentTime = new Date().toLocaleString("en-US", {timeZone: timezone})
        var m = moment(new Date(currentTime))
        //momentTimezone(new Date()).tz(currentTimeAsPerTimezone).format('YYYY-MM-DD');
    }
    var minutes = (m.hour()*60) + m.minute() + 30;//added 30mins to remove slot available within 30mins from now.
    var updatedSlots = slots.filter(function(x) {
        return x.slot > minutes;
    });
    return updatedSlots;
}
