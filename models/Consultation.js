let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let Config = require('../config/appConstants')
//let Consultation_plugin = require("../plugins").Consultationplugin;

let title = {
    name: { type: String, required: true },
    type: { type: String, required: true },
};
let currency = {
    name: { type: String, required: true },
    type: { type: String, required: true },
};

let Consultation = new Schema({
    title:      [title],
    price:      { type: Number, default: 0 },
    minute:     { type: Number, default: 0 },
    consult:    { type: Number,default: Config.DATABASE.CONSULT.VIDEO, enum: [
                    Config.DATABASE.CONSULT.VIDEO,
                    Config.DATABASE.CONSULT.IMAGE,
                    Config.DATABASE.CONSULT.CHAT
                ] },
    consultType:{ type: Number, default: Config.DATABASE.CONSULT_TYPES.ONLINE, enum: [
                    Config.DATABASE.CONSULT_TYPES.ONLINE,
                    Config.DATABASE.CONSULT_TYPES.OFFSITE,
                    Config.DATABASE.CONSULT_TYPES.HOME
                ] },
    isActive:   { type:Boolean,default:true },
    isDeleted:  { type:Boolean,default:false },
    currency:   [currency],
    type:       { type: String,default: "USER", enum: ["USER","PROFESSIONAL"] },
    level:      [{ type: Schema.ObjectId, ref:'ProfessionalType', index: true, sparse: true }],
    speciality: { type: Schema.ObjectId, ref:'ProfessionalSpeciality', index: true, sparse: true },
    userIp:     { type: String, default: "" }
},{timestamps:true});

module.exports = mongoose.model('Consultation',Consultation);
/*Consultation.plugin(Consultation_plugin);
const PharmacyRequests = mongoose.model('Consultation',Consultation);
module.exports = Consultation;*/


