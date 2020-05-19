'use strict';

// npm modules
const joi           = require('joi');
const md5           = require('md5');
const handlebars    = require('handlebars');
const mongoose      = require('mongoose');
const bcrypt        = require("bcryptjs");
const randomString  = require("randomstring");
const async         = require('async');
// constructor
const Boom          = require('boom');

const Models        = require('../models');
const DAO           = require('../dao').queries;

// constants imported
const RESPONSE_MESSAGES = require('../config/response-messages');

const failActionFunction = function (request, reply, error) {
    try{
        console.log("mmmmmmmmmm", request.payload);
        console.log("mmmmmmmmmm--------_>>>>>>>>>>.", request.query);
        console.log("mmmmmmmmmm=======",  error.output.payload.type);

        error.output.payload.type = "Joi Error";

        if (error.isBoom) {
            delete error.output.payload.validation;
            if (error.output.payload.message.indexOf("authorization") !== -1) {
                error.output.statusCode = RESPONSE_MESSAGES.STATUS_MSG.ERROR.UNAUTHORIZED.statusCode;
                return error;
            }
            let details = error.details[0];
            if (details.message.indexOf("pattern") > -1 && details.message.indexOf("required") > -1 && details.message.indexOf("fails") > -1) {
                error.output.payload.message = "Invalid " + details.path;
                return error;
            }
        }

        let customErrorMessage = '';
        if (error.output.payload.message.indexOf("[") > -1) {
            customErrorMessage = error.output.payload.message.substr(error.output.payload.message.indexOf("["));
        } else {
            customErrorMessage = error.output.payload.message;
        }
        customErrorMessage = customErrorMessage.replace(/"/g, '');
        customErrorMessage = customErrorMessage.replace('[', '');
        customErrorMessage = customErrorMessage.replace(']', '');
        customErrorMessage = customErrorMessage.replace(customErrorMessage.charAt(0), customErrorMessage.charAt(0).toUpperCase());
        error.output.payload.message = customErrorMessage;
        delete error.output.payload.validation;
        return error;
    }catch(err){
        console.error(err);
    }
};


const customQueryDataValidations = function (type, key, data, callback) {
    let schema = {};
    switch (type) {
        case 'PHONE_NO': schema[key] = joi.string().regex(/^[0-9]+$/).length(10);
            break;
        case 'NAME': schema[key] = joi.string().regex(/^[a-zA-Z ]+$/).min(2);
            break;
        case 'BOOLEAN': schema[key] = joi.boolean();
            break;
    }
    let value = {};
    value[key] = data;

    joi.validate(value, schema, callback);
};


const authorizationHeaderObj = joi.object({
    authorization: joi.string().required()
}).unknown();

const authorizationHeaderObjOptional = joi.object({
    authorization: joi.string().optional()
}).unknown();

const CryptData = function (stringToCrypt) {
    return md5(md5(stringToCrypt));
};

const hashPassword = function (plainTextPassword) {

    return md5(md5(plainTextPassword));

    //bcrypt.hash(plainTextPassword,saltRounds,function(err,hash){
    //  callback(err,hash);
};

const compareHashPassword = function (plainTextPassword, hash) {

    return md5(md5(plainTextPassword)) === hash;

    /*bcrypt.compare(plainTextPassword,hash,function(err,res){
       callback(err,res);
    })*/
};

const getFileNameWithUserId = function (thumbFlag, fullFileName,type,uploadType) {
    let prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.ORIGINAL;
    if(type===CONSTANTS.appDefaults.DATABASE.FILE_TYPES.VIDEO) prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.VIDEO;
    if(type===CONSTANTS.appDefaults.DATABASE.FILE_TYPES.DOCUMENT) prefix = CONSTANTS.appDefaults.DATABASE.DOCUMENT_PREFIX;
    if(type===CONSTANTS.appDefaults.DATABASE.FILE_TYPES.OBJECT) prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.OBJECT;
    if(type===CONSTANTS.appDefaults.DATABASE.FILE_TYPES.TEXTURE_IMAGE) prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.TEXTURE_IMAGE;
    if(type===CONSTANTS.appDefaults.DATABASE.FILE_TYPES.MTL_FILE) prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.MTL_FILE;


    if(uploadType===CONSTANTS.appDefaults.DATABASE.UPLOAD_TYPES.OBJECT) prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.OBJECT_ORIGINAL;
    if(uploadType===CONSTANTS.appDefaults.DATABASE.UPLOAD_TYPES.GALLERY) prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.ORIGINAL;
    if(uploadType===CONSTANTS.appDefaults.DATABASE.UPLOAD_TYPES.PACKAGE) prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.PACKAGE;
    if(uploadType===CONSTANTS.appDefaults.DATABASE.UPLOAD_TYPES.BACKGROUND) prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.BACKGROUND;
    if(uploadType===CONSTANTS.appDefaults.DATABASE.UPLOAD_TYPES.LOGO) prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.LOGO;
    if(uploadType===CONSTANTS.appDefaults.DATABASE.UPLOAD_TYPES.FILTER) prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.FILTER;
    if(uploadType===CONSTANTS.appDefaults.DATABASE.UPLOAD_TYPES.LENSE) prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.LENSE;
    if(uploadType===CONSTANTS.appDefaults.DATABASE.UPLOAD_TYPES.PROFILE) prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.PROFILE;
    if(uploadType===CONSTANTS.appDefaults.DATABASE.UPLOAD_TYPES.CHAT) prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.PROFILE;
    let id = new Date().getTime() + Math.floor(Math.random() * 2920) + 1;
    let ext = fullFileName && fullFileName.length > 0 && fullFileName.substr(fullFileName.lastIndexOf('.') || 0);
    if (thumbFlag && type !== CONSTANTS.appDefaults.DATABASE.FILE_TYPES.TEXTURE_IMAGE) {
        prefix = CONSTANTS.appDefaults.DATABASE.FILE_PREFIX.THUMB;
    }
    console.log(prefix,'prefix')
    return prefix + id + ext;
};

const getFileNameWithUserIdWithCustomPrefix = function (thumbFlag, fullFileName, type, userId) {
    let prefix = '';
    if (type == CONSTANTS.appDefaults.DATABASE.FILE_TYPES.LOGO) {
        prefix = CONSTANTS.appDefaults.DATABASE.LOGO_PREFIX.ORIGINAL;
    } else if (type == CONSTANTS.appDefaults.DATABASE.FILE_TYPES.DOCUMENT) {
        prefix = CONSTANTS.appDefaults.DATABASE.DOCUMENT_PREFIX;
    }
    let ext = fullFileName && fullFileName.length > 0 && fullFileName.substr(fullFileName.lastIndexOf('.') || 0, fullFileName.length);
    if (thumbFlag && type == CONSTANTS.appDefaults.DATABASE.FILE_TYPES.LOGO) {
        prefix = CONSTANTS.appDefaults.DATABASE.LOGO_PREFIX.THUMB;
    }
    return prefix + userId + ext;
};

const generateFilenameWithExtension = function (oldFilename, newFilename) {
    let ext = oldFilename.substr(oldFilename.lastIndexOf(".") + 1);
    return newFilename + new Date().getTime() + Math.floor(Math.random() * 2920) + 1 + '.' + ext;
};

const updateNotificationMsgText = function (msg, data) {
    msg = handlebars.compile(msg);
    return msg(data);
};

const updateNotificationMsgObject = function (msgObj, data) {
    let msg = handlebars.compile(msgObj.customMessage);
    msgObj.customMessage = msg(data);
    return msgObj;
};

const checkObjectId = function (ids) {
    const ObjectId = mongoose.Types.ObjectId;
    if (ids && ids.$in && typeof ids.$in == 'object' && ids.$in.length) {
        let length = ids.$in.length;
        for (let i = 0; i < length; i++) {
            if (!ObjectId.isValid(ids.$in[i])) {
                return false;
            }
        }
        return true;
    } else {
        return ObjectId.isValid(ids);
    }
};

/*
* @function - deleteExtraObjKeys - This method will remove extra keys from object
*
* @params {Object} obj - This will be object on which delete keys operation will be performaed
* @params {String[]} - This will be array of keys to remove from the object
*
* @return {Object} - The new object with deleted keys
* */
const deleteObjKeys = (obj,keysToRemove) => {
    if(typeof keysToRemove !== 'object' || !keysToRemove.length) {
        throw '"keysToRemove" parameter must be of type array.';
    }
    let newObj = Object.assign({},obj);
    for(let i=0;i<keysToRemove.length;i++){
        delete newObj[keysToRemove[i]];
    }

    return newObj;
};

function removeDiacriticCharacters(phrase) {
    const strAccents = phrase.split('');
    let strAccentsOut = [];
    let strAccentsLen = strAccents.length;
    let accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
    let accentsOut = "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz";
    for (let i = 0; i < strAccentsLen; i++) {
        if (accents.indexOf(strAccents[i]) != -1) {
            strAccentsOut[i] = accentsOut.substr(accents.indexOf(strAccents[i]), 1);
        } else {
            strAccentsOut[i] = strAccents[i];
        }
    }
    strAccentsOut = strAccentsOut.join('');
    return strAccentsOut;
}


const escapeRegex = (str)=>{
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

let bCryptData=async function (data) {             // bcryptjs encryption
    return new Promise((resolve,reject)=> {
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(data, salt).then(result => {
                resolve(result)
            })
        })
    })
};

