'use strict';

const async = require('async');

module.exports = exports = function generateAppointmentUniqueCode(schema) {
    
    schema.pre('save', async function(next) {
        const RequestData = this.constructor;
        let data = await RequestData.findOne({}).sort( { "_id": -1 } );
        if(data!=null){
            this.orderId = ("00000"+ (Number(data.orderId)+1)).slice(-5);
        }
        next();
    });

};