let mongoose=require('mongoose');
let Schema=mongoose.Schema;
const DB_CONSTANTS = require("../config/appConstants").DATABASE;

let PatientAppointmentReportSchema = new Schema({

    appointmentId:  {type: Schema.Types.ObjectId, ref: 'appointment', required: true, index: true, sparse: true},
    userId:         {type: Schema.Types.ObjectId, ref: 'Users', required: true, index: true, sparse: true},
    dependentId:    { type:Schema.Types.ObjectId,ref:'Users.dependents', default:null},
    professionalId: {type: Schema.Types.ObjectId, ref: 'Users', required: true, index: true, sparse: true},
    allergies:      {type: String, default: ""},
    chiefComplaint: {type: String, default: ""},
    diagnostics:    [{type: Schema.Types.ObjectId, ref: 'CommonServiceType', required: true, index: true, sparse: true}],
    history:        {type: String, default: ""},
    examinationDiagnosticsResult: {type: String, default: ""},
    managementPlanRecommendation: {type: String, default: ""},
    stepwise:       { type: Number, default: DB_CONSTANTS.REPORTS_STEPWISE.E_REPORT,
                    enum: [
                        DB_CONSTANTS.REPORTS_STEPWISE.E_REPORT,
                        DB_CONSTANTS.REPORTS_STEPWISE.TEST_REQ,
                        DB_CONSTANTS.REPORTS_STEPWISE.FOLLOW_UP_APPOINTMENT,
                        DB_CONSTANTS.REPORTS_STEPWISE.E_PRESCRIPTION,
                        DB_CONSTANTS.REPORTS_STEPWISE.PROFESSIONAL_FACILTY
                    ]
    },
    tests:          [{type: Schema.Types.ObjectId, ref: 'CommonServiceType', default: null, index: true, sparse: true}],
    testComments:   { type: String, default: "" },
    medications:    [{
                        name: { type: String, default: "" },
                        dose: { type: String, default: "" },
                        frequency: { type: String, default: "" },
                        duration: { type: String, default: "" }
                    }],
    medicationsComments: { type: String, default: "" },
    startTime:      { type: String, default: "" },
    endTime:        { type: String, default: "" },
    slots:          { type: Array, default: [] },
    followUpDate:   { type: String, default: "" },
    referDoctorId:  {type: Schema.Types.ObjectId, ref: 'Users', default: null, index: true, sparse: true},
    isVerified:     { type: Boolean, default: false },
    isBlocked:      { type: Boolean, default: false },
    isDeleted:      { type: Boolean, default: false }
},{ timestamps: true });

module.exports = mongoose.model('PatientAppointmentReport', PatientAppointmentReportSchema);

