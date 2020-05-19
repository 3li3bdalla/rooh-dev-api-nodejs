const AppConstraints  = require('../config/appConstants');
const responseMessage = require('../config/response-messages');
//var util = require('util');

if(process.env.ENABLE_ENCRYPTION=="1"){
    var rsaWrapper        = require('../Lib/rsa-wrapper');
    var aesWrapper        = require('../Lib/aes-wrapper');
}
if(process.env.ENABLE_DB_ENCRYPTION=="1"){
    var rsaWrapper          = require('../Lib/rsa-wrapper');
}

exports.invalidAccessTokenError = function (statusCode, language, message, res) {
    let lang = language ? language : 'en';
    var successData = {
        status: AppConstraints.STATUSCODE.UNAUTHORIZE,
        data: {},
        message: message.message ? message.message[lang] : responseMessage.STATUS_MSG.ERROR.DEFAULT.message[lang]
    };
    sendData(successData, statusCode, res);
};

exports.somethingWentWrongError = function (statusCode, language, message, res) {

    let lang = language ? language : 'en';
    var successData = {
        status: AppConstraints.STATUSCODE.INTERNAL_SERVER_ERROR,
        data: {},
        message: message.message ? message.message[lang] : responseMessage.STATUS_MSG.ERROR.DEFAULT.message[lang]
    };
    sendData(successData, statusCode, res);
};


exports.accountBlockedOrDeleted = function (statusCode, language, message, res) {

    let lang = language ? language : 'en';
    var successData = {
        status: (statusCode === 402 ? AppConstraints.STATUSCODE.APP_ERROR : AppConstraints.STATUSCODE.ROLE_CHANGE),
        data: {},
        message: message.message ? message.message[lang] : responseMessage.STATUS_MSG.ERROR.DEFAULT.message[lang]
    };
    sendData(successData, statusCode, res);
};



exports.sendSuccessData = async function (data, statusCode, language, message, res, decryptColumns = []) {

    let lang = language ? language : 'en';
    //console.log("data ----------- ********* ",data)
    if(process.env.ENABLE_DB_ENCRYPTION=="1" && decryptColumns.length > 0){ // if db encryption is enabled and there are columns to decrypt
        if(Array.isArray(data)){
            for(let i in data){
                await decryptDBData(data[i], decryptColumns);
            }
        }else{
            await decryptDBData(data, decryptColumns);
        }
    }
    if(process.env.ENABLE_ENCRYPTION=="1"){
        data = await encryptData(data);
    }
    //console.log("enc data ----------- ********* ",data)

    var successData = {
        status: 1,
        statusCode: statusCode,
        data: data,
        message:  message.message ? message.message[lang] : responseMessage.STATUS_MSG.ERROR.DEFAULT.message[lang]
    };
    sendData(successData, statusCode, res);
};


/*exports.sendSuccessDataForOTP = function (data, statusCode, language, message, res) {

    let lang = language ? language : 'en';

    var successData = {
        statusCode: AppConstraints.STATUSCODE.SUCCESS,
        data: data.data,
        isExists: data.isExists,
        msg:  message.message ? message.message[lang] : responseMessage.STATUS_MSG.ERROR.DEFAULT.message[lang]
    };
    sendData(successData, statusCode, res);
};*/


/*exports.sendSuccessMessage = function (message, language, res) {

    var successData = {
        status: "true", 
        message: message,
        flag:104
    };
    sendData(successData, res);
};*/

exports.sendErrorMessage = function (statusCode, language, message, res) {

    let lang = language ? language : 'en';
    var successData = {
        status: 0,
        statusCode: statusCode,
        data: {},
        message: message.message ? message.message[lang] : responseMessage.STATUS_MSG.ERROR.DEFAULT.message[lang]
    };
    sendData(successData, statusCode, res);
};

