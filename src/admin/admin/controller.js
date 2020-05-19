'use strict';

//npm modules
const Joi = require('joi');
const bcrypt              = require('bcrypt');
const saltRounds          = 10;
const jwt = require('jsonwebtoken');



// local modules
const Models = require('../../../models'),
    Dao = require('../../../dao').queries,
    APP_CONSTANTS = require('../../../config/appConstants'),
    RESPONSE_MESSAGES = require('../../../config/response-messages'),
    UniversalFunctions = require('../../../utils').universalFunctions,
    sendResponse = require('../../sendResponse'),
    commonFunctions = require('../../../utils').commonController;

module.exports = {
    //admin login
    login: async (req, res, next) => {
        try {
            let schema =  Joi.object().keys({
                email: Joi.string().required(),
                password: Joi.string().required()
            });

            let payload = await UniversalFunctions.validateSchema(req.body, schema, {presence: "required"});
            console.log("payload -------- ",payload)
            let checkEmail = await Dao.findOne(Models.Admin, { "email": payload.email },
                { "_id": 1, password: 1, name: 1, email: 1 }, { lean: true });

            if (!checkEmail) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_EMAIL;

            const match = await bcrypt.compare(payload.password, checkEmail.password);

            if(match) {
                let payload = {
                    email: checkEmail.email,
                    _id: checkEmail._id,
                    "scope": "ADMIN"
                }
                let token = jwt.sign(payload, gRouter.get(APP_CONSTANTS.SERVER.JWT_SECRET_KEY_ADMIN).toString(), {
                    expiresIn: APP_CONSTANTS.SERVER.TOKEN_EXPIRATION
                });                

                var successData = {
                    status: 1,
                    statusCode: APP_CONSTANTS.STATUSCODE.SUCCESS,
                    data: {"token": token, name: checkEmail.name, "email": checkEmail.email, "_id": checkEmail._id},
                    message:  RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT.message[req.headers.language]
                };
                return res.status(APP_CONSTANTS.STATUSCODE.SUCCESS).json(successData);




                /*return sendResponse.sendSuccessData({
                        "token": token, name: checkEmail.name, "email": checkEmail.email, "_id": checkEmail._id
                    },
                    APP_CONSTANTS.STATUSCODE.SUCCESS, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);*/

            }
            else {
                throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INVALID_EMAIL;
            }
        }
        catch(err) {
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
    details: async (req, res, next) => {
        try {
            let schema = Joi.object().keys({});

            let payload = await UniversalFunctions.validateSchema(req.body, schema, {presence: "required"});

            let userData = await Dao.findOne(Models.Admin, {"_id": req.userData._id },
                {"_id": 1, name: 1, email: 1}, {lean: true});

            var successData = {
                status: 1,
                statusCode: APP_CONSTANTS.STATUSCODE.SUCCESS,
                data: userData,
                message:  RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT.message[req.headers.language]
            };
            return res.status(APP_CONSTANTS.STATUSCODE.SUCCESS).json(successData);

                
            /*return sendResponse.sendSuccessData(userData,
                APP_CONSTANTS.STATUSCODE.SUCCESS, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);*/

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
                        if(payload.type=="video"){
                            url.duration = payload.duration;
                        }
                        
                        filesUpload.push(url);
                    }
                    return res.status(200).json({
                        status: 1,
                        message: 'Successufully',
                        data: filesUpload
                    });
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
                if(payload.type=="video"){
                    url.duration = payload.duration;
                }
                return res.status(200).json({
                    status: 1,
                    message: 'Successufully',
                    data: [url]
                });
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
    }
};

