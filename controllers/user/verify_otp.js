var Models = require("../../models");
var is = require("is_js");
var RESPONSE_MESSAGES = require("../../config/response-messages");
var sendResponse = require("../../src/sendResponse");
var jwt = require("jsonwebtoken");
const formatDataByRole = require('../helper/format_data_by_role');


module.exports = (req, res) => {
    try {
        let obj = req.body;

        if (is.undefined(obj.userId) || is.empty(obj.userId)) {
            return res.status(400).json({
                status: 0,
                message: "userId is required",
            });
        }
        if (is.undefined(obj.phone) || is.empty(obj.phone)) {
            return res.status(400).json({
                status: 0,
                message: "Phone is required",
            });
        }
        if (is.undefined(obj.otp) || is.empty(obj.otp)) {
            return res.status(400).json({
                status: 0,
                message: "OTP is required",
            });
        }
        // console.log("obj..................", obj)
        if (
            !is.undefined(obj.merge) &&
            !is.empty(obj.merge) &&
            obj.merge == true
        ) {
            if (is.undefined(obj.facebookId) || is.empty(obj.facebookId)) {
                return res.status(400).json({
                    status: 0,
                    message: "facebookId is required",
                });
            }
            let criteria = {
                _id: obj.userId, // THIS IS THE ID(_id) OF TEMP TABLE
                otp: obj.otp,
                phone: obj.phone,
                fbId: obj.facebookId,
            };
            Models.UsersTemp.findOne(criteria, function (err, result) {
                let userCriteria = {
                    phone: result.phone,
                    countryCode: result.countryCode,
                    isDeleted: false,
                };
                if (err) {
                    return sendResponse.sendErrorMessageData(
                        400,
                        req.headers.language,
                        RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,
                        err,
                        res
                    );
                } else {
                    if (result == null) {
                        return sendResponse.sendErrorMessageData(
                            400,
                            req.headers.language,
                            RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_OTP,
                            result,
                            res
                        );
                    } else {
                        let d = new Date();
                        let otpExpTime = new Date(result.otpExpiration);
                        if (otpExpTime.getTime() + 60 * 60 * 1000 < d.getTime()) {
                            //1hour check
                            return sendResponse.sendErrorMessageData(
                                400,
                                req.headers.language,
                                RESPONSE_MESSAGES.STATUS_MSG.ERROR.TOKEN_EXPIRED, {},
                                res
                            );
                        } else {
                            Models.Users.findOne(userCriteria, function (
                                exstErr,
                                exstResult
                            ) {
                                let payload = {
                                    phone: exstResult.phone,
                                    name: exstResult.name,
                                    countryCode: exstResult.countryCode,
                                    _id: exstResult._id,
                                };
                                let token = jwt.sign(
                                    payload,
                                    gRouter.get(Constants.SERVER.JWT_SECRET_KEY).toString(), {
                                        expiresIn: Constants.SERVER.TOKEN_EXPIRATION,
                                    }
                                );
                                if (errUpdate) {
                                    return sendResponse.sendErrorMessageData(
                                        400,
                                        req.headers.language,
                                        RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,
                                        errUpdate,
                                        res
                                    );
                                } else {
                                    let dataToSet = {
                                        $addToSet: {
                                            role: result.role[0],
                                        },
                                        $set: {
                                            currentStatus: "ONLINE",
                                            accessToken: token,
                                            fbId: obj.facebookId,
                                            defaultLoginRole: result.role[0],
                                            deviceToken: obj.deviceToken ? obj.deviceToken : "",
                                            deviceType: obj.deviceType,
                                        },
                                    };
                                    console.log("updatedata ---- ", JSON.stringify(dataToSet));
                                    Models.Users.updateOne(userCriteria, dataToSet, function (
                                        errTokenUpdate,
                                        resultTokenUpdate
                                    ) {
                                        Models.UsersTemp.deleteOne({
                                                _id: ObjectId(result._id),
                                            },
                                            function (errDelete, resultDelete) {
                                                Models.Users.findOne(userCriteria, function (
                                                    UserErr,
                                                    UserResult
                                                ) {
                                                    formatDataByRole(UserResult, function (
                                                        updatedResult
                                                    ) {
                                                        return sendResponse.sendSuccessData(
                                                            updatedResult,
                                                            200,
                                                            req.headers.language,
                                                            RESPONSE_MESSAGES.STATUS_MSG.SUCCESS
                                                            .OTP_VERIFIED,
                                                            res
                                                        );
                                                    });
                                                });
                                            }
                                        );
                                    });
                                }
                            });
                        }
                    }
                }
            });
        }

        let criteria = {
            _id: ObjectId(obj.userId),
            otp: obj.otp,
            phone: obj.phone,
        };
        Models.UsersTemp.findOne(criteria, function (err, result) {
            if (err) {
                return sendResponse.sendErrorMessageData(
                    400,
                    req.headers.language,
                    RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,
                    err,
                    res
                );
            } else {
                if (result == null) {
                    // console.log(result);
                    return sendResponse.sendErrorMessageData(
                        400,
                        req.headers.language,
                        RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_OTP,
                        result,
                        res
                    );
                } else {
                    let d = new Date();
                    let otpExpTime = new Date(result.otpExpiration);


                    if (otpExpTime.getTime() + 60 * 60 * 1000 < d.getTime()) {
                        //1hour check
                        return sendResponse.sendErrorMessageData(
                            400,
                            req.headers.language,
                            RESPONSE_MESSAGES.STATUS_MSG.ERROR.TOKEN_EXPIRED, {},
                            res
                        );
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
                            deviceType: obj.deviceType,
                            // joiningReferralCode = this.facility.name + randomstring(5),
                            /*professional: {"step":result.role[0]=="PROFESSIONAL" || result.role[0]=="Professional"  ? "1" : ""},
                                            facility    : {"step":result.role[0]=="FACILITY" || result.role[0]=="Facility"  ? "1" : ""},*/
                        });
                        userdata.save(function (errUpdate, resultUpdate) {
                            console.log(
                                errUpdate,
                                "err Update--- result update----",
                                resultUpdate
                            );

                            let payload = {
                                phone: resultUpdate.phone,
                                name: resultUpdate.name,
                                countryCode: resultUpdate.countryCode,
                                _id: resultUpdate._id,
                            };
                            let token = jwt.sign(
                                payload,
                                gRouter.get(Constants.SERVER.JWT_SECRET_KEY).toString(), {
                                    expiresIn: Constants.SERVER.TOKEN_EXPIRATION,
                                }
                            );
                            if (errUpdate) {
                                return sendResponse.sendErrorMessageData(
                                    400,
                                    req.headers.language,
                                    RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,
                                    errUpdate,
                                    res
                                );
                            } else {
                                Models.Users.updateOne({
                                        phone: obj.phone,
                                        countryCode: resultUpdate.countryCode,
                                        isDeleted: false,
                                    }, {
                                        $set: {
                                            accessToken: token,
                                        },
                                    },
                                    function (errTokenUpdate, resultTokenUpdate) {
                                        Models.UsersTemp.deleteOne({
                                                _id: ObjectId(result._id),
                                            },
                                            function (errDelete, resultDelete) {
                                                resultUpdate.accessToken = token;
                                                formatDataByRole(resultUpdate, function (
                                                    updatedResult
                                                ) {
                                                    return sendResponse.sendSuccessData(
                                                        updatedResult,
                                                        200,
                                                        req.headers.language,
                                                        RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.OTP_VERIFIED,
                                                        res
                                                    );
                                                });
                                            }
                                        );
                                    }
                                );
                            }
                        });
                    }
                }
            }
        });
    } catch (err) {
        //return res.status(500).json({status: 0, message: err.message});
        return sendResponse.sendErrorMessage(
            500,
            req.headers.language,
            RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,
            res
        );
    }
};