exports.sendErrorMessageData = async function (statusCode, language, message, data, res) {

    let lang = language ? language : 'en';
    if(process.env.ENABLE_ENCRYPTION=="1"){
        data = await encryptData(data);
    }
    var successData = {
        status: 0,
        statusCode: statusCode,
        data: data,
        message: message.message ? message.message[lang] : responseMessage.STATUS_MSG.ERROR.DEFAULT.message[lang]
    };
    sendData(successData, statusCode, res);
};

/*exports.sendErrorMessagePrevious = function (statusCode, language, message, res) {

    let lang = language ? language : 'en';
    var successData = {
        status: AppConstraints.STATUSCODE.BAD_REQUEST,
        data: {},
        msg: message.message ? message.message[lang] : responseMessage.STATUS_MSG.ERROR.DEFAULT.message[lang]
    };
    sendData(successData, statusCode, res);
};
*/

exports.sendError = function (statusCode, error, language, res) {

    let lang = language ? language : 'en';
    var errorMessage = {
        statusCode:statusCode,
        data: {},
        message: error
    };
    sendData(errorMessage, statusCode, res);
};


exports.successStatusMsg = function (res) {

    var successMsg = {"status": "true"};
    sendData(successMsg, res);
};


async function sendData(data, statusCode, res) {
    // if (res.socket.parser.incoming.originalMethod !== 'GET' && res.socket.parser.incoming.route &&
    //     res.socket.parser.incoming.credentials) {
    //     await DAO.saveData(Models.ApiUpdateLogs, {
    //         apiName:  res.socket.parser.incoming.route ? res.socket.parser.incoming.route.path : '',
    //         updatedBy:{
    //             _id: res.socket.parser.incoming.credentials ? res.socket.parser.incoming.credentials._id : '',
    //             type: res.socket.parser.incoming.credentials ? res.socket.parser.incoming.credentials.user : 'user'
    //         },
    //         statusCode : res.statusCode,
    //         message: data.msg,
    //         payload: res.socket.parser.incoming.body,
    //         headers: res.socket.parser.incoming.headers,
    //         ipInfo:res.socket.parser.incoming.rawHeaders});
    // }
    return res.status(statusCode).json(data);
}


exports.sendData = async function (data, statusCode, res) {
    // if (res.socket.parser.incoming.originalMethod !== 'GET') {
    //     await DAO.saveData(Models.ApiUpdateLogs, {
    //         apiName: res.socket.parser.incoming.route ? res.socket.parser.incoming.route.path : '',
    //         updatedBy:{
    //             _id: res.socket.parser.incoming.credentials ? res.socket.parser.incoming.credentials._id : '',
    //             type:  res.socket.parser.incoming.credentials ? res.socket.parser.incoming.credentials.user : ''
    //         },
    //         statusCode : res.statusCode,
    //         message:  data.msg,
    //         payload: res.socket.parser.incoming.body,
    //         headers: res.socket.parser.incoming.headers,
    //         ipInfo:res.socket.parser.incoming.rawHeaders});
    // }
    //data = await encryptData(data);
    return res.status(statusCode).json(data);
};


async function encryptData(data){
    const aesKey = await aesWrapper.generateKey();
    let encryptedAesKey = await rsaWrapper.encrypt(rsaWrapper.clientPub, (aesKey.toString('base64')));
    let encryptedMessage = {};
    /*if(encryptionType && encryptionType == "web"){
        encryptedMessage = await aesWrapper.webEncrypt(aesKey, JSON.stringify(data))
    }else{*/
        encryptedMessage = await aesWrapper.encryptData(aesKey, JSON.stringify(data))
    //}
    let response = {"encryptionKey":encryptedAesKey, "encryptionData":encryptedMessage};
    return response
}
async function decryptDBData(data,fieldCheck){
    for(let x of fieldCheck){
        data[x] = await rsaWrapper.decrypt(rsaWrapper.serverDBPrivate, data[x]);
    }
    return data;
}