let compareCryptData = function (data, hash) {       // bcryptjs matching
    return new Promise((resolve,reject)=>{
        bcrypt.compare(data, hash).then(result=>{
            resolve(result)
        }).catch(err=>{
            reject(err)
        })
    })
};

const generateRandomString = function () {
    return randomString.generate(10);
};

const generateRandomOTP = function () {
    return randomString.generate({length: 4,
        charset: 'numeric'});
};

// convert [10:00 AM] -> [600] (minutes)
const convertTimeStringInMins = async function(timeStringArray) {
        return new Promise((resolve, reject) => {
            let minsArray = [];
            for(let string of timeStringArray) {
                let splitedString = string.split(' '),        // split 10:00 AM -> 10:00 & AM
                    am_pm = splitedString[1],
                    time = splitedString[0];

                time = time.split(':');   // split 10:05 in 10 and 05
                time = [parseInt(time[0]), parseInt(time[1])];

                //console.log("tiome------")

                if(am_pm === "AM"){
                    if(time[0]==12){
                        time[0] = 0;
                    }
                    minsArray.push((time[0]*60) + time[1]);
                } else {
                    if(time[0] === 12) minsArray.push((time[0]*60) + time[1]);
                    else {
                        time[0] = time[0] + 12;
                        minsArray.push((time[0]*60) + time[1]);
                    }
                }
            }
            resolve(minsArray);
        })
    };


