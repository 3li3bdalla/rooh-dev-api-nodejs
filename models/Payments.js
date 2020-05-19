let mongoose=require('mongoose');
let Schema=mongoose.Schema;

let PaymentsSchema = new Schema({
    type:           {type: String, enum: ['1','2','3','4'], default:'1'}, // 1 - Appointment, 2 - Wallet, 3 - Course, 4 - Instant Consultation
    consultType:    {type: String, enum: ['0','1','2','3'],default:'0'}, // 0 - Nothing, 1 - Audio Call, 2 - Video Call,3-Chat
    appointmentId:  {type: Schema.ObjectId, ref: 'appointment', default: null},
    courseId:       {type: Schema.ObjectId, ref: 'Courses', default: null},
    professionalId: {type: Schema.ObjectId, ref: 'Users', default: null},
    paymentMode:    {type: String, default:""},
    userId:         {type: Schema.Types.ObjectId,ref:'Users'},
    //walletId:     {type: Schema.Types.ObjectId,ref:'Users'},
    paymentStatus:  {type: String, default:""},
    paymentStatusMsg:{type: String, default:""},
    message:        {
        'en':       { type: String, default: '', trim: true },
        'ar':       { type: String, default: '', trim: true }
    },
    amount:         {type: String, default:""},
    professionalAmount:{type: String, default:""},
    //currency:       {type: String, default:""}, //SAR/AED/USD
    transactionId:  {type: String, default:""},
    registrationId: {type: String, default:""},
    response:       {type: String, default:""}, 
    action:         {type: String, enum: ['0','1'],default:'0'}, // 0 - Debited, 1 - Credited
    isDeleted:      {type: Boolean,default:false }
},{timestamps:true});

module.exports = mongoose.model('Payments',PaymentsSchema);



