
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AppConstraints = require('../config/appConstants')

var ScheduledPushNotifications = new Schema({    
    receiverId: { type: Schema.ObjectId, ref: 'Users', trim: true, required: true },
    doctor: { type: Schema.ObjectId, ref: 'Users', trim: true, required: true },
    appointmentId: { type: Schema.ObjectId, ref: "appointment", default: null, sparse: true },
    message: {
        'en': { type: String, default: '', trim: true },
        'ar': { type: String, default: '', trim: true }
    },
    time: { type: String, default: ''}
},{timestamps:true});


module.exports = mongoose.model('ScheduledPushNotifications', ScheduledPushNotifications);


