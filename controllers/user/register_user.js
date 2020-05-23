var Models = require("../../models");
var is = require("is_js");
var RESPONSE_MESSAGES = require("../../config/response-messages");
var sendResponse = require("../../src/sendResponse");
var bcrypt = require("bcrypt");
var saltRounds = 10;
const sendOTP = require('./../helper/send_otp');



module.exports = async (req, res, next) => {
    // res.send("works").end();
    try {
        let obj = req.body;
        if (is.undefined(obj.name) || is.empty(obj.name)) {
            return res.status(400).json({
                status: 0,
                message: "Please enter name",
            });
        }
        if (is.undefined(obj.phone) || is.empty(obj.phone)) {
            return res.status(400).json({
                status: 0,
                message: "Please enter contact number",
            });
        }
        if (is.undefined(obj.password) || is.empty(obj.password)) {
            return res.status(400).json({
                status: 0,
                message: "Please enter password",
            });
        }
        if (is.undefined(obj.countryCode) || is.empty(obj.countryCode)) {
            return res.status(400).json({
                status: 0,
                message: "Please enter country code",
            });
        }
        if (is.undefined(obj.role) || is.empty(obj.role)) {
            return res.status(400).json({
                status: 0,
                message: "Please enter role",
            });
        }

        let phoneCheck = await Models.Users.findOne({
            phone: obj.phone,
            countryCode: obj.countryCode,
            isDeleted: {
                $ne: true,
            },
        });

        if (phoneCheck == null) {
            // console.log('user is not found');
            Models.UsersTemp.findOne({
                    phone: obj.phone,
                    countryCode: obj.countryCode,
                },
                function (tmpErr, tmpCheck) {
                    //console.log("")

                    // ADD TEMP TABLE CHECK HEREuserId
                    let randomValue = new Date(new Date().getTime() + 60000).getTime();
                    var otpval = Math.floor(10000 + Math.random() * 90000);
                    bcrypt.genSalt(saltRounds, function (err, salt) {
                        //generating salt/hash password
                        bcrypt.hash(obj.password, salt, function (err, hash) {
                            //generating salt/hash password
                            let criteria = {
                                countryCode: obj.countryCode,
                                phone: obj.phone,
                            };
                            let dataToSet = {
                                $set: {
                                    name: obj.name,
                                    phone: obj.phone,
                                    email: obj.email ? obj.email : "",
                                    password: hash,
                                    countryCode: obj.countryCode,
                                    //otp: otpval,
                                    otp: process.env.ENABLE_OTP == "1" ? otpval : "12345",
                                    //otp: "12345",
                                    otpExpiration: randomValue,
                                    role: obj.role,
                                },
                            };
                            Models.UsersTemp.updateOne(
                                criteria,
                                dataToSet, {
                                    upsert: true,
                                },
                                function (err, result) {
                                    if (err) {
                                        return sendResponse.sendErrorMessageData(
                                            400,
                                            req.headers.language,
                                            RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,
                                            err,
                                            res
                                        );
                                    } else {
                                        Models.UsersTemp.findOne(
                                            criteria, {
                                                _id: 1,
                                                role: 1,
                                                phone: 1,
                                                countryCode: 1,
                                                name: 1,
                                            },
                                            function (errFind, resultFind) {
                                                delete resultFind.otp;
                                                //SENT OTP
                                                //let paymentDetails = await sendOTP(payload);
                                                if (process.env.ENABLE_OTP == "1") {
                                                    if (obj.countryCode && obj.phone) {
                                                        // console.log('req.headers.language', req.headers.language)
                                                        obj.message = `${otpval}  ${RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.REGISTRATION_OTP.message[req.headers.language]}`;
                                                        // console.log('user', obj)
                                                        // console.log('otpval', otpval);
                                                        sendOTP(obj);
                                                    }
                                                }
                                                //SENT OTP
                                                return sendResponse.sendSuccessData(
                                                    resultFind,
                                                    200,
                                                    req.headers.language,
                                                    RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,
                                                    res
                                                );
                                            }
                                        );
                                    }
                                }
                            );
                        });
                    });
                }
            );
        } else {
            // console.
            return sendResponse.sendErrorMessageData(
                400,
                req.headers.language,
                RESPONSE_MESSAGES.STATUS_MSG.ERROR.PHONE_ALREADY_EXIST, {},
                res
            );
        }
    } catch (err) {
        // console.log(err.message);
        // console.log('error in server');
        return sendResponse.sendErrorMessage(
            500,
            req.headers.language,
            RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,
            res
        );
    }
};