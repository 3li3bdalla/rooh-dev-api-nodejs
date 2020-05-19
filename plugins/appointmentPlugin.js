'use strict';

const async = require('async');
if(process.env.ENABLE_DB_ENCRYPTION=="1"){
    var rsaWrapper = require('../Lib/rsa-wrapper');
}

module.exports = exports = function generateAppointmentUniqueCode(schema) {


    schema.pre('save', async function(next) {
        const AppointmentData = this.constructor;
        let data = await AppointmentData.findOne({}).sort( { "_id": -1 } );
        if(data!=null){
            this.appointmentNumber = ("00000"+ (Number(data.appointmentNumber)+1)).slice(-5);
        }
        let fileIdData = await AppointmentData.findOne({"user":ObjectId(this.user),"doctor":ObjectId(this.doctor)});
        if(fileIdData!=null){
            this.fileId = fileIdData.fileId;
        }else{// if no file id generated till now between doctor and user than generate a new fileId
            let newFileIdData = await AppointmentData.findOne().sort( { "fileId": -1 } );
            if(newFileIdData!=null){
                this.fileId = ("00000"+ (Number(newFileIdData.fileId)+1)).slice(-5);
            }
        }
        if(process.env.ENABLE_DB_ENCRYPTION=="1"){
            this.appointmentNumber = await rsaWrapper.encrypt(rsaWrapper.serverDBPub, ((this.appointmentNumber).toString('base64')));
            this.fileId = await rsaWrapper.encrypt(rsaWrapper.serverDBPub, ((this.fileId).toString('base64')));
        }
        next();
    });

};