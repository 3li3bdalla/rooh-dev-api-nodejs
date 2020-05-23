var Models = require('../models');
var Constants = require('../config/appConstants');
var RESPONSE_MESSAGES = require('../config/response-messages')
var jwt = require("jsonwebtoken");
var multer = require('multer');
var is = require('is_js');
//DESCRYPTION
if (process.env.ENABLE_ENCRYPTION == "1") {
    var aesWrapper = require('../Lib/aes-wrapper');
    var rsaWrapper = require('../Lib/rsa-wrapper');
}
//DESCRYPTION

async function decryptData(data) {
    if (!data.encryptionKey) return {};
    await rsaWrapper.initLoadKeys(__dirname + '/../utils');
    var decryptedKey = await rsaWrapper.decrypt(rsaWrapper.serverPrivate, data.encryptionKey);
    /*let descryptedPayload = JSON.parse(await aesWrapper.decrypt(Buffer.from(decryptedKey, 'base64'), data.encryptionData));*/

    let descryptedPayload = {};
    /*if(data.type && data.type=="web"){
        global.encryptionType = "web";
        descryptedPayload = await aesWrapper.webDecrypt(Buffer.from(decryptedKey, 'base64'), data.encryptionData);
    }else{*/
    descryptedPayload = JSON.parse(await aesWrapper.decrypt(Buffer.from(decryptedKey, 'base64'), data.encryptionData));
    //}
    return descryptedPayload;
}



exports.validateToken = function (req, res, next) {
    global.encryptionType = "mobile";
    let token = req.headers['authorization'];
    // let language = "en";
    // if (!is.undefined(req.headers['language']) && req.headers['language'] != "") {
    //     language = req.headers['language'];
    // }

    if (token) {
        let authToken = token.split(" ")
        // console.log("-------", authToken[1]);

        jwt.verify(authToken[1], gRouter.get(Constants.SERVER.JWT_SECRET_KEY).toString(), async function (err, decoded) {

            // console.log('error token', err);
            if (err) {
                if (authToken[1] == Constants.SERVER.GUEST_TOKEN) {

                    //DESCRYPTION
                    if (process.env.ENABLE_ENCRYPTION == "1") {
                        if (req.body != undefined) {
                            req.body = await decryptData(req.body);
                        }
                        if (req.query != undefined) {
                            req.query = await decryptData(req.query);
                        }
                    }
                    //DESCRYPTION
                    global.userData = "";
                    next();
                } else {
                    res.status(401).json({
                        status: 0,
                        message: RESPONSE_MESSAGES.STATUS_MSG.ERROR.ERROR_TOKEN_AUTH.customMessage
                    });
                    return;
                }
            } else {
                //DESCRYPTION
                if (process.env.ENABLE_ENCRYPTION == "1") {
                    if (req.body != undefined) {
                        req.body = await decryptData(req.body);
                    }
                    if (req.query != undefined) {
                        req.query = await decryptData(req.query);
                    }
                }
                //DESCRYPTION
                Models.Users.findOne({
                    "_id": decoded._id
                }, {}, function (err, result) {
                    if (!result || (result.accessToken == "") || (result.accessToken != authToken[1])) return res.status(401).json({
                        status: 0,
                        message: RESPONSE_MESSAGES.STATUS_MSG.ERROR.ERROR_TOKEN_AUTH.customMessage
                    });

                    if (result.isBlocked == true) {
                        return res.status(403).json({
                            status: 0,
                            message: RESPONSE_MESSAGES.STATUS_MSG.ERROR.BLOCK_USER.customMessage
                        });
                    } else if (result.isDeleted == true) {
                        return res.status(403).json({
                            status: 0,
                            message: RESPONSE_MESSAGES.STATUS_MSG.ERROR.NO_USER_EXISTS.customMessage
                        });
                    } else {
                        global.userData = result;
                        global.language = req.headers.language;
                        req.credentials = result;
                        next();
                    }
                });
            }
        });
    } else {
        res.status(403).json({
            status: 0,
            message: RESPONSE_MESSAGES.STATUS_MSG.ERROR.EMPTY_TOKEN.customMessage
        });
        return;
    }
};