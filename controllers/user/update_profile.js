var Models = require("../../models");
var is = require("is_js");
const createUserFolders = require('./create_user_folders');
var RESPONSE_MESSAGES = require("../../config/response-messages");
var sendResponse = require("../../src/sendResponse");
var mirrorFlyAPI = require("../../utils/mirrorfly");
var formatDataByRole = require('../helper/format_data_by_role');
module.exports = async (req, res) => {
    try {
        let obj = req.body;
        let err = [];
        if (is.undefined(obj.currency) || is.empty(obj.currency)) {
            return res.status(400).json({
                status: 0,
                message: "currency is required",
            });
        }
        // console.log("obj ============================", obj);
        let criteria = {
            _id: ObjectId(userData._id),
        };

        // console.log('criteria', userData)
        await createUserFolders("1", "", "0");
        Models.Users.findOne(criteria, async function (err, result) {
            if (err) {
                return sendResponse.sendErrorMessageData(
                    400,
                    req.headers.language,
                    RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,
                    err,
                    res
                );
            } else {
                if (result != null) {
                    if (result.isPhoneVerified == true) {
                        let randomstring = Math.random().toString(36).slice(-8);

                        if (obj.deviceType == "IOS") {
                            obj.deviceToken = obj.mirrorFlyDeviceToken;
                        }

                        let data = await mirrorFlyAPI.register({
                            password: randomstring,
                            userId: userData._id,
                            deviceToken: obj.deviceToken,
                            deviceType: obj.deviceType,
                        });


                        let DataToSet = {
                            $set: {
                                email: obj.email,
                                location: typeof obj.location === "string" ?
                                    JSON.parse(obj.location) : obj.location,
                                address: obj.address,
                                jid: obj.jid ? obj.jid : "",
                                "user.step": "2",
                                "user.currency": obj.currency,
                                "user.dob": obj.dob,
                                "user.haveInsurance": obj.haveInsurance,
                                "user.insuranceCompany": obj.insuranceCompany ?
                                    ObjectId(obj.insuranceCompany) : null,
                                "user.policyNumber": obj.policyNumber,
                                mirrorfly: true,
                                mirrorflyPassword: randomstring,
                                mirrorFlyToken: data.data,
                                mirrorFlyDeviceToken: obj.mirrorFlyDeviceToken,
                                deviceToken: obj.deviceToken ? obj.deviceToken : "",
                            },
                        };

                        Models.Users.findOneAndUpdate(criteria, DataToSet, {
                                new: true,
                                lean: true,
                            })
                            .populate([{
                                path: "user.insuranceCompany",
                                select: "companyName",
                                query: {
                                    isActive: true,
                                },
                            }, ])
                            .then((response) => {
                                response.user.insuranceCompany ?
                                    (response.user.insuranceCompany.companyName =
                                        response.user.insuranceCompany.companyName[req.headers.language]) :
                                    "";
                                response.mirrorFlyToken = data.data;
                                //response.mirrorFlyTokenConsult = dataNew.data;
                                response.JID = `${response._id}@fly.uat.mirrorfly.com`;
                                formatDataByRole(response, function (finalResult) {
                                    return sendResponse.sendSuccessData(
                                        finalResult,
                                        200,
                                        req.headers.language,
                                        RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,
                                        res
                                    );
                                });
                            })
                            .catch((err) => {
                                return res.json({
                                    message: err.message
                                });

                                // console.log("err ----------- ", err);
                                return sendResponse.sendErrorMessageData(
                                    400,
                                    req.headers.language,
                                    RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,
                                    err,
                                    res
                                );
                            });
                    } else {

                        return sendResponse.sendErrorMessageData(
                            400,
                            req.headers.language,
                            RESPONSE_MESSAGES.STATUS_MSG.ERROR.PHONE_NO_NOT_VERIFIED, {},
                            res
                        );
                    }
                } else {

                    return sendResponse.sendErrorMessageData(
                        400,
                        req.headers.language,
                        RESPONSE_MESSAGES.STATUS_MSG.ERROR.NO_USER_EXISTS, {},
                        res
                    );
                }
            }
        });
    } catch (err) {
        // return res.status(500).json({
        //     status: 0,
        //     message: err.message
        // });
        return sendResponse.sendErrorMessage(
            500,
            req.headers.language,
            RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,
            res
        );
    }
}