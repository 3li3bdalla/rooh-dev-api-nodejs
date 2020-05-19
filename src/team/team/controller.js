'use strict';

//npm modules
const async = require('async');
const is = require("is_js");
const moment = require("moment")
var momentTimezone = require('moment-timezone');
if(process.env.ENABLE_DB_ENCRYPTION=="1"){
    var rsaWrapper          = require('../../../Lib/rsa-wrapper');
}
 // local modules
const Models = require('../../../models'),
    Dao = require('../../../dao').queries,
    //controllerUtil = require('./controllerUtil'),
    Constants = require('../../../config/appConstants'),
    RESPONSE_MESSAGES = require('../../../config/response-messages'),
    UniversalFunctions = require('../../../utils').universalFunctions,
    SocketManager = require('../../../Lib/SocketManager'),
    sendResponse = require('../../sendResponse'),
    NotificationManager = require('../../../Lib/NotificationManager'),
    CommonController    = require('../../commonController');


module.exports = {

    getEContractTemplates: (req, res) => {
        try {
            let aggregate = [
                {
                    $match: {"type": "econtract"}
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
                        "name": "$title.name",
                        template: 1
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
                    return sendResponse.sendSuccessData(result,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    getEContractServices: (req, res) => {
        try {
            let aggregate = [
                {
                    $match: {"type": "contractServices"}
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
                        "name": "$title.name",
                        template: 1
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
                    return sendResponse.sendSuccessData(result,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    viewContract: async (req, res) => {
        try {
            let obj = req.query;
            let tags = {};
            let result;
            let template;
            /*tags.teamManagerName = userData.name;
            tags.teamManagerRole = userData.defaultLoginRole;*/
            tags.facilityName = userData.name;
            if(obj.type=="1"){
                result = await Models.CommonServiceType.findOne({"_id":ObjectId(obj.id)},{_id:0,template:1});
                template = result.template;
            }else if(obj.type=="2"){
                result = await Models.Team.findOne(
                    {"_id": ObjectId(obj.id)},
                    {})
                    .populate('teamManagerId', 'name defaultLoginRole')
                    /*.populate('bankCountry', 'locationName')
                    .populate('bankCity', 'locationName')*/
                    //.populate('professionalId', 'name phone defaultLoginRole')
                    .populate({
                        path : 'professionalId',
                        select:'_id name email phone address professional.professionalSpeciality professional.city professional.country professional.license',
                        populate : {
                            path : 'professional.professionalSpeciality',
                            select:'specialityName specialist'
                        },
                        /*populate : {
                            path : 'professional.city',
                            select:'locationName'
                        },
                        populate : {
                            path : 'professional.country',
                            select:'locationName'
                        }*/
                    })
                    .populate('services', 'title')//adding because of static contract text
                    .exec();

                    result = JSON.parse(JSON.stringify(result));
                    let servicesList = [];
                    for (let xx of result.services){
                        if(req.headers.language == "en"){
                            xx.title = xx.title[0].name
                        }else{
                            xx.title = xx.title[1].name
                        }
                        servicesList.push(xx.title);
                    }
                    result.services = servicesList;
                    let dayAr = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
                    result.workingDays = Object.entries(result.workingDays).filter(([_, v]) => v).map(([k, _]) => +k);
                    if(result.workingDays.length > 0){
                        let wd = [];
                        for (let yy of result.workingDays){
                            wd.push(dayAr[yy]);
                        }
                        result.workingDays = wd;
                    }
                        tags.name = result.professionalId.name;
                        tags.pname = result.professionalId.name;//repeating because of static contract text
                        /*tags.emailAddress = result.professionalId.email;
                        tags.phoneNumber = result.professionalId.phone;*/
                        if(result.professionalId.professional.professionalSpeciality!=null && result.professionalId.professional.professionalSpeciality.specialityName!=undefined){
                            /*tags.positionEnglish = result.professionalId.professional.professionalSpeciality.specialityName.en;
                            tags.positionArabic = result.professionalId.professional.professionalSpeciality.specialityName.ar;*/
                            tags.pspeciality = result.professionalId.professional.professionalSpeciality.specialityName.en;//repeating because of static contract text
                        }
                        /*if(result.professionalId.professional.country!=null && result.professionalId.professional.country.locationName!=undefined){
                            tags.nationalityEnglish = result.professionalId.professional.country.locationName.en;
                            tags.nationalityArabic = result.professionalId.professional.country.locationName.ar;
                        }

                        if(result.professionalId.professional.city!=null && result.professionalId.professional.city.locationName!=undefined){
                            tags.cityEnglish = result.professionalId.professional.city.locationName.en;
                            tags.cityArabic = result.professionalId.professional.city.locationName.ar;
                        }*/
                        
                        /*tags.fullName = result.professionalId.name;
                        tags.licenseNumber = result.professionalId.professional.license;
                        tags.address = result.professionalId.address;*/

                        tags.facilityName = result.teamManagerId.name;
                        tags.teamManagerName = result.teamManagerId.name;//repeating because of static contract text
                        tags.teamManagerRole = result.teamManagerId.defaultLoginRole;//adding because of static contract text

                        tags.startDate = result.startDate;
                        tags.shifts = result.shift;//adding because of static contract text
                        tags.workingHours = result.workingHours;//adding because of static contract text
                        tags.terms = result.termCondition;//adding because of static contract text
                        tags.workingDays = result.workingDays;//adding because of static contract text
                        tags.description = result.description;//adding because of static contract text
                        tags.services = result.services;//adding because of static contract text

                        tags.endDate = result.endDate;
                        /*tags.idNumber = result.idNumber;
                        tags.registrationNumber = result.registrationNumber;
                        tags.representativeName = result.representativeName;
                        tags.day = result.day;
                        tags.commercialRegistration = result.commercialRegistration;
                        tags.procurationNumber = result.procurationNumber;
                        tags.postalCode = result.postalCode;*/

                        /*tags.bankName = result.bankName;
                        tags.iban = result.iban;
                        tags.swiftCode = result.swiftCode;
                        if(result.bankCity!=null && result.bankCity.locationName!=undefined){
                            tags.bankCity = result.bankCity.locationName.en;
                            tags.bankCityArabic = result.bankCity.locationName.ar;
                        }*/
                        //tags.bankCity = result.bankCity;

                        /*if(result.bankCountry!=null && result.bankCountry.locationName!=undefined){
                            tags.bankCountry = result.bankCountry.locationName.en;
                            tags.bankCountryArabic = result.bankCountry.locationName.ar;
                        }*/
                        //tags.bankCountry = result.bankCountry;
                        //tags.currency = result.currency;
                        
                        //console.log("result.professionalId.professional.city.locationName ----------- ",result.professionalId.professional.country.locationName)
                        /*tags.professionalSignatureDate = "";
                        tags.managerSignatureDate = "";*/
                    /* NEW TEMPLATE PARAMETERS*/
                    if(result.professionalSignature != ""){
                        tags.professionalSignature = "<img src='"+process.env.BASE_URL + result.professionalSignature.original+"' width='100%'>"
                    }
                    if(result.teamManagerSignature != ""){
                        tags.teamManagerSignature = "<img src='"+process.env.BASE_URL + result.teamManagerSignature.original+"' width='100%'>"
                    }
                    template = result.contract;
            }

            if (!result) {
                return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,{},res);
            } else {
                String.prototype.fmt = function (hash) {
                    var string = this, key; for (key in hash) string = string.replace(new RegExp('\\{{' + key + '\\}}', 'gm'), hash[key]); return string
                }
                template = template.fmt(tags);
                let finalResult = {contract:template}
                return sendResponse.sendSuccessData(finalResult,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
            }
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    hireProfessional: async (req, res) => {
        try {
            let obj = req.body;
            //console.log("------------------- req.headers.timeZone --- ",req.headers.timezone)
            let contract = "";
            /*let contractTemplateData = await Models.CommonServiceType.findOne({"_id": ObjectId(obj.templateId)}, {template:1});
            if(contractTemplateData != null && contractTemplateData.template!=undefined && contractTemplateData.template!=null){

                let professional = await Models.Users.findOne({"_id": ObjectId(obj.professionalId)}, {name:1, defaultLoginRole:1});
                let manager = await Models.Users.findOne({"_id": ObjectId(userData._id)}, {name:1, defaultLoginRole:1});
                contract = contractTemplateData.template;
                String.prototype.fmt = function (hash) {
                    var string = this, key; for (key in hash) string = string.replace(new RegExp('\\{{' + key + '\\}}', 'gm'), hash[key]); return string
                }
                contract = contract.fmt({
                    currentDateAndTime : moment(new Date().toLocaleString("en-US", {timeZone: req.headers.timezone})).format('YYYY-MM-DD HH:mm:ss')
                });
            }*/
            if(req.headers.language == "en"){
                contract = "<p>{{teamManagerName}}, who is a {{teamManagerRole}} known as 'First Party', agrees to enter into this contract with {{pname}} who is a {{pspeciality}} , known as 'Second Party' from {{startDate}} to {{endDate}}&nbsp; on {{currentDateAndTime}} <br /><br />The Second Party agrees on the task assigned by first party.</p>\n<p>Services: {{services}}</p>\n<p>Shifts: {{shifts}}</p>\n<p>Working Hours: {{workingHours}}</p>\n<p>Working Days: {{workingDays}}</p>\n<p>Terms: {{terms}}</p>\n<p>Description: {{description}}</p>\n<p><br />Invalidity or unenforceability of one or more provisions of this agreement shall not affect any other provision of this agreement.<br /><br />This agreement is subject to the laws and regulations of the state.<br /><br /><br />Signature:<br /><br /></p>\n<table style=\'text-align: center;\' width=\'100%\'>\n<tbody>\n<tr>\n<td width=\'50%\'>{{teamManagerName}}</td>\n<td width=\'50%\'>{{pname}}</td>\n</tr>\n<tr>\n<td width=\'50%\'>First Party Name</td>\n<td width=\'50%\'>Second Party Name</td>\n</tr>\n<tr>\n<td>&nbsp;</td>\n</tr>\n<tr>\n<td width=\'50%\'>{{teamManagerSignature}}</td>\n<td width=\'50%\'>{{professionalSignature}}</td>\n</tr>\n<tr>\n<td width=\'50%\'>First Party Signature</td>\n<td width=\'50%\'>Second Party Signature</td>\n</tr>\n</tbody>\n</table>\n<p>&nbsp;</p>";
            }else{
                contract = "<p>{{pname}} المعروف باسم ’الطرف الأول’ يوافق على قبول هذا العقد مع {{teamManagerRole}} وهو يمثل {{teamManagerName}}{{currentDateAndTme}} من {{endDate}} إلى {{startDate}}من  المعروف باسم ’الطرف الثاني’ {{pspeciality}} الذي يمثل<br /><br />ويوافق الطرف الثاني على المهمة الموكلة اليه من الطرف الاول</p>\n<p>الخدمات: {{services}}</p>\n<p>الورديات:  {{shifts}}</p>\n<p>ساعات العمل:  {{workingHours}}</p>\n<p>أيام العمل:{{workingDays}}</p>\n<p>الشروط: {{terms}}</p>\n<p>الوصف: {{description}}</p>\n<p><br /> لا يؤثر بطلان أو عدم الزامية شرط أو اكثر من شروط هذه الاتفاقية على أي شرط آخر من هذه الاتفاقية <br /> <br />  تخضع هذه الاتفاقية لقوانين وأنظمة الدولة  <br />  <br />  <br /> :التوقيع <br />  <br /> </p>\n <table style=\'text-align: center;\' width=\'100%\'>\n <tbody>\n   <tr>\n   <td width=\'50%\'> {{teamManagerName}} </td>\n <td width=\'50%\'> {{pname}} </td>\n </tr>\n <tr>\n <td width=\'50%\'> اسم الطرف الأول </td>\n <td width=\'50%\'> اسم الطرف الثاني </td>\n </tr>\n <tr>\n <td>&nbsp;</td>\n </tr>\n <tr>\n <td width=\'50%\'> {{teamManagerSignature}} </td>\n <td width=\'50%\'> {{professionalSignature}} </td>\n </tr>\n <tr>\n <td width=\'50%\'> توقيع الطرف الأول </td>\n <td width=\'50%\'> توقيع الطرف الثاني </td>\n </tr>\n </tbody>\n </table>\n <p>&nbsp;</p>";
            }
            String.prototype.fmt = function (hash) {
                    var string = this, key; for (key in hash) string = string.replace(new RegExp('\\{{' + key + '\\}}', 'gm'), hash[key]); return string
                }
            contract = contract.fmt({

                currentDateAndTime : momentTimezone(new Date()).tz(req.headers.timezone).format('YYYY-MM-DD HH:mm:ss')
                //currentDateAndTime : moment(new Date().toLocaleString("en-US", {timeZone: req.headers.timezone})).format('YYYY-MM-DD HH:mm:ss')
            });

            if (obj.services) {
                obj.services = await mapArrayData(obj.services)
            }

            let team = new Models.Team({
                teamManagerId:  ObjectId(userData._id),
                teamManagerType:userData.defaultLoginRole,
                professionalId: ObjectId(obj.professionalId),
                //hiringDuration: obj.hiringDuration,
                startDate:      obj.startDate,
                endDate:        obj.endDate,
                startTime:      obj.startTime,
                endTime:        obj.endTime,
                contract:       contract,
                templateId:     obj.templateId,

                /* NEW TEMPLATE PARAMETERS*/
                    day :                   moment().format('dddd'),
                  //  idNumber :              obj.idNumber,
                  //  registrationNumber :    obj.registrationNumber,
                  //  representativeName :    obj.representativeName,
                 //   commercialRegistration :obj.commercialRegistration,
              //      procurationNumber :     obj.procurationNumber,
                 //   postalCode :            obj.postalCode,

                //    bankName :              obj.bankName,
                //    iban :                  obj.iban,
                  //  swiftCode :             obj.swiftCode,
                 //   bankCity :              obj.bankCity,
                   // bankCountry :           obj.bankCountry,
                  //  currency :              obj.currency,

                    workingHours :          obj.workingHours,
                    shift :                 obj.shift,
                    services :              obj.services,
                    workingDays :           typeof obj.workingDays === "string" ? JSON.parse(obj.workingDays) : obj.workingDays,
                    description :           obj.description,
                    termCondition :        obj.termCondition
                /* NEW TEMPLATE PARAMETERS*/

            });
            team.save(function (error, result) {
                if (error) {
                    console.log(error)
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,error,res);
                } else {

                    sendPush(
                        Constants.NOTIFICATION_TYPE.HIRE_PROFESSIONAL,
                        Constants.NOTIFICATION_TITLE.HIRE_PROFESSIONAL,
                        Constants.NOTIFICATION_MESSAGE.HIRE_PROFESSIONAL,
                        obj.professionalId, //rec
                        result._id, //content
                        req.credentials._id //sender
                    )


                    return sendResponse.sendSuccessData(result,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    approveHiring: async (req, res) => {
        try {
            let obj = req.body;
            let dataToSet = {};
            let contract = "";
            //let contractData = await Models.Team.findOne({"_id": ObjectId(obj.id)}, {contract:1});
            /*String.prototype.fmt = function (hash) {
                var string = this, key; for (key in hash) string = string.replace(new RegExp('\\{{' + key + '\\}}', 'gm'), hash[key]); return string
            }       */
            if(obj.status == "2"){
                /*if(contractData != null && contractData.contract != undefined && contractData.contract != null){
                    contract = contractData.contract;
                    contract = contract.fmt({
                        professionalSignature : "<img src='"+obj.signature.original+"' width='50%'>"
                    });
                }*/
                dataToSet = {
                    "status": obj.status,
                    professionalSignature : typeof obj.signature === "string" ? JSON.parse(obj.signature) : obj.signature,/*,
                    contract : contract*/
                }
            }else if(obj.status == "3"){
                /*if(contractData != null && contractData.contract != undefined && contractData.contract != null){
                    contract = contractData.contract;
                    contract = contract.fmt({
                        teamManagerSignature : "<img src='"+obj.signature.original+"' width='50%'>"
                    });
                }*/
                dataToSet = {
                    "status": obj.status,
                    teamManagerSignature : typeof obj.signature === "string" ? JSON.parse(obj.signature) : obj.signature/*,
                    contract : contract*/
                }
            }

            Models.Team.findOneAndUpdate({"_id": ObjectId(obj.id)},dataToSet,{ projection: { "teamManagerId" : 1, "professionalId" : 1} }, function (error, result) {
            //Models.Users.findOneAndUpdate({{ projection: { "assignment" : 1, "points" : 1,"mirrorFlyToken":1,"mirrorFlyAccessToken":1 } });
                if (error) {
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,error,res);
                } else {
                    //Models.TeamTasks.findOne({"_id": ObjectId(obj.taskId)}, {_id:1,assignedById:1}, function (taskError, taskResult) {
                        var pushType ="" , pushTitle = "", pushMsg = "", recId = "";
                        if(obj.status == "2"){ //send notification to teamManager
                            pushType = Constants.NOTIFICATION_TYPE.CONTRACT_SIGNED;
                            pushTitle = Constants.NOTIFICATION_TITLE.CONTRACT_SIGNED;
                            pushMsg = Constants.NOTIFICATION_MESSAGE.CONTRACT_SIGNED;
                            recId = result.teamManagerId
                        }else if(obj.status == "3"){ //send notification to professional
                            pushType = Constants.NOTIFICATION_TYPE.CONTRACT_SIGNED;
                            pushTitle = Constants.NOTIFICATION_TITLE.CONTRACT_SIGNED;
                            pushMsg = Constants.NOTIFICATION_MESSAGE.CONTRACT_SIGNED;
                            recId = result.professionalId
                        }
                        if(obj.status == "3" || obj.status == "2"){
                            console.log([pushType,
                                    pushTitle,
                                    pushMsg,
                                    recId,
                                    obj.id,
                                    req.credentials._id],"=========================")
                                sendPush(
                                    pushType,
                                    pushTitle,
                                    pushMsg,
                                    recId, //rec
                                    obj.id, //content
                                    req.credentials._id //sender
                                )
                        }
                    //});

                    return sendResponse.sendSuccessData({},200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    cancelContract: async (req, res) => {
        try {
            let obj = req.body;
            let dataToSet = {
                "status": "4",
                cancelDescription : obj.cancelDescription
            }
            //Models.Team.updateOne({"_id": ObjectId(obj.id)},dataToSet, async function (error, result) {
            Models.Team.findOneAndUpdate({"_id": ObjectId(obj.id)}, dataToSet, async function (error, result) {
                if (error) {
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,error,res);
                } else {
                    if(result && result.teamManagerId!=undefined && result.professionalId!=undefined){
                        let criteria = {"assignedById": ObjectId(result.teamManagerId),"professionalId": ObjectId(result.professionalId)};
                        await Models.TeamTasks.updateMany(criteria, {"status": "3"})
                    }
                    var recId = result.professionalId;
                    if((result.professionalId).toString() == (req.credentials._id).toString()){
                        recId = result.teamManagerId;
                    }
                    sendPush(
                        Constants.NOTIFICATION_TYPE.REJECT_CONTRACT,
                        Constants.NOTIFICATION_TITLE.REJECT_CONTRACT,
                        Constants.NOTIFICATION_MESSAGE.REJECT_CONTRACT,
                        recId, //rec
                        result._id, //content
                        req.credentials._id //sender
                    )

                    return sendResponse.sendSuccessData({},200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },

    renewContract: async (req, res) => {
        try {
            let obj = req.body;
            let contractData = {};
            let result = await Models.Team.findOne({"_id": ObjectId(obj.id)});
            if(!result){
                return sendResponse.sendErrorMessage(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,res);
            }else{
                let saveTeam = new Models.Team({
                    startDate:              obj.startDate,
                    endDate:                obj.endDate,
                    startTime:              obj.startTime,
                    endTime:                obj.endTime,
                    teamManagerType:        result.teamManagerType,
                    teamManagerId:          ObjectId(result.teamManagerId),
                    professionalId:         ObjectId(result.professionalId),
                    templateId:             ObjectId(result.templateId),

                    contract:               result.contract,
                    day:                    moment().format('dddd'),
                    idNumber:               result.idNumber,
                    registrationNumber:     result.registrationNumber,
                    representativeName:     result.representativeName,
                    commercialRegistration: result.commercialRegistration,
                    procurationNumber:      result.procurationNumber,
                    postalCode:             result.postalCode,
                    bankName:               result.bankName,
                    iban:                   result.iban,
                    swiftCode:              result.swiftCode,
                    bankCity:               result.bankCity,
                    bankCountry:            result.bankCountry,
                    currency:               result.currency,

                    workingHours :          result.workingHours,
                    shift :                 result.shift,
                    services :              result.services,
                    workingDays :           result.workingDays,
                    description :           result.description,
                    termCondition :        result.termCondition
                });
                contractData = await saveTeam.save();
            }
            if(result){
                return sendResponse.sendSuccessData(contractData,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
            }else{
                return sendResponse.sendErrorMessage(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,res);
            }
        } catch (err) {
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    /*editContractCheck: async (req, res) => {
        try {
            let obj = req.query;
            let criteria = {"assignedById": ObjectId(obj.teamManagerId),"professionalId": ObjectId(obj.professionalId), "status":"1"};
            let result = await Models.TeamTasks.countDocuments(criteria);
            if(result > 0){
                return sendResponse.sendErrorMessage(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,res);
            }else{
                return sendResponse.sendSuccessData({},200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);                
            }
        } catch (err) {
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },*/
    editContract: async (req, res) => {
        try {
            let obj = req.body;
            let contractData = {};
            console.log(req.headers)
            if(req.headers.timezone==undefined){
                req.headers.timezone = "Asia/Kolkata";
            }
            var result = await Models.Team.findOne({"_id": ObjectId(obj.id)});
            if(!result){
                return sendResponse.sendErrorMessage(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,res);
            }else{                
                //if(moment(result.date).format('YYYY-MM-DD') < moment(new Date().toLocaleString("en-US", {timeZone: req.headers.timezone})).format('YYYY-MM-DD')){
                 console.log("--------------- ",moment(result.date).format('YYYY-MM-DD')+" <= "+momentTimezone(new Date()).tz(req.headers.timezone).format('YYYY-MM-DD'))   
                if(momentTimezone(new Date()).tz(req.headers.timezone).format('YYYY-MM-DD') <= moment(result.endDate).format('YYYY-MM-DD')){
                    console.log("111111111111111111111")
                    //to check if there is any task pending related to this contract
                        let criteria = {"assignedById": ObjectId(result.teamManagerId),"professionalId": ObjectId(result.professionalId), $or: [{"status": "1"},{"status": "2"}]};
                        console.log("*********criteria -------------------------- ",JSON.stringify(criteria))
                        let taskCount = await Models.TeamTasks.countDocuments(criteria);
                        console.log("111111111111111111111 --- ",taskCount)
                        if(taskCount > 0){
                            console.log("22222222222222222 --- ")
                            return sendResponse.sendErrorMessage(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.PENDING_TASKS,res);
                        }
                    //to check if there is any task pending related to this contract                    
                }else{
                    console.log("33333333333333333333 --- ")
                    let criteria = {"assignedById": ObjectId(result.teamManagerId),"professionalId": ObjectId(result.professionalId)};
                    //await Models.TeamTasks.update(criteria, {"status": "3"}, {multi: true})
                    await Models.TeamTasks.updateMany(criteria, {"status": "3"})
                }
                
                if (obj.services) {
                    obj.services = await mapArrayData(obj.services)
                }
                let dataToSet = {
                    status:         "1",
                    startDate:      obj.startDate,
                    endDate:        obj.endDate,
                    startTime:      obj.startTime,
                    endTime:        obj.endTime,
                    //contract:       contract,
                    templateId:     obj.templateId,
                    day :           moment().format('dddd'),
                    workingHours :  obj.workingHours,
                    shift :         obj.shift,
                    services :      obj.services,
                    workingDays :   typeof obj.workingDays === "string" ? JSON.parse(obj.workingDays) : obj.workingDays,
                    description :   obj.description,
                    termCondition : obj.termCondition,
                    teamManagerSignature:{},
                    professionalSignature: {}
                };
                //contractData = await saveTeam.save();
                Models.Team.findOneAndUpdate({"_id": ObjectId(obj.id)},dataToSet, function (error, result) {
                    if (error) {
                        return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,error,res);
                    } else {/*
                        console.log(result.professionalId,"(result.professionalId).toString() ")
                        console.log((result.professionalId).toString())
                        console.log(req.credentials._id," (req.credentials._id).toString() ",(req.credentials._id).toString())*/
                        var recId = result.professionalId;
                        if((result.professionalId).toString() == (req.credentials._id).toString()){
                            recId = result.teamManagerId;
                        }
                        sendPush(
                            Constants.NOTIFICATION_TYPE.EDIT_CONTRACT,
                            Constants.NOTIFICATION_TITLE.EDIT_CONTRACT,
                            Constants.NOTIFICATION_MESSAGE.EDIT_CONTRACT,
                            recId, //rec
                            result._id, //content
                            req.credentials._id //sender
                        )
                        return sendResponse.sendSuccessData({},200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                    }
                });
            }            
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },

    getTeam: async (req, res) => {
        try {

            let obj = req.query;
            let criteria = {}
            if(obj.status == "4"){
                criteria =  {
                    $or: [
                        {"teamManagerId": ObjectId(userData._id), $or: [{"status": "1"},{"status": "2"}]},
                        {"professionalId": ObjectId(userData._id), $or: [{"status": "1"},{"status": "2"}]}
                    ],
                    "isDeleted":false
                }
            }else{
                criteria =  {
                      $or: [
                          {"teamManagerId": ObjectId(userData._id)},
                          {"professionalId": ObjectId(userData._id)}
                      ],
                      "isDeleted":false,
                      "status":obj.status
                    }
            }

            if (is.undefined(obj.count) || is.empty(obj.count)) {
                obj.count = 100;
            }else{
                obj.count = Number(obj.count);
            }

            if(obj.lastId){
                criteria._id = {$lt:ObjectId(obj.lastId)};
            }
            var searchMatch = {$match: {}}
            if(obj.keyword && obj.keyword!=""){
                searchMatch = { $match: {"professionalId.name":{ '$regex': ".*" + obj.keyword + ".*", '$options': 'i' }} }
            }
            let aggregate = [
                {
                    $match: criteria
                },
                {$lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "teamManagerId",
                        as: 'teamManagerId'
                    }
                },
                { "$unwind": {
                    "path": "$teamManagerId",
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

                searchMatch,

                {
                    $lookup: {
                        from: "professionalspecialities",
                        let: {userId: '$professionalId.professional.professionalSpeciality'},
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {$eq: ["$_id", "$$userId"]},
                                            {$eq: ["$isActive", true]}
                                        ]
                                    }
                                }
                            }],
                        as: 'professionalId.professional.professionalSpeciality'
                    }
                },
                { "$unwind": {
                    "path": "$professionalId.professional.professionalSpeciality",
                    "preserveNullAndEmptyArrays": true
                } },





                {$lookup: {
                        from: "commonservicetypes",
                        foreignField: "_id",
                        localField: "services",
                        as: 'services'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        teamManagerSignature: 1,
                        professionalSignature: 1,
                        bankCountry: 1,
                        services:{
                            _id:1,
                            title:1
                        },
                        bankCity: 1,
                        workingDays: 1,
                        teamManagerType: 1,
                        status: 1,
                        teamManagerId: {
                            _id: 1,
                            name: 1,
                            profilePic: 1,
                            coverPic: 1,
                            defaultLoginRole: 1
                        },
                        professionalId: {
                            _id: 1,
                            name: 1,
                            profilePic: 1,
                            coverPic: 1,
                            defaultLoginRole: 1,
                            professional : {
                                professionalSpeciality:{
                                    _id:1,
                                    specialityIcon:1,
                                    specialityName:"$professionalId.professional.professionalSpeciality.specialityName."+req.headers.language,
                                    specialist:"$professionalId.professional.professionalSpeciality.specialist."+req.headers.language,
                                }
                            }
                        },
                        startDate: 1,
                        endDate: 1,
                        day: 1,
                        workingHours: 1,
                        shift: 1,
                        description: 1,
                        termCondition: 1,
                        createdAt: 1,
                        endTime: 1,
                        startTime: 1
                    }
                },
                { $sort: {_id: -1} },
                { $limit:obj.count }
            ];
            console.log("JSON.stringify(result)",JSON.stringify(aggregate))
            Models.Team.aggregate(aggregate, (err, result) => {

                if (err) {
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,err,res);
                } else {
                    //return sendResponse.sendSuccessData(result,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                    let queryPromises = [];
                    result = JSON.parse(JSON.stringify(result));
                    if(result && result.length > 0){
                        for (let ress of result){                            
                            for (let xx of ress.services){
                                if(req.headers.language == "en"){
                                    xx.name = xx.title[0].name
                                }else{
                                    xx.name = xx.title[1].name
                                }
                                delete xx.title;
                            }
                            queryPromises.push(ress);
                        }
                    }
                    return sendResponse.sendSuccessData(queryPromises,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
               }
            });
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    getSingleTeamMember: async (req, res) => {
        try {
            let obj = req.query;
            let criteria = {"_id": ObjectId(obj.id)};
            Models.Team.findOne(
                criteria,
                {__v:0,updatedAt:0,isDeleted:0,contract:0})
                .populate({
                    path : 'professionalId',
                    select:'_id profilePic coverPic name defaultLoginRole professional.professionalSpeciality',
                    populate : {
                        path : 'professional.professionalSpeciality',
                        select:'specialityName'
                    }
                })
                .populate({
                    path : 'teamManagerId',
                    select:'_id name profilePic coverPic defaultLoginRole professional.professionalSpeciality',
                    populate : {
                        path : 'professional.professionalSpeciality',
                        select:'specialityName'
                    }
                })
                //.populate('teamManagerId', '_id name profilePic coverPic defaultLoginRole')
                .populate('templateId', '_id title')
                .populate('services', '_id title')
                .exec(function (err, result) {

                if (err) {
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,err,res);
                } else {
                    let queryPromises = [];
                    if(result){
                        result = JSON.parse(JSON.stringify(result));

                        result.professionalId.professional.professionalSpeciality.specialityName = result.professionalId.professional.professionalSpeciality.specialityName[req.headers.language]

                        if(result.teamManagerId.professional!=undefined && result.teamManagerId.professional.professionalSpeciality!=""){
                            result.teamManagerId.professional.professionalSpeciality.specialityName = result.teamManagerId.professional.professionalSpeciality.specialityName[req.headers.language]
                        }

                        if(result.templateId != undefined){
                            if(req.headers.language=="ar"){
                                result.templateId.title = result.templateId.title[1].name;
                            }else{
                                result.templateId.title = result.templateId.title[0].name;
                            }                        
                            result.templateId.name = result.templateId.title
                            delete result.templateId.title;
                        }
                        if(result.services && result.services.length > 0){
                            for (let xx of result.services){
                                if(req.headers.language == "en"){
                                    xx.name = xx.title[0].name
                                }else{
                                    xx.name = xx.title[1].name
                                }
                                delete xx.title;
                            }
                        }
                    }
                    return sendResponse.sendSuccessData(result,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
               }
            });
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    taskTypes: (req, res) => {
        try {
            let aggregate = [
                {
                    $match: {"type": "taskType"}
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
                        "name": "$title.name",
                        template: 1
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
                    return sendResponse.sendSuccessData(result,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    createTask: (req, res) => {
        try {
            let obj = req.body;
            let teamTasks = new Models.TeamTasks({
                patientId:      obj.patientId ? ObjectId(obj.patientId) : null,
                facilityId:     obj.facilityId ? ObjectId(obj.facilityId) : null,
                professionalId: ObjectId(obj.professionalId),
                assignedById:   ObjectId(userData._id),
                taskType:       ObjectId(obj.taskType),
                description:    obj.description,
                duration:       obj.duration,
                date:           obj.date,
                time:           obj.time,
                /*location:       obj.location,*/
                location:       typeof obj.location === "string" ? JSON.parse(obj.location) : obj.location,
                address:        obj.address,
                fees:           obj.fees
            });
            teamTasks.save(function (error, result) {
                if (error) {
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,error,res);
                } else {
                    sendPush(
                        Constants.NOTIFICATION_TYPE.CREATE_TASK,
                        Constants.NOTIFICATION_TITLE.CREATE_TASK,
                        Constants.NOTIFICATION_MESSAGE.CREATE_TASK,
                        obj.professionalId, //rec
                        result._id, //content
                        req.credentials._id //sender
                    )
                    return sendResponse.sendSuccessData(result,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    myTasks: (req, res) => {
        try {
            let obj = req.query;
            var decryptColumns = ['fileId'];
            var sortBy = {"_id":-1};
            let criteria = {"professionalId": ObjectId(userData._id), "isDeleted":false, "status":obj.type};
            if(obj.type=="5"){
                criteria = {"professionalId": ObjectId(userData._id), "isDeleted":false, $or: [{"status": "3"},{"status": "4"}]}
            }

            if (is.undefined(obj.count) || is.empty(obj.count)) {
                obj.count = 100;
            }else{
                obj.count = Number(obj.count);
            }
            if(obj.lastId){
                criteria._id = {$lt:ObjectId(obj.lastId)};
            }
            if(obj.taskType){
                criteria.taskType = ObjectId(obj.taskType);
            }
            if(obj.sortBy && obj.sortBy=="0"){ 
                sortBy = {"sortBy":1};
            }else if(obj.sortBy && obj.sortBy=="1"){ 
                sortBy = {"sortBy":-1};
            }

            //console.log(criteria)

            let aggregate = [
                {
                    $match: criteria
                },
                {"$addFields":{
                  "sortBy":{"$toInt":"$duration"}
                }},
                {
                    $lookup: {
                        from: "appointments",
                        let: {userId: '$patientId', doctorId: '$professionalId'},
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {$eq: ["$user", "$$userId"]},
                                            {$eq: ["$doctor", "$$doctorId"]}
                                        ]
                                    }
                                }
                            }],
                        as: 'appointments'
                    }
                },
                { "$unwind": {
                    "path": "$appointments",
                    "preserveNullAndEmptyArrays": true
                } },

                {$lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "patientId",
                        as: 'patientId'
                    }
                },
                { "$unwind": {
                    "path": "$patientId",
                    "preserveNullAndEmptyArrays": true
                } },
                {$lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "facilityId",
                        as: 'facilityId'
                    }
                },
                { "$unwind": {
                    "path": "$facilityId",
                    "preserveNullAndEmptyArrays": true
                } },
                {$lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "assignedById",
                        as: 'assignedById'
                    }
                },
                { "$unwind": {
                    "path": "$assignedById",
                    "preserveNullAndEmptyArrays": true
                } },


                {
                    $lookup: {
                        from: "professionalspecialities",
                        let: {userId: '$assignedById.professional.professionalSpeciality'},
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {$eq: ["$_id", "$$userId"]},
                                            {$eq: ["$isActive", true]}
                                        ]
                                    }
                                }
                            }],
                        as: 'assignedById.professional.professionalSpeciality'
                    }
                },
                { "$unwind": {
                    "path": "$assignedById.professional.professionalSpeciality",
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

                {
                    $lookup: {
                        from: "professionalspecialities",
                        let: {userId: '$professionalId.professional.professionalSpeciality'},
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {$eq: ["$_id", "$$userId"]},
                                            {$eq: ["$isActive", true]}
                                        ]
                                    }
                                }
                            }],
                        as: 'professionalId.professional.professionalSpeciality'
                    }
                },
                { "$unwind": {
                    "path": "$professionalId.professional.professionalSpeciality",
                    "preserveNullAndEmptyArrays": true
                } },





                {$lookup: {
                        from: "commonservicetypes",
                        foreignField: "_id",
                        localField: "taskType",
                        as: 'taskType'
                    }
                },
                { "$unwind": {
                    "path": "$taskType",
                    "preserveNullAndEmptyArrays": true
                } },


                { $unwind: "$taskType.title"},
                {
                    "$match": {
                        "taskType.title.type": req.headers.language || 'en'
                    }
                },

                {
                    $project: {
                        _id: 1,
                        patientId: {
                            _id: 1,
                            name: 1,
                            profilePic: 1,
                            coverPic: 1,
                            defaultLoginRole: 1
                        },
                        facilityId: {
                            _id: 1,
                            name: 1,
                            profilePic: 1,
                            coverPic: 1,
                            defaultLoginRole: 1
                        },
                        description: 1,
                        duration: 1,
                        date: 1,
                        time: 1,
                        location: 1,
                        address: 1,
                        fees: 1,
                        status: 1,
                        assignedById: {
                            _id: 1,
                            name: 1,
                            profilePic: 1,
                            coverPic: 1,
                            defaultLoginRole: 1,
                            professional : {
                                professionalSpeciality:{
                                    _id:1,
                                    specialityIcon:1,
                                    specialityName:"$assignedById.professional.professionalSpeciality.specialityName."+req.headers.language,
                                    specialist:"$assignedById.professional.professionalSpeciality.specialist."+req.headers.language,
                                }
                            }
                        },
                        professionalId: {
                            _id: 1,
                            name: 1,
                            profilePic: 1,
                            coverPic: 1,
                            defaultLoginRole: 1,
                            professional : {
                                professionalSpeciality:{
                                    _id:1,
                                    specialityIcon:1,
                                    specialityName:"$professionalId.professional.professionalSpeciality.specialityName."+req.headers.language,
                                    specialist:"$professionalId.professional.professionalSpeciality.specialist."+req.headers.language,
                                }
                            }
                        },
                        createdAt: 1,
                        taskType:{
                            _id:1,
                            name: "$taskType.title.name"
                        },
                        fileId: {
                            $cond: { if: { $ne:  [ { $type : "$appointments.fileId"}, 'missing'] }, then: "$appointments.fileId", else: "" }
                        },
                        sortBy:1
                    }
                },
                //{ $sort: {_id: -1} },
                {$sort: sortBy},
                { $limit:obj.count }
            ];
            Models.TeamTasks.aggregate(aggregate, (err, result) => {

            /*Models.TeamTasks.find(
                criteria,
                {__v:0,updatedAt:0,isDeleted:0,taskType:0},
                {sort: {_id: -1}, limit: obj.count})
                .populate('patientId', '_id name profilePic coverPic defaultLoginRole')
                .populate('facilityId', '_id name profilePic coverPic defaultLoginRole')
                .populate('assignedById', '_id name profilePic coverPic defaultLoginRole')
                .populate('professionalId', '_id name profilePic coverPic defaultLoginRole')
                //.populate('taskType', '_id name profilePic coverPic defaultLoginRole')
                .exec(function (err, result) {*/
                if (err) {
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,err,res);
                } else {
                    return sendResponse.sendSuccessData(result,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res,decryptColumns);
                }
            });
        } catch (err) {
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    myTeamTasks: (req, res) => {
        try {
            let obj = req.query;
            var decryptColumns = ['fileId'];

            var sortBy = {"_id":-1};
            let criteria = {"assignedById": ObjectId(userData._id), "isDeleted":false, "status":obj.type};

            if(obj.type=="5"){
                criteria = {"assignedById": ObjectId(userData._id), "isDeleted":false, $or: [{"status": "3"},{"status": "4"}]}
            }

            if (is.undefined(obj.count) || is.empty(obj.count)) {
                obj.count = 100;
            }else{
                obj.count = Number(obj.count);
            }
            if(obj.lastId){
                criteria._id = {$lt:ObjectId(obj.lastId)};
            }            
            if(obj.taskType){
                criteria.taskType = ObjectId(obj.taskType);
            }            
            
            if(obj.sortBy && obj.sortBy=="0"){ 
                sortBy = {"sortBy":1};
            }else if(obj.sortBy && obj.sortBy=="1"){ 
                sortBy = {"sortBy":-1};
            }

            console.log("=========================================== obj -------------- ",obj)


            let aggregate = [
                {
                    $match: criteria
                },
                {"$addFields":{
                  "sortBy":{"$toInt":"$duration"}
                }},
                {
                    $lookup: {
                        from: "appointments",
                        let: {userId: '$patientId', doctorId: '$professionalId'},
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {$eq: ["$user", "$$userId"]},
                                            {$eq: ["$doctor", "$$doctorId"]}
                                        ]
                                    }
                                }
                            }],
                        as: 'appointments'
                    }
                },
                { "$unwind": {
                    "path": "$appointments",
                    "preserveNullAndEmptyArrays": true
                } },

                {$lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "patientId",
                        as: 'patientId'
                    }
                },
                { "$unwind": {
                    "path": "$patientId",
                    "preserveNullAndEmptyArrays": true
                } },
                {$lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "facilityId",
                        as: 'facilityId'
                    }
                },
                { "$unwind": {
                    "path": "$facilityId",
                    "preserveNullAndEmptyArrays": true
                } },
                {$lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "assignedById",
                        as: 'assignedById'
                    }
                },
                { "$unwind": {
                    "path": "$assignedById",
                    "preserveNullAndEmptyArrays": true
                } },



                {
                    $lookup: {
                        from: "professionalspecialities",
                        let: {userId: '$assignedById.professional.professionalSpeciality'},
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {$eq: ["$_id", "$$userId"]},
                                            {$eq: ["$isActive", true]}
                                        ]
                                    }
                                }
                            }],
                        as: 'assignedById.professional.professionalSpeciality'
                    }
                },
                { "$unwind": {
                    "path": "$assignedById.professional.professionalSpeciality",
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


                {
                    $lookup: {
                        from: "professionalspecialities",
                        let: {userId: '$professionalId.professional.professionalSpeciality'},
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {$eq: ["$_id", "$$userId"]},
                                            {$eq: ["$isActive", true]}
                                        ]
                                    }
                                }
                            }],
                        as: 'professionalId.professional.professionalSpeciality'
                    }
                },
                { "$unwind": {
                    "path": "$professionalId.professional.professionalSpeciality",
                    "preserveNullAndEmptyArrays": true
                } },

                {$lookup: {
                        from: "commonservicetypes",
                        foreignField: "_id",
                        localField: "taskType",
                        as: 'taskType'
                    }
                },
                { "$unwind": {
                    "path": "$taskType",
                    "preserveNullAndEmptyArrays": true
                } },

                { $unwind: "$taskType.title"},
                {
                    "$match": {
                        "taskType.title.type": req.headers.language || 'en'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        patientId: {
                            _id: 1,
                            name: 1,
                            profilePic: 1,
                            coverPic: 1,
                            defaultLoginRole: 1
                        },
                        facilityId: {
                            _id: 1,
                            name: 1,
                            profilePic: 1,
                            coverPic: 1,
                            defaultLoginRole: 1
                        },
                        description: 1,
                        duration: 1,
                        date: 1,
                        time: 1,
                        location: 1,
                        address: 1,
                        fees: 1,
                        status: 1,
                        assignedById: {
                            _id: 1,
                            name: 1,
                            profilePic: 1,
                            coverPic: 1,
                            defaultLoginRole: 1,
                            professional : {
                                professionalSpeciality:{
                                    _id:1,
                                    specialityIcon:1,
                                    specialityName:"$assignedById.professional.professionalSpeciality.specialityName."+req.headers.language,
                                    specialist:"$assignedById.professional.professionalSpeciality.specialist."+req.headers.language,
                                }
                            }
                        },
                        professionalId: {
                            _id: 1,
                            name: 1,
                            profilePic: 1,
                            coverPic: 1,
                            defaultLoginRole: 1,
                            professional : {
                                professionalSpeciality:{
                                    _id:1,
                                    specialityIcon:1,
                                    specialityName:"$professionalId.professional.professionalSpeciality.specialityName."+req.headers.language,
                                    specialist:"$professionalId.professional.professionalSpeciality.specialist."+req.headers.language,
                                }
                            }
                        },
                        createdAt: 1,
                        taskType:{
                            _id:1,
                            name: "$taskType.title.name"
                        },
                        fileId: {
                            $cond: { if: { $ne:  [ { $type : "$appointments.fileId"}, 'missing'] }, then: "$appointments.fileId", else: "" }
                        },
                        sortBy:1
                    }
                },
                //{ $sort: {_id: -1} },
                {$sort: sortBy},
                { $limit:obj.count }
            ];
            Models.TeamTasks.aggregate(aggregate, (err, result) => {

            /*Models.TeamTasks.find(
                criteria,
                {__v:0,updatedAt:0,isDeleted:0,taskType:0},
                {sort: {_id: -1}, limit: obj.count})
                .populate('patientId', '_id name profilePic coverPic defaultLoginRole')
                .populate('facilityId', '_id name profilePic coverPic defaultLoginRole')
                .populate('assignedById', '_id name profilePic coverPic defaultLoginRole')
                .populate('professionalId', '_id name profilePic coverPic defaultLoginRole')
                //.populate('taskType', '_id name profilePic coverPic defaultLoginRole')
                .exec(function (err, result) {*/
                if (err) {
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,err,res);
                } else {
                    return sendResponse.sendSuccessData(result,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res,decryptColumns);
                }
            });
        } catch (err) {
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    acceptRejectTask: async (req, res) => {
        try {
            let obj = req.body;
            let dataToSet = {"status":obj.action}
            /*if(obj.action == "1"){
                dataToSet = {"status":"2"};
            }else if(obj.action == "0"){
                dataToSet = {"status":"3"};
            }*/
            Models.TeamTasks.updateOne({"_id": ObjectId(obj.taskId)},dataToSet, function (error, result) {
                if (error) {
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,error,res);
                } else {

                    var pushType ="" , pushTitle = "", pushMsg = "";
                    if(obj.action == "4"){ //COMPLETE
                        pushType = Constants.NOTIFICATION_TYPE.COMPLETE_TASK;
                        pushTitle = Constants.NOTIFICATION_TITLE.COMPLETE_TASK;
                        pushMsg = Constants.NOTIFICATION_MESSAGE.COMPLETE_TASK;
                    }else if(obj.action == "3"){ //REJECT
                        pushType = Constants.NOTIFICATION_TYPE.REJECT_TASK;
                        pushTitle = Constants.NOTIFICATION_TITLE.REJECT_TASK;
                        pushMsg = Constants.NOTIFICATION_MESSAGE.REJECT_TASK;
                    }else if(obj.action == "2"){ //ACCEPT
                        pushType = Constants.NOTIFICATION_TYPE.ACCEPT_TASK;
                        pushTitle = Constants.NOTIFICATION_TITLE.ACCEPT_TASK;
                        pushMsg = Constants.NOTIFICATION_MESSAGE.ACCEPT_TASK;
                    }
                    if(obj.action == "4" || obj.action == "3" || obj.action == "2"){
                        Models.TeamTasks.findOne({"_id": ObjectId(obj.taskId)}, {_id:1,assignedById:1}, function (taskError, taskResult) {
                            sendPush(
                                pushType,
                                pushTitle,
                                pushMsg,
                                taskResult.assignedById, //rec
                                taskResult._id, //content
                                req.credentials._id //sender
                            )
                        });
                    }
                    return sendResponse.sendSuccessData({},200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    taskDetails: (req, res) => {
        try {
            let obj = req.query;
            var decryptColumns = ['fileId'];
            let criteria = {"_id": ObjectId(obj.taskId)};
            Models.TeamTasks.findOne(
                criteria,
                {__v:0,updatedAt:0,isDeleted:0},
                {sort: {_id: -1}, limit: obj.count})
                .populate('patientId', '_id name profilePic coverPic defaultLoginRole')
                .populate('facilityId', '_id name profilePic coverPic defaultLoginRole address')
                //.populate('assignedById', '_id name profilePic coverPic defaultLoginRole')
                .populate({
                    path : 'assignedById',
                    select:'_id profilePic coverPic  name professional.professionalSpeciality',
                    populate : {
                        path : 'professional.professionalSpeciality',
                        select:'specialityName'
                    }
                })//considering assignedbyid as professional as asked by Rishi - 30sept
                /*.populate('professionalId', '_id name profilePic coverPic defaultLoginRole')*/
                .populate({
                    path : 'professionalId',
                    select:'_id profilePic coverPic name professional.professionalSpeciality',
                    populate : {
                        path : 'professional.professionalSpeciality',
                        select:'specialityName'
                    }
                })
                .populate('taskType', 'title')
                .exec(async function (err, result) {
                if (err) {
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,err,res);
                } else {
                    result = JSON.parse(JSON.stringify(result))
                    result.canMarkAsComplete = false;
                    if(result.taskType != undefined){
                        if(req.headers.language=="ar"){
                            result.taskType.name = result.taskType.title[1].name;
                        }else{
                            result.taskType.name = result.taskType.title[0].name;
                        }
                        delete result.taskType.title;
                        result.taskType.type = req.headers.language;
                    }
                    result.fileId = "";
                    if(result.patientId && result.professionalId && result.patientId._id){
                        let AptData = await Models.Appointment.findOne({"user": ObjectId(result.patientId._id),"doctor": ObjectId(result.assignedById._id)}, {fileId:1});//matching doctor with assignedbyid as asked by Ankit on 4oct which was with professionalid before
                        //console.log("AptData---",AptData)
                        if(AptData){
                            result.patientId.fileId = AptData.fileId;
                            if(process.env.ENABLE_DB_ENCRYPTION=="1"){
                                await decryptDBData(result.patientId, decryptColumns);
                            }
                        }
                    }
                    if(result.professionalId && result.professionalId.professional && result.professionalId.professional.professionalSpeciality){
                        result.professionalId.professional.professionalSpeciality.specialityName = result.professionalId.professional.professionalSpeciality.specialityName[req.headers.language]
                    }
                    if(result.assignedById && result.assignedById.professional && result.assignedById.professional.professionalSpeciality){
                        result.assignedById.professional.professionalSpeciality.specialityName = result.assignedById.professional.professionalSpeciality.specialityName[req.headers.language]
                    }
                    /*console.log("moment(result.date).format('YYYY-MM-DD') ---------------- ",moment(result.date).format('YYYY-MM-DD'))
                    console.log("=======================================================")
                    console.log("  --------------------     ",moment(new Date().toLocaleString("en-US", {timeZone: req.headers.timezone})).format('YYYY-MM-DD'))*/
                    if(moment(result.date).format('YYYY-MM-DD') < momentTimezone(new Date()).tz(req.headers.timezone).format('YYYY-MM-DD')){
                    //if(moment(result.date).format('YYYY-MM-DD') <= moment(new Date().toLocaleString("en-US", {timeZone: req.headers.timezone})).format('YYYY-MM-DD')){
                        result.canMarkAsComplete = true;
                    }
                    return sendResponse.sendSuccessData(result,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });
        } catch (err) {
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    }
};

async function sendPush(type, title, message, receiverId, contentId, senderId){ // contentId - post id, user id,appointmentid, comment id, etc
    console.log("receiverId ---- ",receiverId)
    let userSettings = await Models.Users.findOne({"_id":ObjectId(receiverId)},{deviceType: 1, deviceToken: 1, language: 1});
    var usernm = userData.name ? userData.name: ''
    let notificationData = {
        "name": usernm, // sender's name who is owner or sender
        "contentId": (contentId).toString(), //postid / appointmentid / userid / commentid / etc
        "type": type, //APP_CONSTANTS.NOTIFICATION_TYPE.CREATE_APPOINTMENT, // type of notification
        "title": title[userSettings.language], //APP_CONSTANTS.NOTIFICATION_TITLE.CREATE_APPOINMENT[userSettings.language],
        "message": usernm+" "+message[userSettings.language], //APP_CONSTANTS.NOTIFICATION_MESSAGE.CREATE_APPOINMENT[userSettings.language],
        "userId": (receiverId).toString()//payload.user // push notification receiver's id
    };
    let notificationDataInsert = {
        senderId: senderId, //
        receiverId: receiverId,//payload.doctor, //owner of post, user who posted comment in case of reply, all followers, etc
        contentId: contentId, //pharmacy request id / postid / appointmentid / userid / commentid / etc
        timeStamp: (new Date()).getTime(),
        "type": type,//APP_CONSTANTS.NOTIFICATION_TYPE.CREATE_APPOINTMENT, //type of notification
        "title": title[userSettings.language], //APP_CONSTANTS.NOTIFICATION_TITLE.CREATE_APPOINMENT[userSettings.language],
        "message": {
            'en': usernm+" "+message['en'],//APP_CONSTANTS.NOTIFICATION_MESSAGE.CREATE_APPOINMENT['en'],
            'ar': usernm+" "+message['ar']//APP_CONSTANTS.NOTIFICATION_MESSAGE.CREATE_APPOINMENT['ar']
        }
    };

    //  console.log(notificationData, notificationDataInsert);

    CommonController.sendPushNotification({
        deviceType: userSettings.deviceType,
        deviceToken: userSettings.deviceToken
    }, notificationData);
    CommonController.notificationUpdate(notificationDataInsert);
}
function mapArrayData(data) {
    let list;
    list = typeof data === "string" ? JSON.parse(data) : data;
    if (list && list.length > 0) {
        list = list.map(s => ObjectId(s))
    }
    return list;
}
async function decryptDBData(data,fieldCheck){
    for(let x of fieldCheck){
        if(data[x]!=undefined && data[x]!=""){
            data[x] = await rsaWrapper.decrypt(rsaWrapper.serverDBPrivate, data[x]);
        }
    }
    return data;
}