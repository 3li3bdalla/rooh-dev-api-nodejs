let mongoose=require('mongoose');
let Schema=mongoose.Schema;

let ContractSchema = new Schema({
    //FIELDS ADDED AS PER NEW CONTRACT TEMPLATE
    idNumber:       {type: String},
    registrationNumber:{type: String},
    representativeName:{type: String},
    day:            {type: String},
    commercialRegistration:{type: String},
    procurationNumber:{type: String},
    postalCode:     {type: String},
    bankName:       {type: String},
    iban:           {type: String},
    swiftCode:      {type: String},
    /*bankCity:       {type: String},
    bankCountry:    {type: String},*/
    bankCountry:    {type: Schema.Types.ObjectId,ref:'Country', default: null},
    bankCity:       {type: Schema.Types.ObjectId,ref:'Country', default: null},
    currency:       {type: String},

    //FIELDS ADDED AS PER NEW CONTRACT TEMPLATE

    professionalId: {type: Schema.Types.ObjectId,ref:'Users'},
    teamManagerType:{type: String, enum: ['PROFESSIONAL','FACILITY'],default:'PROFESSIONAL'}, // type of hiring manager
    duration: { type: Number, default: 0 },
    //hiringDuration:	{type: String,default:"" }, //time period for which a professional will be hired
    //status: 		{type: String, enum: ['PENDING','HIRED'],default:'PENDING'},
    status: 		{type: String, enum: ['1','2','3','4'],default:'1'},
    templateId:   	{type: Schema.Types.ObjectId,ref:'CommonServiceType'},
    contract:       {type: String}, //save complete contract instead of template id
    teamSignature:{
        original:   {type:String, default:""},
        thumbnail:  {type:String, default:""},
        fileName:  {type:String, default:""},
        type:  {type:String, default:""}
    },
    cancelDescription: {type: String}, //details on cacellation of a contract
    isDeleted: 		{type: Boolean,default:false },
    contractSignDate: { type: Number, default: 0 },
    contractExpireDate: { type: Number, default: 0 }
},{timestamps:true});

module.exports = mongoose.model('Contract', ContractSchema);



