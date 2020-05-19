let mongoose=require('mongoose');
let Schema=mongoose.Schema;
const DB_CONSTANTS = require("../config/appConstants").DATABASE;

let PatientLabsReport = new Schema({

    "appointmentId": {type: Schema.Types.ObjectId, ref: 'appointment', required: true, index: true, sparse: true},
    "userId": {type: Schema.Types.ObjectId, ref: 'Users', required: true, index: true, sparse: true},
    "dependentId":    { type:Schema.Types.ObjectId,ref:'Users.dependents', default:null},
    "professionalId": {type: Schema.Types.ObjectId, ref: 'Users', required: true, index: true, sparse: true},
    "testType": [{type: Schema.Types.ObjectId, ref: 'CommonServiceType', default: null, index: true, sparse: true}],
    "allergies": { type: String, default: "" },
    "technic": { type: String, default: "" },
    "results": { type: String, default: "" },
    "attachments": [{
        "original": { type: String, default: "" },
        "thumbnail": { type: String, default: "" },
        "fileName": { type: String, default: "" },
        "type": { type: String, default: "" }
    }],
    "conclusion": { type: String, default: "" },
    "attachmentType": { type: String, default: "" },
    "isBlocked": { type: Boolean, default: false },
    "isDeleted": { type: Boolean, default: false },
    "folderId": { type: String, default: DB_CONSTANTS.FOLDERS.LABS['en'], enum: [
            DB_CONSTANTS.FOLDERS.LABS['en'],
            DB_CONSTANTS.FOLDERS.RADIOLOGY['en']
        ]}
},{ timestamps: true });

module.exports = mongoose.model('PatientLabsReport', PatientLabsReport);

