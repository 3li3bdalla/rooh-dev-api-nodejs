'use strict';

let mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// array static schema
const professionalFacilities = {
    endTime:          {type: String, default: ""},
    startTime:        {type: String, default: ""},
    working:          {type: Boolean},
    slots:            [Number]
};

const ProfessionalFacilities  = new Schema({
    isWholeWeekWorking:   {type: Boolean, required: true},
    workingHours:         {type: [professionalFacilities], default: [], required: true},

    // references
    facility:                   {type: Schema.ObjectId, ref: 'Users', index: true, sparse: true},
    professional:               {type: Schema.ObjectId, ref: 'Users', index: true, required: true},
    professionalCategory:       {type: Schema.Types.ObjectId, ref:'ServiceCategory', required: true},
    status: {type: String, enum: [
        "ACTIVE", "BLOCKED", "DELETED"
        ], default: "ACTIVE"},
    facilityServices: [{type: Schema.Types.ObjectId,ref:'ProfessionalSpeciality',default:[]}]
//});
},{timestamps:true});

module.exports = mongoose.model('ProfessionalFacilities',ProfessionalFacilities);
