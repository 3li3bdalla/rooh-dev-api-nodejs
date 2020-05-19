var async = require('async');
var Models = require('../models');
var {
    queries
} = require('../dao');
var Constants = require('../config/appConstants');
var UniversalFunction = require('../utils/universal-functions');
var bcrypt = require('bcrypt');
var saltRounds = 10;
var jwt = require("jsonwebtoken");
var is = require("is_js");
var moment = require("moment");
var sendResponse = require('../src/sendResponse');
var RESPONSE_MESSAGES = require('../config/response-messages');
var mirrorFlyAPI = require('../utils/mirrorfly');
var CommonController = require('../src/commonController');
var request = require('request');
var momentTimezone = require('moment-timezone');
var controllerUtil = require('../src/user/appointment/controllerUtil')
const Joi = require('joi');
if (process.env.ENABLE_DB_ENCRYPTION == "1") {
    var rsaWrapper = require('../Lib/rsa-wrapper');
    //var aesWrapper          = require('../Lib/aes-wrapper');
}

//console.log("hello")            
/*var fs = require('fs');
var util = require('util');
var logFile = fs.createWriteStream('log.txt', { flags: 'a' });
var logStdout = process.stdout;
console.log = function () {
  logFile.write(util.format.apply(null, arguments) + '\n');
  logStdout.write(util.format.apply(null, arguments) + '\n');
}
console.error = console.log;*/
//router.use(async function(req, res, next) {
//    console.log("router.use 111111111111111111111111111111")
/*if(req.body != undefined){
    req.body = await decryptData(req.body);
}
if(req.query != undefined){
    req.query = await decryptData(req.query);
}*/
/*next();
});*/

