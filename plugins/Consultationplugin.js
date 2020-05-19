'use strict';
module.exports = exports = function generateAppointmentUniqueCode(schema) {
    schema.pre('save', function(next) {
        this.userIp = (req.headers['x-forwarded-for'] || '').split(',').pop() ||  req.connection.remoteAddress ||  req.socket.remoteAddress || req.connection.socket.remoteAddress;
        next();
    });
};