const validateSchema = (data, schema, options) => {
    return new Promise((resolve, reject) => {
        joi.validate(data, schema, options, (err, value) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(value);
            }
        });
    });
}

const messageResponse = async function (payload) {
//async function messageResponse(payload){
    let aggregate = [
        {$match:{_id:ObjectId(payload.messageId)}},
        {
            $lookup:
                {
                    from: "users",
                    localField: "senderId",
                    foreignField: "_id",
                    as: "userId"
                }
        },
        {
            $lookup:
                {
                    from: "chats",
                    localField: "replyId",
                    foreignField: "_id",
                    as: "replyObject"
                }
        },
        { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$replyObject", preserveNullAndEmptyArrays: true } },
        {
            $lookup:
                {
                    from: "likes",
                    let: { chatId: "$_id"},
                    pipeline: [
                        { $match:
                                { $expr:
                                        { $and:
                                                [
                                                    { $eq: [ "$chatId",  "$$chatId" ] },
                                                    { $eq: [ "$userId", ObjectId(payload.userId)] }
                                                ]
                                        }
                                }
                        }
                    ],
                    as: "isLike"
                }
        },
        { $unwind: { path: "$isLike", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$info", preserveNullAndEmptyArrays: true } },
        {
            $lookup:
                {
                    from        : "users",
                    localField  : "info.userId",
                    foreignField: "_id",
                    as          : "info.userId"
                }
        },
        { $unwind: { path: "$info.userId", preserveNullAndEmptyArrays: true } },
        {
            $group : {
                _id    : "$_id",
                info   :  {$addToSet:{
                        _id           :"$info._id",
                        userId        :"$info.userId._id",
                        lastName      :"$info.userId.lastName",
                        role          :"$info.userId.role",
                        profilePicURL :"$info.userId.profilePicURL",
                        companyPicURL :"$info.userId.companyPicURL" ,
                        firstName     :"$info.userId.firstName",
                        messageStatus :"$info.messageStatus",
                        createdAt :"$info.createdAt",
                    }},
                isLike              : {$first:{$cond:{if:"$isLike",then:"$isLike.subType",else:""}}},
                LIKE                :  {$first:"$LIKE"},
                UNLIKE              :  {$first:"$UNLIKE"},
                replyObject         :  {$first:"$replyObject"},
                replyId             :  {$first:"$replyId"},
                HAHA                :  {$first:"$HAHA"},
                LOVE                :  {$first:"$LOVE"},
                WOW                 :  {$first:"$WOW"},
                note                :  {$first:"$note"},
                SAD                 :  {$first:"$SAD"},
                ANGRY               :  {$first:"$ANGRY"},
                type                :  {$first:"$type"},
                messageStatus       :  {$first:"$messageStatus"},
                isDeleted           :  {$first:"$isDeleted"},
                unread              :  {$first:"$unread"},
                image               :  {$first:"$image"},
                chatType            :  {$first:"$chatType"},
                senderId            :  {$first:"$senderId"},
                receiverId          :  {$first:"$receiverId"}, // Added by Gagan(20June)
                groupId             :  {$first:"$groupId"},
                contact             :  {$first:"$contact"},
                location            :  {$first:"$location"},
                conversationId      :  {$first:"$conversationId"},
                text                :  {$first:"$text"},
                createdAt           :  {$first:"$createdAt"},
                userId              :  {$addToSet:{
                        _id             :       {$cond: { if: "$userId._id",then:"$userId._id",else:""}},
                        firstName       :      "$userId.firstName",
                        lastName        :      "$userId.lastName",
                        role            :      "$userId.role",
                        fullName        :      "$userId.fullName",
                        profilePicURL   :      "$userId.profilePicURL"
                    }}

            }},
        { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
    ];

    return (await DAO.aggregateData(Models.Chat,aggregate));
}


module.exports = {
    CryptData: CryptData,
    failActionFunction: failActionFunction,
    getFileNameWithUserId: getFileNameWithUserId,
    getFileNameWithUserIdWithCustomPrefix: getFileNameWithUserIdWithCustomPrefix,
    customQueryDataValidations: customQueryDataValidations,
    hashPassword: hashPassword,
    compareHashPassword: compareHashPassword,
    updateNotificationMsgText: updateNotificationMsgText,
    updateNotificationMsgObject: updateNotificationMsgObject,
    authorizationHeaderObj: authorizationHeaderObj,
    authorizationHeaderObjOptional:authorizationHeaderObjOptional,
    generateFilenameWithExtension: generateFilenameWithExtension,
    checkObjectId: checkObjectId,
    removeDiacriticCharacters: removeDiacriticCharacters,
    deleteObjKeys : deleteObjKeys,
    escapeRegex : escapeRegex,
    bCryptData:bCryptData,
    compareCryptData:compareCryptData,
    generateRandomString:generateRandomString,
    generateRandomOTP:generateRandomOTP,
    convertTimeStringInMins:convertTimeStringInMins,
    validateSchema: validateSchema, 
    //ADDED BY GAGAN - 14AUG19   
    messageResponse               : messageResponse,
};