module.exports = {
    registerUser: async (req, res, next) => {
        // res.send("works").end();
        try {
            let obj = req.body;
            if (is.undefined(obj.name) || is.empty(obj.name)) {
                return res.status(400).json({
                    status: 0,
                    message: "Please enter name"
                });
            }
            if (is.undefined(obj.phone) || is.empty(obj.phone)) {
                return res.status(400).json({
                    status: 0,
                    message: "Please enter contact number"
                });
            }
            if (is.undefined(obj.password) || is.empty(obj.password)) {
                return res.status(400).json({
                    status: 0,
                    message: "Please enter password"
                });
            }
            if (is.undefined(obj.countryCode) || is.empty(obj.countryCode)) {
                return res.status(400).json({
                    status: 0,
                    message: "Please enter country code"
                });
            }
            if (is.undefined(obj.role) || is.empty(obj.role)) {
                return res.status(400).json({
                    status: 0,
                    message: "Please enter role"
                });
            }

            let phoneCheck = await Models.Users.findOne({
                phone: obj.phone,
                countryCode: obj.countryCode,
                isDeleted: {
                    $ne: true
                }
            });

            if (phoneCheck == null) {
                // console.log('user is not found');
                Models.UsersTemp.findOne({
                    "phone": obj.phone,
                    "countryCode": obj.countryCode
                }, function (tmpErr, tmpCheck) {
                    //console.log("")

                    // ADD TEMP TABLE CHECK HEREuserId
                    let randomValue = new Date(new Date().getTime() + 60000).getTime();
                    var otpval = Math.floor(10000 + Math.random() * 90000);
                    bcrypt.genSalt(saltRounds, function (err, salt) { //generating salt/hash password
                        bcrypt.hash(obj.password, salt, function (err, hash) { //generating salt/hash password
                            let criteria = {
                                countryCode: obj.countryCode,
                                phone: obj.phone
                            };
                            let dataToSet = {
                                $set: {
                                    name: obj.name,
                                    phone: obj.phone,
                                    email: obj.email ? obj.email : '',
                                    password: hash,
                                    countryCode: obj.countryCode,
                                    //otp: otpval,
                                    otp: (process.env.ENABLE_OTP == "1") ? otpval : "12345",
                                    //otp: "12345",
                                    otpExpiration: randomValue,
                                    role: obj.role,
                                }
                            }
                            Models.UsersTemp.updateOne(criteria, dataToSet, {
                                upsert: true
                            }, function (err, result) {
                                if (err) {
                                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                                } else {

                                    Models.UsersTemp.findOne(criteria, {
                                        _id: 1,
                                        role: 1,
                                        phone: 1,
                                        countryCode: 1,
                                        name: 1
                                    }, function (errFind, resultFind) {
                                        delete resultFind.otp;
                                        //SENT OTP
                                        //let paymentDetails = await sendOTP(payload);
                                        if (process.env.ENABLE_OTP == "1") {
                                            if (obj.countryCode && obj.phone) {
                                                obj.message = otpval + RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.REGISTRATION_OTP.message[req.headers.language];
                                                sendOTP(obj);
                                            }
                                        }
                                        //SENT OTP
                                        return sendResponse.sendSuccessData(resultFind, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                                    });
                                }
                            });
                        });
                    });

                });
            } else {
                return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.PHONE_ALREADY_EXIST, {}, res);
            }
        } catch (err) {

            // console.log(err.message);
            // console.log('error in server');
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    //exports.verifyOtp = async (request, response) => {
    verifyOtp: (req, res) => {
        try {
            let obj = req.body;

            if (is.undefined(obj.userId) || is.empty(obj.userId)) {
                return res.status(400).json({
                    status: 0,
                    message: "userId is required"
                });
            }
            if (is.undefined(obj.phone) || is.empty(obj.phone)) {
                return res.status(400).json({
                    status: 0,
                    message: "Phone is required"
                });
            }
            if (is.undefined(obj.otp) || is.empty(obj.otp)) {
                return res.status(400).json({
                    status: 0,
                    message: "OTP is required"
                });
            }
            // console.log("obj..................", obj)
            if (!is.undefined(obj.merge) && !is.empty(obj.merge) && obj.merge == true) {
                if (is.undefined(obj.facebookId) || is.empty(obj.facebookId)) {
                    return res.status(400).json({
                        status: 0,
                        message: "facebookId is required"
                    });
                }
                let criteria = {
                    _id: obj.userId, // THIS IS THE ID(_id) OF TEMP TABLE
                    otp: obj.otp,
                    phone: obj.phone,
                    fbId: obj.facebookId
                }
                Models.UsersTemp.findOne(criteria, function (err, result) {
                    let userCriteria = {
                        phone: result.phone,
                        countryCode: result.countryCode,
                        isDeleted: false
                    };
                    if (err) {
                        return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                    } else {
                        if (result == null) {
                            return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_OTP, result, res);

                        } else {
                            let d = new Date();
                            let otpExpTime = new Date(result.otpExpiration);
                            if ((otpExpTime.getTime() + (60 * 60 * 1000)) < d.getTime()) { //1hour check
                                return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.TOKEN_EXPIRED, {}, res);

                            } else {
                                Models.Users.findOne(userCriteria, function (exstErr, exstResult) {

                                    let payload = {
                                        phone: exstResult.phone,
                                        name: exstResult.name,
                                        countryCode: exstResult.countryCode,
                                        _id: exstResult._id
                                    }
                                    let token = jwt.sign(payload, gRouter.get(Constants.SERVER.JWT_SECRET_KEY).toString(), {
                                        expiresIn: Constants.SERVER.TOKEN_EXPIRATION
                                    });
                                    if (errUpdate) {
                                        return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, errUpdate, res);
                                    } else {
                                        let dataToSet = {
                                            $addToSet: {
                                                role: result.role[0]
                                            },
                                            $set: {
                                                currentStatus: "ONLINE",
                                                accessToken: token,
                                                fbId: obj.facebookId,
                                                defaultLoginRole: result.role[0],
                                                deviceToken: obj.deviceToken ? obj.deviceToken : "",
                                                deviceType: obj.deviceType
                                            }
                                        }
                                        console.log("updatedata ---- ", JSON.stringify(dataToSet))
                                        Models.Users.updateOne(userCriteria, dataToSet, function (errTokenUpdate, resultTokenUpdate) {
                                            Models.UsersTemp.deleteOne({
                                                "_id": ObjectId(result._id)
                                            }, function (errDelete, resultDelete) {
                                                Models.Users.findOne(userCriteria, function (UserErr, UserResult) {
                                                    formatDataByRole(UserResult, function (updatedResult) {
                                                        return sendResponse.sendSuccessData(updatedResult, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.OTP_VERIFIED, res);
                                                    });
                                                });
                                            });
                                        });
                                    }


                                });
                            }
                        }
                    }
                });
            }

            let criteria = {
                _id: obj.userId,
                otp: obj.otp,
                phone: obj.phone
            }
            Models.UsersTemp.findOne(criteria, function (err, result) {
                if (err) {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                } else {
                    if (result == null) {
                        return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_OTP, result, res);
                    } else {
                        let d = new Date();
                        let otpExpTime = new Date(result.otpExpiration);
                        if ((otpExpTime.getTime() + (60 * 60 * 1000)) < d.getTime()) { //1hour check
                            return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.TOKEN_EXPIRED, {}, res);
                        } else {
                            let userdata = new Models.Users({
                                name: result.name,
                                phone: result.phone,
                                email: result.email,
                                fbId: result.fbId,
                                password: result.password,
                                countryCode: result.countryCode,
                                otp: result.otp, //otpval,
                                otpExpiration: result.otpExpiration,
                                role: result.role,
                                defaultLoginRole: result.role[0],
                                isPhoneVerified: true,
                                currentStatus: "ONLINE",
                                deviceToken: obj.deviceToken ? obj.deviceToken : "",
                                deviceType: obj.deviceType
                                // joiningReferralCode = this.facility.name + randomstring(5),
                                /*professional: {"step":result.role[0]=="PROFESSIONAL" || result.role[0]=="Professional"  ? "1" : ""},
                                facility    : {"step":result.role[0]=="FACILITY" || result.role[0]=="Facility"  ? "1" : ""},*/
                            });
                            userdata.save(function (errUpdate, resultUpdate) {
                                console.log(errUpdate, "err Update--- result update----", resultUpdate);

                                let payload = {
                                    phone: resultUpdate.phone,
                                    name: resultUpdate.name,
                                    countryCode: resultUpdate.countryCode,
                                    _id: resultUpdate._id
                                }
                                let token = jwt.sign(payload, gRouter.get(Constants.SERVER.JWT_SECRET_KEY).toString(), {
                                    expiresIn: Constants.SERVER.TOKEN_EXPIRATION
                                });
                                if (errUpdate) {
                                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, errUpdate, res);
                                } else {
                                    Models.Users.updateOne({
                                        "phone": obj.phone,
                                        "countryCode": resultUpdate.countryCode,
                                        isDeleted: false
                                    }, {
                                        $set: {
                                            "accessToken": token
                                        }
                                    }, function (errTokenUpdate, resultTokenUpdate) {
                                        Models.UsersTemp.deleteOne({
                                            "_id": ObjectId(result._id)
                                        }, function (errDelete, resultDelete) {
                                            resultUpdate.accessToken = token;
                                            formatDataByRole(resultUpdate, function (updatedResult) {
                                                return sendResponse.sendSuccessData(updatedResult, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.OTP_VERIFIED, res);
                                            });
                                        });
                                    });
                                }
                            });
                        }
                    }
                }
            });
        } catch (err) {
            //return res.status(500).json({status: 0, message: err.message});
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    resendOtp: (req, res) => {
        try {
            let obj = req.body;
            if (is.undefined(obj.countryCode) || is.empty(obj.countryCode)) {
                return res.status(400).json({
                    status: 0,
                    message: "Country Code is required"
                });
            }
            if (is.undefined(obj.phone) || is.empty(obj.phone)) {
                return res.status(400).json({
                    status: 0,
                    message: "Phone is required"
                });
            }

            let randomValue = new Date(new Date().getTime() + 60000).getTime();
            var otpval = Math.floor(10000 + Math.random() * 90000)
            let criteria = {
                phone: obj.phone,
                countryCode: obj.countryCode,
                isDeleted: false
            };
            let dataToSet = {
                $set: {
                    //otp: otpval,
                    otp: (process.env.ENABLE_OTP == "1") ? otpval : "12345",
                    //otp: "54321",
                    otpExpiration: randomValue,
                }
            }
            Models.Users.findOne({
                "countryCode": obj.countryCode,
                "phone": obj.phone,
                "isPhoneVerified": true,
                isDeleted: false
            }, function (err, result) {
                if (err) {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                } else if (result != null) {
                    Models.Users.updateOne(criteria, dataToSet, {
                        upsert: true
                    }, function (errUpdate, resultUpdate) {
                        if (errUpdate) {
                            return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, errUpdate, res);
                        } else {
                            delete resultUpdate.otp;

                            //SENT OTP
                            //let paymentDetails = await sendOTP(payload);
                            // console.log("obj**------------------------", obj)
                            if (process.env.ENABLE_OTP == "1") {
                                if (obj.countryCode && obj.phone) {
                                    obj.message = otpval + RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.REGISTRATION_OTP.message[req.headers.language];
                                    sendOTP(obj);
                                }
                            }
                            //SENT OTP

                            return sendResponse.sendSuccessData({}, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.OTP_RESENT, res);
                        }
                    });
                } else {
                    Models.UsersTemp.findOne({
                        "countryCode": obj.countryCode,
                        "phone": obj.phone
                    }, function (err, result) {
                        if (err) {
                            return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                        } else if (result != null) {
                            delete criteria.isDeleted;
                            Models.UsersTemp.updateOne(criteria, dataToSet, {
                                upsert: true
                            }, function (errUpdate, resultUpdate) {
                                if (errUpdate) {
                                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, errUpdate, res);
                                } else {
                                    delete resultUpdate.otp;


                                    //SENT OTP
                                    //let paymentDetails = await sendOTP(payload);
                                    console.log("obj**------------------------", obj)
                                    if (process.env.ENABLE_OTP == "1") {
                                        if (obj.countryCode && obj.phone) {
                                            obj.message = otpval + RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.REGISTRATION_OTP.message[req.headers.language];
                                            sendOTP(obj);
                                        }
                                    }
                                    //SENT OTP

                                    return sendResponse.sendSuccessData({}, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.OTP_RESENT, res);
                                }
                            });
                        } else {
                            return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.NO_USER_EXISTS, {}, res);
                        }
                    });
                }
            });
        } catch (err) {
            //return res.status(500).json({status: 0, message: err.message});
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    forgotPassword: async (req, res) => {
        try {
            let obj = req.body;
            if (is.undefined(obj.countryCode) || is.empty(obj.countryCode)) {
                return res.status(400).json({
                    status: 0,
                    message: "Country Code is required"
                });
            }
            if (is.undefined(obj.phone) || is.empty(obj.phone)) {
                return res.status(400).json({
                    status: 0,
                    message: "Phone is required"
                });
            }

            let randomValue = new Date(new Date().getTime() + 60000).getTime();
            let otpval = Math.floor(10000 + Math.random() * 90000);
            let criteria = {
                phone: obj.phone,
                countryCode: obj.countryCode,
                isDeleted: false
            };
            let dataToSet = {
                $set: {
                    //otp: otpval,
                    otp: (process.env.ENABLE_OTP == "1") ? otpval : "12345",
                    //otp: "12345",
                    otpExpiration: randomValue,
                }
            }
            Models.Users.findOne({
                "countryCode": obj.countryCode,
                "phone": obj.phone,
                "isPhoneVerified": true,
                isDeleted: false
            }, function (err, result) {
                if (err) {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                } else if (result != null) {
                    Models.Users.updateOne(criteria, dataToSet, {
                        upsert: true
                    }, function (errUpdate, resultUpdate) {
                        if (errUpdate) {
                            return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, errUpdate, res);
                        } else {
                            delete resultUpdate.otp;

                            //SENT OTP
                            //let paymentDetails = await sendOTP(payload);
                            if (process.env.ENABLE_OTP == "1") {
                                if (obj.countryCode && obj.phone) {
                                    obj.message = otpval + RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.PASSWORD_RESET_OTP.message[req.headers.language];
                                    sendOTP(obj);
                                }
                            }
                            //SENT OTP

                            return sendResponse.sendSuccessData({}, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.OTP_RESENT, res);
                        }
                    });
                } else {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.NO_USER_EXISTS, {}, res);
                }
            });
        } catch (err) {
            //return res.status(500).json({status: 0, message: err.message});
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    updatePassword: (req, res) => {
        try {
            let obj = req.body;
            let err = [];
            if (is.undefined(obj.phone) || is.empty(obj.phone)) {
                return res.status(400).json({
                    status: 0,
                    message: "Phone is required"
                });
            }
            if (is.undefined(obj.countryCode) || is.empty(obj.countryCode)) {
                return res.status(400).json({
                    status: 0,
                    message: "countryCode is required"
                });
            }
            if (is.undefined(obj.otp) || is.empty(obj.otp)) {
                return res.status(400).json({
                    status: 0,
                    message: "OTP is required"
                });
            }
            if (is.undefined(obj.password) || is.empty(obj.password)) {
                return res.status(400).json({
                    status: 0,
                    message: "password is required"
                });
            }
            let criteria = {
                otp: obj.otp,
                phone: obj.phone,
                countryCode: obj.countryCode,
                isDeleted: false
            }
            Models.Users.findOne(criteria, function (err, result) {
                if (err) {
                    res.status(400).json({
                        status: 0,
                        message: RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,
                        data: err
                    });
                } else if (result == null) {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_OTP, result, res);
                } else {
                    let d = new Date();
                    let otpExpTime = new Date(result.otpExpiration);
                    if ((otpExpTime.getTime() + (60 * 60 * 1000)) < d.getTime()) { //1hour check
                        return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.TOKEN_EXPIRED, {}, res);
                    } else {
                        bcrypt.genSalt(saltRounds, function (err, salt) { //generating salt/hash password
                            bcrypt.hash(obj.password, salt, function (err, hash) { //generating salt/hash password
                                let criteria = {
                                    phone: obj.phone,
                                    countryCode: obj.countryCode,
                                    isDeleted: false
                                };
                                let dataToSet = {
                                    $set: {
                                        password: hash,
                                        otp: ""
                                    }
                                }
                                Models.Users.updateOne(criteria, dataToSet, function (err, result) {
                                    if (err) {
                                        return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                                    } else {
                                        delete result.otp;
                                        return sendResponse.sendSuccessData({}, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.CHANGE_PASSWORD_SUCCESS, res);
                                    }
                                });
                            });
                        });
                    }
                }
            });
        } catch (err) {
            //return res.status(500).json({status: 0, message: err.message});
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },

    userLogin: (req, res) => {
        try {
            //console.log("1452638444 ............ criteria----------------");
            let obj = req.body,
                populate = [{
                    path: "user.insuranceCompany",
                    select: "companyName",
                    query: {
                        "isActive": true
                    }
                }];

            console.log("obj ------------ ", obj)


            let err = [];
            if (is.undefined(obj.phone) || is.empty(obj.phone)) {
                return res.status(400).json({
                    status: 0,
                    message: "Phone is required"
                });
            }
            if (is.undefined(obj.countryCode) || is.empty(obj.countryCode)) {
                return res.status(400).json({
                    status: 0,
                    message: "countryCode is required"
                });
            }
            if (is.undefined(obj.password) || is.empty(obj.password)) {
                return res.status(400).json({
                    status: 0,
                    message: "password is required"
                });
            }
            if (is.undefined(obj.deviceType) || is.empty(obj.deviceType)) {
                return res.status(400).json({
                    status: 0,
                    message: "deviceType is required"
                });
            }

            let criteria = {
                phone: obj.phone,
                countryCode: obj.countryCode,
                isDeleted: false
            };


            // console.log("criteria----------------", criteria);
            Models.Users.findOne(criteria, function (phoneErr, phoneCheck) {
                //console.log("phoneCheck----------------",phoneCheck);
                if (phoneCheck == null) {
                    console.log('phone null');
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_USER_PASS, phoneErr, res);
                } else if (phoneCheck.isPhoneVerified == false) {
                    console.log('phone isPhoneVerified');
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.PHONE_NO_NOT_VERIFIED, {}, res);
                } else if (phoneCheck.isBlocked == true) {
                    console.log('phone isBlocked');
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.BLOCK_USER, {}, res);
                } else if (phoneCheck.isDeleted == true) {
                    console.log('phone isDeleted');
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_USER_PASS, {}, res);
                } else {
                    bcrypt.compare(obj.password, phoneCheck.password, async function (error, response) {
                        if (response == true) {

                            let payload = {
                                phone: phoneCheck.phone,
                                name: phoneCheck.name,
                                countryCode: phoneCheck.countryCode,
                                _id: phoneCheck._id
                            }
                            let token = jwt.sign(payload, gRouter.get(Constants.SERVER.JWT_SECRET_KEY).toString(), {
                                expiresIn: Constants.SERVER.TOKEN_EXPIRATION
                            });
                            var mirrorflyData = {};
                            if (phoneCheck.mirrorflyPassword && phoneCheck.mirrorflyPassword != "") {

                                mirrorflyData = await mirrorFlyAPI.login({
                                    "password": phoneCheck.mirrorflyPassword,
                                    "username": phoneCheck._id,
                                    "type": "1"
                                })
                                //console.log("mirrorflyData --------- ",mirrorflyData)
                            }

                            let dataToSet = {
                                $set: {
                                    currentStatus: 'ONLINE',
                                    deviceType: obj.deviceType,
                                    deviceToken: obj.deviceToken ? obj.deviceToken : "",
                                    accessToken: token,
                                    mirrorFlyAccessToken: (mirrorflyData && mirrorflyData.token) ? mirrorflyData.token : "",
                                    lastLogin: Date.now()
                                }
                            };




                            if (phoneCheck.role.find(r => r === "PROFESSIONAL")) populate = [{
                                path: "professional.professionalSpeciality",
                                select: "specialist specialityName specialityIcon"
                            }, {
                                path: "professional.professionalType",
                                select: "typeName isActive"
                            }, {
                                path: "professional.serviceCategory",
                                select: "serviceName serviceIcon templateType isActive isSelected visible"
                            }, {
                                path: "professional.professionalSubSpeciality",
                                select: "specialityName specialityIcon"
                            }, {
                                path: "professional.country",
                                select: "_id locationName countryFlagIcon countryCode shortName"
                            }, {
                                path: "professional.city",
                                select: "_id locationName"
                            }, {
                                path: "user.insuranceCompany",
                                select: "_id companyName",
                            }];

                            if (phoneCheck.role.find(r => r === "FACILITY")) populate = [{
                                path: "facility.facilityType",
                                select: "_id specialist specialityName",
                            }, {
                                path: "facility.serviceCategory",
                                select: "serviceName serviceIcon templateType isActive isSelected visible",
                            }, {
                                path: "facility.services",
                                select: "specialityName specialist specialityIcon professionalType isActive isSelected parentId",
                            }];
                            Models.Users.findOneAndUpdate(criteria, dataToSet, {
                                    new: true,
                                    lean: true
                                })
                                .populate(populate)
                                .then(response => {
                                    response = JSON.parse(JSON.stringify(response))
                                    //console.log("response ---- ",response)
                                    if (phoneCheck.role.find(r => r === "USER")) {
                                        response.user.insuranceCompany ? response.user.insuranceCompany.companyName = response.user.insuranceCompany.companyName[req.headers.language] : '';
                                    }
                                    if (phoneCheck.role.find(r => r === "PROFESSIONAL")) {

                                        /*console.log(response.professional.professionalSpeciality.specialityName,"  =======================  ",response.professional.professionalSpeciality.specialityName[req.headers.language], " ---------------- ",req.headers.language)*/

                                        response.professional.professionalSpeciality ? response.professional.professionalSpeciality.specialityName = response.professional.professionalSpeciality.specialityName[req.headers.language] : '';

                                        response.professional.professionalSpeciality ? response.professional.professionalSpeciality.specialist = response.professional.professionalSpeciality.specialist[req.headers.language] : '';

                                        response.professional.professionalType ? response.professional.professionalType.typeName = response.professional.professionalType.typeName[req.headers.language] : '';

                                        response.professional.serviceCategory ? response.professional.serviceCategory.serviceName = response.professional.serviceCategory.serviceName[req.headers.language] : '';

                                        if (response.professional.professionalSubSpeciality != undefined) {
                                            response.professional.professionalSubSpeciality = response.professional.professionalSubSpeciality.map(data => ({
                                                _id: data._id,
                                                specialityName: data.specialityName[req.headers.language]
                                            }));
                                        }
                                        response.professional.country ? response.professional.country.locationName = response.professional.country.locationName[req.headers.language] : '';
                                        response.professional.city ? response.professional.city.locationName = response.professional.city.locationName[req.headers.language] : '';
                                    }
                                    if (phoneCheck.role.find(r => r === "FACILITY")) {
                                        response.facility.facilityType ? response.facility.facilityType.specialityName = response.facility.facilityType.specialityName[req.headers.language] : '';
                                        response.facility.facilityType ? response.facility.facilityType.specialist = response.facility.facilityType.specialist[req.headers.language] : '';

                                        response.facility.serviceCategory ? response.facility.serviceCategory.serviceName = response.facility.serviceCategory.serviceName[req.headers.language] : '';

                                        if (response.facility.services != undefined) {
                                            response.facility.services = response.facility.services.map(data => ({
                                                _id: data._id,
                                                specialityName: data.specialityName[req.headers.language],
                                                specialist: data.specialist[req.headers.language]
                                            }));
                                        }
                                        /*response.facility.services ? response.facility.services.specialityName = response.facility.services.specialityName[language] : '';
                                        response.facility.services ? response.facility.services.specialist = response.facility.services.specialist[language] : '';*/
                                    }

                                    //console.log("11111111111111111111112222222222698898", response)
                                    formatDataByRole(response, function (finalResult) {

                                        return sendResponse.sendSuccessData(finalResult, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                                    });
                                })
                                .catch(err => {
                                    console.log("33333333333333", err)
                                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                                })
                            // Models.Users.updateOne(criteria, dataToSet, function (updateErr, updateCheck) {
                            //     if (updateErr) {
                            //         return res.status(400).json({
                            //             status: 0,
                            //             message: RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,
                            //             data: updateErr
                            //         });
                            //     } else {
                            //         Models.Users.findOne(criteria, {'professional.professionalSubSpeciality': 0}, function (err, result) {
                            //             formatDataByRole(result, function (updatedResult) {
                            //                 return res.status(200).json({
                            //                     status: 1,
                            //                     message: RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.LOGIN_SUCCESS,
                            //                     data: updatedResult
                            //                 });
                            //             });
                            //         });
                            //     }
                            // });
                        } else {
                            console.log("11111111111111111111111")
                            return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_USER_PASS, {}, res);
                        }
                    });
                }
            });
            return;
        } catch (err) {
            //return res.status(500).json({status: 0, message: err.message});
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },


    socialLogin: async (req, res) => {
        try {
            let obj = req.body;
            if (is.undefined(obj.facebookId) || is.empty(obj.facebookId)) {
                return res.status(400).json({
                    status: 0,
                    message: "facebookId is required"
                });
            }

            let criteria = {
                fbId: obj.facebookId,
                isDeleted: false
            };
            Models.Users.findOne(criteria, function (fbErr, fbCheck) {
                if (fbCheck == null) {
                    if ((is.undefined(obj.phone) || is.empty(obj.phone)) && (is.undefined(obj.countryCode) || is.empty(obj.countryCode))) {
                        return sendResponse.sendSuccessData({
                            is_exists: false
                        }, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.NO_FB_USER_EXISTS, res);
                    } else {
                        Models.Users.findOne({
                            phone: obj.phone,
                            countryCode: obj.countryCode,
                            isDeleted: false
                        }, function (phoneErr, phoneCheck) {
                            if (phoneCheck == null) { // PHONE DON'T EXISTS1
                                if (is.undefined(obj.phone) || is.empty(obj.phone)) {
                                    return res.status(400).json({
                                        status: 0,
                                        message: "phone is required"
                                    });
                                }
                                if (is.undefined(obj.countryCode) || is.empty(obj.countryCode)) {
                                    return res.status(400).json({
                                        status: 0,
                                        message: "countryCode is required"
                                    });
                                }
                                if (is.undefined(obj.role) || is.empty(obj.role)) {
                                    return res.status(400).json({
                                        status: 0,
                                        message: "role is required"
                                    });
                                }
                                let randomValue = new Date(new Date().getTime() + 60000).getTime();
                                var otpval = Math.floor(10000 + Math.random() * 90000)
                                let dataToSet = {
                                    $set: {
                                        fbId: obj.facebookId,
                                        name: obj.name,
                                        phone: obj.phone,
                                        countryCode: obj.countryCode,
                                        //otp: otpval,
                                        otp: (process.env.ENABLE_OTP == "1") ? otpval : "12345",
                                        //otp: "12345",
                                        otpExpiration: randomValue,
                                        role: obj.role,
                                    }
                                }

                                Models.UsersTemp.updateOne({
                                    phone: obj.phone,
                                    countryCode: obj.countryCode
                                }, dataToSet, {
                                    upsert: true
                                }, function (err, result) {
                                    if (err) {
                                        return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                                    } else {
                                        Models.UsersTemp.findOne({
                                            phone: obj.phone,
                                            countryCode: obj.countryCode
                                        }, {
                                            _id: 1,
                                            role: 1,
                                            phone: 1,
                                            countryCode: 1,
                                            name: 1
                                        }, function (errFind, resultFind) {

                                            //SENT OTP
                                            //let paymentDetails = await sendOTP(payload);
                                            if (process.env.ENABLE_OTP == "1") {
                                                if (obj.countryCode && obj.phone) {
                                                    obj.message = otpval + RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.LOGIN_OTP.message[req.headers.language];
                                                    sendOTP(obj);
                                                }
                                            }
                                            //SENT OTP
                                            return sendResponse.sendSuccessData(resultFind, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                                        });
                                    }
                                });
                            } else {
                                return res.status(200).json({
                                    status: 1,
                                    message: 'Need merge',
                                    data: {
                                        "need_merge": true,
                                        "userId": phoneCheck._id
                                    }
                                });
                                return sendResponse.sendSuccessData({
                                    "need_merge": true,
                                    "userId": phoneCheck._id
                                }, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.NEED_MERGE, res);
                            }
                        });
                    }
                } else { // IF FB ID EXISTS
                    if (fbCheck.isBlocked == true) {
                        return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.BLOCK_USER, {}, res);
                    } else if (fbCheck.isDeleted == true) {
                        return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.NO_FB_USER_EXISTS, {}, res);
                    } else {
                        if (fbCheck.role.indexOf(obj.role) != -1) {
                            let payload = {
                                phone: fbCheck.phone,
                                name: fbCheck.name,
                                countryCode: fbCheck.countryCode,
                                _id: fbCheck._id
                            }
                            let token = jwt.sign(payload, gRouter.get(Constants.SERVER.JWT_SECRET_KEY).toString(), {
                                expiresIn: Constants.SERVER.TOKEN_EXPIRATION
                            });
                            let dataToSet = {
                                $set: {
                                    currentStatus: 'ONLINE',
                                    deviceType: obj.deviceType,
                                    accessToken: token,
                                    lastLogin: Date.now(),
                                    defaultLoginRole: obj.role
                                }
                            }
                            Models.Users.updateOne(criteria, dataToSet, function (updateErr, updateCheck) {
                                if (updateErr) {
                                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, updateErr, res);
                                } else {
                                    //Models.Users.findOne(criteria, function (err, result) {
                                    Models.Users.findOne(criteria)
                                        .populate('professional.country', '_id locationName countryFlagIcon countryCode shortName')
                                        .populate('professional.city', '_id locationName')
                                        .exec(function (err, result) {
                                            result.professional.country ? result.professional.country.locationName = result.professional.country.locationName[language] : '';
                                            result.professional.city ? result.professional.city.locationName = result.professional.city.locationName[language] : '';
                                            formatDataByRole(result, function (updatedResult) {
                                                updatedResult.is_exists = true;
                                                return sendResponse.sendSuccessData(updatedResult, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.LOGIN_SUCCESS, res);
                                            });
                                        });
                                }
                            });
                        } else {
                            /*
                                                        return res.status(200).json({
                                                            status: 1,
                                                            message: 'Need facebook merge',
                                                            data: {"need_fb_merge": true, "userData": obj}
                                                        });*/
                            return sendResponse.sendSuccessData({
                                "need_fb_merge": true,
                                "userData": obj
                            }, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.NEED_FACEBOOK_MERGE, res);
                        }
                    }
                }
            });
            return;
        } catch (err) {
            //return res.status(500).json({status: 0, message: err.message});
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    socialLoginMerge: async (req, res) => {
        try {
            let obj = req.body;
            if (is.undefined(obj.userId) || is.empty(obj.userId)) {
                return res.status(400).json({
                    status: 0,
                    message: "userId is required"
                });
            }
            if (is.undefined(obj.phone) || is.empty(obj.phone)) {
                return res.status(400).json({
                    status: 0,
                    message: "phone is required"
                });
            }
            if (is.undefined(obj.countryCode) || is.empty(obj.countryCode)) {
                return res.status(400).json({
                    status: 0,
                    message: "countryCode is required"
                });
            }
            if (is.undefined(obj.facebookId) || is.empty(obj.facebookId)) {
                return res.status(400).json({
                    status: 0,
                    message: "facebookId is required"
                });
            }
            if (is.undefined(obj.role) || is.empty(obj.role)) {
                return res.status(400).json({
                    status: 0,
                    message: "role is required"
                });
            }

            let randomValue = new Date(new Date().getTime() + 60000).getTime();
            let otpval = Math.floor(10000 + Math.random() * 90000);
            let dataToSet = {
                $set: {
                    userId: obj.userId,
                    fbId: obj.facebookId,
                    phone: obj.phone,
                    countryCode: obj.countryCode,
                    role: obj.role,
                    //otp: otpval,
                    otp: (process.env.ENABLE_OTP == "1") ? otpval : "12345",
                    //otp: "12345",
                    otpExpiration: randomValue
                }
            }
            Models.UsersTemp.updateOne({
                phone: obj.phone,
                countryCode: obj.countryCode
            }, dataToSet, {
                upsert: true
            }, function (err, result) {
                if (err) {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                } else {
                    Models.UsersTemp.findOne({
                        phone: obj.phone,
                        countryCode: obj.countryCode
                    }, {
                        _id: 1,
                        role: 1,
                        phone: 1,
                        countryCode: 1,
                        name: 1,
                        fbId: 1
                    }, function (errFind, resultFind) {

                        //SENT OTP
                        //let paymentDetails = await sendOTP(payload);
                        if (process.env.ENABLE_OTP == "1") {
                            if (obj.countryCode && obj.phone) {
                                obj.message = otpval + RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.LOGIN_OTP.message[req.headers.language];
                                sendOTP(obj);
                            }
                        }
                        //SENT OTP
                        return sendResponse.sendSuccessData(resultFind, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                    });
                }
            });
        } catch (err) {
            //return res.status(500).json({status: 0, message: err.message});
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    facebookLoginMerge: async (req, res) => {
        try {

            let obj = req.body;
            if (is.undefined(obj.facebookId) || is.empty(obj.facebookId)) {
                return res.status(400).json({
                    status: 0,
                    message: "facebookId is required"
                });
            }
            if (is.undefined(obj.role) || is.empty(obj.role)) {
                return res.status(400).json({
                    status: 0,
                    message: "role is required"
                });
            }
            let criteria = {
                fbId: obj.facebookId
            };
            Models.Users.findOne(criteria, function (err, result) {
                if (err) {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                }
                if (result) {
                    let payload = {
                        phone: result.phone,
                        name: result.name,
                        countryCode: result.countryCode,
                        _id: result._id
                    }
                    let token = jwt.sign(payload, gRouter.get(Constants.SERVER.JWT_SECRET_KEY).toString(), {
                        expiresIn: Constants.SERVER.TOKEN_EXPIRATION
                    });

                    let dataToSet = {
                        $addToSet: {
                            role: obj.role
                        },
                        $set: {
                            currentStatus: "ONLINE",
                            accessToken: token,
                            defaultLoginRole: obj.role
                        }
                    }
                    Models.Users.updateOne(criteria, dataToSet, function (upErr, upResult) {
                        if (upErr) {
                            return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, upErr, res);
                        } else {
                            Models.Users.findOne(criteria)
                                .populate('professional.country', '_id locationName countryFlagIcon countryCode shortName')
                                .populate('professional.city', '_id locationName')
                                .exec(function (errFind, resultFind) {
                                    resultFind.professional.country ? resultFind.professional.country.locationName = resultFind.professional.country.locationName[language] : '';
                                    resultFind.professional.city ? resultFind.professional.city.locationName = resultFind.professional.city.locationName[language] : '';
                                    formatDataByRole(resultFind, function (finalResult) {
                                        //console.log("finalResult----------------------------", finalResult)
                                        return sendResponse.sendSuccessData(finalResult, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);

                                    });
                                });
                        }
                    });
                } else {
                    return sendResponse.sendSuccessData(result, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.NOTHING_FOUND, res);
                }
            });
        } catch (err) {
            //return res.status(500).json({status: 0, message: err.message});
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    /*******************************************/
    /*************AUTH FUNCTIONS END************/
    /*******************************************/


    updateProfile: async (req, res) => {
        try {
            let obj = req.body;
            let err = [];
            if (is.undefined(obj.currency) || is.empty(obj.currency)) {
                return res.status(400).json({
                    status: 0,
                    message: "currency is required"
                });
            }
            console.log("obj ============================", obj)
            let criteria = {
                "_id": ObjectId(userData._id)
            }
            await createUserFolders("1", "", "0");
            Models.Users.findOne(criteria, async function (err, result) {
                if (err) {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                } else {
                    if (result != null) {
                        if (result.isPhoneVerified == true) {

                            let randomstring = Math.random().toString(36).slice(-8);

                            //console.log(" 45 6 ----------",result)

                            if (obj.deviceType == "IOS") {
                                obj.deviceToken = obj.mirrorFlyDeviceToken;
                            }
                            console.log(" 123 ----------", {
                                "password": randomstring,
                                "userId": userData._id,
                                deviceToken: obj.deviceToken,
                                deviceType: obj.deviceType
                            })
                            let data = await mirrorFlyAPI.register({
                                "password": randomstring,
                                "userId": userData._id,
                                deviceToken: obj.deviceToken,
                                deviceType: obj.deviceType
                            })
                            // let dataNew = await mirrorFlyAPI.register({
                            //     "password": randomstring,
                            //     "userId": userData._id + "-CONSULT",
                            //     deviceToken: obj.deviceToken,
                            //     deviceType: obj.deviceType
                            // })
                            console.log(data, "data");

                            let DataToSet = {
                                $set: {
                                    "email": obj.email,
                                    "location": typeof obj.location === "string" ? JSON.parse(obj.location) : obj.location,
                                    "address": obj.address,
                                    "jid": obj.jid ? obj.jid : '',
                                    "user.step": "2",
                                    "user.currency": obj.currency,
                                    "user.dob": obj.dob,
                                    "user.haveInsurance": obj.haveInsurance,
                                    "user.insuranceCompany": obj.insuranceCompany ? ObjectId(obj.insuranceCompany) : null,
                                    "user.policyNumber": obj.policyNumber,
                                    "mirrorfly": true,
                                    "mirrorflyPassword": randomstring,
                                    "mirrorFlyToken": data.data,
                                    "mirrorFlyToken": data.data,
                                    "isOpenChat": obj.isOpenChat,
                                    //"mirrorFlyTokenConsult": dataNew.data,
                                    "mirrorFlyDeviceToken": obj.mirrorFlyDeviceToken,
                                    deviceToken: obj.deviceToken ? obj.deviceToken : ""
                                }
                            };
                            Models.Users.findOneAndUpdate(criteria, DataToSet, {
                                    new: true,
                                    lean: true
                                })
                                .populate([{
                                    path: "user.insuranceCompany",
                                    select: "companyName",
                                    query: {
                                        "isActive": true
                                    }
                                }])
                                .then(response => {
                                    //console.log("response ----------- ",response)
                                    /*console.log("afdsadfsfdsf", obj);
                                    let data = await mirrorFlyAPI.register({
                                        "password": randomstring,
                                        "userId": response._id,
                                        deviceToken: obj.deviceToken,
                                        deviceType: obj.deviceType
                                    })
                                    console.log(data, "data");*/
                                    response.user.insuranceCompany ? response.user.insuranceCompany.companyName = response.user.insuranceCompany.companyName[language] : '';
                                    response.mirrorFlyToken = data.data;
                                    //response.mirrorFlyTokenConsult = dataNew.data;
                                    response.JID = `${response._id}@fly.uat.mirrorfly.com`;
                                    formatDataByRole(response, function (finalResult) {
                                        return sendResponse.sendSuccessData(finalResult, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                                    });
                                })
                                .catch(err => {
                                    console.log("err ----------- ", err)
                                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                                })
                        } else {
                            console.log("error")
                            return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.PHONE_NO_NOT_VERIFIED, {}, res);
                        }
                    } else {
                        console.log("error1")
                        return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.NO_USER_EXISTS, {}, res);
                    }
                }
            });
        } catch (err) {
            console.log("err", err)
            //return res.status(500).json({status: 0, message: err.message});
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    updateProfessionalProfile: async (req, res) => {
        try {
            let obj = req.body;
            let err = [];
            let DataToSet;
            //console.log("==================================", obj)
            if (obj.step == "1") {
                await createUserFolders("2", "", "0");
                if (is.undefined(obj.professionalSpeciality) || is.empty(obj.professionalSpeciality)) {
                    return res.status(400).json({
                        status: 0,
                        message: "Professional speciality is required"
                    });
                }
                if (is.undefined(obj.professionalType) || is.empty(obj.professionalType)) {
                    return res.status(400).json({
                        status: 0,
                        message: "Professional type is required"
                    });
                }
                if (is.undefined(obj.serviceCategory) || is.empty(obj.serviceCategory)) {
                    return res.status(400).json({
                        status: 0,
                        message: "Service Category is required"
                    });
                }
            } else if (obj.step == "2") {
                if (is.undefined(obj.country) || is.empty(obj.country)) {
                    return res.status(400).json({
                        status: 0,
                        message: "Country is required"
                    });
                }
                if (is.undefined(obj.city) || is.empty(obj.city)) {
                    return res.status(400).json({
                        status: 0,
                        message: "City is required"
                    });
                }
            }
            let criteria = {
                "_id": ObjectId(userData._id)
            }
            Models.Users.findOne(criteria, async function (err, result) {
                if (err) {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                } else {
                    if (result != null) {
                        if (result.isPhoneVerified == true) {
                            let randomstring = Math.random().toString(36).slice(-8);

                            if (obj.step == "1") {
                                if (obj.professionalSubSpeciality) {


                                    /*let subList;
                                    subList = typeof obj.professionalSubSpeciality === "string" ? JSON.parse(obj.professionalSubSpeciality) : obj.professionalSubSpeciality;
                                    if (subList && subList.length > 0) {
                                        subList = subList.map(s => ObjectId(s))
                                    }
                                    obj.professionalSubSpeciality = subList;*/
                                    obj.professionalSubSpeciality = mapArrayData(obj.professionalSubSpeciality)
                                }

                                DataToSet = {
                                    $set: {
                                        "professional.step": "2",
                                        "profilePic": typeof obj.profilePic === "string" ? JSON.parse(obj.profilePic) : obj.profilePic,
                                        "email": obj.email,
                                        //"professional.profilePic" :  obj.profilePic,
                                        "professional.serviceCategory": obj.serviceCategory,
                                        "professional.professionalType": obj.professionalType,
                                        "professional.professionalSpeciality": obj.professionalSpeciality,
                                        "professional.professionalSubSpeciality": obj.professionalSubSpeciality,
                                        "professional.license": obj.license,
                                        "professional.licenseImage": typeof obj.licenseImage === "string" ? JSON.parse(obj.licenseImage) : obj.licenseImage,
                                        "professional.skillDescription": obj.skillDescription
                                    }
                                };
                            } else if (obj.step == "2") {

                                /*let location = JSON.parse(obj.location)
                                location = [location.long, location.lat]*/
                                if (result.deviceType == "IOS") {
                                    obj.deviceToken = obj.mirrorFlyDeviceToken;
                                }
                                var data1 = await mirrorFlyAPI.register({
                                    "password": randomstring,
                                    "userId": userData._id,
                                    deviceToken: obj.deviceToken,
                                    deviceType: obj.deviceType
                                })
                                // let dataNew = await mirrorFlyAPI.register({
                                //     "password": randomstring,
                                //     "userId": userData._id + "-CONSULT",
                                //     deviceToken: obj.deviceToken,
                                //     deviceType: obj.deviceType
                                // })
                                console.log(data1, "data");
                                DataToSet = {
                                    $set: {
                                        "location": typeof obj.location === "string" ? JSON.parse(obj.location) : obj.location,
                                        "address": obj.address,
                                        "jid": obj.jid ? obj.jid : '',
                                        "professional.step": "3",
                                        "professional.country": ObjectId(obj.country),
                                        "professional.city": ObjectId(obj.city),
                                        "professional.expertise": obj.expertise,
                                        "professional.image": typeof obj.image === "string" ? JSON.parse(obj.image) : obj.image,
                                        "professional.video": typeof obj.video === "string" ? JSON.parse(obj.video) : obj.video,
                                        "mirrorfly": true,
                                        "mirrorflyPassword": randomstring,
                                        "mirrorFlyToken": data1.data,
                                        //"mirrorFlyTokenConsult": dataNew.data,
                                        "mirrorFlyDeviceToken": obj.mirrorFlyDeviceToken,
                                        deviceToken: obj.deviceToken ? obj.deviceToken : ""
                                    }
                                };
                            }
                            //console.log("criteria.................", criteria);
                            //console.log("DataToSet.................", DataToSet);
                            Models.Users.findOneAndUpdate(criteria, DataToSet, {
                                    new: true,
                                    lean: true
                                })
                                .populate([{
                                    path: "professional.professionalSpeciality",
                                    select: "specialist specialityName specialityIcon"
                                }, {
                                    path: "professional.professionalType",
                                    select: "typeName isActive"
                                }, {
                                    path: "professional.serviceCategory",
                                    select: "serviceName serviceIcon templateType isActive isSelected visible"
                                }, {
                                    path: "professional.professionalSubSpeciality",
                                    select: "specialityName specialityIcon"
                                }, {
                                    path: "professional.country",
                                    select: "_id locationName countryFlagIcon countryCode shortName"
                                }, {
                                    path: "professional.city",
                                    select: "_id locationName"
                                }])
                                .then(response => {

                                    response.professional.professionalSpeciality ? response.professional.professionalSpeciality.specialityName = response.professional.professionalSpeciality.specialityName[language] : '';
                                    response.professional.professionalSpeciality ? response.professional.professionalSpeciality.specialist = response.professional.professionalSpeciality.specialist[language] : '';

                                    response.professional.professionalType ? response.professional.professionalType.typeName = response.professional.professionalType.typeName[language] : '';
                                    response.professional.serviceCategory ? response.professional.serviceCategory.serviceName = response.professional.serviceCategory.serviceName[language] : '';

                                    if (response.professional.professionalSubSpeciality != undefined) {
                                        response.professional.professionalSubSpeciality = response.professional.professionalSubSpeciality.map(data => ({
                                            _id: data._id,
                                            specialityName: data.specialityName[language]
                                        }));
                                    }
                                    //response.professional.professionalSubSpeciality ? response.professional.professionalSubSpeciality.specialityName = response.professional.professionalSubSpeciality.specialityName[language] : '';

                                    response.professional.country ? response.professional.country.locationName = response.professional.country.locationName[language] : '';
                                    response.professional.city ? response.professional.city.locationName = response.professional.city.locationName[language] : '';

                                    if (obj.step == "2") {

                                        /*let data = await mirrorFlyAPI.register({
                                            "password": randomstring,
                                            "userId": response._id,
                                            deviceToken: obj.deviceToken,
                                            deviceType: obj.deviceType
                                        })
                                        console.log(data, "data");*/
                                        response.mirrorFlyToken = data1.data;
                                        //response.mirrorFlyTokenConsult = dataNew.data;
                                        response.JID = `${response._id}@fly.uat.mirrorfly.com`;
                                    }


                                    formatDataByRole(response, function (finalResult) {
                                        return sendResponse.sendSuccessData(finalResult, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                                    });
                                })
                                .catch(err => {
                                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                                })
                        } else {
                            return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.PHONE_NO_NOT_VERIFIED, {}, res);
                        }
                    } else {
                        return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.NO_USER_EXISTS, {}, res);
                    }
                }
            });
        } catch (err) {
            //return res.status(500).json({status: 0, message: err.message});
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    updateFacilityProfile: (req, res) => {
        try {
            let obj = req.body;
            let err = [];
            let DataToSet;
            if (obj.step == "1") {
                if (is.undefined(obj.serviceCategory) || is.empty(obj.serviceCategory)) {
                    return res.status(400).json({
                        status: 0,
                        message: "Service Category is required"
                    });
                }
                if (is.undefined(obj.facilityType) || is.empty(obj.facilityType)) {
                    return res.status(400).json({
                        status: 0,
                        message: "Facility type is required"
                    });
                }
            } else if (obj.step == "2") {
                if (is.undefined(obj.workingHours) || is.empty(obj.workingHours)) {
                    return res.status(400).json({
                        status: 0,
                        message: "Working Hours is required"
                    });
                }
            } else if (obj.step == "3") {
                if (is.undefined(obj.services) || is.empty(obj.services)) {
                    return res.status(400).json({
                        status: 0,
                        message: "Services is required"
                    });
                }
            } else if (obj.step == "4") {
                if (is.undefined(obj.expertise) || is.empty(obj.expertise)) {
                    return res.status(400).json({
                        status: 0,
                        message: "Expertise is required"
                    });
                }
            }
            let criteria = {
                "_id": userData._id
            }
            Models.Users.findOne(criteria, async function (err, result) {
                if (err) {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                } else {
                    if (result != null) {
                        if (result.isPhoneVerified == true) {

                            let randomstring = Math.random().toString(36).slice(-8);

                            if (obj.step == "1") {

                                obj.registrationImage = {
                                    original: obj.originalRegistrationImage ? obj.originalRegistrationImage : '',
                                    thumbnail: obj.thumbnailRegistrationImage ? obj.thumbnailRegistrationImage : ''
                                }
                                DataToSet = {
                                    $set: {
                                        "facility.step": "2",
                                        //"facility.logo" : obj.logo,
                                        "profilePic": typeof obj.profilePic === "string" ? JSON.parse(obj.profilePic) : obj.profilePic,
                                        "email": obj.email,
                                        "location": typeof obj.location === "string" ? JSON.parse(obj.location) : obj.location,
                                        "address": obj.address,
                                        "facility.serviceCategory": obj.serviceCategory,
                                        "facility.facilityType": obj.facilityType,
                                        "facility.address": obj.address,
                                        "facility.registrationNumber": obj.registrationNumber,
                                        "facility.registrationImage": typeof obj.registrationImage === "string" ? JSON.parse(obj.registrationImage) : obj.registrationImage,
                                        "facility.description": obj.description
                                    }
                                };
                            } else if (obj.step == "2") {
                                DataToSet = {
                                    $set: {
                                        "facility.step": "3",
                                        "facility.isWholeWeekWorking": obj.isWholeWeekWorking,
                                        "facility.workingHours": typeof obj.workingHours === "string" ? JSON.parse(obj.workingHours) : obj.workingHours
                                    }
                                };
                            } else if (obj.step == "3") {

                                /*let subList;
                                subList = JSON.parse(obj.services) //DONE
                                if (subList && subList.length > 0) {
                                    subList = subList.map(s => ObjectId(s))
                                }
                                obj.services = subList;*/
                                obj.services = mapArrayData(obj.services)

                                DataToSet = {
                                    $set: {
                                        "facility.step": "4",
                                        "facility.services": obj.services
                                    }
                                };
                            } else if (obj.step == "4") {
                                if (result.deviceType == "IOS") {
                                    obj.deviceToken = obj.mirrorFlyDeviceToken;
                                }
                                var data1 = await mirrorFlyAPI.register({
                                    "password": randomstring,
                                    "userId": userData._id,
                                    deviceToken: obj.deviceToken,
                                    deviceType: obj.deviceType
                                })
                                // let dataNew = await mirrorFlyAPI.register({
                                //     "password": randomstring,
                                //     "userId": userData._id + "-CONSULT",
                                //     deviceToken: obj.deviceToken,
                                //     deviceType: obj.deviceType
                                // })

                                console.log(data1, "data");
                                let subList;
                                //console.log("obj.image-----------", obj.image)
                                if (!is.undefined(obj.image) && !is.empty(obj.image)) {
                                    subList = JSON.parse(obj.image) //DONE
                                }
                                obj.image = subList;
                                DataToSet = {
                                    $set: {
                                        "jid": obj.jid ? obj.jid : '',
                                        "facility.step": "5",
                                        "facility.expertise": obj.expertise,
                                        "facility.image": typeof obj.image === "string" ? JSON.parse(obj.image) : obj.image,
                                        "facility.video": typeof obj.video === "string" ? JSON.parse(obj.video) : obj.video,
                                        "mirrorfly": true,
                                        "mirrorflyPassword": randomstring,
                                        "mirrorFlyToken": data1.data,
                                        //"mirrorFlyTokenConsult": dataNew.data,
                                        "mirrorFlyDeviceToken": obj.mirrorFlyDeviceToken,
                                        "deviceToken": obj.deviceToken ? obj.deviceToken : ""
                                    }
                                };
                            }
                            Models.Users.findOneAndUpdate(criteria, DataToSet, {
                                    new: true,
                                    lean: true
                                })
                                .populate([{
                                    path: "facility.facilityType",
                                    select: "_id specialist specialityName",
                                }, {
                                    path: "facility.serviceCategory",
                                    select: "serviceName serviceIcon templateType isActive isSelected visible",
                                }, {
                                    path: "facility.services",
                                    select: "specialityName specialist specialityIcon professionalType isActive isSelected parentId",
                                }])
                                .then(response => {
                                    response.facility.facilityType ? response.facility.facilityType.specialityName = response.facility.facilityType.specialityName[language] : '';
                                    response.facility.facilityType ? response.facility.facilityType.specialist = response.facility.facilityType.specialist[language] : '';

                                    response.facility.serviceCategory ? response.facility.serviceCategory.serviceName = response.facility.serviceCategory.serviceName[language] : '';

                                    if (response.facility.services != undefined) {
                                        response.facility.services = response.facility.services.map(data => ({
                                            _id: data._id,
                                            specialityName: data.specialityName[language],
                                            specialist: data.specialist[language]
                                        }));
                                    }
                                    if (obj.step == "4") {
                                        /*let data1 = await mirrorFlyAPI.register({
                                            "password": randomstring,
                                            "userId": response._id,
                                            deviceToken: obj.deviceToken,
                                            deviceType: obj.deviceType
                                        })
                                        console.log(data1, "data");*/
                                        response.user.insuranceCompany ? response.user.insuranceCompany.companyName = response.user.insuranceCompany.companyName[language] : '';
                                        response.mirrorFlyToken = data1.data;
                                        //response.mirrorFlyTokenConsult = dataNew.data;
                                        response.JID = `${response._id}@fly.uat.mirrorfly.com`;
                                    }

                                    /*

                                    response.facility.services ? response.facility.services.specialityName = response.facility.services.specialityName[language] : '';
                                    response.facility.services ? response.facility.services.specialist = response.facility.services.specialist[language] : '';*/
                                    formatDataByRole(response, function (finalResult) {
                                        return sendResponse.sendSuccessData(finalResult, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                                    });
                                })
                                .catch(err => {
                                    console.log("333333333 -- ", err)
                                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                                })
                        } else {
                            console.log("22222222222222")
                            return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.PHONE_NO_NOT_VERIFIED, {}, res);
                        }
                    } else {
                        console.log("111111111")
                        return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.NO_USER_EXISTS, {}, res);
                    }
                }
            });
        } catch (err) {
            console.log(err)
            //return res.status(500).json({status: 0, message: err.message});
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    editUserProfile: (req, res) => {
        try {
            let obj = req.body;
            //console.log("edit user profile----");
            let haveInsurance = false;
            if (is.undefined(obj.name) || is.empty(obj.name)) {
                return res.status(400).json({
                    status: 0,
                    message: "name is required"
                });
            }
            if (is.undefined(obj.role) || is.empty(obj.role)) {
                return res.status(400).json({
                    status: 0,
                    message: "role is required"
                });
            }
            let criteria = {
                "_id": ObjectId(userData._id)
            }
            var decryptColumns = ['dob', 'bio'];
            console.log("obj ------ ", obj)
            Models.Users.findOne(criteria, function (error, result) {
                if (result.role.indexOf(obj.role) != -1) {
                    if (obj.policyNumber && !is.empty(obj.policyNumber)) {
                        haveInsurance = true;
                    }
                    let DataToSet = {
                        name: obj.name,
                        email: obj.email,
                        "user.currency": obj.currency,
                        //address: obj.address,
                        "location": typeof obj.location === "string" ? JSON.parse(obj.location) : obj.location,
                        "address": obj.address,
                        "user.bio": obj.bio,
                        "user.dob": obj.dob,
                        "user.haveInsurance": haveInsurance,
                        "user.policyNumber": obj.policyNumber,
                        "user.insuranceCompany": obj.insuranceCompany ? ObjectId(obj.insuranceCompany) : null,
                        profilePic: typeof obj.profilePic === "string" ? JSON.parse(obj.profilePic) : obj.profilePic,
                        coverPic: typeof obj.coverPic === "string" ? JSON.parse(obj.coverPic) : obj.coverPic
                    };
                    Models.Users.findOneAndUpdate(criteria, DataToSet, {
                            new: true,
                            lean: true
                        })
                        .populate("user.insuranceCompany", "companyName", {
                            "isActive": true
                        })
                        .then(response => {
                            response.user.insuranceCompany ? response.user.insuranceCompany.companyName = response.user.insuranceCompany.companyName[language] : '';
                            formatDataByRole(response, function (finalResult) {
                                return sendResponse.sendSuccessData(finalResult, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                            });
                        })
                        .catch(err => {
                            console.log(err)
                            return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                        })
                } else {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ROLE, {}, res);
                }
            });

        } catch (err) {
            console.log("error in edit user profile in user controller under controllers---", err);
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    editProfessionalProfile: (req, res) => {
        try {
            let obj = req.body;
            let haveInsurance = false;
            if (is.undefined(obj.name) || is.empty(obj.name)) {
                return res.status(400).json({
                    status: 0,
                    message: "name is required"
                });
            }
            if (is.undefined(obj.role) || is.empty(obj.role)) {
                return res.status(400).json({
                    status: 0,
                    message: "role is required"
                });
            }
            let criteria = {
                "_id": ObjectId(userData._id)
            };

            if (obj.professionalSubSpeciality) {

                /*let subList;
                subList = typeof obj.professionalSubSpeciality === "string" ? JSON.parse(obj.professionalSubSpeciality) : obj.professionalSubSpeciality;
                if (subList && subList.length > 0) {
                    subList = subList.map(s => ObjectId(s))
                }
                obj.professionalSubSpeciality = subList;*/

                obj.professionalSubSpeciality = mapArrayData(obj.professionalSubSpeciality)
            };


            Models.Users.findOne(criteria, function (error, result) {
                if (result.role.indexOf(obj.role) != -1) {
                    let DataToSet = {
                        name: obj.name,
                        email: obj.email,
                        //address: obj.address,
                        "location": typeof obj.location === "string" ? JSON.parse(obj.location) : obj.location,
                        "address": obj.address,
                        profilePic: typeof obj.profilePic === "string" ? JSON.parse(obj.profilePic) : obj.profilePic,
                        coverPic: typeof obj.coverPic === "string" ? JSON.parse(obj.coverPic) : obj.coverPic,
                        "professional.serviceCategory": obj.serviceCategory,
                        "professional.professionalSpeciality": obj.professionalSpeciality,
                        "professional.professionalSubSpeciality": obj.professionalSubSpeciality,
                        "professional.professionalType": obj.professionalType,

                        "professional.license": obj.license,
                        "professional.licenseImage": typeof obj.licenseImage === "string" ? JSON.parse(obj.licenseImage) : obj.licenseImage,
                        "professional.skillDescription": obj.skillDescription,
                        "professional.country": ObjectId(obj.country),
                        "professional.city": ObjectId(obj.city),
                        "professional.expertise": obj.expertise,
                        "professional.image": typeof obj.image === "string" ? JSON.parse(obj.image) : obj.image,
                        "professional.video": typeof obj.video === "string" ? JSON.parse(obj.video) : obj.video
                    };
                    console.log("DataToSet ----------------- ", DataToSet)
                    Models.Users.findOneAndUpdate(criteria, DataToSet, {
                            new: true,
                            lean: true
                        })
                        .populate([{
                            path: "professional.professionalSpeciality",
                            select: "specialist specialityName specialityIcon"
                        }, {
                            path: "professional.professionalType",
                            select: "typeName isActive"
                        }, {
                            path: "professional.serviceCategory",
                            select: "serviceName serviceIcon templateType isActive isSelected visible"
                        }, {
                            path: "professional.professionalSubSpeciality",
                            select: "specialityName specialityIcon"
                        }, {
                            path: "professional.country",
                            select: "_id locationName countryFlagIcon countryCode shortName"
                        }, {
                            path: "professional.city",
                            select: "_id locationName"
                        }])
                        .then(response => {

                            response.professional.professionalSpeciality ? response.professional.professionalSpeciality.specialityName = response.professional.professionalSpeciality.specialityName[language] : '';
                            response.professional.professionalSpeciality ? response.professional.professionalSpeciality.specialist = response.professional.professionalSpeciality.specialist[language] : '';

                            response.professional.professionalType ? response.professional.professionalType.typeName = response.professional.professionalType.typeName[language] : '';
                            response.professional.serviceCategory ? response.professional.serviceCategory.serviceName = response.professional.serviceCategory.serviceName[language] : '';

                            if (response.professional.professionalSubSpeciality != undefined) {
                                response.professional.professionalSubSpeciality = response.professional.professionalSubSpeciality.map(data => ({
                                    _id: data._id,
                                    specialityName: data.specialityName[language]
                                }));
                            }
                            /*response.professional.professionalSubSpeciality ? response.professional.professionalSubSpeciality.specialityName = response.professional.professionalSubSpeciality.specialityName[language] : '';
                            response.professional.professionalSubSpeciality ? response.professional.professionalSubSpeciality.specialist = response.professional.professionalSubSpeciality.specialist[language] : '';*/

                            response.professional.country ? response.professional.country.locationName = response.professional.country.locationName[language] : '';
                            response.professional.city ? response.professional.city.locationName = response.professional.city.locationName[language] : '';
                            formatDataByRole(response, function (finalResult) {
                                return sendResponse.sendSuccessData(finalResult, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                            });
                        })
                        .catch(err => {
                            return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                        })
                } else {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ROLE, {}, res);
                }
            });

        } catch (err) {
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    editFacilityProfile: (req, res) => {
        try {
            let obj = req.body;
            let haveInsurance = false;
            if (is.undefined(obj.name) || is.empty(obj.name)) {
                return res.status(400).json({
                    status: 0,
                    message: "name is required"
                });
            }
            if (is.undefined(obj.role) || is.empty(obj.role)) {
                return res.status(400).json({
                    status: 0,
                    message: "role is required"
                });
            }
            if (obj.services) {
                /*let subList;
                subList = typeof obj.services === "string" ? JSON.parse(obj.services) : obj.services;
                if (subList && subList.length > 0) {
                    subList = subList.map(s => ObjectId(s))
                }
                obj.services = subList;*/

                obj.services = mapArrayData(obj.services)
            }
            let criteria = {
                "_id": ObjectId(userData._id)
            }
            Models.Users.findOne(criteria, function (error, result) {
                if (result.role.indexOf(obj.role) != -1) {
                    let DataToSet = {
                        name: obj.name,
                        email: obj.email,
                        //address: obj.address,                        
                        "location": typeof obj.location === "string" ? JSON.parse(obj.location) : obj.location,
                        "address": obj.address,
                        coverPic: typeof obj.coverPic === "string" ? JSON.parse(obj.coverPic) : obj.coverPic,
                        profilePic: typeof obj.profilePic === "string" ? JSON.parse(obj.profilePic) : obj.profilePic,
                        "facility.serviceCategory": obj.serviceCategory,
                        "facility.facilityType": obj.facilityType,
                        "facility.description": obj.description,
                        "facility.expertise": obj.expertise,
                        "facility.services": obj.services,
                        "facility.address": obj.address,
                        "facility.registrationNumber": obj.registrationNumber,
                        "facility.registrationImage": typeof obj.registrationImage === "string" ? JSON.parse(obj.registrationImage) : obj.registrationImage,
                        "facility.image": typeof obj.image === "string" ? JSON.parse(obj.image) : obj.image,
                        "facility.video": typeof obj.video === "string" ? JSON.parse(obj.video) : obj.video
                    };
                    Models.Users.findOneAndUpdate(criteria, DataToSet, {
                            new: true,
                            lean: true
                        })
                        .populate([{
                            path: "facility.facilityType",
                            select: "_id specialist specialityName",
                            // model: "ProfessionalSpeciality"
                        }, {
                            path: "facility.serviceCategory",
                            select: "serviceName serviceIcon templateType isActive isSelected visible",
                            // model: "ServiceCategory"
                        }, {
                            path: "facility.services",
                            select: "specialityName specialist specialityIcon professionalType isActive isSelected parentId",
                            // model: "ProfessionalSpeciality"
                        }])
                        .then(response => {

                            response.facility.facilityType ? response.facility.facilityType.specialityName = response.facility.facilityType.specialityName[language] : '';
                            response.facility.facilityType ? response.facility.facilityType.specialist = response.facility.facilityType.specialist[language] : '';

                            response.facility.serviceCategory ? response.facility.serviceCategory.serviceName = response.facility.serviceCategory.serviceName[language] : '';

                            if (response.facility.services != undefined) {
                                response.facility.services = response.facility.services.map(data => ({
                                    _id: data._id,
                                    specialityName: data.specialityName[language],
                                    specialist: data.specialist[language]
                                }));
                            }
                            /*response.facility.services ? response.facility.services.specialityName = response.facility.services.specialityName[language] : '';
                            response.facility.services ? response.facility.services.specialist = response.facility.services.specialist[language] : '';*/
                            return sendResponse.sendSuccessData(response, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                        })
                        .catch(err => {
                            return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                        })
                } else {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ROLE, {}, res);
                }
            });

        } catch (err) {
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },

    updateUserRole: async (req, res) => {
        try {
            let obj = req.body;
            let err = [];
            /*if (is.undefined(obj.userId) || is.empty(obj.userId)) {
                return res.status(400).json({status: 0, message: "userId is required"});
            }*/
            if (is.undefined(obj.role) || is.empty(obj.role)) {
                return res.status(400).json({
                    status: 0,
                    message: "Role is required"
                });
            }
            var criteria = {
                "_id": ObjectId(userData._id)
            }
            /*let dataToSet = {
                $set: {defaultLoginRole: obj.role}
            }*/

            var dataToSet = {};
            if (obj.type == "1") {
                dataToSet = {
                    $addToSet: {
                        role: obj.role
                    },
                    defaultLoginRole: obj.role,
                    "user.currency": obj.currency,
                    "user.dob": obj.dob,
                    "user.haveInsurance": obj.haveInsurance,
                    "user.insuranceCompany": obj.insuranceCompany ? ObjectId(obj.insuranceCompany) : null,
                    "user.policyNumber": obj.policyNumber,
                    "user.step": "2"
                }
                /*if(obj.currency){ dataToSet.user = {currency:obj.currency}; }
                if(obj.dob){ dataToSet.user = {dob: obj.dob}; }
                if(obj.haveInsurance){ dataToSet.user.haveInsurance = obj.haveInsurance; }
                if(obj.insuranceCompany){ dataToSet.user.insuranceCompany = obj.insuranceCompany; }
                if(obj.policyNumber){ dataToSet.user.policyNumber = obj.policyNumber; }*/
                //dataToSet.$addToSet = {role: obj.role} 
            } else {
                dataToSet = {
                    defaultLoginRole: obj.role
                };
            }

            if (obj.type == "1") {
                var checkFolder = await Models.Folder.countDocuments({
                    "userId": ObjectId(userData._id),
                    "folderName": Constants.DATABASE.FOLDERS.MEDICATIONS['en'],
                    "dependentId": null
                });
                console.log("checkFolder ##### ---------- ", checkFolder)
                if (checkFolder == "0") {
                    var folderAddCheck = {
                        "folders": "medications,requests,reports,radiology,labs"
                    };
                    //let dataToSend = {"folders":obj.folders, "dependentId":addedDpendent[0]._id};
                    //await createUserFolders("1",dataToSend, "0");
                    await createUserFolders("1", folderAddCheck, "1");
                }
            }

            if (obj.role == "PROFESSIONAL") {
                populate = [{
                    path: "professional.professionalSpeciality",
                    select: "specialist specialityName specialityIcon"
                }, {
                    path: "professional.professionalType",
                    select: "typeName isActive"
                }, {
                    path: "professional.serviceCategory",
                    select: "serviceName serviceIcon templateType isActive isSelected visible"
                }, {
                    path: "professional.professionalSubSpeciality",
                    select: "specialityName specialityIcon"
                }, {
                    path: "professional.country",
                    select: "_id locationName countryFlagIcon countryCode shortName"
                }, {
                    path: "professional.city",
                    select: "_id locationName"
                }];
            }

            if (obj.role == "USER") {
                populate = [{
                    path: "user.insuranceCompany",
                    select: "_id companyName",
                }];
            }

            Models.Users.findOneAndUpdate(criteria, dataToSet, {
                    new: true
                }) //, function (errUpdate, response) {
                .populate(populate)
                .exec(function (errUpdate, response) {
                    if (errUpdate) {
                        return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, errUpdate, res);
                    } else {
                        response = JSON.parse(JSON.stringify(response))
                        //if (phoneCheck.role.find(r => r === "USER")){
                        if (response.defaultLoginRole == "USER") {
                            response.user.insuranceCompany ? response.user.insuranceCompany.companyName = response.user.insuranceCompany.companyName[req.headers.language] : '';
                        }
                        //if (phoneCheck.role.find(r => r === "PROFESSIONAL")){
                        if (response.defaultLoginRole == "PROFESSIONAL") {

                            console.log(response.professional.professionalSpeciality.specialityName, "  =======================  ", response.professional.professionalSpeciality.specialityName[req.headers.language], " ---------------- ", req.headers.language)

                            response.professional.professionalSpeciality ? response.professional.professionalSpeciality.specialityName = response.professional.professionalSpeciality.specialityName[req.headers.language] : '';

                            response.professional.professionalSpeciality ? response.professional.professionalSpeciality.specialist = response.professional.professionalSpeciality.specialist[req.headers.language] : '';

                            response.professional.professionalType ? response.professional.professionalType.typeName = response.professional.professionalType.typeName[req.headers.language] : '';

                            response.professional.serviceCategory ? response.professional.serviceCategory.serviceName = response.professional.serviceCategory.serviceName[req.headers.language] : '';

                            if (response.professional.professionalSubSpeciality != undefined) {
                                response.professional.professionalSubSpeciality = response.professional.professionalSubSpeciality.map(data => ({
                                    _id: data._id,
                                    specialityName: data.specialityName[req.headers.language]
                                }));
                            }
                            response.professional.country ? response.professional.country.locationName = response.professional.country.locationName[req.headers.language] : '';
                            response.professional.city ? response.professional.city.locationName = response.professional.city.locationName[req.headers.language] : '';
                        }
                        //Models.Users.findOne(criteria, function (UpdatedErr, UpdatedResult) {
                        formatDataByRole(response, function (finalResult) {
                            return sendResponse.sendSuccessData(finalResult, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                        });
                        //});
                    }
                });


        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },

    updatePushNotificationDeviceToken: async (req, res) => {
        try {
            let obj = req.body;
            let err = [];
            if (is.undefined(obj.deviceToken) || is.empty(obj.deviceToken)) {
                return res.status(400).json({
                    status: 0,
                    message: "deviceToken is required"
                });
            }
            //let alreadyExistsResult = await Models.Users.findOne({"fcmId": obj.fcmId},{_id:1});
            /*if(alreadyExistsResult!=null){
                await Models.Users.update({"fcmId": obj.fcmId}, { $set: { isDefault: false } }, { multi: true });
            }*/
            var criteria = {
                "_id": ObjectId(userData._id)
            }
            let dataToSet = {
                //$set: {deviceToken: obj.deviceToken,fcmId: obj.fcmId}
                $set: {
                    deviceToken: obj.deviceToken
                }
            }
            Models.Users.findOneAndUpdate(criteria, dataToSet, function (errUpdate, resultUpdate) {
                if (errUpdate) {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, errUpdate, res);
                } else {
                    formatDataByRole(resultUpdate, function (finalResult) {
                        return sendResponse.sendSuccessData(finalResult, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                    });
                }
            });

        } catch (err) {
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    usersList: (req, res) => {
        try {
            let obj = req.query;
            let err = [];
            if (is.undefined(obj.role) || is.empty(obj.role)) {
                return res.status(400).json({
                    status: 0,
                    message: "Role is required"
                });
            }
            let project = {
                phone: 1,
                email: 1,
                address: 1,
                language: 1,
                role: 1,
                defaultLoginRole: 1,
                _id: 1,
                name: 1,
                countryCode: 1
            }
            if (obj.role == "User" || obj.role == "USER") {
                project.user = "1";
            }
            if (obj.role == "Professional" || obj.role == "PROFESSIONAL") {
                project.professional = "1";
            }
            if (obj.role == "Facility" || obj.role == "FACILITY") {
                project.facility = "1";
            }
            Models.Users.find({
                "role": {
                    "$in": obj.role
                }
            }, project, function (err, userResult) {
                if (err) {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                } else {
                    if (userResult.length > 0) {
                        return sendResponse.sendSuccessData(userResult, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                    } else {
                        return sendResponse.sendSuccessData(userResult, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                    }
                }
            });
        } catch (err) {
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    countryList: (req, res) => {
        const queryData = req.query;
        try {
            /*let criteria;
            let id = queryData._id ? ObjectId(queryData._id) : null;
            if(queryData._id && queryData._id != ""){
                criteria = {"parentId": ObjectId(queryData._id)}
            }else{
                criteria = {"isActive": true, "parentId": null}
            }
            Models.Country.find(criteria, function (err, result) {*/
            let match;
            let id = queryData._id ? ObjectId(queryData._id) : null;
            if (queryData._id && queryData._id != "") {
                match = {
                    "parentId": ObjectId(queryData._id)
                }
            } else {
                match = {
                    "isActive": true,
                    "parentId": null
                }
            }
            Models.Country.aggregate([{
                    $match: match
                },
                {
                    $project: {
                        locationName: "$locationName." + req.headers.language,
                        isActive: 1,
                        isDeleted: 1
                    }
                }
            ], function (err, result) {
                //console.log("result",result)
                if (err) {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                } else {
                    if (result.length > 0) {
                        return sendResponse.sendSuccessData(result, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                    } else {
                        return sendResponse.sendSuccessData(result, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                    }
                }
            });
        } catch (err) {
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },

    getUserDetailsById: async (req, res) => {
        try {
            let obj = req.body;
            let err = [];
            let isTeamMember = false,
                isHired = "0",
                isFriend = "0"; //isFriend=0 means not friends
            let isFavorite = false;

            if (is.undefined(obj.userId) || is.empty(obj.userId)) {
                return res.status(400).json({
                    status: 0,
                    message: "userId is required"
                });
            }
            if (is.undefined(obj.role) || is.empty(obj.role)) {
                return res.status(400).json({
                    status: 0,
                    message: "User role is required"
                });
            }
            let id = ObjectId(obj.userId);
            let followingCount = await Models.Follow.countDocuments({
                "followById": id,
                "type": "1"
            });
            let followedCount = await Models.Follow.countDocuments({
                "followedId": id,
                "type": "1"
            });
            let favoriteCount = await Models.Users.countDocuments({
                $or: [{
                        "favoriteProfessionals": {
                            "$in": [id]
                        }
                    },
                    {
                        "favoriteFacilities": {
                            "$in": [id]
                        }
                    }
                ]
            });
            let feedback = await Models.ApointmentFeedback.find({
                "userId": ObjectId(obj.userId)
            }, {
                rating: 1,
                _id: 0
            });

            let followCheck, checkTeamStatus, isFriendData;
            if (userData) {
                followCheck = await Models.Follow.countDocuments({
                    "followById": ObjectId(userData._id),
                    "followedId": id,
                    "type": "1"
                });
                checkTeamStatus = await Models.Team.find({
                    "teamManagerId": ObjectId(userData._id),
                    "professionalId": id
                }).sort({
                    '_id': -1
                }).limit(1);
                isFriendData = await Models.Follow.findOne({
                    $or: [{
                        "followById": ObjectId(userData._id),
                        "followedId": id
                    }, {
                        "followById": id,
                        "followedId": ObjectId(userData._id)
                    }],
                    "type": "2"
                }, {
                    contactStatus: 1,
                    _id: 0
                });
                if (isFriendData != null) {
                    if (isFriendData.contactStatus == "0") {
                        isFriend = "2"; //PENDING
                    } else if (isFriendData.contactStatus == "1") {
                        isFriend = "1"; //ACCEPTED/FRIENDS
                    }
                }
                if (checkTeamStatus && checkTeamStatus.length > 0) {
                    isHired = checkTeamStatus[0].status;
                    if (checkTeamStatus[0].status == "3") {
                        isTeamMember = true;
                    }
                }
            }
            await Promise.all([
                    getProfileData(id, req),
                    (obj.role == "FACILITY") ? getProfessionalsCountWithService(id, req) : Promise.resolve([]),
                    (obj.role == "FACILITY") ? getFacilityProfessionalServicesList(id, req) : Promise.resolve([]),
                ])
                .then(async response => {
                    // let facilityServices = response[0][0].facility.services;
                    // let professionalServices = response[2];
                    // console.log("response----", response);
                    // var servicesResult = await removeDuplicate(facilityServices,professionalServices );
                    // response[0][0].facility.services = servicesResult;

                    let dataToSend = {}
                    dataToSend = response[0][0];
                    if (obj.role == "FACILITY") {
                        dataToSend.facilityProfessionals = response[1];
                        //dataToSend.facilityProfessionalServicesList = response[2];
                    }
                    if (userData) {
                        dataToSend.isFollowed = (followCheck == 1) ? true : false;
                        if (checkTeamStatus && checkTeamStatus.length > 0) {
                            dataToSend.contractId = checkTeamStatus[0]._id;
                        }
                        dataToSend.isFriend = isFriend;
                        dataToSend.isTeamMember = isTeamMember;
                        dataToSend.isHired = isHired;
                        if ((userData.favoriteProfessionals).indexOf(id) != -1 || (userData.favoriteFacilities).indexOf(id) != -1) {
                            dataToSend.isFavorite = true;
                        } else {
                            dataToSend.isFavorite = false;
                        }
                    }
                    dataToSend.followingCount = followingCount;
                    dataToSend.followedCount = followedCount;
                    dataToSend.favoriteCount = favoriteCount;
                    if (feedback.length > 0) {
                        console.log(feedback, "----feedback.length----", feedback.length)
                        dataToSend.feedbackCount = feedback.length;
                        let sumOfRatings = feedback.reduce((a, b) => +a + +b.rating, 0);
                        let avgrating = (sumOfRatings / feedback.length);
                        dataToSend.feedbackRating = Number(parseFloat(avgrating).toFixed(1))
                    } else {
                        dataToSend.feedbackCount = 0;
                        dataToSend.feedbackRating = 0;
                    }
                    return sendResponse.sendSuccessData(dataToSend, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                })
                .catch(err => {
                    console.log(err)
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                });
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },

    getUserRoleAndUnavailabilityById: async (req, res) => {
        try {
            var obj = req.body;
            console.log(obj)
            let criteria = {
                "_id": ObjectId(obj.userId)
            };
            Models.Users.findOne(criteria, {
                name: 1,
                profilePic: 1,
                coverPic: 1,
                defaultLoginRole: 1,
                phone: 1,
                countryCode: 1
            }, async function (err, result) {
                if (err) {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                } else {
                    var checkDate = momentTimezone(new Date()).tz(req.headers.timezone).format('YYYY-MM-DD');
                    var appCriteria = {
                        "user": ObjectId(obj.userId),
                        "type": Constants.DATABASE.APPOINTMENT.SELF,
                        "selfAppointment.dates": {
                            $in: [checkDate]
                        }
                    }
                    let unavailability = await Models.Appointment.find(appCriteria, {
                        "slots": 1,
                        "selfAppointment.isAllDay": 1,
                        "_id": 0
                    });

                    var unavailabileSlots = [];
                    var isAllDay = false;
                    var isAvailable = true;
                    console.log("=========================================================")
                    console.log("unavailability", unavailability)
                    for (let x in unavailability) {
                        unavailabileSlots = unavailabileSlots.concat(unavailability[x].slots)
                        if (unavailability[x].selfAppointment.isAllDay == true) {
                            isAllDay = true;
                            break;
                        }

                    }
                    console.log("=========================================================", unavailabileSlots)
                    if (isAllDay == false) {
                        var startTime = momentTimezone(new Date()).tz(req.headers.timezone).format('hh:mm A');
                        var start = moment(startTime, 'hh:mm A');
                        if (start.minutes() == "0" || start.minutes() == "30") {
                            start.minutes(Math.ceil(start.minutes() / 30) * 30);
                        } else {
                            start.minutes(Math.ceil(start.minutes() / 30) * 30 - 30);
                        }
                        var current = moment(start);
                        var resultt = current.format('hh:mm A');
                        var dataa = await controllerUtil.convertTimeStringInMins([resultt]);
                        console.log(unavailabileSlots, " --- ", dataa);

                        if (unavailabileSlots.indexOf(dataa[0]) != -1) {
                            isAvailable = false
                        }
                    } else {
                        isAvailable = false
                    }
                    result = JSON.parse(JSON.stringify(result))
                    result.isAvailable = isAvailable;

                    return sendResponse.sendSuccessData(result, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                }
            });
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },

    createProfessionalAccount: async (req, res) => {
        try {
            let obj = req.body;
            if (is.undefined(obj.facilityId) || is.empty(obj.facilityId)) {
                return res.status(400).json({
                    status: 0,
                    message: "Facility Id is required"
                });
            }
            if (is.undefined(obj.name) || is.empty(obj.name)) {
                return res.status(400).json({
                    status: 0,
                    message: "Name is required"
                });
            }
            if (is.undefined(obj.countryCode) || is.empty(obj.countryCode)) {
                return res.status(400).json({
                    status: 0,
                    message: "Country code is required"
                });
            }
            if (is.undefined(obj.phone) || is.empty(obj.phone)) {
                return res.status(400).json({
                    status: 0,
                    message: "Contact number is required"
                });
            }
            if (is.undefined(obj.password) || is.empty(obj.password)) {
                return res.status(400).json({
                    status: 0,
                    message: "Password is required"
                });
            }
            if (is.undefined(obj.professionalSpeciality) || is.empty(obj.professionalSpeciality)) {
                return res.status(400).json({
                    status: 0,
                    message: "Professional speciality is required"
                });
            }
            if (is.undefined(obj.professionalType) || is.empty(obj.professionalType)) {
                return res.status(400).json({
                    status: 0,
                    message: "Professional type is required"
                });
            }
            if (is.undefined(obj.serviceCategory) || is.empty(obj.serviceCategory)) {
                return res.status(400).json({
                    status: 0,
                    message: "Service Category is required"
                });
            }
            if (is.undefined(obj.country) || is.empty(obj.country)) {
                return res.status(400).json({
                    status: 0,
                    message: "Country is required"
                });
            }
            if (is.undefined(obj.city) || is.empty(obj.city)) {
                return res.status(400).json({
                    status: 0,
                    message: "City is required"
                });
            }
            await createUserFolders("2", "", "0");
            let phoneCheck = await Models.Users.findOne({
                "phone": obj.phone,
                "countryCode": obj.countryCode,
                "isDeleted": {
                    $ne: true
                }
            });
            if (phoneCheck == null) {
                if (obj.professionalSubSpeciality) {
                    obj.professionalSubSpeciality = mapArrayData(obj.professionalSubSpeciality)
                }
                let professionalData = new Models.Users({
                    name: result.name,
                    countryCode: result.countryCode,
                    phone: result.phone,
                    email: result.email,
                    password: result.password,
                    otp: "12345",
                    role: ["PROFESSIONAL"],
                    defaultLoginRole: "PROFESSIONAL",
                    isPhoneVerified: true,
                    currentStatus: "ONLINE",
                    profilePic: typeof obj.profilePic === "string" ? JSON.parse(obj.profilePic) : obj.profilePic,
                    coverPic: typeof obj.coverPic === "string" ? JSON.parse(obj.coverPic) : obj.coverPic,
                    location: typeof obj.location === "string" ? JSON.parse(obj.location) : obj.location,
                    "professional.serviceCategory": obj.serviceCategory,
                    "professional.professionalType": obj.professionalType,
                    "professional.professionalSpeciality": obj.professionalSpeciality,
                    "professional.professionalSubSpeciality": obj.professionalSubSpeciality,
                    "professional.license": obj.license,
                    "professional.licenseImage": typeof obj.licenseImage === "string" ? JSON.parse(obj.licenseImage) : obj.licenseImage,
                    "professional.skillDescription": obj.skillDescription,
                    "professional.country": ObjectId(obj.country),
                    "professional.city": ObjectId(obj.city),
                    "professional.expertise": obj.expertise,
                    /*"professional.image": typeof obj.image === "string" ? JSON.parse(obj.image) : obj.image,
                    "professional.video": typeof obj.video === "string" ? JSON.parse(obj.video) : obj.video,*/
                    "professional.isAddedByFacility": true,
                    "professional.facilityId": obj.facilityId,
                    "professional.step": "3"
                });
                professionalData.save(function (err, result) {
                    if (err) {
                        return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                    } else {
                        let criteria = {
                            "_id": result._id
                        }
                        Models.Users.find(criteria)
                            .populate('professional.professionalSpeciality', 'specialist specialityName specialityIcon')
                            .populate('professional.professionalSubSpeciality', 'specialityName specialityIcon')
                            .populate('professional.professionalType', 'typeName isActive')
                            .populate('professional.serviceCategory', 'serviceName serviceIcon templateType isActive isSelected visible')
                            .populate('professional.country', '_id locationName countryFlagIcon countryCode shortName')
                            .populate('professional.city', '_id locationName')
                            .exec(function (finalErr, finalResult) {
                                if (finalErr) {
                                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, finalErr, res);
                                } else {
                                    formatDataByRole(response, function (finalResult) {
                                        return sendResponse.sendSuccessData(finalResult, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                                    });
                                }
                            });
                    }
                });
            }
        } catch (err) {
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    getProfessionalsList: async (req, res) => { // type-1 was returning all professionals only on the basis of speciality id before but now a check is added to look same speciality for
        try {
            let obj = req.body;
            //console.log(obj)
            let err = [];
            let criteria
            console.log("obj--------------- ", obj)
            //var sortBy = {"distanceNew":1, "_id":-1};
            var sortBy = {
                "distanceNew": 1
            };

            if (is.undefined(obj.id) || is.empty(obj.id)) {
                return res.status(400).json({
                    status: 0,
                    message: "Professional Speciality/Service/SubSpeciality Id is required"
                });
            }
            if (is.undefined(obj.type) || is.empty(obj.type)) {
                return res.status(400).json({
                    status: 0,
                    message: "Professional Type is required"
                });
            }
            if (obj.type == "1") {
                criteria = {
                    $or: [{
                            "professional.professionalSpeciality": ObjectId(obj.id),
                            role: {
                                $elemMatch: {
                                    $eq: "PROFESSIONAL"
                                }
                            }
                        },
                        {
                            "facility.facilityType": ObjectId(obj.id),
                            role: {
                                $elemMatch: {
                                    $eq: "FACILITY"
                                }
                            }
                        }
                    ],
                    "_id": {
                        $ne: ObjectId(userData._id)
                    }
                };
                if (obj.professionalType && obj.professionalType != "") {
                    criteria.$or = [{
                            'professional.professionalSubSpeciality': {
                                "$in": [ObjectId(obj.professionalType)]
                            }
                        },
                        {
                            'facility.services': {
                                "$in": [ObjectId(obj.professionalType)]
                            }
                        }
                    ]
                }
            }
            if (obj.type == "2") {
                criteria = {
                    "professional.serviceCategory": ObjectId(obj.id),
                    role: {
                        $elemMatch: {
                            $eq: "PROFESSIONAL"
                        }
                    },
                    "professional.facilities": {
                        $elemMatch: {
                            $eq: ObjectId(obj.facilityId)
                        }
                    },
                    "_id": {
                        $ne: ObjectId(userData._id)
                    }
                };
            }
            if (obj.type == "3") {
                let idAr = obj.id.split(",");
                idAr = mapArrayData(idAr);

                let professionalIds = await queries.getData(Models.ProfessionalFacilities, {
                    "facilityServices": {
                        $in: idAr
                    },
                    "facility": ObjectId(obj.facilityId)
                }, {
                    "professional": 1
                }, {
                    lean: true
                });

                let professionalId = [];

                professionalIds.map((item) => {
                    professionalId.push(ObjectId(item.professional));
                });

                if (obj.facilityId == undefined || obj.facilityId == "") {
                    criteria = {
                        $or: [{
                            "_id": {
                                $in: professionalId
                            }
                        }],
                        "_id": {
                            $ne: ObjectId(userData._id)
                        },
                    };
                } else {
                    criteria = {
                        $or: [{
                            "_id": {
                                $in: professionalId
                            }
                        }]

                    };
                }
            }

            if (obj.long == undefined || obj.lat == undefined) {
                let userLocation = await Models.Users.findOne({
                    "_id": ObjectId(userData._id)
                }, {
                    "location": 1,
                    _id: 0
                });
                if (userLocation != null) {
                    obj.long = userLocation.location[0]
                    obj.lat = userLocation.location[1]
                } else {
                    obj.long = 0
                    obj.lat = 0
                }
            }

            if (obj.sortBy && obj.sortBy == "1") {
                sortBy = {
                    "feedbackRating": -1
                };
            } else if (obj.sortBy && obj.sortBy == "2") {
                sortBy = {
                    "favoriteCount": -1
                };
            } else if (obj.sortBy && obj.sortBy == "3") {
                //sortBy = "distance";
                sortBy = {
                    "distanceNew": 1
                };
            }

            if (obj.keyword && obj.keyword != "") {
                criteria.name = {
                    '$regex': ".*" + obj.keyword + ".*",
                    '$options': 'i'
                }
            }

            //if(obj.lastId && obj.lastId!=""){ criteria._id = {$lt:ObjectId(obj.lastId)} } //FOR PAGINATION
            if (is.undefined(obj.skip) || is.empty(obj.skip)) {
                obj.skip = 0;
            } else {
                obj.skip = Number(obj.skip);
            } //FOR PAGINATION
            if (is.undefined(obj.count) || is.empty(obj.count)) {
                obj.count = 100;
            } else {
                obj.count = Number(obj.count);
            } //FOR PAGINATION

            criteria.isDeleted = false

            var aggregateData = [{
                    $geoNear: {
                        near: {
                            type: "Point",
                            coordinates: [parseFloat(obj.long), parseFloat(obj.lat)] || [0, 0]
                        },
                        distanceField: "distanceNew",
                        limit: 999999,
                        spherical: true
                    }
                },
                {
                    $match: criteria
                },
                {
                    $lookup: {
                        from: "professionalspecialities",
                        let: {
                            "specialityId": '$professional.professionalSubSpeciality'
                        },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [{
                                            $in: ["$_id", {
                                                $ifNull: ['$$specialityId', []]
                                            }]
                                        },
                                        {
                                            $eq: ["$isActive", true]
                                        }
                                    ]
                                }
                            }
                        }],
                        as: 'professional.professionalSubSpeciality'
                    }
                },
                {
                    $lookup: {
                        from: "professionalspecialities",
                        let: {
                            specialityId: '$professional.professionalSpeciality'
                        },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [{
                                            $eq: ["$_id", "$$specialityId"]
                                        },
                                        {
                                            $eq: ["$isActive", true]
                                        }
                                    ]
                                }
                            }
                        }],
                        as: 'professional.professionalSpeciality'
                    }
                },
                {
                    "$unwind": {
                        "path": "$professional.professionalSpeciality",
                        "preserveNullAndEmptyArrays": true
                    }
                },


                {
                    $lookup: {
                        from: "professionaltypes",
                        let: {
                            userId: '$professional.professionalType'
                        },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [{
                                            $eq: ["$_id", "$$userId"]
                                        },
                                        {
                                            $eq: ["$isActive", true]
                                        }
                                    ]
                                }
                            }
                        }],
                        as: 'professional.professionalType'
                    }

                },
                {
                    "$unwind": {
                        "path": "$professional.professionalType",
                        "preserveNullAndEmptyArrays": true
                    }
                },

                {
                    $lookup: {
                        from: "countries",
                        foreignField: "_id",
                        localField: "professional.country",
                        as: 'professional.country'
                    }
                },
                {
                    "$unwind": {
                        "path": "$professional.country",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $lookup: {
                        from: "countries",
                        foreignField: "_id",
                        localField: "professional.city",
                        as: 'professional.city'
                    }
                },
                {
                    "$unwind": {
                        "path": "$professional.city",
                        "preserveNullAndEmptyArrays": true
                    }
                },

                //RATING
                {
                    "$lookup": {
                        "from": "apointmentfeedbacks",
                        "localField": "_id",
                        "foreignField": "userId",
                        "as": "ratingData"
                    }
                },
                //RATING

                //FAVORITE
                { //to count number of people who marked my favorite professional as his/her favourite
                    $lookup: {
                        from: "users",
                        let: {
                            "id": '$_id'
                        },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [{
                                        $in: ["$$id", {
                                            $ifNull: ['$favoriteProfessionals', []]
                                        }]
                                    }]
                                }
                            }
                        }],
                        as: 'favoriteProfessionalsData'
                    }
                },

                { //to count number of people who marked my favorite professional as his/her favourite
                    $lookup: {
                        from: "users",
                        let: {
                            "id": '$_id'
                        },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [{
                                        $in: ["$$id", {
                                            $ifNull: ['$favoriteFacilities', []]
                                        }]
                                    }]
                                }
                            }
                        }],
                        as: 'favoriteFacilities'
                    }
                },
                //FAVORITE

                {
                    $project: {
                        _id: 1,
                        name: 1,
                        defaultLoginRole: 1,
                        profilePic: 1,
                        coverPic: 1,
                        distanceNew: 1,
                        location: 1,
                        address: 1,
                        homeConsultation: 1,
                        onlineConsultation: 1,
                        instantConsultation: 1,
                        isChampion: 1,
                        favoriteCount: {
                            "$cond": {
                                "if": {
                                    "$eq": ["$defaultLoginRole", "FACILITY"]
                                },
                                "then": {
                                    '$size': {
                                        "$ifNull": ["$favoriteFacilities", []]
                                    }
                                },
                                "else": {
                                    '$size': {
                                        "$ifNull": ["$favoriteProfessionalsData", []]
                                    }
                                }
                            }
                        },
                        professional: {
                            "professionalSubSpeciality": {
                                $map: {
                                    "input": "$professional.professionalSubSpeciality",
                                    "as": "option",
                                    in: {
                                        specialityName: "$$option.specialityName." + req.headers.language,
                                        _id: "$$option._id",

                                    }
                                }
                            },
                            professionalSpeciality: {
                                _id: 1,
                                specialityIcon: 1,
                                specialityName: "$professional.professionalSpeciality.specialityName." + req.headers.language,
                                specialist: "$professional.professionalSpeciality.specialist." + req.headers.language,
                                //specialist:1
                            },
                            professionalType: {
                                _id: 1,
                                typeName: "$professional.professionalType.typeName." + req.headers.language,
                                isActive: 1
                            },
                            expertise: 1,
                            skillDescription: 1,
                            city: {
                                _id: 1,
                                locationName: "$professional.city.locationName." + req.headers.language,
                            }, // add populate for this field
                            country: {
                                _id: 1,
                                locationName: "$professional.country.locationName." + req.headers.language,
                                countryFlagIcon: 1,
                                countryCode: 1,
                                shortName: 1
                            }
                        },
                        "feedbackRating": {
                            "$cond": {
                                if: {
                                    "$gte": [{
                                        $size: "$ratingData.rating"
                                    }, 1]
                                },
                                then: {
                                    "$divide": [{
                                            $sum: "$ratingData.rating"
                                        },
                                        {
                                            $size: "$ratingData.rating"
                                        }
                                    ]
                                },
                                else: 0
                            }
                        },
                        "feedbackCount": {
                            "$cond": {
                                if: {
                                    "$gte": [{
                                        $size: "$ratingData.rating"
                                    }, 1]
                                },
                                then: {
                                    "$size": "$ratingData.rating"
                                },
                                else: 0
                            }
                        }
                    }
                },
                {
                    $sort: sortBy
                },
                {
                    $limit: obj.count
                },
                {
                    $skip: obj.skip
                }
            ];
            console.log("aggregateData --- ", JSON.stringify(aggregateData))
            Models.Users.aggregate(aggregateData, function (professionalerr, professionalResult) {
                if (professionalerr) {
                    console.log("professionalerr ---- ", professionalerr)
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, professionalerr, res);
                } else {
                    //console.log("professionalResult ============ ",JSON.stringify(professionalResult))
                    return sendResponse.sendSuccessData(professionalResult, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                }
            });
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    getFacilitysByService: (req, res) => {
        try {
            let obj = req.body;
            let err = [];
            let criteria;
            if (is.undefined(obj.serviceCategoryId) || is.empty(obj.serviceCategoryId)) {
                return res.status(400).json({
                    status: 0,
                    message: "Service category is required"
                });
            }

            criteria = {
                "facility.serviceCategory": ObjectId(obj.serviceCategoryId),
                role: {
                    $in: "FACILITY"
                },
                "_id": {
                    $ne: ObjectId(userData._id)
                },
                isDeleted: false
            }

            if (obj.lastId && obj.lastId != "") {
                criteria._id = {
                    $lt: ObjectId(obj.lastId)
                }
            } //FOR PAGINATION
            if (is.undefined(obj.count) || is.empty(obj.count)) {
                obj.count = 100;
            } else {
                obj.count = Number(obj.count);
            } //FOR PAGINATION

            let project = {
                _id: 1,
                name: 1,
                'facility.address': 1,
                profilePic: 1,
                defaultLoginRole: 1,
                'facility.image': 1
            };
            Models.Users.find(criteria, project, {
                    sort: {
                        _id: -1
                    },
                    limit: obj.count
                })
                //.populate('professional.professionalSubSpeciality', 'specialityName _id specialityIcon')
                //.sort({"_id":-1}).limit(obj.count)
                .exec(function (facilityerr, facilityResult) {
                    if (facilityerr) {
                        return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, facilityerr, res);
                    } else {
                        return sendResponse.sendSuccessData(facilityResult, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                    }
                });
        } catch (err) {
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },

    professionalSpecialityList: (req, res) => {
        try {
            let obj = req.query;
            let err = [];
            if (is.undefined(obj.serviceCategoryId) || is.empty(obj.serviceCategoryId)) {
                return res.status(400).json({
                    status: 0,
                    message: "Service category is required"
                });
            }
            let criteria;
            if (!is.undefined(obj.parentId) && !is.empty(obj.parentId)) {
                criteria = {
                    "parentId": ObjectId(obj.parentId),
                    "serviceCategoryId": ObjectId(obj.serviceCategoryId),
                    isActive: true
                }
            } else {
                criteria = {
                    "parentId": null,
                    "serviceCategoryId": ObjectId(obj.serviceCategoryId),
                    isActive: true
                }
            }
            /*let project = {
                _id: 1,
                specialityName: 1,
                specialityIcon: 1,
                specialist: 1,
                professionalType: 1,
                isActive: 1,
                parentId: 1
            };
            Models.ProfessionalSpeciality.find(criteria, project)
            .populate([{
                path: "professionalType",
                select: "_id typeName isActive",
                query: {"isActive": true}
            }])
            .populate([{
                path: "serviceCategoryId",
                select: "_id serviceName isActive",
                query: {"isActive": true}
            }])
            .exec(function (err, result) {*/
            Models.ProfessionalSpeciality.aggregate([{
                    $match: criteria
                },
                {
                    $lookup: {
                        from: "professionaltypes",
                        let: {
                            "professionalTypeId": '$professionalType'
                        },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [{
                                            $in: ['$_id', {
                                                $ifNull: ['$$professionalTypeId', []]
                                            }]
                                        },
                                        {
                                            $eq: ["$isActive", true]
                                        }
                                    ]
                                }
                            }
                        }],
                        as: 'professionalType'
                    }
                },
                /*{ "$unwind": {
                    "path": "$professionalType",
                    "preserveNullAndEmptyArrays": true
                } },  */
                {
                    $lookup: {
                        from: "servicecategories",
                        let: {
                            serviceCategoryId: '$serviceCategoryId'
                        },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [{
                                            $eq: ["$_id", "$$serviceCategoryId"]
                                        },
                                        {
                                            $eq: ["$isActive", true]
                                        }
                                    ]
                                }
                            }
                        }],
                        as: 'serviceCategoryId'
                    }
                },
                {
                    "$unwind": {
                        "path": "$serviceCategoryId",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $project: {
                        _id: 1,
                        specialityIcon: 1,
                        specialityName: "$specialityName." + req.headers.language,
                        specialist: "$specialist." + req.headers.language,
                        "professionalType": {
                            $map: {
                                "input": "$professionalType",
                                "as": "option",
                                in: {
                                    typeName: "$$option.typeName." + req.headers.language,
                                    _id: "$$option._id",

                                }
                            }
                        },
                        /*professionalType: {
                            //typeName:"$professionalType.typeName."+req.headers.language,
                            typeName:"$professionalType.typeName",
                            //typeName:1,
                            //isActive:1,
                            _id:1
                        },*/
                        //professionalType: 1,
                        serviceCategoryId: {
                            serviceName: "$serviceCategoryId.serviceName." + req.headers.language,
                            isActive: 1,
                            _id: 1,
                            visible: 1
                        },
                        //isActive: 1,
                        parentId: 1
                    }
                }
            ], function (err, result) {
                //console.log(err)
                //console.log(result)
                if (err) {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                } else {
                    if (result.length > 0) {
                        return sendResponse.sendSuccessData(result, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                    } else {
                        return sendResponse.sendSuccessData(result, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                    }
                }
            });
        } catch (err) {
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },


    insuranceCompanyList: (req, res) => {
        try {
            Models.InsuranceCompany.aggregate([{
                    $match: {
                        "isActive": true
                    }
                },
                {
                    $project: {
                        companyName: "$companyName." + req.headers.language,
                        isActive: 1,
                        isDeleted: 1
                    }
                }
            ], function (err, userResult) {
                if (err) {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                } else {
                    if (userResult.length > 0) {
                        return sendResponse.sendSuccessData(userResult, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                    } else {
                        return sendResponse.sendSuccessData(userResult, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                    }
                }
            });
        } catch (err) {
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },

    saveAddress: async (req, res) => {
        try {
            let obj = req.body;
            let result;
            var decryptColumns = []
            var encryptColumns = ['locationName', 'houseNumber', 'addressName'];
            if (is.undefined(obj.locationName) || is.empty(obj.locationName)) {
                return res.status(400).json({
                    status: 0,
                    message: "Location Name is required"
                });
            }
            if (is.undefined(obj.location) || is.empty(obj.location)) {
                return res.status(400).json({
                    status: 0,
                    message: "Location(long,lat) is required"
                });
            }

            if (obj.isDefault == true) {
                await Models.Address.update({
                    "userId": ObjectId(userData._id)
                }, {
                    $set: {
                        isDefault: false
                    }
                }, {
                    multi: true
                });
            }
            /*if(process.env.ENABLE_DB_ENCRYPTION=="1"){
                await encryptDBData(obj, encryptColumns);
            }*/
            let dataToSave = {
                location: typeof obj.location === "string" ? JSON.parse(obj.location) : obj.location,
                locationName: obj.locationName,
                houseNumber: obj.houseNumber,
                addressName: obj.addressName,
                userId: ObjectId(userData._id),
                isDefault: obj.isDefault,
            }
            if (obj.addressId != undefined && obj.addressId != "") {
                result = await Models.Address.updateOne({
                    "_id": ObjectId(obj.addressId)
                }, dataToSave);
            } else {
                //let address = new Models.Address(dataToSave);
                result = await queries.saveData(Models.Address, dataToSave);
                decryptColumns = encryptColumns;
            }
            ///address.save(function (error, result) {
            if (!result) {
                return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, {}, res);
            } else {
                return sendResponse.sendSuccessData(result, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res, decryptColumns);
            }
            //});
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },

    addressList: (req, res) => {
        try {
            let obj = req.query;
            var encryptColumns = ['locationName', 'houseNumber', 'addressName'];
            Models.Address.find({
                "userId": ObjectId(userData._id)
            }, function (err, result) {
                if (err) {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                } else {
                    return sendResponse.sendSuccessData(result, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res, encryptColumns);
                }
            });
        } catch (err) {
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    setDefaultAddress: (req, res) => {
        try {
            let obj = req.body;
            if (is.undefined(obj.addressId) || is.empty(obj.addressId)) {
                return res.status(400).json({
                    status: 0,
                    message: "addressId is required"
                });
            }
            Models.Address.updateOne({
                "userId": ObjectId(userData._id),
                "isDefault": true
            }, {
                "isDefault": false
            }, function (errReset, resultReset) {
                Models.Address.updateOne({
                    "_id": ObjectId(obj.addressId)
                }, {
                    "isDefault": true
                }, function (err, result) {
                    if (err) {
                        return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                    } else {
                        return sendResponse.sendSuccessData({}, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                    }
                });
            });
        } catch (err) {
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    deleteAddress: (req, res) => {
        try {
            let obj = req.body;
            if (is.undefined(obj.addressId) || is.empty(obj.addressId)) {
                return res.status(400).json({
                    status: 0,
                    message: "addressId is required"
                });
            }
            Models.Address.deleteOne({
                "_id": ObjectId(obj.addressId)
            }, function (errDelete, resultDelete) {
                if (errDelete) {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, errDelete, res);
                } else {
                    return sendResponse.sendSuccessData({}, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                }
            });
        } catch (err) {
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    createFolder: async (req, res) => {
        try {
            let obj = req.body;
            var decryptColumns = []
            //var encryptColumns = ['folderName'];
            if (is.undefined(obj.folderName) || is.empty(obj.folderName)) {
                return res.status(400).json({
                    status: 0,
                    message: "Folder name is required"
                });
            }

            let dependentId = obj.dependentId ? ObjectId(obj.dependentId) : null;

            /*if(process.env.ENABLE_DB_ENCRYPTION=="1"){
                await encryptDBData(obj, encryptColumns);
            }*/

            let folder = new Models.Folder({
                folderNameByLang: {
                    'en': obj.folderName,
                    'ar': obj.folderName
                },
                folderName: obj.folderName,
                folderIcon: obj.folderIcon ? obj.folderIcon : '',
                folderType: "3",
                isPrivate: obj.isPrivate ? obj.isPrivate : false,
                userId: ObjectId(userData._id),
                dependentId: dependentId
            });
            folder.save(function (error, result) {
                if (error) {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, error, res);
                } else {
                    result = JSON.parse(JSON.stringify(result))
                    result.folderNameByLang = obj.folderName;
                    return sendResponse.sendSuccessData(result, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res /*,encryptColumns*/ );
                }
            });
        } catch (err) {
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    foldersList: async (req, res) => {
        try {
            let obj = req.query;
            let dependentId = null;
            var userId = userData._id;
            console.log("obj===========", obj)
            //var encryptColumns = ['folderName'];
            if (obj.dependentId != undefined && obj.dependentId != "") {
                dependentId = ObjectId(obj.dependentId)
            }
            if (obj.checkFolders != undefined && obj.checkFolders == "true") {
                let apptCriteria = {
                    doctor: ObjectId(userData._id),
                    user: ObjectId(obj.userId),
                    type: {
                        $ne: "SELF"
                    },
                    status: {
                        $in: ["PLACED", "COMPLETED"]
                    }
                };
                let countAppointments = await Models.Appointment.countDocuments(apptCriteria);
                if (countAppointments == 0) {
                    return sendResponse.sendSuccessData({
                        "medicalFolders": [],
                        "personalFolders": [],
                        "customFolders": [],
                        "recentFiles": []
                    }, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                }
                userId = obj.userId;
            }
            let match = {
                "userId": ObjectId(userId),
                "isDeleted": false,
                dependentId: dependentId
            }
            Models.Folder.aggregate([{
                $match: match
            }, {
                $lookup: {
                    from: "files",
                    let: {
                        folderId: '$_id'
                    },
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [{
                                        $eq: ["$folderId", "$$folderId"]
                                    },
                                    {
                                        $eq: ["$isDeleted", false]
                                    }
                                ]
                            }
                        }
                    }],
                    as: 'file'
                }
            }, {
                $project: {
                    _id: 1,
                    folderName: 1,
                    folderNameByLang: "$folderNameByLang." + req.headers.language,
                    folderIcon: 1,
                    isPrivate: 1,
                    folderType: 1,
                    fileCount: {
                        $size: "$file"
                    }
                }
            }], async function (err, result) {
                if (err) {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                } else {
                    let medicalFolders = [],
                        personalFolders = [],
                        customFolders = [],
                        recentFiles = [];
                    let finalResult = {};

                    //  console.log("check test", JSON.stringify(result));
                    console.log("folderslist ==== ", {
                        medications: {
                            $ne: []
                        },
                        userId: userId,
                        dependentId: dependentId,
                        isVerified: true
                    })
                    let [medicationCount, requestCount, reportCount, labsCount, radioLogyCount] = await Promise.all([
                        DAO.count(Models.PatientAppointmentReport, {
                            medications: {
                                $ne: []
                            },
                            userId: userId,
                            dependentId: dependentId,
                            isVerified: true
                        }),
                        DAO.count(Models.PatientAppointmentReport, {
                            tests: {
                                $ne: []
                            },
                            userId: userId,
                            dependentId: dependentId,
                            isVerified: true
                        }),
                        DAO.count(Models.PatientAppointmentReport, {
                            userId: userId,
                            dependentId: dependentId,
                            isVerified: true
                        }),
                        DAO.count(Models.PatientLabsReport, {
                            userId: userId,
                            dependentId: dependentId,
                            folderId: {
                                $ne: Constants.DATABASE.FOLDERS.RADIOLOGY['en']
                            }
                        }),
                        DAO.count(Models.PatientLabsReport, {
                            userId: userId,
                            dependentId: dependentId,
                            folderId: Constants.DATABASE.FOLDERS.RADIOLOGY['en']
                        }),
                    ]);
                    console.log("result ----- ", result)
                    console.log("result ----- ", labsCount)
                    console.log("result ----- ", medicationCount)
                    console.log("result ----- ", requestCount)
                    console.log("result ----- ", reportCount)
                    console.log("result ----- ", radioLogyCount)

                    for (let folder of result) {
                        //folder.fileCount = "3";
                        if (folder.folderType == "1") {
                            console.log(folder.folderName, " == ", Constants.DATABASE.FOLDERS.LABS['en'])
                            if (folder.folderName == Constants.DATABASE.FOLDERS.LABS['en']) {
                                folder.fileCount = labsCount;
                            } else if (folder.folderName == Constants.DATABASE.FOLDERS.MEDICATIONS['en']) {
                                folder.fileCount = medicationCount;
                            } else if (folder.folderName == Constants.DATABASE.FOLDERS.REQUESTS['en']) {
                                folder.fileCount = requestCount;
                            } else if (folder.folderName == Constants.DATABASE.FOLDERS.REPORTS['en']) {
                                folder.fileCount = reportCount;
                            } else if (folder.folderName == Constants.DATABASE.FOLDERS.RADIOLOGY['en']) {
                                folder.fileCount = radioLogyCount;
                            }
                            /*if(process.env.ENABLE_DB_ENCRYPTION=="1"){
                                await decryptDBData(folder, encryptColumns);
                            }*/
                            medicalFolders.push(folder);

                        } else if (folder.folderType == "2") {
                            personalFolders.push(folder);
                        } else {

                            /*if(process.env.ENABLE_DB_ENCRYPTION=="1"){
                                await decryptDBData(folder, encryptColumns);
                            }*/
                            customFolders.push(folder);
                        }
                    }
                    Models.File.find({
                        "userId": ObjectId(userId),
                        dependentId: dependentId,
                        "isDeleted": false
                    }, {}, {
                        sort: {
                            _id: -1
                        },
                        limit: 10
                    }, async function (fileErr, fileResult) {
                        /*for(let i in fileResult){
                            if(process.env.ENABLE_DB_ENCRYPTION=="1"){
                                await decryptDBData(fileResult[i], ['fileName']);
                            }
                        }*/
                        finalResult = {
                            "medicalFolders": medicalFolders,
                            "personalFolders": personalFolders,
                            "customFolders": customFolders,
                            "recentFiles": fileResult
                        }
                        return sendResponse.sendSuccessData(finalResult, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                    });
                }
            });
        } catch (err) {
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    deleteFolder: (req, res) => {
        try {
            let obj = req.body;
            if (is.undefined(obj.folderId) || is.empty(obj.folderId)) {
                return res.status(400).json({
                    status: 0,
                    message: "folderId is required"
                });
            }
            Models.Folder.findOne({
                "_id": ObjectId(obj.folderId)
            }, function (err, result) {
                if (err) {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                } else {
                    if (result.folderType == 3) {
                        //Models.Folder.deleteOne({"_id": ObjectId(obj.folderId)}, function (errDelete, resultDelete) {
                        Models.Folder.updateOne({
                            "_id": ObjectId(obj.folderId)
                        }, {
                            isDeleted: true
                        }, function (errDelete, resultDelete) {
                            if (errDelete) {
                                return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, errDelete, res);
                            } else {
                                return sendResponse.sendSuccessData({}, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                            }
                        });
                    } else {
                        return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.CANNOT_DELETE_FOLDER, {}, res);
                    }
                }
            });
        } catch (err) {
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    addFileToFolder: async (req, res) => {
        try {
            let obj = req.body;
            /*var decryptColumns = []
            var encryptColumns = ['fileName'];*/

            if (is.undefined(obj.folderId) || is.empty(obj.folderId)) {
                return res.status(400).json({
                    status: 0,
                    message: "Folder id is required"
                });
            }
            if (is.undefined(obj.fileType) || is.empty(obj.fileType)) {
                return res.status(400).json({
                    status: 0,
                    message: "File Type is required"
                });
            }
            let dependentId = obj.dependentId ? ObjectId(obj.dependentId) : null;

            let fileCriteria = [];
            obj.file = typeof obj.file === "string" ? JSON.parse(obj.file) : obj.file;
            for (let file of obj.file) {

                /*if(process.env.ENABLE_DB_ENCRYPTION=="1"){
                    await encryptDBData(file, encryptColumns);
                }*/
                fileCriteria.push({
                    fileName: file.fileName,
                    folderId: ObjectId(obj.folderId),
                    file: file,
                    fileType: obj.fileType,
                    userId: ObjectId(userData._id),
                    dependentId: dependentId
                })
            }
            Models.File.insertMany(fileCriteria, function (error, result) {
                if (error) {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, error, res);
                } else {
                    return sendResponse.sendSuccessData(result, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res /*,encryptColumns*/ );
                }
            });
        } catch (err) {
            console.log("111111111111111111", err)
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    getFilesByFolder: (req, res) => {
        try {
            let obj = req.query;
            //var encryptColumns = ['fileName'];
            if (is.undefined(obj.folderId) || is.empty(obj.folderId)) {
                return res.status(400).json({
                    status: 0,
                    message: "Folder Id is required"
                });
            }
            if (is.undefined(obj.folderType) || is.empty(obj.folderType)) {
                obj.folderType = "";
            }
            //console.log(obj)
            let finalResult = {
                allData: [],
                custom: {}
            };
            Models.File.find({
                "userId": ObjectId(userData._id),
                "isDeleted": false,
                "folderId": ObjectId(obj.folderId)
            }, {}, {
                sort: {
                    "_id": -1
                }
            }, async function (err, result) {
                if (err) {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                } else {
                    let photos = [],
                        videos = [],
                        audios = [],
                        documents = []; // "Photos/Videos/Audios/Documents"

                    /*for(let file of result){
                        if(process.env.ENABLE_DB_ENCRYPTION=="1"){
                            await decryptDBData(file, encryptColumns);
                        }
                    }*/

                    if (obj.folderType == "custom") {
                        for (let file of result) {
                            if (file.fileType == "Photos") {
                                photos.push(file);
                            } else if (file.fileType == "Videos") {
                                videos.push(file);
                            } else if (file.fileType == "Audios") {
                                audios.push(file);
                            } else if (file.fileType == "Documents") {
                                documents.push(file);
                            }
                        }
                        finalResult.custom = {
                            "photos": photos,
                            "videos": videos,
                            "audios": audios,
                            "documents": documents
                        }
                    } //else{
                    finalResult.allData = result
                    //}
                    return sendResponse.sendSuccessData(finalResult, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                }
            });
        } catch (err) {
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    deleteFileFromFolder: (req, res) => {
        try {
            let obj = req.query;
            if (is.undefined(obj.fileId) || is.empty(obj.fileId)) {
                return res.status(400).json({
                    status: 0,
                    message: "File Id is required"
                });
            }
            console.log(obj)
            Models.File.updateOne({
                "_id": ObjectId(obj.fileId)
            }, {
                isDeleted: true
            }, function (errDelete, resultDelete) {
                if (errDelete) {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, errDelete, res);
                } else {
                    return sendResponse.sendSuccessData({}, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                }
            });
        } catch (err) {
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    moveFileToFolder: (req, res) => {
        try {
            let obj = req.body;
            if (is.undefined(obj.fileId) || is.empty(obj.fileId)) {
                return res.status(400).json({
                    status: 0,
                    message: "File Id is required"
                });
            }
            if (is.undefined(obj.folderId) || is.empty(obj.folderId)) {
                return res.status(400).json({
                    status: 0,
                    message: "Folder Id is required"
                });
            }
            if (is.undefined(obj.fileType) || is.empty(obj.fileType)) {
                return res.status(400).json({
                    status: 0,
                    message: "File Type is required"
                });
            }
            Models.File.updateOne({
                "userId": ObjectId(userData._id),
                "_id": ObjectId(obj.fileId)
            }, {
                $set: {
                    "fileType": obj.fileType,
                    "folderId": obj.folderId,
                }
            }, function (errDelete, resultDelete) {
                if (errDelete) {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, errDelete, res);
                } else {
                    return sendResponse.sendSuccessData({}, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                }
            });
        } catch (err) {
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    serviceCategoryList: (req, res) => {
        try {
            let obj = req.body;
            console.log("====================", obj)
            let err = [];
            let criteria
            if (is.undefined(obj.serviceType) || is.empty(obj.serviceType)) {
                return res.status(400).json({
                    status: 0,
                    message: "Service Type is required"
                });
            }
            /*criteria = {serviceType: {$in: obj.serviceType}, isActive: true}

            let project = {_id: 1, serviceName: 1, serviceIcon: 1, templateType: 1, isActive: 1, orderNumber: 1};
            let options = {sort: {orderNumber: 1}};
            Models.ServiceCategory.find(criteria, project, options, function (err, result) {*/
            criteria = {
                //serviceType: {$in: obj.serviceType},
                serviceType: {
                    $elemMatch: {
                        $eq: obj.serviceType
                    }
                },
                isActive: true
            }

            let project = {
                _id: 1,
                serviceName: "$serviceName." + req.headers.language,
                serviceIcon: 1,
                templateType: 1,
                isActive: 1,
                orderNumber: 1,
                serviceType: 1
            };
            console.log(criteria, "=========criteria = project ==========", project)
            //let options = {sort: {orderNumber: 1}};
            //Models.ServiceCategory.find(criteria, project, options, function (err, result) {
            Models.ServiceCategory.aggregate([{
                    $match: criteria
                },
                {
                    $project: project
                },
                {
                    $sort: {
                        orderNumber: 1
                    }
                }
            ], function (err, result) {
                if (err) {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                } else {
                    if (result.length > 0) {
                        return sendResponse.sendSuccessData(result, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                    } else {
                        return sendResponse.sendSuccessData(result, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                    }
                }
            });
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },

    testapi: async (req, res) => {
        try {

            let checkDate = moment(new Date()).format('YYYY-MM-DD');

            var criteria = {}
            var project = {
                "homeService.startTime": 1,
                "scheduledService.slots": 1,
                type: 1
            }
            criteria.$or = [{
                    "type": "HOME",
                    $or: [{
                            "homeService.type": "EVERYDAY",
                            "homeService.everyDayOrCustom": {
                                $in: [checkDate]
                            }
                        },
                        {
                            "homeService.type": "CUSTOM",
                            "homeService.everyDayOrCustom": {
                                $in: [checkDate]
                            }
                        },
                        {
                            "homeService.type": "WEEKLY",
                            "homeService.weeklyDates.dayWiseDates": {
                                $in: [checkDate]
                            }
                        }
                    ]
                },
                {
                    "type": "ONLINE",
                    "scheduledService.date": checkDate
                },
                {
                    "type": "ONSITE",
                    "scheduledService.date": checkDate
                }
            ]
            //var appntmentsCount = await Models.Appointment.find(criteria, project);
            Models.Appointment.find(criteria, project, function (err, result) {
                if (err) {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                } else {
                    result = JSON.parse(JSON.stringify(result))
                    var dataToSave = []
                    let output = [];
                    for (let x of result) {
                        //console.log("------",RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.HOME_PUSH_MESSAGE)
                        if (x.type == "HOME") {

                            var time = x.homeService.startTime;
                            var cdt = moment(time, 'h:mm A');
                            cdt = cdt.format('YYYY-MM-DD HH:mm')
                            var updated = moment(cdt).format('YYYY-MM-DD h:mm A');
                            //var finalTime = moment(new Date(updated)).subtract({hours:1}).format('YYYY-MM-DD  h:mm A') +" - "+moment(time, ["h:mm A"]).subtract({hours:1}).format("HH:mm");;
                            //var finalTime = moment(time, ["h:mm A"]).subtract({hours:1}).format("HH:mm");
                            var finalTime = moment(new Date(updated)).subtract({
                                hours: 1
                            }).format('YYYY-MM-DD  h:mm A');
                            dataToSave.push({
                                time: finalTime,
                                message: {
                                    "en": RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.HOME_PUSH_MESSAGE.message.en,
                                    "ar": RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.HOME_PUSH_MESSAGE.message.ar
                                },
                                receiverId: ObjectId(x.user),
                                appointmentId: ObjectId(x._id)
                            });
                        }
                        if (x.type == "ONLINE") {

                            var time = x.scheduledService.slots[0]
                            var cdt = moment(time, 'h:mm A');
                            cdt = cdt.format('YYYY-MM-DD HH:mm')
                            var updated = moment(cdt).format('YYYY-MM-DD h:mm A');
                            var finalTime = moment(new Date(updated)).subtract({
                                hours: 1
                            }).format('YYYY-MM-DD  h:mm A')
                            //var finalTime = moment(new Date(updated)).subtract({hours:1}).format('YYYY-MM-DD  h:mm A') +" - "+moment(time, ["h:mm A"]).subtract({hours:1}).format("HH:mm");;
                            //var finalTime = moment(time, ["h:mm A"]).subtract({hours:1}).format("HH:mm");

                            dataToSave.push({
                                time: finalTime,
                                message: {
                                    "en": RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.HOME_PUSH_MESSAGE.message.en,
                                    "ar": RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.HOME_PUSH_MESSAGE.message.ar
                                },
                                receiverId: ObjectId(x.user),
                                appointmentId: ObjectId(x._id)
                            });
                        }

                    }
                    console.log(dataToSave)
                    Models.ScheduledPushNotifications.insertMany(dataToSave, function (terr, tresult) {
                        //console.log("tresult.................",tresult)
                        //return true;
                    });
                    //return sendResponse.sendSuccessData(result,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });
            /*return res.status(200).json({
                status: 1,
                message: RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,
                data: data
            });*/
        } catch (err) {
            console.log("error in add edit professoinal facilities in user controller under controllers---", err);
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },

    // professional join facility using referral code
    joinFacility: async (req, res) => {
        req.headers.language = req.headers.language || 'en';
        try {
            let payload = req.body;

            //console.log("payload-----",payload)
            let resultData, resultPFData;
            //ADDED CODE FOR PARTNERS
            var userRole = await Models.Users.findOne({
                "joiningReferralCode": payload.joiningReferralCode
            } /*,{defaultLoginRole:1}*/ );
            var role = "FACILITY"
            if (userRole && userRole.defaultLoginRole != undefined) {
                role = userRole.defaultLoginRole;
            }
            //ADDED CODE FOR PARTNERS
            let criteria = {
                //"facility.joiningReferralCode": new RegExp('^' + payload.joiningReferralCode + '$'),
                //"facility.joiningReferralCode": payload.joiningReferralCode,
                joiningReferralCode: payload.joiningReferralCode,
                //role: {$elemMatch: {$eq: "FACILITY"}}
            }
            //console.log(role,"userRole",userRole)
            var populateData = {
                path: 'facility.services',
                query: {
                    status: "ACTIVE"
                }
            };
            if (role == "FACILITY") {
                criteria.role = {
                    $elemMatch: {
                        $eq: "FACILITY"
                    }
                };
            } else {
                populateData = {
                    path: 'professional.professionalSubSpeciality',
                    query: {
                        status: "ACTIVE"
                    }
                };
                criteria.$or = [{
                        role: {
                            $elemMatch: {
                                $eq: "PROFESSIONAL"
                            }
                        }
                    },
                    {
                        role: {
                            $elemMatch: {
                                $eq: "USER"
                            }
                        }
                    }
                ]
            }
            criteria.isDeleted = false
            //console.log("criteria-----",criteria)
            Models.Users.findOne(criteria, {
                    professional: 1,
                    facility: 1,
                    name: 1,
                    profilePic: 1,
                    address: 1
                }, {
                    lean: true
                })
                //.populate({path: 'facility.services', query: {status: "ACTIVE"}})
                .populate(populateData)
                .exec(async (err, result) => {
                    //console.log("----------------------", result)
                    //console.log(err, "refferalCode- find----", JSON.stringify(result));
                    if (err) return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                    if (!result) return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_FACILITY_CODE, {}, res);


                    console.log("userRole ==== ", userRole)
                    var partnersCountBeforeAction = await Models.ProfessionalFacilities.countDocuments({
                        facility: ObjectId(userRole._id),
                        status: "ACTIVE"
                    });

                    resultData = result;
                    let servicesData = [];
                    let serviceSpecialities = result.facility.services;
                    if (role != "FACILITY") {
                        serviceSpecialities = result.professional.professionalSubSpeciality;
                    }

                    if (serviceSpecialities && serviceSpecialities.length > 0) {
                        for (let i = 0; i < serviceSpecialities.length; i++) {
                            servicesData.push({
                                specialityName: serviceSpecialities[i].specialityName[req.headers.language],
                                _id: serviceSpecialities[i]._id
                            })
                        }
                    }

                    Models.ProfessionalFacilities.findOne({
                        "professional": ObjectId(userData._id),
                        "facility": resultData._id
                    }, {
                        isWholeWeekWorking: 1
                    }, async function (errPF, resultPF) {
                        /*console.log(resultPF);
                        console.log("resultPF resultPF resultPF resultPF ");*/
                        resultPFData = resultPF;
                        if (errPF) return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, errPF, res);
                        if (resultPFData && resultPFData.isWholeWeekWorking != undefined) {
                            return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.WORKING_HOUR_ALREADY_EXISTS, err, res);
                        } else {
                            if (!payload.workingHours) {
                                var user_data = resultData.facility;
                                if (role != "FACILITY") {
                                    user_data = resultData.professional;
                                }
                                //console.log(resultData,"----------------- user_data- -- -",user_data)
                                let data = {
                                    name: resultData.name,
                                    profilePic: resultData.profilePic,
                                    facility: {
                                        /*address: resultData.facility.address,
                                        workingHours: resultData.facility.workingHours,
                                        isWholeWeekWorking: resultData.facility.isWholeWeekWorking,*/
                                        address: resultData.address,
                                        workingHours: user_data.workingHours,
                                        isWholeWeekWorking: user_data.isWholeWeekWorking,
                                        services: servicesData
                                    },
                                    defaultLoginRole: role
                                }
                                return sendResponse.sendSuccessData(data, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.VALID_FACILITY_CODE, res);
                            }

                            let workingHours = typeof payload.workingHours === 'string' ? JSON.parse(payload.workingHours) : payload.workingHours;
                            payload.facilityServices = payload.facilityServices ? (typeof payload.facilityServices === 'string' ? JSON.parse(payload.facilityServices) : payload.facilityServices) : [];

                            let i = 0;
                            for (let day of workingHours) {
                                if (!day.working) {
                                    workingHours[i].slots = [];
                                    i++;
                                    continue;
                                }
                                let startTime = day.startTime;
                                let endTime = day.endTime;
                                /*let startTime = "01:00 AM";
                                let endTime = "03:00 PM";*/
                                var start = moment(startTime, 'hh:mm A');
                                var end = moment(endTime, 'hh:mm A');
                                start.minutes(Math.ceil(start.minutes() / 30) * 30);
                                var result = [];
                                var current = moment(start);
                                while (current <= end) {
                                    result.push(current.format('hh:mm A'));
                                    current.add(30, 'minutes');
                                }
                                let data = await UniversalFunction.convertTimeStringInMins(result);
                                data.splice(-1, 1)
                                //payload.workingHours[i].slots = data;
                                workingHours[i].slots = data;
                                i++;
                            }

                            //console.log("workingHours=========== ",workingHours)

                            let saveProfessionalWorkingHours = {
                                professional: userData._id,
                                facility: resultData._id,
                                workingHours: workingHours,
                                isWholeWeekWorking: payload.isWholeWeekWorking || false,
                                professionalCategory: userData.professional.serviceCategory
                            };

                            if (payload.facilityServices) {
                                saveProfessionalWorkingHours.facilityServices = payload.facilityServices;
                            }

                            Promise.all([
                                updateUser({
                                    $addToSet: {
                                        "professional.facilities": resultData._id
                                    }
                                }, {
                                    _id: userData._id
                                }),
                                saveWorkingHours(saveProfessionalWorkingHours)
                            ]).then(response => {

                                sendPush(
                                    Constants.NOTIFICATION_TYPE.JOIN_FACILITY,
                                    Constants.NOTIFICATION_TITLE.JOIN_FACILITY,
                                    Constants.NOTIFICATION_MESSAGE.JOIN_FACILITY,
                                    userRole._id, //rec
                                    req.credentials._id, //content // SENDING SENDERS ID IN CONTENT AS REQUESTED BY RISHI TO REDIRECT USER TO SENDER'S PROFILE PAGE - 31DEC
                                    req.credentials._id //sender
                                )

                                Models.ProfessionalFacilities.countDocuments({
                                    facility: ObjectId(userRole._id),
                                    status: "ACTIVE"
                                }, function (partnerErr, partnersCount) {


                                    if ((role == "FACILITY" && partnersCount > 0) || (role != "FACILITY" && partnersCount > 1 /*4*/ )) {
                                        var championValue = "4";
                                        if (role == "FACILITY") {
                                            championValue = "5";
                                        }
                                        Models.Users.updateOne({
                                            "_id": ObjectId(userRole._id)
                                        }, {
                                            isChampion: championValue
                                        }, async function (e, r) {
                                            var pushTitle = "",
                                                pushMessage = "",
                                                sendPushNotif = "0";
                                            if ((role == "FACILITY" && partnersCountBeforeAction == 1 && partnersCount == 0) || (role != "FACILITY" && partnersCountBeforeAction == 5 && partnersCount == 4)) {
                                                pushTitle = Constants.NOTIFICATION_TITLE.NOT_USER_CHAMPION
                                                pushMessage = Constants.NOTIFICATION_MESSAGE.NOT_USER_CHAMPION
                                                sendPushNotif = "1"
                                            } else if ((role == "FACILITY" && partnersCountBeforeAction == 0 && partnersCount == 1) || (role != "FACILITY" && partnersCountBeforeAction == 4 && partnersCount == 5)) {
                                                pushTitle = Constants.NOTIFICATION_TITLE.USER_CHAMPION
                                                pushMessage = Constants.NOTIFICATION_MESSAGE.USER_CHAMPION
                                                sendPushNotif = "2"
                                            }
                                            if (sendPushNotif == "1" || sendPushNotif == "2") {
                                                sendPush(
                                                    Constants.NOTIFICATION_TYPE.USER_CHAMPION,
                                                    pushTitle,
                                                    pushMessage,
                                                    userRole._id, //rec
                                                    userRole._id, //content
                                                    req.credentials._id //sender
                                                )
                                            }
                                        });

                                    }


                                })
                                return sendResponse.sendSuccessData({}, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                            }).catch(err => {
                                return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                            })
                        } // already exists check else ends here
                    }); //END - Models.ProfessionalFacilities.findOne()
                });
        } catch (err) {
            console.log('error in join facility in user controllers under controllers----', err);
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },

    // professional facilities with distance from location
    getProfessionalFacilities: async (req, res) => {
        try {
            //console.log("professionalFacilities----", userData, req.query);
            var obj = req.query;
            console.log("obj...", obj)
            console.log("req.headers...", req.headers)
            let long = parseFloat(obj.long),
                lat = parseFloat(obj.lat);

            let professionalFacilitiesIds = await Models.Users.findOne({
                "_id": ObjectId(obj.userId)
            }, {
                "professional.facilities": 1,
                _id: 0
            });
            let output = [];
            if (professionalFacilitiesIds && professionalFacilitiesIds.professional && professionalFacilitiesIds.professional.facilities && (professionalFacilitiesIds.professional.facilities).length > 0) {
                for (let x of professionalFacilitiesIds.professional.facilities) {
                    output.push(ObjectId(x))
                }
            }
            /*console.log(professionalFacilitiesIds.professional.facilities)
            console.log(output)
            console.log({_id: {$in: output}})*/

            Models.Users.aggregate([{
                    $geoNear: {
                        near: {
                            type: "Point",
                            coordinates: [long, lat] || [0, 0]
                        },
                        distanceField: "distance",
                        //num: parseInt(req.query.limit) || 20,
                        //query: {_id: {$in: userData.professional.facilities}},
                        query: {
                            _id: {
                                $in: output
                            }
                        },
                        spherical: true
                    }
                }, {
                    $lookup: {
                        from: "professionalfacilities",
                        let: {
                            facility: '$_id'
                        },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [{
                                            $eq: ["$facility", "$$facility"]
                                        },
                                        {
                                            $eq: ["$professional", ObjectId(obj.userId)]
                                        },
                                        // {$eq: ["$professionalCategory", ObjectId("5cfe53de3952e9155c789998")]},
                                        {
                                            $eq: ["$status", "ACTIVE"]
                                        }
                                    ]
                                }
                            }
                        }],
                        as: 'professionalFacility'
                    }
                },
                {
                    $unwind: "$professionalFacility"
                },
                {
                    $lookup: {
                        from: "professionalspecialities",
                        let: {
                            userId: '$facility.facilityType'
                        },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [{
                                            $eq: ["$_id", "$$userId"]
                                        },
                                        {
                                            $eq: ["$isActive", true]
                                        }
                                    ]
                                }
                            }
                        }],
                        as: 'facility.facilityType'
                    }
                },
                {
                    "$unwind": {
                        "path": "$facility.facilityType",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $graphLookup: {
                        from: "professionalspecialities",
                        startWith: "$facility.services",
                        connectFromField: "_id",
                        connectToField: "_id",
                        as: "facility.services"
                    }
                },
                {
                    $graphLookup: {
                        from: "professionalspecialities",
                        startWith: "$professional.professionalSpeciality",
                        connectFromField: "_id",
                        connectToField: "_id",
                        as: "professional.professionalSpeciality"
                    }
                },
                {
                    $graphLookup: {
                        from: "professionalspecialities",
                        startWith: "$professionalFacility.facilityServices",
                        connectFromField: "_id",
                        connectToField: "_id",
                        as: "professionalFacility.facilityServices"
                    }
                },
                {
                    $project: {
                        name: 1,
                        distance: 1,
                        location: 1,
                        profilePic: 1,
                        defaultLoginRole: 1,
                        address: 1,
                        "facility.workingHours": 1,
                        "facility.isWholeWeekWorking": 1,
                        "professional.workingHours": 1,
                        "professional.isWholeWeekWorking": 1,
                        //"facility.facilityType": 1,
                        "facility.facilityType": {
                            _id: 1,
                            specialityName: "$facility.facilityType.specialityName." + req.headers.language,
                            specialist: "$facility.facilityType.specialist." + req.headers.language,
                        },
                        "professionalFacility.workingHours": 1,
                        "professionalFacility.isWholeWeekWorking": 1,
                        "facility.services": {
                            $map: {
                                "input": "$facility.services",
                                "as": "option",
                                in: {
                                    specialityName: "$$option.specialityName." + req.headers.language,
                                    _id: "$$option._id",

                                }
                            }
                        },
                        "professional.services": {
                            $map: {
                                "input": "$professional.professionalSpeciality",
                                "as": "option",
                                in: {
                                    specialityName: "$$option.specialityName." + req.headers.language,
                                    _id: "$$option._id",

                                }
                            }
                        },
                        "professionalFacility.facilityServices": {
                            $map: {
                                "input": "$professionalFacility.facilityServices",
                                "as": "option",
                                in: {
                                    specialityName: "$$option.specialityName." + req.headers.language,
                                    _id: "$$option._id",

                                }
                            }
                        }
                    }
                }, {
                    $sort: {
                        _id: -1
                    }
                }
            ], (err, response) => {
                if (err) return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);

                return sendResponse.sendSuccessData(response, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
            });
        } catch (err) {
            console.log('error in professional Facilities in user controllers under controllers----', err);
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },

    // update professional facilities
    addEditProfessionalFacility: async (req, res) => {
        const payload = req.body;
        try {
            //console.log("add edit professional facility---", userData._id, payload);
            console.log("payload---------", payload)
            if (typeof payload.workingHours === "string") payload.workingHours = JSON.parse(payload.workingHours);
            payload.facility = ObjectId(payload.facility);
            console.log("payload---------", payload)
            payload.facilityServices = payload.facilityServices ? (typeof payload.facilityServices === 'string' ? JSON.parse(payload.facilityServices) : payload.facilityServices) : [];


            let i = 0;
            for (let day of payload.workingHours) {
                let startTime = day.startTime;
                let endTime = day.endTime;
                /*let startTime = "01:00 AM";
                let endTime = "03:00 PM";*/
                var start = moment(startTime, 'hh:mm A');
                var end = moment(endTime, 'hh:mm A');
                start.minutes(Math.ceil(start.minutes() / 30) * 30);
                var result = [];
                var current = moment(start);
                while (current <= end) {
                    result.push(current.format('hh:mm A'));
                    current.add(30, 'minutes');
                }
                let data = await UniversalFunction.convertTimeStringInMins(result);
                data.splice(-1, 1)
                payload.workingHours[i].slots = data;
                i++;
            }

            // console.log( userData._id, payload.facility);


            Models.ProfessionalFacilities.findOneAndUpdate({
                    professional: userData._id,
                    facility: payload.facility
                }, {
                    $set: payload
                }, {
                    new: true,
                    lean: true
                })
                .then(response => {
                    //   console.log(response);
                    return sendResponse.sendSuccessData({}, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                })
                .catch(err => {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                })
        } catch (err) {
            console.log("error in add edit professoinal facilities in user controller under controllers---", err);
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },

    // set working hours for user i.e. facility or professional
    workingHours: async (req, res) => {
        try {
            let payload = req.body;
            let DataToSet;
            //console.log("working hours---");
            if (!req.body.workingHours) return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, {}, res);

            /*let data = await UniversalFunction.convertTimeStringInMins(["00:30 AM","01:00 AM","01:30 AM","02:00 AM","02:30 AM"]); */

            if (typeof payload.workingHours === "string") payload.workingHours = JSON.parse(payload.workingHours);


            let i = 0;
            for (let day of payload.workingHours) {
                let startTime = day.startTime;
                let endTime = day.endTime;
                /*let startTime = "01:00 AM";
                let endTime = "03:00 PM";*/
                var start = moment(startTime, 'hh:mm A');
                var end = moment(endTime, 'hh:mm A');
                start.minutes(Math.ceil(start.minutes() / 30) * 30);
                var result = [];
                var current = moment(start);
                while (current <= end) {
                    result.push(current.format('hh:mm A'));
                    current.add(30, 'minutes');
                }
                let data = await UniversalFunction.convertTimeStringInMins(result);
                data.splice(-1, 1)
                payload.workingHours[i].slots = data;
                i++;
            }


            if (payload.role == "PROFESSIONAL") {
                DataToSet = {
                    $set: {
                        "professional.workingHours": payload.workingHours,
                        "professional.isWholeWeekWorking": payload.isWholeWeekWorking || false
                    }
                };
            } else if (payload.role == "FACILITY") {
                DataToSet = {
                    $set: {
                        "facility.workingHours": payload.workingHours,
                        "facility.isWholeWeekWorking": payload.isWholeWeekWorking || false
                    }
                };
            }
            //Models.Users.findOneAndUpdate({_id: userData._id, role: {$elemMatch: {$eq: "PROFESSIONAL"}}},
            Models.Users.findOneAndUpdate({
                        _id: userData._id,
                        role: {
                            $elemMatch: {
                                $eq: payload.role
                            }
                        }
                    },
                    DataToSet, {
                        new: true,
                        lean: true
                    })
                .then(response => {
                    return sendResponse.sendSuccessData(response.professional.workingHours, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                })
                .catch(err => {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                });
        } catch (err) {
            console.log("error in working hours in user controller under controllers----", err);
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },

    // manage availability tab for userz
    manageAvailability: async (req, res) => {
        try {

            let payload = req.body,
                slots = [];
            console.log(payload, "-----------------------------", req.headers)

            if (typeof payload.notAvailableOn === "string") payload.notAvailableOn = JSON.parse(payload.notAvailableOn);

            let createAppointment = {
                user: userData._id,
                doctor: userData._id,
                type: Constants.DATABASE.APPOINTMENT.SELF,
                slots,
                selfAppointment: {
                    dates: payload.notAvailableOn && payload.notAvailableOn.dates || [],
                    endTime: "",
                    startTime: "",
                    isAllDay: true
                }
            };
            console.log("manage availability----", payload);

            // let slots = [];
            console.log("payload.notAvailableOn ------------------ ", payload.notAvailableOn)
            if (payload.notAvailableOn && payload.notAvailableOn.startTime && payload.notAvailableOn.endTime) {

                console.log("$$$$$$$$$$$$$$$$$$$$$ 1111111111111222222222222")
                let timeInMinutes = await Promise.all([
                    UniversalFunction.convertTimeStringInMins([payload.notAvailableOn.startTime]),
                    UniversalFunction.convertTimeStringInMins([payload.notAvailableOn.endTime])
                ]);

                let current = timeInMinutes[0][0];
                while (current <= timeInMinutes[1][0]) {
                    slots.push(current);
                    current += 30;
                }
                slots.splice(-1, 1)
                createAppointment = {
                    user: userData._id,
                    doctor: userData._id,
                    type: Constants.DATABASE.APPOINTMENT.SELF,
                    slots,
                    selfAppointment: payload.notAvailableOn
                };

                //await queries.saveData(Models.Appointment, createAppointment);
                /*await queries.findAndUpdate(Models.Appointment, {_id: userData._id},
                    {$set: createAppointment},
                    {new: true, lean: true}
                )*/
                console.log("{$set: createAppointment}----", createAppointment);

                // let updatedata = await Models.Appointment.updateOne({_id: userData._id}, {$set: createAppointment}, {upsert: true,new: true, lean: true});
                //console.log("updatedata =============== ",updatedata )
            }

            if (payload.notAvailableOn) await Models.Appointment.updateOne({
                doctor: userData._id,
                user: userData._id
            }, {
                $set: createAppointment
            }, {
                upsert: true,
                new: true,
                lean: true
            });



            // let result = [
            await queries.findAndUpdate(Models.Users, {
                _id: userData._id
            }, {
                $set: payload
            }, {
                new: true,
                lean: true
            })
            // ];

            return sendResponse.sendSuccessData({}, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);

            // Models.Users.findOneAndUpdate({_id: userData._id},
            //     {$set: payload},
            //     {new: true, lean: true})
            //     .then(response => {
            //         res.status(200).json({
            //             status: 1,
            //             message: RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,
            //             data: {}
            //         })
            //     })
            //     .catch(err => {
            //         return res.status(400).json({
            //             status: 0,
            //             message: RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,
            //             data: err
            //         });
            //     })
        } catch (err) {
            console.log("error in manage availability in user controller under controllers----", err);
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },

    // facility professionals
    facilityProfessionals: async (req, res) => {
        try {
            let queryData = req.query;
            var criteria = {
                //professionalCategory: ObjectId(queryData.serviceCategory),
                facility: ObjectId(queryData.facility),
                status: "ACTIVE"
            }
            if (queryData.serviceCategory) {
                criteria.professionalCategory = ObjectId(queryData.serviceCategory);
            }

            if (queryData.lastId && queryData.lastId != "") {
                criteria._id = {
                    $lt: ObjectId(queryData.lastId)
                }
            } //FOR PAGINATION

            if (is.undefined(queryData.count) || is.empty(queryData.count)) {
                queryData.count = 100;
            } else {
                queryData.count = Number(queryData.count);
            } //FOR PAGINATION


            var searchMatch = {
                $match: {}
            }
            if (queryData.keyword && queryData.keyword != "") {
                searchMatch = {
                    $match: {
                        "professional.name": {
                            '$regex': ".*" + queryData.keyword + ".*",
                            '$options': 'i'
                        }
                    }
                }
            }

            let servicesList = await Models.ProfessionalFacilities.aggregate([{
                    $match: criteria
                },
                {
                    $lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "professional",
                        as: 'professional'
                    }
                },
                {
                    "$unwind": {
                        "path": "$professional",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                searchMatch,
                {
                    $lookup: {
                        from: "professionalspecialities",
                        let: {
                            userId: '$professional.professional.professionalSubSpeciality'
                        },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [
                                        //{$in: ["$_id", "$$userId"]},
                                        {
                                            $in: ["$_id", {
                                                $ifNull: ['$$userId', []]
                                            }]
                                        },
                                        {
                                            $eq: ["$isActive", true]
                                        }
                                    ]
                                }
                            }
                        }],
                        as: 'professional.professional.professionalSubSpeciality'
                    }
                },

                {
                    $lookup: {
                        from: "professionalspecialities",
                        let: {
                            userId: '$professional.professional.professionalSpeciality'
                        },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [{
                                            $eq: ["$_id", "$$userId"]
                                        },
                                        {
                                            $eq: ["$isActive", true]
                                        }
                                    ]
                                }
                            }
                        }],
                        as: 'professional.professional.professionalSpeciality'
                    }
                },
                {
                    "$unwind": {
                        "path": "$professional.professional.professionalSpeciality",
                        "preserveNullAndEmptyArrays": true
                    }
                },


                {
                    $lookup: {
                        from: "professionaltypes",
                        let: {
                            userId: '$professional.professional.professionalType'
                        },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [{
                                            $eq: ["$_id", "$$userId"]
                                        },
                                        {
                                            $eq: ["$isActive", true]
                                        }
                                    ]
                                }
                            }
                        }],
                        as: 'professional.professional.professionalType'
                    }

                },
                {
                    "$unwind": {
                        "path": "$professional.professional.professionalType",
                        "preserveNullAndEmptyArrays": true
                    }
                },

                {
                    $lookup: {
                        from: "servicecategories",
                        let: {
                            userId: '$professional.professional.serviceCategory'
                        },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [{
                                            $eq: ["$_id", "$$userId"]
                                        },
                                        {
                                            $eq: ["$isActive", true]
                                        },
                                        //{$eq: ["$isDeleted", false]}
                                    ]
                                }
                            }
                        }],
                        as: 'professional.professional.serviceCategory'
                    }
                },
                {
                    "$unwind": {
                        "path": "$professional.professional.serviceCategory",
                        "preserveNullAndEmptyArrays": true
                    }
                },

                {
                    $project: {
                        professional: {
                            _id: 1,
                            profilePic: 1,
                            coverPic: 1,
                            user: 1,
                            facility: 1,
                            name: 1,
                            professional: {
                                "professionalSubSpeciality": {
                                    $map: {
                                        "input": "$professional.professional.professionalSubSpeciality",
                                        "as": "option",
                                        in: {
                                            specialityName: "$$option.specialityName." + req.headers.language,
                                            _id: "$$option._id",

                                        }
                                    }
                                },
                                professionalSpeciality: {
                                    _id: 1,
                                    specialityIcon: 1,
                                    specialityName: "$professional.professional.professionalSpeciality.specialityName." + req.headers.language,
                                    specialist: "$professional.professional.professionalSpeciality.specialist." + req.headers.language,
                                },
                                professionalType: {
                                    _id: 1,
                                    typeName: "$professional.professional.professionalType.typeName." + req.headers.language,
                                    isActive: 1
                                },
                                serviceCategory: {
                                    _id: 1,
                                    serviceName: "$professional.professional.serviceCategory.serviceName." + req.headers.language,
                                    templateType: 1,
                                    visible: 1
                                },
                            }
                        }

                    }
                }
            ]);

            /*Models.ProfessionalFacilities
            .find(criteria,{professional: 1}, {sort: {_id: -1}, limit: queryData.count})
            .populate({path: 'professional', select: "profilePic coverPic user facility ", query: {status: "ACTIVE"}})
            .then(response => {
                return sendResponse.sendSuccessData(response,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
            })*/
            return sendResponse.sendSuccessData(servicesList, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
            /*.catch(err => {
                return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,err,res);
            });*/
        } catch (err) {
            console.log("error in facility professionals in user controller under controllers---", err);
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    logout: async (req, res) => {
        try {
            var obj = req.body;
            let result = await Models.Users.findOneAndUpdate({
                "_id": ObjectId(userData._id)
            }, {
                "accessToken": "",
                "deviceToken": ""
            }, {
                projection: {
                    "assignment": 1,
                    "points": 1,
                    "mirrorFlyToken": 1,
                    "mirrorFlyAccessToken": 1
                }
            });
            if (!result) {
                return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, {}, res);
            } else {
                let data = await mirrorFlyAPI.logout({
                    "token": obj.mirrorFlyToken
                })
                // let dataNew = await mirrorFlyAPI.logout({
                //     "token": result.mirrorFlyTokenConsult
                // })
                return sendResponse.sendSuccessData({}, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
            }
        } catch (err) {
            console.log("error in facility professionals in user controller under controllers---", err);
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    getNotifications: async (req, res) => {
        try {
            let obj = req.query;
            let err = [];
            let criteria = {
                "isDeleted": false,
                "receiverId": ObjectId(userData._id)
            }
            if (obj.lastId && obj.lastId != "") {
                criteria._id = {
                    $lt: ObjectId(obj.lastId)
                }
            } //FOR PAGINATION
            if (is.undefined(obj.count) || is.empty(obj.count)) {
                obj.count = 100;
            } else {
                obj.count = Number(obj.count);
            } //FOR PAGINATION
            Models.Notification.aggregate([{
                    $match: criteria
                },
                {
                    $lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "senderId",
                        as: 'senderId'
                    }
                },
                {
                    "$unwind": {
                        "path": "$senderId",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $project: {
                        _id: 1,
                        message: "$message." + req.headers.language,
                        type: 1,
                        isRead: 1,
                        senderId: {
                            name: 1,
                            profilePic: 1,
                            coverPic: 1,
                            defaultLoginRole: 1
                        },
                        title: 1,
                        createdAt: 1,
                        appointmentId: 1,
                        contentId: 1,
                        postType: 1
                    }
                },
                {
                    $sort: {
                        _id: -1
                    }
                },
                {
                    $limit: obj.count
                }
            ], function (err, result) {
                if (err) {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                } else {
                    console.log("11111111")
                    Models.Notification.update({
                        "receiverId": ObjectId(userData._id),
                        "isRead": false
                    }, {
                        isRead: true
                    }, {
                        multi: true
                    }, function (e, r) {
                        console.log(e, "3333333333", r)
                    });
                    console.log("22222222")
                    return sendResponse.sendSuccessData(result, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                }
            });
        } catch (err) {
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },

    help: async (req, res) => {
        try {

            let rescuer = await Models.Users.findOne({
                "_id": ObjectId(userData._id)
            }, {
                rescuerId: 1,
                name: 1
            });
            console.log("rescuer- ----- ", rescuer)
            if (!rescuer) {
                return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, {}, res);
            } else {
                if (rescuer != null && rescuer.rescuerId != undefined && rescuer.rescuerId != null) {
                    await sendPush(
                        Constants.NOTIFICATION_TYPE.HELP,
                        Constants.NOTIFICATION_TITLE.HELP,
                        Constants.NOTIFICATION_MESSAGE.HELP,
                        rescuer.rescuerId, // receiver id
                        rescuer.rescuerId, //content id
                        req.credentials._id, //sender id
                        rescuer.name
                    )
                    return sendResponse.sendSuccessData({}, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                } else {
                    return sendResponse.sendErrorMessageData(200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.RESCUER_NOT_FOUND, {}, res);
                }
            }
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    partnersAppointment: async (req, res) => {
        try {
            var obj = req.query
            var criteria1 = {
                facility: ObjectId(userData._id),
                status: "ACTIVE"
            }
            var decryptColumns = ['fileId'];
            var decryptColumns2 = ['feedback'];

            let partnerIds = await Models.ProfessionalFacilities.find(criteria1, {
                professional: 1,
                _id: 0
            });
            if (partnerIds && partnerIds.length > 0) {
                let output = [];
                for (let x of partnerIds) {
                    output.push(ObjectId(x.professional))
                }

                let criteria = {};
                criteria = {
                    doctor: {
                        "$in": output
                    },
                    type: {
                        $ne: "SELF"
                    }
                };


                if (obj.lastId && obj.lastId != "") {
                    criteria._id = {
                        $lt: ObjectId(obj.lastId)
                    }
                } //FOR PAGINATION
                if (is.undefined(obj.count) || is.empty(obj.count)) {
                    obj.count = 100;
                } else {
                    obj.count = Number(obj.count);
                } //FOR PAGINATION

                if (obj.bookingType) {
                    criteria.type = obj.bookingType;
                }




                if (obj.startDate && obj.endDate) {
                    var startDate = obj.startDate;
                    var endDate = obj.endDate;

                    criteria.$or = [{
                            "type": "HOME",
                            $or: [{
                                    "homeService.type": "EVERYDAY",
                                    //"homeService.everyDayOrCustom": {$elemMatch: {$lte:endDate}} 
                                    "homeService.everyDayOrCustom": {
                                        $gte: startDate,
                                        $lte: endDate
                                    },
                                },
                                {
                                    "homeService.type": "CUSTOM",
                                    "homeService.everyDayOrCustom": {
                                        $gte: startDate,
                                        $lte: endDate
                                    } /*{$elemMatch: {$lte:endDate}} */
                                },
                                {
                                    "homeService.type": "WEEKLY",
                                    "homeService.weeklyDates.dayWiseDates": {
                                        $gte: startDate,
                                        $lte: endDate
                                    } /*{$elemMatch: {$lte:endDate}}*/
                                }
                            ]
                        },
                        {
                            "type": "ONLINE",
                            "scheduledService.date": {
                                $gte: startDate,
                                $lte: endDate
                            } /*{$lte:endDate}*/
                        },
                        {
                            "type": "ONSITE",
                            "scheduledService.date": {
                                $gte: startDate,
                                $lte: endDate
                            } /*{$lte:endDate}*/
                        }
                    ]

                } else
                if (obj.startDate) {
                    var startDate = obj.startDate;
                    criteria.$or = [{
                            "type": "HOME",
                            $or: [{
                                    "homeService.type": "EVERYDAY",
                                    "homeService.everyDayOrCustom": {
                                        $gte: startDate
                                    }
                                },
                                {
                                    "homeService.type": "CUSTOM",
                                    "homeService.everyDayOrCustom": {
                                        $gte: startDate
                                    }
                                },
                                {
                                    "homeService.type": "WEEKLY",
                                    "homeService.weeklyDates.dayWiseDates": {
                                        $gte: startDate
                                    }
                                }
                            ]
                        },
                        {
                            "type": "ONLINE",
                            "scheduledService.date": {
                                $gte: startDate
                            }
                        },
                        {
                            "type": "ONSITE",
                            "scheduledService.date": {
                                $gte: startDate
                            }
                        }
                    ]
                } else
                if (obj.endDate) {
                    var endDate = obj.endDate;
                    criteria.$or = [{
                            "type": "HOME",
                            $or: [{
                                    "homeService.type": "EVERYDAY",
                                    "homeService.everyDayOrCustom": {
                                        $lte: endDate
                                    }
                                },
                                {
                                    "homeService.type": "CUSTOM",
                                    "homeService.everyDayOrCustom": {
                                        $lte: endDate
                                    }
                                },
                                {
                                    "homeService.type": "WEEKLY",
                                    "homeService.weeklyDates.dayWiseDates": {
                                        $lte: endDate
                                    }
                                }
                            ]
                        },
                        {
                            "type": "ONLINE",
                            "scheduledService.date": {
                                $lte: endDate
                            }
                        },
                        {
                            "type": "ONSITE",
                            "scheduledService.date": {
                                $lte: endDate
                            }
                        }
                    ]
                }

                let aggregate = [{
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
                    {
                        "$unwind": {
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
                    {
                        "$unwind": {
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
                            user: {
                                _id: 1,
                                profilePic: 1,
                                coverPic: 1,
                                name: 1,
                                user: {
                                    dob: 1
                                }
                            },
                            rating: {
                                "isRating": {
                                    $cond: [{
                                        $not: "$rating.rating"
                                    }, false, true]
                                },
                                rating: {
                                    $cond: [{
                                        $not: "$rating.rating"
                                    }, 0, "$rating.rating"]
                                },
                                feedback: {
                                    $cond: [{
                                        $not: "$rating.feedback"
                                    }, "", "$rating.feedback"]
                                },

                            }
                        }
                    },
                    {
                        $sort: {
                            _id: -1
                        }
                    },
                    {
                        $limit: obj.count
                    }
                ];
                console.log("aggregate --------------- ", JSON.stringify(aggregate))
                let appntments = await Models.Appointment.aggregate(aggregate);


                if (process.env.ENABLE_DB_ENCRYPTION == "1" && appntments.length > 0) {
                    for (let x in appntments) {
                        await decryptDBData(appntments[x].rating, decryptColumns2);
                    }
                }
                return sendResponse.sendSuccessData(appntments, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res, decryptColumns);
            } else {
                return sendResponse.sendSuccessData([], 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
            }

        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    partnersPastTasks: async (req, res) => {
        try {
            let obj = req.query;
            var sortBy = {
                "_id": -1
            };
            var criteria1 = {
                facility: ObjectId(userData._id),
                status: "ACTIVE"
            }
            var decryptColumns = ['fileId'];
            let partnerIds = await Models.ProfessionalFacilities.find(criteria1, {
                professional: 1,
                _id: 0
            });
            console.log("partnerIds ----------- ", partnerIds)
            if (!partnerIds || partnerIds.length == 0) {
                return sendResponse.sendSuccessData([], 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
            }

            let output = [];
            for (let x of partnerIds) {
                output.push(ObjectId(x.professional))
            }
            console.log("output ----------- ", output)

            let criteria = {
                "professionalId": {
                    "$in": output
                },
                "isDeleted": false,
                $or: [{
                    "status": "3"
                }, {
                    "status": "4"
                }]
            }
            console.log("criteria ----------- ", criteria)
            if (is.undefined(obj.count) || is.empty(obj.count)) {
                obj.count = 100;
            } else {
                obj.count = Number(obj.count);
            }
            if (obj.lastId) {
                criteria._id = {
                    $lt: ObjectId(obj.lastId)
                };
            }

            if (obj.taskType) {
                criteria.taskType = ObjectId(obj.taskType);
            }
            if (obj.sortBy && obj.sortBy == "0") {
                sortBy = {
                    "sortBy": 1
                };
            } else if (obj.sortBy && obj.sortBy == "1") {
                sortBy = {
                    "sortBy": -1
                };
            }

            let aggregate = [{
                    $match: criteria
                },


                {
                    $lookup: {
                        from: "appointments",
                        let: {
                            userId: '$patientId',
                            doctorId: '$professionalId'
                        },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [{
                                            $eq: ["$user", "$$userId"]
                                        },
                                        {
                                            $eq: ["$doctor", "$$doctorId"]
                                        }
                                    ]
                                }
                            }
                        }],
                        as: 'appointments'
                    }
                },
                {
                    "$unwind": {
                        "path": "$appointments",
                        "preserveNullAndEmptyArrays": true
                    }
                },

                {
                    $lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "patientId",
                        as: 'patientId'
                    }
                },
                {
                    "$unwind": {
                        "path": "$patientId",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "facilityId",
                        as: 'facilityId'
                    }
                },
                {
                    "$unwind": {
                        "path": "$facilityId",
                        "preserveNullAndEmptyArrays": true
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "assignedById",
                        as: 'assignedById'
                    }
                },
                {
                    "$unwind": {
                        "path": "$assignedById",
                        "preserveNullAndEmptyArrays": true
                    }
                },



                {
                    $lookup: {
                        from: "professionalspecialities",
                        let: {
                            userId: '$assignedById.professional.professionalSpeciality'
                        },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [{
                                            $eq: ["$_id", "$$userId"]
                                        },
                                        {
                                            $eq: ["$isActive", true]
                                        }
                                    ]
                                }
                            }
                        }],
                        as: 'assignedById.professional.professionalSpeciality'
                    }
                },
                {
                    "$unwind": {
                        "path": "$assignedById.professional.professionalSpeciality",
                        "preserveNullAndEmptyArrays": true
                    }
                },

                {
                    $lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "professionalId",
                        as: 'professionalId'
                    }
                },
                {
                    "$unwind": {
                        "path": "$professionalId",
                        "preserveNullAndEmptyArrays": true
                    }
                },


                {
                    $lookup: {
                        from: "professionalspecialities",
                        let: {
                            userId: '$professionalId.professional.professionalSpeciality'
                        },
                        pipeline: [{
                            $match: {
                                $expr: {
                                    $and: [{
                                            $eq: ["$_id", "$$userId"]
                                        },
                                        {
                                            $eq: ["$isActive", true]
                                        }
                                    ]
                                }
                            }
                        }],
                        as: 'professionalId.professional.professionalSpeciality'
                    }
                },
                {
                    "$unwind": {
                        "path": "$professionalId.professional.professionalSpeciality",
                        "preserveNullAndEmptyArrays": true
                    }
                },

                {
                    $lookup: {
                        from: "commonservicetypes",
                        foreignField: "_id",
                        localField: "taskType",
                        as: 'taskType'
                    }
                },
                {
                    "$unwind": {
                        "path": "$taskType",
                        "preserveNullAndEmptyArrays": true
                    }
                },

                {
                    $unwind: "$taskType.title"
                },
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
                            professional: {
                                professionalSpeciality: {
                                    _id: 1,
                                    specialityIcon: 1,
                                    specialityName: "$assignedById.professional.professionalSpeciality.specialityName." + req.headers.language,
                                    specialist: "$assignedById.professional.professionalSpeciality.specialist." + req.headers.language,
                                }
                            }
                        },
                        professionalId: {
                            _id: 1,
                            name: 1,
                            profilePic: 1,
                            coverPic: 1,
                            defaultLoginRole: 1,
                            professional: {
                                professionalSpeciality: {
                                    _id: 1,
                                    specialityIcon: 1,
                                    specialityName: "$professionalId.professional.professionalSpeciality.specialityName." + req.headers.language,
                                    specialist: "$professionalId.professional.professionalSpeciality.specialist." + req.headers.language,
                                }
                            }
                        },
                        createdAt: 1,
                        taskType: {
                            _id: 1,
                            name: "$taskType.title.name"
                        },
                        fileId: {
                            $cond: {
                                if: {
                                    $ne: [{
                                        $type: "$appointments.fileId"
                                    }, 'missing']
                                },
                                then: "$appointments.fileId",
                                else: ""
                            }
                        }
                    }
                },
                //{ $sort: {_id: -1} },
                {
                    $sort: sortBy
                },
                {
                    $limit: obj.count
                }
            ];
            Models.TeamTasks.aggregate(aggregate, (err, result) => {
                if (err) {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                } else {
                    return sendResponse.sendSuccessData(result, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res, decryptColumns);
                }
            });
        } catch (err) {
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },

    appVersioning: (req, res) => {
        try {
            var obj = req.query;
            var forceUpdate = false,
                softUpdate = false;
            if (obj.deviceType == "ANDROID") {
                if (obj.appVersion < process.env.androidHardUpdate) {
                    forceUpdate = true;
                    softUpdate = false;
                } else if (obj.appVersion < process.env.androidSoftUpdate) {
                    forceUpdate = false;
                    softUpdate = true;
                }
            } else if (obj.deviceType == "IOS") {
                if (obj.appVersion < process.env.iosHardUpdate) {
                    forceUpdate = true;
                    softUpdate = false;
                } else if (obj.appVersion < process.env.iosSoftUpdate) {
                    forceUpdate = false;
                    softUpdate = true;
                }
            }
            return sendResponse.sendSuccessData({
                "forceUpdate": forceUpdate,
                "softUpdate": softUpdate
            }, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },

    testapiSave: (req, res) => {
        try {
            var tt = new Models.TestTable({
                companyName: {
                    en: "Test name two",
                    ar: "اسم الاختبار اثنين"
                }
            })
            tt.save(function (err, result) {
                return sendResponse.sendSuccessData(result, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
            });
        } catch (err) {
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    testapiGet: async (req, res) => {
        try {


            /*var XLSX = require('xlsx')
            var workbook = XLSX.readFile('simpletabulation.xlsx');
            var sheet_name_list = workbook.SheetNames;
            var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
            //console.log(xlData);

            let newData = [];
            let formatted  = {};
            for(let data of xlData){
                if(data.Code!="" && data.Code!=undefined){
                    formatted = await formatJsonData(data);
                    formatted = {
                                    "title" : [
                                        {
                                            "name" : formatted.code + " - " + formatted.title,
                                            "type" : "en"
                                        },
                                        {
                                            "name" : formatted.code + " - " + formatted.title,
                                            "type" : "ar"
                                        }
                                    ],
                                    "type" : "diagnosis"
                                }
                    newData.push(formatted);
                }
            }

            console.log("------------- ",newData.length);
            return res.status(200).json({status: 0, message: "done", data:newData});*/





            /*function NumberInt(data){return "NumberInt("+data+")"}
            function ISODate(data){return "ISODate("+data+")"}
            function ObjectId(data){return "ObjectId("+data+")"}
            var obj = [


]
console.log(obj.length)
let newData = [];
let formatted = {};
for(let data of obj){
    formatted = await formatJsonData(data);
    newData.push(formatted);
    //console.log("data -- ",data)
}
console.log(newData.length)
            return res.status(200).json({status: 0, message: "done", data:newData});*/



            /*console.log("req.headers.language----------",req.headers.language)
            let lang = req.headers.language;
            var match={};
            let keyword = "Name";
            match['companyName.'+lang] = {'$regex': ".*" + keyword + ".*", '$options': 'i'};
            let criteria = [{
                $match: match
            }, {
                $project: {
                    companyName:"$companyName."+lang,
                    isActive:1,
                    isDeleted:1,
                }
            }]
            Models.TestTable.aggregate(criteria, function (err, result) {
                if (err) {
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,err,res);
                } else {
                    return sendResponse.sendSuccessData(result,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });*/
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    dashboardData: async (req, res) => {
        try {
            let id = ObjectId(userData._id);
            let dataToSend = {};
            var dataCount = {
                getCount: 1
            }
            await Promise.all([
                    /*0*/
                    bookingsMadeCount(id, "1"),
                    /*1*/
                    bookingsReceivedCount(id, "1"),
                    /*2*/
                    todayBookingsReceivedCount(id),
                    /*3*/
                    bookingsReceivedCount(id, "2"),
                    /*4*/
                    totalTeamMembers(id),
                    /*5*/
                    pendingActions(id),

                    /*6*/
                    professionalsTasksCount(id, "1"), //1 - my tasks count
                    /*7*/
                    professionalsTasksCount(id, "2"), //2 - my past tasks count
                    /*8*/
                    professionalsTasksCount(id, "3"), //3 - team tasks count
                    /*9*/
                    professionalsTasksCount(id, "4"), //4 - team past tasks count
                    /*10*/
                    professionalsTasksCount(id, "5"), //5 - team Pending Action Count
                    /*11*/
                    professionalsTasksCount(id, "6"), //6 - my Pending Action Count
                    //Pharmacy counts
                    /*12*/
                    pharmacyRequestCounts(id, "1"), //1
                    /*13*/
                    pharmacyRequestCounts(id, "2"), //2
                    /*14*/
                    pharmacyRequestCounts(id, "3"), //3
                    /*15*/
                    pharmacyRequestCounts(id, "4"), //4
                    //Pharmacy counts
                    //CME Courses counts
                    /*16*/
                    CMECoursesCount(id, "1"), //1 - cmeCourses -- coursese - 
                    /*17*/
                    CMECoursesCount(id, "2"), //2 - cmeCerificates -- 
                    /*18*/
                    CMECoursesCount(id, "3"), //3 - cmeCredits
                    //CME Courses counts
                    //PARTNERS
                    /*19*/
                    partnersFunction(id, "1"), //1 - totalpartners
                    /*20*/
                    partnersFunction(id, "2"), //2 - partnersTotalAppointment
                    /*21*/
                    partnersFunction(id, "3"), //3 - partnersPastTask
                    //PARTNERS
                    /*22*/
                    bookingsMadeCount(id, "2"), //past appointments

                    //REPORTSCOUNT
                    /*23*/
                    getProfessionalAppointmentReports(dataCount, req),
                    /*24*/
                    getProfessionalLabReports(dataCount, req),
                    /*25*/
                    getPrescriptionsList(dataCount, req)
                    //REPORTSCOUNT
                ])
                .then(response => {
                    dataToSend.bookingsMadeCount = response[0];
                    dataToSend.totalBookingsReceivedCount = response[1];
                    dataToSend.todayBookingsReceivedCount = response[2];
                    dataToSend.totalUpcomingBookingsCount = response[3];
                    dataToSend.teamMemberCount = response[4];
                    dataToSend.pendingActionCount = (+response[5] + +response[11]);
                    //below counts are for professional
                    dataToSend.myTaskCount = response[6];
                    dataToSend.myPastTaskCount = response[7];
                    dataToSend.teamTaskCount = response[8];
                    dataToSend.teamPastTaskCount = response[9];
                    dataToSend.teamPendingActionCount = (+response[10] + +response[5]);
                    //above counts are for professional
                    //Pharmacy counts
                    dataToSend.medicationRequestCount = response[12];
                    dataToSend.medicationPendingCount = response[13];
                    dataToSend.medicationOpenCount = response[14];
                    dataToSend.medicationClosedCount = response[15];
                    //Pharmacy counts
                    //CME Courses counts
                    dataToSend.cmeCourses = response[16];
                    dataToSend.cmeCerificates = response[17];
                    dataToSend.cmeCredits = response[18];
                    //CME Courses counts
                    //PARTNERS
                    dataToSend.totalpartners = response[19];
                    dataToSend.partnersTotalAppointment = response[20];
                    dataToSend.partnersPastTask = response[21];
                    dataToSend.totalRevenue = 0;
                    dataToSend.contractingFacility = 0;
                    //PARTNERS
                    dataToSend.bookingsMadePastCount = response[22];
                    //REPORTSCOUNT
                    dataToSend.professionalAppointmentReports = response[23];
                    dataToSend.professionalLabReports = response[24];
                    dataToSend.prescriptionsList = response[25];
                    //REPORTSCOUNT
                    return sendResponse.sendSuccessData(dataToSend, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                })
                .catch(err => {
                    console.log("err--", err)
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                });
        } catch (err) {
            console.log("500 err--", err)
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    dashboardSearch: async (req, res) => {
        try {
            let obj = req.query;
            if (is.undefined(obj.keyword) || is.empty(obj.keyword)) {
                return res.status(400).json({
                    status: 0,
                    message: "Search keyword is required"
                });
            }
            let dataToSend = {};
            await Promise.all([
                    searchProfessional(obj.keyword),
                    searchServices(obj.keyword, req)
                ])
                .then(response => {
                    dataToSend.professionals = response[0];
                    dataToSend.services = response[1];
                    return sendResponse.sendSuccessData(dataToSend, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                })
                .catch(err => {
                    return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                });
        } catch (err) {
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    dashboardDataCustomCounts: async (req, res) => {
        try {
            let obj = req.query;
            if (is.undefined(obj.type) || is.empty(obj.type)) {
                return res.status(400).json({
                    status: 0,
                    message: "Type is required"
                });
            }
            var aggregate = [];
            var partnerAggregateData = [];
            var getPartnerIds = [];
            var getChampionIds = [];
            let dataToSend = {};

            if (obj.type == "1") {
                getPartnerIds = await getPartnerIdsFunc();
                var partnerAggregate = [{
                        $match: {
                            "professionalId": {
                                $in: getPartnerIds
                            }
                        }
                    },
                    {
                        "$addFields": {
                            "amountNew": {
                                "$toDouble": "$professionalAmount"
                            }
                        }
                    },
                    {
                        $group: {
                            _id: '',
                            amountNew: {
                                $sum: "$amountNew"
                            },
                        }
                    },
                    {
                        $project: {
                            totalAmount: "$amountNew"
                        }
                    }
                ];
                /*var partnerAggregate = [
                    {$match: {"userId": { $in: getPartnerIds } }},
                    {$project:{
                        totalAmount:{ $sum: "$amount" }
                    }}
                ];*/
                var partnerAggregateData = await Models.Payments.aggregate(partnerAggregate)

                aggregate = [{
                        $match: {
                            "professionalId": ObjectId(userData._id)
                        }
                    },
                    {
                        "$addFields": {
                            "amountNew": {
                                "$toDouble": "$professionalAmount"
                            }
                        }
                    },
                    {
                        $group: {
                            _id: '',
                            amountNew: {
                                $sum: "$amountNew"
                            },
                        }
                    },
                    {
                        $project: {
                            totalAmount: "$amountNew"
                        }
                    }
                ];
                /*aggregate = [
                    {$match: {"userId": ObjectId(userData._id) }},
                    {$project:{
                        totalAmount:{ $sum: "$amount" }
                    }}
                ];*/
                var aggregateData = await Models.Payments.aggregate(aggregate)
                console.log("aggregateData ---- ", aggregateData)
                dataToSend.totalRevenue = (aggregateData.length > 0) ? aggregateData[0].totalAmount : 0;
                dataToSend.totalPartnersRevenue = (partnerAggregateData.length > 0) ? partnerAggregateData[0].totalAmount : 0;
            } else {
                getChampionIds = await getChampionIdsFunc();
                aggregate = [{
                        $match: {
                            "userId": {
                                $in: getChampionIds
                            }
                        }
                    },
                    {
                        $project: {
                            totalAmount: {
                                $sum: "$amount"
                            },
                            totalTransactions: {
                                $size: "$amount"
                            }
                        }
                    }
                ];

                var aggregateData = await Models.Payments.aggregate(aggregate)

                dataToSend.championsTotalTransactions = (aggregateData.length > 0) ? aggregateData[0].totalTransactions : 0;
                dataToSend.championsTotalAmount = (aggregateData.length > 0) ? aggregateData[0].totalAmount : 0;
            }
            console.log(dataToSend)
            return sendResponse.sendSuccessData(dataToSend, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    addUserDependent: async (req, res) => {
        try {
            let obj = req.body;
            if (is.undefined(obj.name) || is.empty(obj.name)) {
                return res.status(400).json({
                    status: 0,
                    message: "Dependent name is required"
                });
            }
            let dependentCheck = await Models.Users.findOne({
                "_id": ObjectId(userData._id),
                "user.dependents": {
                    $elemMatch: {
                        "name": obj.name
                    }
                }
            }, {
                _id: 1
            });
            if (dependentCheck != null) {
                //return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,{},res);
                return res.status(400).json({
                    status: 0,
                    message: "Dependent name already exists",
                    data: {}
                });
            }
            Models.Users.findOneAndUpdate({
                    "_id": ObjectId(userData._id)
                }, {
                    $push: {
                        "user.dependents": {
                            "name": obj.name
                        }
                    }
                }, {
                    new: true
                },
                async function (err, result) {
                    console.log("1111111111111", result)
                    var addedDpendent = result.user.dependents.sort(function (a, b) {
                        return a._id == b._id ? 0 : +(a._id > b._id) || -1;
                    }).slice(-1);
                    if (err) {
                        return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                    } else {
                        console.log("2222222222", addedDpendent)
                        if (obj.folders != "") {
                            let dataToSend = {
                                "folders": obj.folders,
                                "dependentId": addedDpendent[0]._id
                            };
                            console.log("3333333333333333 ", dataToSend)
                            await createUserFolders("1", dataToSend, "0");
                        }
                        return sendResponse.sendSuccessData({}, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                    }
                });
        } catch (err) {
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    listUserDependents: async (req, res) => {
        try {
            let obj = req.query;
            let id = userData._id
            if (obj.userId != undefined && obj.userId != "") {
                id = obj.userId;
            }
            Models.Users.find({
                    "_id": ObjectId(id)
                }, {
                    "user.dependents": 1
                },
                function (err, result) {
                    if (err) {
                        return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, err, res);
                    } else {
                        result = JSON.parse(JSON.stringify(result));
                        let finalResult = result[0].user.dependents;
                        return sendResponse.sendSuccessData(finalResult, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
                    }
                });
        } catch (err) {
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    deleteUserDependent: async (req, res) => {
        try {
            let obj = req.body;
            if (is.undefined(obj.dependentId) || is.empty(obj.dependentId)) {
                return res.status(400).json({
                    status: 0,
                    message: "Dependent id is required"
                });
            }
            let result = await Models.Users.updateOne({
                "_id": ObjectId(userData._id)
            }, {
                $pull: {
                    "user.dependents": {
                        "_id": ObjectId(obj.dependentId)
                    }
                }
            });
            /*Models.Users.updateOne(
            {"_id": ObjectId(userData._id)},
            { $pull: { "user._id": {"_id":obj.dependentId} } },
            function (err, result) {*/
            if (!result) {
                return sendResponse.sendErrorMessageData(400, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT, {}, res);
            } else {
                await Models.Folder.update({
                    dependentId: ObjectId(obj.dependentId)
                }, {
                    isDeleted: true
                }, {
                    multi: true
                })
                return sendResponse.sendSuccessData({}, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);
            }
            //});
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    uploadLabsTest: async (req, res) => {
        try {

            let labsTests = Constants.LABS_TESTS;

            let updateTest = [];

            for (let i = 0; i < labsTests.length; i++) {
                updateTest.push({
                    isActive: true,
                    type: "lab",
                    title: [{
                        name: labsTests[i].code + " - " + labsTests[i].display,
                        type: 'en'
                    }, {
                        name: labsTests[i].code + " - " + labsTests[i].display,
                        type: 'ar'
                    }]
                })
            }

            Models.CommonServiceType.insertMany(updateTest, (err, result) => {
                console.log(err);

                return sendResponse.sendSuccessData({}, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);

            })


        } catch (error) {
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    testEncryption: async (req, res) => {
        try {
            var t1 = process.hrtime();
            var obj = req.body;
            let response = {
                encryptedobj: {},
                decryptedobj: {},
                obj: obj
            }
            /*response.encryptedobj.facebookId = await encryptDBData(obj.facebookId);
            response.encryptedobj.role = await encryptDBData(obj.role);
            response.encryptedobj.facebookId1 = await encryptDBData(obj.facebookId);
            response.encryptedobj.role1 = await encryptDBData(obj.role);*/
            if (process.env.ENABLE_DB_ENCRYPTION == "1") {
                response.encryptedobj = await encryptDBData(obj, ["facebookId", "role"]);
                console.log("response.encryptedobj.role1 -- ", response.encryptedobj);
            }
            /*response.decryptedobj.facebookId = await decryptDBData(response.encryptedobj.facebookId);
            response.decryptedobj.role = await decryptDBData(response.encryptedobj.role);
            response.decryptedobj.facebookId1 = await decryptDBData(response.encryptedobj.facebookId1);
            response.decryptedobj.role1 = await decryptDBData(response.encryptedobj.role1);*/
            //response.decryptedobj = JSON.parse(response.decryptedobj);
            response.decryptedobj.obj = await decryptDBData(response.encryptedobj, ["facebookId", "role"]);
            console.log("response.decryptedobj.role1 -- ", response.decryptedobj);
            var t2 = process.hrtime();
            console.log("=========================================")
            console.log(hrdiff(t1, t2) / 10000);

            return sendResponse.sendSuccessData(response, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);

        } catch (error) {
            console.log("11111111 ", error)
            return sendResponse.sendErrorMessage(500, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR, res);
        }
    },
    getProfessionalReports: async (req, res, next) => {
        req.headers.language = req.headers.language || 'en';
        var timeZone = req.headers.timezone;
        try {
            let schema = Joi.object().keys({
                /*reportType: Joi.string().optional(),*/
                /*type: Joi.number().required().valid([
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
                ])*/
            });
            var professionalId = req.credentials._id
            //let payload = await UniversalFunctions.validateSchema(req.query, schema, {presence: "required"});
            let payload = req.query
            /*if(payload.professionalId!=undefined && payload.professionalId!="" ){
                professionalId = payload.professionalId;
            }*/

            /*let checkFolderId = await Dao.findOne(Models.Folder, { "_id": ObjectId(payload.folderId) },
                {_id: 1, folderName: 1}, { lean: true });

            if (!checkFolderId) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_ID;*/

            /*let professionalServiceType = await Models.Users.findOne({"_id":ObjectId(professionalId)},{professionalSpeciality: 1});*/

            let professionalServiceType = await Models.Users.findOne({
                    "_id": ObjectId(professionalId)
                }, {
                    "professional.professionalSpeciality": 1
                }, {
                    lean: true
                })
                .populate({
                    path: 'professional.professionalSpeciality',
                    select: '_id serviceType'
                })
                .exec();
            console.log("professionalServiceType -- ", professionalServiceType)

            let data = [];
            let count = 0;
            let aggregate = [];
            //if(payload.reportType == "appointment"){ // reports are from apppointmentreports
            if (
                professionalServiceType &&
                professionalServiceType.professional.professionalSpeciality && (!professionalServiceType.professional.professionalSpeciality.serviceType || professionalServiceType.professional.professionalSpeciality.serviceType == "1")
            ) {
                data = await getProfessionalAppointmentReports(payload, req)
            } else { //else if reports are from labreports collection
                data = await getProfessionalLabReports(payload, req)
            }

            // console.log(data, count);
            return sendResponse.sendSuccessData({
                data: data,
                count: 0
            }, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);

        } catch (err) {
            console.log(err);
            if (err.isJoi) {
                return sendResponse.sendError(400, err.message, req.headers.language, res);
            } else {
                return sendResponse.sendErrorMessage(500,
                    req.headers.language, err, res);
            }
        }
    },
    getPrescriptionsList: async (req, res, next) => {
        req.headers.language = req.headers.language || 'en';
        var timeZone = req.headers.timezone;
        try {
            let schema = Joi.object().keys({
                /*reportType: Joi.string().optional(),*/
                /*type: Joi.number().required().valid([
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
                ])*/
            });
            var professionalId = req.credentials._id
            //let payload = await UniversalFunctions.validateSchema(req.query, schema, {presence: "required"});
            let payload = req.query
            /*if(payload.professionalId!=undefined && payload.professionalId!="" ){
                professionalId = payload.professionalId;
            }*/

            let data = [];
            let count = 0;
            let aggregate = [];

            data = await getPrescriptionsList(payload, req);
            // console.log(data, count);
            return sendResponse.sendSuccessData({
                data: data,
                count: 0
            }, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);

        } catch (err) {
            console.log(err);
            if (err.isJoi) {
                return sendResponse.sendError(400, err.message, req.headers.language, res);
            } else {
                return sendResponse.sendErrorMessage(500, req.headers.language, err, res);
            }
        }
    }


};

function hrdiff(t1, t2) {
    var s = t2[0] - t1[0];
    var mms = t2[1] - t1[1];
    return s * 1e9 + mms;
}

//await encryptDBData(obj, ["facebookId","role"]);
async function encryptDBData(data, fieldCheck) {
    for (let x of fieldCheck) {
        data[x] = await rsaWrapper.encrypt(rsaWrapper.serverDBPub, (data[x].toString('base64')));
    }
    return data;
}

//await decryptDBData(response.encryptedobj, ["facebookId","role"]);
async function decryptDBData(data, fieldCheck) {
    if (process.env.ENABLE_DB_ENCRYPTION == "1") {
        for (let x of fieldCheck) {
            data[x] = await rsaWrapper.decrypt(rsaWrapper.serverDBPrivate, data[x]);
        }
        return data;
    } else {
        return data;
    }
}

/*async function encryptDBData(data){
    if(process.env.ENABLE_DB_ENCRYPTION=="1"){
        let response = await rsaWrapper.encrypt(rsaWrapper.serverDBPub, (data.toString('base64')));
        return response
    }else{
        return data;
    }
}
async function decryptDBData(data){
    if(process.env.ENABLE_DB_ENCRYPTION=="1"){
        var descryptedPayload = await rsaWrapper.decrypt(rsaWrapper.serverDBPrivate, data);
        return descryptedPayload;
    }else{
        return data;
    }
}*/


/*async function encryptData(data){
    const aesKey = await aesWrapper.generateKey();
    let encryptedAesKey = await rsaWrapper.encrypt(rsaWrapper.clientPub, (aesKey.toString('base64')));

    let encryptedMessage = await aesWrapper.encryptData(aesKey, JSON.stringify(data))
    let response = {"encryptionKey":encryptedAesKey, "encryptionData":encryptedMessage};
    return response
}*/

/*async function decryptData(data){
    if(!data.encryptionKey) return {};    
    await rsaWrapper.initLoadKeys(__dirname + '/../utils');
    var decryptedKey = await rsaWrapper.decrypt(rsaWrapper.serverPrivate, data.encryptionKey);
    let descryptedPayload = JSON.parse(await aesWrapper.decrypt(Buffer.from(decryptedKey, 'base64'), data.encryptionData));
    return descryptedPayload;
}*/
async function getProfessionalAppointmentReports(payload, req) {

    let criteria = {};
    let data = [];
    let count = 0;
    let aggregate = [];
    if (payload.dependentId) {
        criteria.dependentId = ObjectId(payload.dependentId);
    } else {
        criteria.professionalId = ObjectId(userData._id);
        criteria.dependentId = null;
    }
    criteria.isVerified = true;

    /*if (checkFolderId.folderName === APP_CONSTANTS.DATABASE.FOLDERS.MEDICATIONS) {
        criteria.medications = {$ne: []};
    }
    else  if (checkFolderId.folderName === APP_CONSTANTS.DATABASE.FOLDERS.REQUESTS) {
        criteria.tests = {$ne: []};
    }*/

    /*if(payload.diagnosticsId){
        criteria.diagnostics  =  { $in: [ObjectId(payload.diagnosticsId)] };
    }*/
    if (payload.duration && payload.duration != "1") {
        let filterDate = momentTimezone(new Date()).tz(req.headers.timezone).subtract(7, 'days').toDate();
        if (payload.duration == "3") {
            filterDate = momentTimezone(new Date()).tz(req.headers.timezone).subtract(1, 'months').toDate();
        } else if (payload.duration == "4") {
            filterDate = momentTimezone(new Date()).tz(req.headers.timezone).subtract(3, 'months').toDate();
        } else if (payload.duration == "5") {
            filterDate = momentTimezone(new Date()).tz(req.headers.timezone).subtract(6, 'months').toDate();
        }
        criteria.createdAt = {
            $gte: filterDate
        }
    }
    if (payload.getCount == 1) {
        return queries.count(Models.PatientAppointmentReport, criteria);
    }

    if (payload.lastId && payload.lastId != "") {
        criteria._id = {
            $lt: ObjectId(payload.lastId)
        }
    }

    if (payload.limit == undefined || payload.limit == "") {
        payload.limit = "50"
    }
    console.log("22222222222")
    aggregate.push({
        $match: criteria
    }, {
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
    }, {
        "$lookup": {
            from: "commonservicetypes",
            foreignField: "_id",
            localField: "diagnostics",
            as: 'diagnosticsData'
        }
    }, {
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
    }, {
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
    }, {
        "$lookup": {
            from: "users",
            foreignField: "_id",
            localField: "userId",
            as: 'userData'
        }
    }, {
        "$unwind": {
            "path": "$appointments",
            "preserveNullAndEmptyArrays": true
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
    }, {
        $project: {
            professionalData: {
                _id: 1,
                profilePic: 1,
                defaultLoginRole: 1,
                coverPic: 1,
                name: 1,
                professional: {
                    professionalSpeciality: {
                        /*specialityName: 1,
                        specialist: 1*/
                        specialityName: "$professional.professionalSpeciality.specialityName." + req.headers.language,
                        specialist: "$professional.professionalSpeciality.specialist." + req.headers.language
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
                defaultLoginRole: 1,
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
    }, {
        $sort: {
            _id: -1
        }
    }, {
        $limit: Number(payload.limit)
    });
    console.log("333333333")
    console.log("aggregate", JSON.stringify(aggregate));

    [data] = await Promise.all([
        queries.aggregateData(Models.PatientAppointmentReport, aggregate),
        //Dao.count(Models.PatientAppointmentReport, criteria)
    ]);

    console.log("data", JSON.stringify(data));

    for (let i = 0; i < data.length; i++) {
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
        if (data[i] && data[i].testData && data[i].testData.length > 0) {
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
        if (data[i] && data[i].userData && data[i].userData.user && data[i].userData.user.dependents.length > 0) {
            let data1 = data[i].userData.user.dependents.filter(item => {
                console.log(item._id.toString(), payload.dependentId);
                return (item._id.toString() == payload.dependentId)
            })
            data[i].dependents = data1.length > 0 ? data1[0] : undefined;

            data[i].userData.user.dependents = {};
        }

    }
    return data;
}
async function getProfessionalLabReports(payload, req) {

    let criteria = {};
    let data = [];
    let count = 0;
    let aggregate = [];
    if (payload.dependentId) {
        criteria.dependentId = ObjectId(payload.dependentId);
    } else {
        criteria.professionalId = ObjectId(userData._id);
        criteria.dependentId = null;
    }
    // criteria.payload = ObjectId(req.credentials._id);
    /*criteria.folderId = { $ne: APP_CONSTANTS.DATABASE.FOLDERS.RADIOLOGY };
    console.log("4444444444444444",criteria)*/

    if (payload.duration && payload.duration != "1") {
        let filterDate = momentTimezone(new Date()).tz(req.headers.timezone).subtract(7, 'days').toDate();
        if (payload.duration == "3") {
            filterDate = momentTimezone(new Date()).tz(req.headers.timezone).subtract(1, 'months').toDate();
        } else if (payload.duration == "4") {
            filterDate = momentTimezone(new Date()).tz(req.headers.timezone).subtract(3, 'months').toDate();
        } else if (payload.duration == "5") {
            filterDate = momentTimezone(new Date()).tz(req.headers.timezone).subtract(6, 'months').toDate();
        }
        criteria.createdAt = {
            $gte: filterDate
        }
    }

    if (payload.getCount == 1) {
        console.log("criteria count ---- ", criteria)
        return queries.count(Models.PatientAppointmentReport, criteria);
    }

    if (payload.limit == undefined || payload.limit == "") {
        payload.limit = "50"
    }

    if (payload.lastId && payload.lastId != "") {
        criteria._id = {
            $lt: ObjectId(payload.lastId)
        }
    }
    //  criteria.medications = {$ne: []};
    aggregate.push({
        $match: criteria
    }, {
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
    }, {
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
    }, {
        $project: {
            professionalData: {
                _id: 1,
                profilePic: 1,
                coverPic: 1,
                name: 1,
                defaultLoginRole: 1,
                professional: {
                    professionalSpeciality: {
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
                defaultLoginRole: 1,
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
    }, {
        $sort: {
            _id: -1
        }
    }, {
        $limit: Number(payload.limit)
    });

    [data] = await Promise.all([
        queries.aggregateData(Models.PatientLabsReport, aggregate),
        //Dao.count(Models.PatientLabsReport, criteria)
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
        if (data[i] && data[i].userData && data[i].userData.user && data[i].userData.user.dependents.length > 0) {
            let data1 = data[i].userData.user.dependents.filter(item => {
                console.log(item._id.toString(), payload.dependentId);
                return (item._id.toString() == payload.dependentId)
            })
            data[i].dependents = data1.length > 0 ? data1[0] : undefined;

            data[i].userData.user.dependents = {};
        }
    }
    return data;
}
async function getPrescriptionsList(payload, req) {

    let criteria = {
        medications: {
            $exists: true,
            $not: {
                $size: 0
            }
        }
    };

    let data = [];
    let count = 0;
    let aggregate = [];
    if (payload.dependentId) {
        criteria.dependentId = ObjectId(payload.dependentId);
    } else {
        criteria.professionalId = ObjectId(userData._id);
        criteria.dependentId = null;
    }
    criteria.isVerified = true;

    /*if (checkFolderId.folderName === APP_CONSTANTS.DATABASE.FOLDERS.MEDICATIONS) {
        criteria.medications = {$ne: []};
    }
    else  if (checkFolderId.folderName === APP_CONSTANTS.DATABASE.FOLDERS.REQUESTS) {
        criteria.tests = {$ne: []};
    }*/

    /*if(payload.diagnosticsId){
        criteria.diagnostics  =  { $in: [ObjectId(payload.diagnosticsId)] };
    }*/
    if (payload.duration && payload.duration != "1") {
        let filterDate = momentTimezone(new Date()).tz(req.headers.timezone).subtract(7, 'days').toDate();
        if (payload.duration == "3") {
            filterDate = momentTimezone(new Date()).tz(req.headers.timezone).subtract(1, 'months').toDate();
        } else if (payload.duration == "4") {
            filterDate = momentTimezone(new Date()).tz(req.headers.timezone).subtract(3, 'months').toDate();
        } else if (payload.duration == "5") {
            filterDate = momentTimezone(new Date()).tz(req.headers.timezone).subtract(6, 'months').toDate();
        }
        criteria.createdAt = {
            $gte: filterDate
        }
    }


    if (payload.getCount == 1) {
        return queries.count(Models.PatientAppointmentReport, criteria);
    }

    if (payload.limit == undefined || payload.limit == "") {
        payload.limit = "50"
    }

    if (payload.lastId && payload.lastId != "") {
        criteria._id = {
            $lt: ObjectId(payload.lastId)
        }
    }
    aggregate.push({
        $match: criteria
    }, {
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
    }, {
        "$lookup": {
            from: "commonservicetypes",
            foreignField: "_id",
            localField: "diagnostics",
            as: 'diagnosticsData'
        }
    }, {
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
    }, {
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
    }, {
        "$lookup": {
            from: "users",
            foreignField: "_id",
            localField: "userId",
            as: 'userData'
        }
    }, {
        "$unwind": {
            "path": "$appointments",
            "preserveNullAndEmptyArrays": true
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
    }, {
        $project: {
            professionalData: {
                _id: 1,
                profilePic: 1,
                defaultLoginRole: 1,
                coverPic: 1,
                name: 1,
                professional: {
                    professionalSpeciality: {
                        /*specialityName: 1,
                        specialist: 1*/
                        specialityName: "$professional.professionalSpeciality.specialityName." + req.headers.language,
                        specialist: "$professional.professionalSpeciality.specialist." + req.headers.language
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
                defaultLoginRole: 1,
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
    }, {
        $sort: {
            _id: -1
        }
    }, {
        $limit: Number(payload.limit)
    });

    [data] = await Promise.all([
        queries.aggregateData(Models.PatientAppointmentReport, aggregate),
        //Dao.count(Models.PatientAppointmentReport, criteria)
    ]);

    //  console.log("data", JSON.stringify(data));

    for (let i = 0; i < data.length; i++) {
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
        if (data[i] && data[i].testData && data[i].testData.length > 0) {
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
        if (data[i] && data[i].userData && data[i].userData.user && data[i].userData.user.dependents.length > 0) {
            let data1 = data[i].userData.user.dependents.filter(item => {
                console.log(item._id.toString(), payload.dependentId);
                return (item._id.toString() == payload.dependentId)
            })
            data[i].dependents = data1.length > 0 ? data1[0] : undefined;

            data[i].userData.user.dependents = {};
        }

    }
    return data;
}

async function sendPush(type, title, message, receiverId, contentId, senderId, userName = "") { // contentId - post id, user id,appointmentid, comment id, etc
    console.log("receiverId ---- ", receiverId)
    let userSettings = await Models.Users.findOne({
        "_id": ObjectId(receiverId)
    }, {
        deviceType: 1,
        deviceToken: 1,
        language: 1
    });
    var usernm = userData.name ? userData.name : ''
    if (userName != "") {
        usernm = userName;
    }
    console.log("usernm ---- ", usernm)
    let notificationData = {
        "name": usernm, // sender's name who is owner or sender
        "contentId": (contentId).toString(), //postid / appointmentid / userid / commentid / etc
        "type": type, //APP_CONSTANTS.NOTIFICATION_TYPE.CREATE_APPOINTMENT, // type of notification
        "title": title[userSettings.language], //APP_CONSTANTS.NOTIFICATION_TITLE.CREATE_APPOINMENT[userSettings.language],
        "message": usernm + " " + message[userSettings.language], //APP_CONSTANTS.NOTIFICATION_MESSAGE.CREATE_APPOINMENT[userSettings.language],
        "userId": (receiverId).toString() //payload.user // push notification receiver's id
    };
    let notificationDataInsert = {
        senderId: senderId, //
        receiverId: receiverId, //payload.doctor, //owner of post, user who posted comment in case of reply, all followers, etc
        contentId: contentId, //pharmacy request id / postid / appointmentid / userid / commentid / etc
        timeStamp: (new Date()).getTime(),
        "type": type, //APP_CONSTANTS.NOTIFICATION_TYPE.CREATE_APPOINTMENT, //type of notification
        "title": title[userSettings.language], //APP_CONSTANTS.NOTIFICATION_TITLE.CREATE_APPOINMENT[userSettings.language],
        "message": {
            'en': usernm + " " + message['en'], //APP_CONSTANTS.NOTIFICATION_MESSAGE.CREATE_APPOINMENT['en'],
            'ar': usernm + " " + message['ar'] //APP_CONSTANTS.NOTIFICATION_MESSAGE.CREATE_APPOINMENT['ar']
        }
    };

    //  console.log(notificationData, notificationDataInsert);

    CommonController.sendPushNotification({
        deviceType: userSettings.deviceType,
        deviceToken: userSettings.deviceToken
    }, notificationData);
    CommonController.notificationUpdate(notificationDataInsert);
}

function formatJsonData(data) {
    /*if(data.Code==""){
        return false;
    }else{*/
    /* let formatted = {};
     formatted.code = data.Code;
     //let title = data.Title;
     data.Title = (data.Title).replace("- - - - - - - - - - - ", "");
     data.Title = (data.Title).replace("- - - - - - - - - - ", "");
     data.Title = (data.Title).replace("- - - - - - - - - ", "");
     data.Title = (data.Title).replace("- - - - - - - - ", "");
     data.Title = (data.Title).replace("- - - - - - - ", "");
     data.Title = (data.Title).replace("- - - - - - ", "");
     data.Title = (data.Title).replace("- - - - - ", "");
     data.Title = (data.Title).replace("- - - - ", "");
     data.Title = (data.Title).replace("- - - ", "");
     data.Title = (data.Title).replace("- - ", "");
     data.Title = (data.Title).replace("- ", "");

     formatted.title = data.Title;

     return formatted;*/
    //}
    /*let ar =  data.specialityName_ar
    let en =  data.specialityName;

    let sar =  data.specialist_ar
    let sen =  data.specialist;

    delete data.specialityName_ar;
    delete data.specialityName;
    delete data.specialist_ar;
    delete data.specialist;
    data.specialityName = {"ar":ar,"en":en}
    data.specialist = {"ar":sar,"en":sen}
    return data;*/
}

function searchProfessional(keyword) {
    return Models.Users.find({
        /*role: {$elemMatch: {$eq: "PROFESSIONAL"}},*/
        isBlocked: false,
        isDeleted: false,
        _id: {
            $ne: ObjectId(userData._id)
        },
        $or: [{
                "defaultLoginRole": "USER",
                "user.step": "2",
            },
            {
                "defaultLoginRole": "PROFESSIONAL",
                "professional.step": "3",
            },
            {
                "defaultLoginRole": "FACILITY",
                "facility.step": "5",
            }
        ],
        name: {
            '$regex': ".*" + keyword + ".*",
            '$options': 'i'
        }
    }, {
        _id: 1,
        name: 1,
        phone: 1,
        countryCode: 1,
        defaultLoginRole: 1
    }, {
        lean: true
    });
}

function searchServices(keyword, req) {
    var match = {};
    match['serviceName.' + req.headers.language] = {
        '$regex': ".*" + keyword + ".*",
        '$options': 'i'
    };
    match['isActive'] = true;
    return Models.ServiceCategory.aggregate([{
            $match: match
        },
        {
            $project: {
                _id: 1,
                serviceName: "$serviceName." + req.headers.language,
                serviceIcon: 1
            }
        }
    ]);
    /*return Models.ServiceCategory.find({
        serviceName: { '$regex': ".*" + keyword + ".*", '$options': 'i' },
        isActive: true,
    },
    {_id:1, serviceName:1, serviceIcon:1});*/
}


async function bookingsMadeCount(id, type) {
    let criteria;
    if (type == "1") {
        criteria = {
            user: ObjectId(userData._id),
            type: {
                $ne: "SELF"
            },
            status: {
                $in: ["PLACED"]
            },
            createdByRole: userData.defaultLoginRole
        };
    } else if (type == "2") {
        criteria = {
            user: ObjectId(userData._id),
            type: {
                $ne: "SELF"
            },
            status: {
                $in: ["CANCELLED", "COMPLETED"]
            },
            createdByRole: userData.defaultLoginRole
        };
    }
    let data = await Models.Appointment.countDocuments(criteria);
    console.log("made resp", data)
    return data;

};
async function bookingsReceivedCount(id, aptType) { //type 1-total appointments(past + upcoming), 2- upcoming
    let criteria = {};
    /*if(type == "1"){
        criteria = {
            doctor: id,
            type:{$ne:"SELF"},
        };
    }else */
    criteria = {
        doctor: id,
        type: {
            $ne: "SELF"
        },
        status: {
            $in: ["CANCELLED", "PLACED", "COMPLETED"]
        }
    };
    if (aptType == "2") {

        let checkDate = moment().format('YYYY-MM-DD');
        criteria.$or = [{
                "type": "HOME",
                $or: [{
                        "homeService.type": "EVERYDAY",
                        "homeService.everyDayOrCustom": {
                            $elemMatch: {
                                $gt: checkDate
                            }
                        }
                    },
                    {
                        "homeService.type": "CUSTOM",
                        "homeService.everyDayOrCustom": {
                            $elemMatch: {
                                $gt: checkDate
                            }
                        }
                    },
                    {
                        "homeService.type": "WEEKLY",
                        "homeService.weeklyDates.dayWiseDates": {
                            $elemMatch: {
                                $gt: checkDate
                            }
                        }
                    }
                ]
            },
            {
                "type": "ONLINE",
                "scheduledService.date": {
                    $gt: checkDate
                }
            },
            {
                "type": "ONSITE",
                "scheduledService.date": {
                    $gt: checkDate
                }
            }
        ]
    }
    let data = await Models.Appointment.countDocuments(criteria);
    console.log("rec resp", data)
    return data;
};

function totalTeamMembers(id) {
    return Models.Team.countDocuments({
        $or: [{
                "teamManagerId": id
            },
            {
                "professionalId": id
            }
        ],
        "isDeleted": false,
        "status": "3"
    });
}
async function pendingActions(id) {
    /*let teamCount = await Models.Team.countDocuments({
        $or: [
            {"teamManagerId": id, $or: [{"status": "1"},{"status": "2"}]},
            {"professionalId": id, $or: [{"status": "1"},{"status": "2"}]}
        ],
        "isDeleted":false
    });
    let taskCount = await Models.TeamTasks.countDocuments({"professionalId": id, "status": "2", "isDeleted":false});
    return (+teamCount + +taskCount);*/
    return Models.Team.countDocuments({
        $or: [{
                "teamManagerId": id,
                $or: [{
                    "status": "1"
                }, {
                    "status": "2"
                }]
            },
            {
                "professionalId": id,
                $or: [{
                    "status": "1"
                }, {
                    "status": "2"
                }]
            }
        ],
        "isDeleted": false
    });
}

function professionalsTasksCount(id, type) {
    //let status = "2";
    let criteria = {
        "professionalId": id,
        "status": "2",
        "isDeleted": false
    };
    if (type == "2") {
        //status = "4"
        criteria = {
            "professionalId": id,
            $or: [{
                "status": "3"
            }, {
                "status": "4"
            }] /*"status": "4"*/ ,
            "isDeleted": false
        };
    }
    if (type == "6") {
        //status = "4"
        criteria = {
            "professionalId": id,
            "status": "1",
            "isDeleted": false
        };
    }
    if (type == "3") {
        //status = "4"
        criteria = {
            "assignedById": id,
            "status": "2",
            "isDeleted": false
        };
    }
    if (type == "4") {
        //status = "4"
        criteria = {
            "assignedById": id,
            $or: [{
                "status": "3"
            }, {
                "status": "4"
            }] /*"status": "4"*/ ,
            "isDeleted": false
        };
    }
    if (type == "5") {
        //status = "4"
        criteria = {
            "assignedById": id,
            "status": "1",
            "isDeleted": false
        };
    }
    return Models.TeamTasks.countDocuments(criteria
        /*{
                "professionalId": id,
                "status": status,
                "isDeleted":false
            }*/
    );
}

function pharmacyRequestCounts(id, type) {
    //let status = "2";
    let criteria = {
        status: "1",
        "allPharmacyIds": {
            $in: [id]
        }
    }
    if (type == "2") {
        criteria = {
            status: "1",
            "acceptedPharmacyIds": {
                $in: [id]
            }
        };
    }
    if (type == "3" || type == "4") {
        criteria = {
            status: type,
            pharmacyId: id
        };
    }
    return Models.PharmacyRequests.countDocuments(criteria
        /*{
                "professionalId": id,
                "status": status,
                "isDeleted":false
            }*/
    );
}
async function CMECoursesCount(id, type) {

    let criteria = {
        isCompleted: true,
        userId: ObjectId(userData._id)
    }
    if (type == "1") {
        criteria = {
            isCompleted: false,
            userId: ObjectId(userData._id)
        }
    }
    if (type == "1" || type == "2") {
        return Models.UserCourses.countDocuments(criteria);
    } else if (type == "3") {
        let result = await Models.UserCourses.find(criteria, {
            courseCredits: 1
        });
        let creditCount = result.reduce((a, b) => +a + +b.courseCredits, 0);
        return creditCount;
    }
}
async function partnersFunction(id, type) {
    if (type == "1") {
        return Models.ProfessionalFacilities.countDocuments({
            facility: id,
            status: "ACTIVE"
        });
    } else if (type == "2") {
        var criteria1 = {
            facility: ObjectId(userData._id),
            status: "ACTIVE"
        }

        let partnerIds = await Models.ProfessionalFacilities.find(criteria1, {
            professional: 1,
            _id: 0
        });
        if (partnerIds && partnerIds.length > 0) {
            let output = [];
            for (let x of partnerIds) {
                output.push(ObjectId(x.professional))
            }

            let criteria = {};
            criteria = {
                doctor: {
                    "$in": output
                },
                type: {
                    $ne: "SELF"
                }
            };
            return Models.Appointment.countDocuments(criteria);
        }
        return 0;
    } else if (type == "3") {
        var criteria1 = {
            facility: ObjectId(userData._id),
            status: "ACTIVE"
        }
        let partnerIds = await Models.ProfessionalFacilities.find(criteria1, {
            professional: 1,
            _id: 0
        });
        if (!partnerIds || partnerIds.length == 0) {
            return 0;
        }

        let output = [];
        for (let x of partnerIds) {
            output.push(ObjectId(x.professional))
        }

        let criteria = {
            "professionalId": {
                "$in": output
            },
            "isDeleted": false,
            $or: [{
                "status": "3"
            }, {
                "status": "4"
            }]
        }
        return Models.TeamTasks.countDocuments(criteria)
    } else {
        return true;
    }
}

async function todayBookingsReceivedCount(id) {
    let checkDate = moment().format('YYYY-MM-DD');
    criteria = {
        doctor: ObjectId(userData._id),
        type: {
            $ne: "SELF"
        },
        status: {
            $in: ["PLACED", "CANCELLED", "COMPLETED"]
        },
        $or: [{
                "type": "HOME",
                $or: [{
                        "homeService.type": "EVERYDAY",
                        "homeService.everyDayOrCustom": {
                            $in: checkDate
                        }
                    },
                    {
                        "homeService.type": "CUSTOM",
                        "homeService.everyDayOrCustom": {
                            $in: checkDate
                        }
                    },
                    {
                        "homeService.type": "WEEKLY",
                        "homeService.weeklyDates.dayWiseDates": {
                            $in: checkDate
                        }
                    }
                ]
            },
            {
                "type": "ONLINE",
                "scheduledService.date": checkDate
            },
            {
                "type": "ONSITE",
                "scheduledService.date": checkDate
            }
        ]
    };
    let data = await Models.Appointment.countDocuments(criteria);
    console.log("rec resp", data)
    return data;
};

function mapArrayData(data) {
    let list;
    list = typeof data === "string" ? JSON.parse(data) : data;
    if (list && list.length > 0) {
        list = list.map(s => ObjectId(s))
    }
    return list;
}

function saveWorkingHours(dataToSave) {
    if (typeof dataToSave.workingHours === 'string') dataToSave.workingHours = JSON.parse(dataToSave.workingHours);
    return new Promise((resolve, reject) => {
        Models.ProfessionalFacilities(dataToSave).save((err, res) => {
            err ? reject(err) : resolve(res);
        });
    });
};

function sendOTP(payload) {
    return new Promise((resolve, reject) => {
        console.log("payload--", payload)
        //http://www.jawalbsms.ws/api.php/sendsms?user=csfhealth&pass=k0pQ4K&to=966596075551&message=SENDING-TEST&sender=ROOH        
        var to = payload.countryCode + payload.phone
        var options = {
            method: 'GET',
            url: process.env.SMS_URL,
            qs: {
                user: process.env.SMS_USER,
                pass: process.env.SMS_PASS,
                sender: process.env.SENDER,
                to: to,
                message: payload.message
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: 'Bearer OGE4Mjk0MTc0YjdlY2IyODAxNGI5Njk5MjIwMDE1Y2N8c3k2S0pzVDg=' // + process.env.Token
            }
        };
        request(options, function (error, response, body) {
            console.log("error-----", error)
            //console.log("response-----",response)
            console.log("body-----", body)
            if (error) {
                console.log(" ************** ERROR COMING ***************", error);
                if (error.code === 'ETIMEDOUT' && e.connect === true) {
                    reject(RESPONSE_MESSAGE.STATUS_MSG.ERROR.PAYMENT_ERROR);
                } else {
                    reject(RESPONSE_MESSAGE.STATUS_MSG.ERROR.PAYMENT_ERROR);
                }
            } else {
                resolve(body);
            };
        });
    });
};


function updateUser(dataToUpdate, criteria) {
    return new Promise((resolve, reject) => {
        //console.log("update user----", JSON.stringify(criteria), JSON.stringify(dataToUpdate));
        Models.Users.findOneAndUpdate(criteria,
            dataToUpdate, {
                lean: true,
                new: true
            },
            (err, updatedData) => {
                err ? reject(err) : resolve(updatedData);
            }
        )
    });
};

function getProfileData(id, req) {

    return Models.Users.aggregate([{
            $match: {
                _id: id
            }
        },
        {
            $lookup: {
                from: "professionalspecialities",
                let: {
                    userId: '$professional.professionalSubSpeciality'
                },
                pipeline: [{
                    $match: {
                        $expr: {
                            $and: [
                                //{$in: ["$_id", "$$userId"]},
                                {
                                    $in: ["$_id", {
                                        $ifNull: ['$$userId', []]
                                    }]
                                },
                                {
                                    $eq: ["$isActive", true]
                                }
                            ]
                        }
                    }
                }],
                as: 'professional.professionalSubSpeciality'
            }
        },
        {
            $lookup: {
                from: "professionalspecialities",
                let: {
                    userId: '$professional.professionalSpeciality'
                },
                pipeline: [{
                    $match: {
                        $expr: {
                            $and: [{
                                    $eq: ["$_id", "$$userId"]
                                },
                                {
                                    $eq: ["$isActive", true]
                                }
                            ]
                        }
                    }
                }],
                as: 'professional.professionalSpeciality'
            }
        },
        {
            "$unwind": {
                "path": "$professional.professionalSpeciality",
                "preserveNullAndEmptyArrays": true
            }
        },

        /*{
            $lookup: {
                from: "professionalspecialities",
                let: {userId: '$facility.services'},
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
                as: 'facility.services'
            }
        },*/

        {
            $lookup: {
                from: "professionalspecialities",
                let: {
                    userId: '$facility.services'
                },
                pipeline: [{
                    $match: {
                        $expr: {
                            $and: [
                                //{$in: ["$_id", "$$userId"]},
                                {
                                    $in: ["$_id", {
                                        $ifNull: ['$$userId', []]
                                    }]
                                },
                                {
                                    $eq: ["$isActive", true]
                                }
                            ]
                        }
                    }
                }],
                as: 'facility.services'
            }
        },

        {
            $lookup: {
                from: "professionalspecialities",
                let: {
                    userId: '$facility.facilityType'
                },
                pipeline: [{
                    $match: {
                        $expr: {
                            $and: [{
                                    $eq: ["$_id", "$$userId"]
                                },
                                {
                                    $eq: ["$isActive", true]
                                }
                            ]
                        }
                    }
                }],
                as: 'facility.facilityType'
            }
        },
        {
            "$unwind": {
                "path": "$facility.facilityType",
                "preserveNullAndEmptyArrays": true
            }
        },


        {
            $lookup: {
                from: "professionaltypes",
                let: {
                    userId: '$professional.professionalType'
                },
                pipeline: [{
                    $match: {
                        $expr: {
                            $and: [{
                                    $eq: ["$_id", "$$userId"]
                                },
                                {
                                    $eq: ["$isActive", true]
                                }
                            ]
                        }
                    }
                }],
                as: 'professional.professionalType'
            }

        },
        {
            "$unwind": {
                "path": "$professional.professionalType",
                "preserveNullAndEmptyArrays": true
            }
        },

        {
            $lookup: {
                from: "servicecategories",
                let: {
                    userId: '$professional.serviceCategory'
                },
                pipeline: [{
                    $match: {
                        $expr: {
                            $and: [{
                                    $eq: ["$_id", "$$userId"]
                                },
                                {
                                    $eq: ["$isActive", true]
                                },
                                //{$eq: ["$isDeleted", false]}
                            ]
                        }
                    }
                }],
                as: 'professional.serviceCategory'
            }
        },
        {
            "$unwind": {
                "path": "$professional.serviceCategory",
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            $lookup: {
                from: "servicecategories",
                let: {
                    userId: '$facility.serviceCategory'
                },
                pipeline: [{
                    $match: {
                        $expr: {
                            $and: [{
                                    $eq: ["$_id", "$$userId"]
                                },
                                {
                                    $eq: ["$isActive", true]
                                },
                                //{$eq: ["$isDeleted", false]}
                            ]
                        }
                    }
                }],
                as: 'facility.serviceCategory'
            }
        },
        {
            "$unwind": {
                "path": "$facility.serviceCategory",
                "preserveNullAndEmptyArrays": true
            }
        },

        {
            $lookup: {
                from: "countries",
                foreignField: "_id",
                localField: "professional.country",
                as: 'professional.country'
            }
        },
        {
            "$unwind": {
                "path": "$professional.country",
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            $lookup: {
                from: "countries",
                foreignField: "_id",
                localField: "professional.city",
                as: 'professional.city'
            }
        },
        {
            "$unwind": {
                "path": "$professional.city",
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            $lookup: {
                from: "insurancecompanies",
                foreignField: "_id",
                localField: "user.insuranceCompany",
                as: 'user.insuranceCompany'
            }
        },
        {
            "$unwind": {
                "path": "$user.insuranceCompany",
                "preserveNullAndEmptyArrays": true
            }
        },

        {
            $project: {
                _id: 1,
                profilePic: 1,
                coverPic: 1,
                name: 1,
                phone: 1,
                countryCode: 1,
                email: 1,
                defaultLoginRole: 1,
                location: 1,
                address: 1,
                role: 1,
                jid: 1,
                homeConsultation: 1,
                onlineConsultation: 1,
                instantConsultation: 1,
                joiningReferralCode: 1,
                deviceToken: 1,
                wallet: 1,
                notAvailableOn: 1,
                isChampion: 1,
                mirrorfly: 1,
                mirrorflyPassword: 1,
                mirrorFlyToken: 1,
                mirrorFlyUserId: 1,
                mirrorFlyDeviceToken: 1,
                mirrorFlyAccessToken: 1,
                //favoriteCount: { '$add': [ { '$size': { "$ifNull": [ "$favoriteProfessionals", [] ] } }, { '$size': { "$ifNull": [ "$favoriteFacilities", [] ] } } ] },
                user: {
                    uid: 1,
                    currency: 1,
                    dob: 1,
                    haveInsurance: 1,
                    policyNumber: 1,
                    bio: 1,
                    step: 1,
                    insuranceCompany: {
                        _id: 1,
                        companyName: "$user.insuranceCompany.companyName." + req.headers.language
                    }
                },
                professional: {
                    licenseImage: 1,
                    image: 1,
                    video: 1,
                    uid: 1,
                    step: 1,
                    /*professionalSubSpeciality:{
                        _id:1,
                        specialityName:"$professional.professionalSubSpeciality.specialityName."+req.headers.language,
                        specialityIcon:1,
                    },*/
                    "professionalSubSpeciality": {
                        $map: {
                            "input": "$professional.professionalSubSpeciality",
                            "as": "option",
                            in: {
                                specialityName: "$$option.specialityName." + req.headers.language,
                                _id: "$$option._id",
                                specialityIcon: "$$option.specialityIcon"
                            }
                        }
                    },
                    professionalSpeciality: {
                        _id: 1,
                        specialityIcon: 1,
                        specialityName: "$professional.professionalSpeciality.specialityName." + req.headers.language,
                        specialist: "$professional.professionalSpeciality.specialist." + req.headers.language,
                    },
                    //professionalType:1,
                    professionalType: {
                        _id: 1,
                        typeName: "$professional.professionalType.typeName." + req.headers.language,
                        isActive: 1
                    },
                    /*"professionalType": {
                        $map: {
                            "input": "$professionalType",
                            "as": "option",
                            in: {
                                typeName: "$$option.typeName."+req.headers.language,
                                _id: "$$option._id",

                            }
                        }
                    },*/
                    serviceCategory: {
                        _id: 1,
                        serviceName: "$professional.serviceCategory.serviceName." + req.headers.language,
                        templateType: 1,
                        visible: 1
                    },
                    license: 1,
                    skillDescription: 1,
                    expertise: 1,
                    facilities: 1,
                    workingHours: 1,
                    country: {
                        _id: 1,
                        locationName: "$professional.country.locationName." + req.headers.language,
                        countryFlagIcon: 1,
                        countryCode: 1,
                        shortName: 1
                    },
                    city: {
                        _id: 1,
                        locationName: "$professional.city.locationName." + req.headers.language,
                    }
                },
                facility: {
                    registrationImage: 1,
                    video: 1,
                    step: 1,
                    uid: 1,
                    address: 1,
                    //joiningReferralCode:1,
                    registrationNumber: 1,
                    description: 1,
                    /*services:{
                        _id:1,
                        specialityName:"$facility.services.specialityName."+req.headers.language,
                        specialityIcon:1,
                    },*/
                    "services": {
                        $map: {
                            "input": "$facility.services",
                            "as": "option",
                            in: {
                                specialityName: "$$option.specialityName." + req.headers.language,
                                _id: "$$option._id",
                                specialityIcon: "$$option.specialityIcon",
                            }
                        }
                    },
                    facilityType: {
                        _id: 1,
                        specialityName: "$facility.facilityType.specialityName." + req.headers.language,
                        specialist: "$facility.facilityType.specialist." + req.headers.language,
                    },
                    serviceCategory: {
                        _id: 1,
                        serviceName: "$facility.serviceCategory.serviceName." + req.headers.language,
                        templateType: 1,
                        visible: 1
                    },
                    expertise: 1,
                    workingHours: 1,
                    isWholeWeekWorking: 1,
                    image: 1,
                }
            }
        }
    ])
    //return userdata;
    /*return Models.Users.findOne({"_id": id},
        {accessToken: 0, __v: 0, createdAt: 0, updatedAt: 0},
        {lean: true})
        .populate('professional.professionalSubSpeciality', 'specialityName specialityIcon')
        .populate('professional.professionalSpeciality', 'specialist specialityName')
        .populate('professional.professionalType', ' typeName isActive')
        .populate('professional.serviceCategory', ' serviceName isActive')
        .populate('professional.country', '_id locationName countryFlagIcon countryCode shortName')
        .populate('professional.city', '_id locationName')
        .populate('facility.services', 'specialityName specialityIcon')
        .populate('facility.facilityType', 'specialist specialityName')
        .populate('facility.serviceCategory', ' serviceName isActive')
        .populate("user.insuranceCompany", "companyName companyName_ar", {"isActive": true});*/
};

function removeDuplicate(arr1, arr2) {
    let finalrray = arr2.concat(arr1)
    var servicesResult = function (array) {
        var o = {};
        return array.filter(function (a) {
            var k = a._id + '|' + a.specialityName;
            if (!o[k]) {
                o[k] = true;
                return true;
            }
        });
    }(finalrray);
    return servicesResult;
}

async function getFacilityProfessionalServicesList(id, req) {

    let servicesList = await Models.ProfessionalFacilities.aggregate([{
            $match: {
                facility: id,
                status: "ACTIVE"
            }
        },
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "professional",
                as: 'professional'
            }
        },
        {
            "$unwind": {
                "path": "$professional",
                "preserveNullAndEmptyArrays": true
            }
        },
        {
            $lookup: {
                from: "professionalspecialities",
                let: {
                    userId: '$professional.professional.professionalSubSpeciality'
                },
                pipeline: [{
                    $match: {
                        $expr: {
                            $and: [
                                //{$in: ["$_id", "$$userId"]},
                                {
                                    $in: ["$_id", {
                                        $ifNull: ['$$userId', []]
                                    }]
                                },
                                {
                                    $eq: ["$isActive", true]
                                }
                            ]
                        }
                    }
                }],
                as: 'professional.professional.professionalSubSpeciality'
            }
        },

        {
            $project: {
                _id: 0,
                "professionalSubSpeciality": {
                    $map: {
                        "input": "$professional.professional.professionalSubSpeciality",
                        "as": "option",
                        in: {
                            specialityName: "$$option.specialityName." + req.headers.language,
                            _id: "$$option._id",

                        }
                    }
                }
            }
        }
    ]);
    let output = [];
    for (let x of servicesList) {
        if (x.professionalSubSpeciality.length > 0) {
            for (let y of x.professionalSubSpeciality) {
                output.push({
                    "_id": ObjectId(y._id),
                    "specialityName": y.specialityName
                })
            }
        }
    }
    return output;
    //return servicesList;
};

function getProfessionalsCountWithService(id, req) {

    console.log(JSON.stringify([{
        $match: {
            facility: id,
            status: "ACTIVE"
        }
    }, {
        $group: {
            _id: "$professionalCategory",
            count: {
                $sum: 1
            }
        }
    }, {
        $lookup: {
            from: "servicecategories",
            foreignField: "_id",
            localField: "_id",
            as: '_id'
        }
    }, {
        $unwind: "$_id"
    }, {
        $project: {
            count: 1,
            serviceCategoryId: "$_id._id",
            serviceIcon: "$_id.serviceIcon",
            serviceName: "$_id.serviceName." + req.headers.language,
            visible: "$_id.visible",
            _id: 0
        }
    }]));

    return Models.ProfessionalFacilities.aggregate([{
            $match: {
                facility: id,
                status: "ACTIVE"
            }
        }, {
            $group: {
                _id: "$professionalCategory",
                count: {
                    $sum: 1
                }
            }
        }, {
            $lookup: {
                from: "servicecategories",
                foreignField: "_id",
                localField: "_id",
                as: '_id'
            }
        }, {
            $unwind: "$_id"
        }, {
            $match: {
                "_id.visible": true
            }
        },
        {
            $project: {
                count: 1,
                serviceCategoryId: "$_id._id",
                serviceIcon: "$_id.serviceIcon",
                serviceName: "$_id.serviceName." + req.headers.language,
                _id: 0
            }
        }
    ])
};

function formatDataByRole(data, callback) {
    //if (data.role.indexOf("USER") == -1 && data.role.indexOf("User") == -1) {
    if (data.defaultLoginRole != "USER" && data.defaultLoginRole != "User") {
        data.user = {};
    }
    //if (data.role.indexOf("PROFESSIONAL") == -1 && data.role.indexOf("Professional") == -1) {
    if (data.defaultLoginRole != "PROFESSIONAL" && data.defaultLoginRole != "Professional") {
        data.professional = {};
    }
    if (data.role.indexOf("FACILITY") == -1 && data.role.indexOf("Facility") == -1) {
        data.facility = {};
    }
    callback(data);
}

async function createUserFolders(type, data, allowed) {
    let result = await Models.Folder.findOne({
        "userId": ObjectId(userData._id)
    }); /*, function (err, result) {*/

    if (result == null || (result != null && data.dependentId != undefined && data.dependentId != "" && data.dependentId != result.dependentId) || allowed == "1") {
        let criteria = [];
        let folderAddCheck = [];
        let dependentId = null;
        if (data == "") {
            folderAddCheck = ["documents", "photos", "videos", "audios", "links", "medications", "requests", "reports", "radiology", "labs"];
        } else {
            if (data && data.folders != undefined) {
                let includeFolders = data.folders;
                includeFolders = includeFolders.toLowerCase();
                folderAddCheck = includeFolders.split(",");
                dependentId = data.dependentId;
            }
        }

        if (folderAddCheck.indexOf("documents") != -1) {
            criteria.push({
                folderName: Constants.DATABASE.FOLDERS.DOCUMENTS['en'],
                folderNameByLang: {
                    'en': Constants.DATABASE.FOLDERS.DOCUMENTS['en'],
                    'ar': Constants.DATABASE.FOLDERS.DOCUMENTS['ar']
                },
                folderIcon: "https://test.rooh.live/files/icons/ic_documents.png",
                folderType: "2",
                userId: ObjectId(userData._id),
                dependentId: dependentId
            });
        }
        if (folderAddCheck.indexOf("photos") != -1) {
            criteria.push({
                folderName: Constants.DATABASE.FOLDERS.PHOTOS['en'],
                folderNameByLang: {
                    'en': Constants.DATABASE.FOLDERS.PHOTOS['en'],
                    'ar': Constants.DATABASE.FOLDERS.PHOTOS['ar']
                },
                folderIcon: "https://test.rooh.live/files/icons/ic_photos.png",
                folderType: "2",
                userId: ObjectId(userData._id),
                dependentId: dependentId
            });
        }
        if (folderAddCheck.indexOf("videos") != -1) {
            criteria.push({
                folderName: Constants.DATABASE.FOLDERS.VIDEOS['en'],
                folderNameByLang: {
                    'en': Constants.DATABASE.FOLDERS.VIDEOS['en'],
                    'ar': Constants.DATABASE.FOLDERS.VIDEOS['ar']
                },
                folderIcon: "https://test.rooh.live/files/icons/ic_videos.png",
                folderType: "2",
                userId: ObjectId(userData._id),
                dependentId: dependentId
            })
        }
        if (folderAddCheck.indexOf("audios") != -1) {
            criteria.push({
                folderName: Constants.DATABASE.FOLDERS.AUDIOS['en'],
                folderNameByLang: {
                    'en': Constants.DATABASE.FOLDERS.AUDIOS['en'],
                    'ar': Constants.DATABASE.FOLDERS.AUDIOS['ar']
                },
                folderIcon: "https://test.rooh.live/files/icons/ic_audios.png",
                folderType: "2",
                userId: ObjectId(userData._id),
                dependentId: dependentId
            })
        }
        if (folderAddCheck.indexOf("links") != -1) {
            criteria.push({
                folderName: Constants.DATABASE.FOLDERS.LINKS['en'],
                folderNameByLang: {
                    'en': Constants.DATABASE.FOLDERS.LINKS['en'],
                    'ar': Constants.DATABASE.FOLDERS.LINKS['ar']
                },
                folderIcon: "https://test.rooh.live/files/icons/ic_links.png",
                folderType: "2",
                userId: ObjectId(userData._id),
                dependentId: dependentId
            })
        }
        //]
        if (type == "1") {
            if (folderAddCheck.indexOf("medications") != -1) {
                criteria.push({
                    folderName: Constants.DATABASE.FOLDERS.MEDICATIONS['en'],
                    folderNameByLang: {
                        'en': Constants.DATABASE.FOLDERS.MEDICATIONS['en'],
                        'ar': Constants.DATABASE.FOLDERS.MEDICATIONS['ar']
                    },
                    folderIcon: "https://test.rooh.live/files/icons/ic_medications.png",
                    folderType: "1",
                    userId: ObjectId(userData._id),
                    dependentId: dependentId
                });
            }
            if (folderAddCheck.indexOf("requests") != -1) {
                criteria.push({
                    folderName: Constants.DATABASE.FOLDERS.REQUESTS['en'],
                    folderNameByLang: {
                        'en': Constants.DATABASE.FOLDERS.REQUESTS['en'],
                        'ar': Constants.DATABASE.FOLDERS.REQUESTS['ar']
                    },
                    folderIcon: "https://test.rooh.live/files/icons/ic_requests.png",
                    folderType: "1",
                    userId: ObjectId(userData._id),
                    dependentId: dependentId
                })
            }
            if (folderAddCheck.indexOf("reports") != -1) {
                criteria.push({
                    folderName: Constants.DATABASE.FOLDERS.REPORTS['en'],
                    folderNameByLang: {
                        'en': Constants.DATABASE.FOLDERS.REPORTS['en'],
                        'ar': Constants.DATABASE.FOLDERS.REPORTS['ar']
                    },
                    folderIcon: "https://test.rooh.live/files/icons/ic_reports.png",
                    folderType: "1",
                    userId: ObjectId(userData._id),
                    dependentId: dependentId
                })
            }
            if (folderAddCheck.indexOf("radiology") != -1) {
                criteria.push({
                    folderName: Constants.DATABASE.FOLDERS.RADIOLOGY['en'],
                    folderNameByLang: {
                        'en': Constants.DATABASE.FOLDERS.RADIOLOGY['en'],
                        'ar': Constants.DATABASE.FOLDERS.RADIOLOGY['ar']
                    },
                    folderIcon: "https://test.rooh.live/files/icons/ic_radiology.png",
                    folderType: "1",
                    userId: ObjectId(userData._id),
                    dependentId: dependentId
                })
            }
            if (folderAddCheck.indexOf("labs") != -1) {
                criteria.push({
                    folderName: Constants.DATABASE.FOLDERS.LABS['en'],
                    folderNameByLang: {
                        'en': Constants.DATABASE.FOLDERS.LABS['en'],
                        'ar': Constants.DATABASE.FOLDERS.LABS['ar']
                    },
                    folderIcon: "https://test.rooh.live/files/icons/ic_labs.png",
                    folderType: "1",
                    userId: ObjectId(userData._id),
                    dependentId: dependentId
                })
            }
        }
        Models.Folder.insertMany(criteria, function (terr, tresult) {
            console.log("tresult.................", tresult)
            return true;
        });
    } else {
        return true;
    }
    //});;
}
async function getChampionIdsFunc() {
    let followByIds = await Models.Follow.find({
        "followedId": ObjectId(userData._id),
        "type": "1"
    }, {
        followById: 1
    });
    let output = [];
    for (let x of followByIds) {
        output.push(ObjectId(x.followById))
    }
    let championIds = await Models.Users.find({
        "_id": {
            "$in": output
        },
        "isChampion": {
            "$in": ["1", "2"]
        }
    }, {
        "_id": 1
    });
    let output1 = [];
    for (let x of championIds) {
        output1.push(ObjectId(x._id))
    }
    return output1;
};
async function getPartnerIdsFunc() {
    let partnerIds = await Models.ProfessionalFacilities.find({
        facility: ObjectId(userData._id),
        status: "ACTIVE"
    }, {
        professional: 1,
        _id: 0
    });
    let output = [];
    for (let x of partnerIds) {
        output.push(ObjectId(x.professional))
    }
    return output;
};