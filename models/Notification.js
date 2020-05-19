
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AppConstraints = require('../config/appConstants')

var Notification = new Schema({
    senderId: { type: Schema.ObjectId, ref: 'Users', trim: true, default: null, sparse: true },
    receiverId: { type: Schema.ObjectId, ref: 'Users', trim: true, required: true },
    appointmentId: { type: Schema.ObjectId, ref: "appointment", default: null, sparse: true },
    contentId: { type: String, default: '', trim: true }, // any id like postid, comment id, pharmacy request id, etc just to save
    type: {
        type: String,
        enum: [
            AppConstraints.NOTIFICATION_TYPE.CREATE_APPOINTMENT,
            AppConstraints.NOTIFICATION_TYPE.CREATE_POST,
            AppConstraints.NOTIFICATION_TYPE.POST_COMMENT,
            AppConstraints.NOTIFICATION_TYPE.FOLLOW_USER,
            AppConstraints.NOTIFICATION_TYPE.CREATE_PHARMACY_REQUEST,
            AppConstraints.NOTIFICATION_TYPE.HELP,
            AppConstraints.NOTIFICATION_TYPE.POST_LIKE,
            AppConstraints.NOTIFICATION_TYPE.COMMENT_LIKE,
            AppConstraints.NOTIFICATION_TYPE.USER_CHAMPION,
            AppConstraints.NOTIFICATION_TYPE.NOT_USER_CHAMPION,
            AppConstraints.NOTIFICATION_TYPE.USER_LIKE,
            AppConstraints.NOTIFICATION_TYPE.HIRE_PROFESSIONAL,
            AppConstraints.NOTIFICATION_TYPE.CREATE_TASK,
            AppConstraints.NOTIFICATION_TYPE.COMPLETE_TASK,
            AppConstraints.NOTIFICATION_TYPE.REJECT_TASK,
            AppConstraints.NOTIFICATION_TYPE.ACCEPT_TASK,
            AppConstraints.NOTIFICATION_TYPE.CONTRACT_SIGNED,
            AppConstraints.NOTIFICATION_TYPE.APPOINTMENT_CONFIRMATION,
            AppConstraints.NOTIFICATION_TYPE.UPDATE_APPOINTMENT,
            AppConstraints.NOTIFICATION_TYPE.CANCEL_APPOINTMENT,
            AppConstraints.NOTIFICATION_TYPE.ADD_FEEDBACK,
            AppConstraints.NOTIFICATION_TYPE.EDIT_CONTRACT,
            AppConstraints.NOTIFICATION_TYPE.JOIN_FACILITY,
            AppConstraints.NOTIFICATION_TYPE.REJECT_CONTRACT,
            AppConstraints.NOTIFICATION_TYPE.CREATE_LAB_REPORT,
            AppConstraints.NOTIFICATION_TYPE.CREATE_REPORT,
            AppConstraints.NOTIFICATION_TYPE.PHARMACY_ACTIONS,
            AppConstraints.NOTIFICATION_TYPE.UPCOMING_APPOINTMENT
        ],
        required: true
    },
    postType: { type: String, enum: [ "0","1","2"], default: '0'}, // 0 - default, 1 - speakouts, 2 - explore posts
    isRead: { type: Boolean, default: false },
    message: {
        'en': { type: String, default: '', trim: true },
        'ar': { type: String, default: '', trim: true }
    },
    title: { type: String, default: '', trim: true },
    isDeleted: { type:Boolean, default: false }
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    } // inserts createdAt and updatedAt
});


module.exports = mongoose.model('Notification', Notification);


