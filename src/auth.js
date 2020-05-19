'use strict';

// constants
const Constants  = require('../config/appConstants');

// npm modules
const jwt   = require("jsonwebtoken");

// local modules
const Models = require('../models');
if(process.env.ENABLE_ENCRYPTION=="1"){
    var aesWrapper      = require('../Lib/aes-wrapper');
    var rsaWrapper      = require('../Lib/rsa-wrapper');
    //rsaWrapper.initLoadKeys(__dirname+"/../utils");
}

module.exports = {
    auth_Fn: router => {
        router.use(function (req, res, next) {

            global.encryptionType = "mobile";
            let token = req.headers['authorization'];
            if (token) {
                let authToken = token.split(" ");
                jwt.verify(authToken[1], gRouter.get(Constants.SERVER.JWT_SECRET_KEY).toString(), async function (err, decoded) {
                    if (err) {
                        if (authToken[1] == Constants.SERVER.GUEST_TOKEN) {
          
                            //DESCRYPTION
                            if(process.env.ENABLE_ENCRYPTION=="1"){
                              if(req.body != undefined){
                                req.body = await decryptData(req.body);
                              }
                              if(req.query != undefined){
                                req.query = await decryptData(req.query);
                              }
                            }
                            //DESCRYPTION
                            global.userData = "";
                            next();
                        } else {
                            res.status(401).json({
                                status: 0,
                                message: Constants.STATUS_MSG.ERROR.ERROR_TOKEN_AUTH.customMessage
                            });
                            return;
                        }
                    } else {
                        if(process.env.ENABLE_ENCRYPTION=="1"){
                            //DESCRYPTION
                            if(req.body != undefined){
                              req.body = await decryptData(req.body);
                            }
                            if(req.query != undefined){
                              req.query = await decryptData(req.query);
                            }
                            //DESCRYPTION
                        }
                        Models.Users.findOne({"_id": decoded._id}, {}, function (err, result) {
                            /*if (!result) return res.status(401).json({
                                status: 0,
                                message: Constants.STATUS_MSG.ERROR.ERROR_TOKEN_AUTH.customMessage
                            });*/
                            if(!result || (result.accessToken=="") || (result.accessToken != authToken[1])) return res.status(401).json({status:0,message:Constants.STATUS_MSG.ERROR.ERROR_TOKEN_AUTH.customMessage});

                            if (result.isBlocked == true) {
                                return res.status(403).json({
                                    status: 0,
                                    message: Constants.STATUS_MSG.ERROR.BLOCK_USER.customMessage
                                });
                            } else if (result.isDeleted == true) {
                                return res.status(403).json({
                                    status: 0,
                                    message: Constants.STATUS_MSG.ERROR.NO_USER_EXISTS.customMessage
                                });
                            } else {
                                global.userData = result;
                                req.credentials = result;
                                delete req.body.token;
                                next();
                            }
                        });
                    }
                });
            } else {
                res.status(403).json({status: 0, message: Constants.STATUS_MSG.ERROR.EMPTY_TOKEN.customMessage});
                return;
            }
        });
    },
    adminAuth_Fn: router => {
        router.use(function (req, res, next) {
            let token = req.headers['authorization'];
            console.log(token);
            if (token) {
                let authToken = token.split(" ");
                jwt.verify(authToken[1], gRouter.get(Constants.SERVER.JWT_SECRET_KEY_ADMIN).toString(), function (err, decoded) {
                    if (err) {
                        if (authToken[1] == Constants.SERVER.GUEST_TOKEN) {
                            global.userData = "";
                            next();
                        } else {
                            res.status(401).json({
                                status: 0,
                                message: Constants.STATUS_MSG.ERROR.ERROR_TOKEN_AUTH.customMessage
                            });
                            return;
                        }
                    } else {
                        Models.Admin.findOne({"_id": decoded._id}, {}, function (err, result) {
                            if (!result) return res.status(401).json({
                                status: 0,
                                message: Constants.STATUS_MSG.ERROR.ERROR_TOKEN_AUTH.customMessage
                            });

                            if (result.isBlocked == true) {
                                return res.status(403).json({
                                    status: 0,
                                    message: Constants.STATUS_MSG.ERROR.BLOCK_USER.customMessage
                                });
                            } else if (result.isDeleted == true) {
                                return res.status(403).json({
                                    status: 0,
                                    message: Constants.STATUS_MSG.ERROR.NO_USER_EXISTS.customMessage
                                });
                            } else {
                                req.userData= result;
                                delete req.body.token;
                                next();
                            }
                        });
                    }
                });
            } else {
                res.status(403).json({status: 0, message: Constants.STATUS_MSG.ERROR.EMPTY_TOKEN.customMessage});
                return;
            }
        });
    },
};

async function decryptData(data){
    if(!data.encryptionKey) return {};    
    await rsaWrapper.initLoadKeys(__dirname + '/../utils');
    var decryptedKey = await rsaWrapper.decrypt(rsaWrapper.serverPrivate, data.encryptionKey);
    /*let descryptedPayload = JSON.parse(await aesWrapper.decrypt(Buffer.from(decryptedKey, 'base64'), data.encryptionData));*/


    let descryptedPayload = {};
    if(data.type && data.type=="web"){
        global.encryptionType = "web";
        descryptedPayload = await aesWrapper.webDecrypt(Buffer.from(decryptedKey, 'base64'), data.encryptionData);
    }else{
        descryptedPayload = JSON.parse(await aesWrapper.decrypt(Buffer.from(decryptedKey, 'base64'), data.encryptionData));
    }


    return descryptedPayload;
}