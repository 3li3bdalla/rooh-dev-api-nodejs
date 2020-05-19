let mongoose=require('mongoose');
let Schema=mongoose.Schema;

let ApointmentFeedbackSchema = new Schema({
    rating:			{ type:Number,default:"" },
    feedback:		{ type:String,default:"" },
    userId:      	{ type:Schema.Types.ObjectId,ref:'Users'},//professionalId/facilityId
    beneficiaryId:  { type:Schema.Types.ObjectId,ref:'Users'},//userId who used services of facility or who booked appointment with professional
    //professionalId: { type:Schema.Types.ObjectId,ref:'Users'},//
    appointmentId: 	{ type: Schema.Types.ObjectId,ref:'appointment',index: true},
    isDeleted: 		{ type:Boolean,default:false }
},{timestamps:true});

module.exports = mongoose.model('ApointmentFeedback',ApointmentFeedbackSchema);



