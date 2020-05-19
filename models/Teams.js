let mongoose=require('mongoose');
let Schema=mongoose.Schema;

let TeamSchema = new Schema({
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

    workingHours:   {type: String},
    shift:          {type: String},
    services:       [{type: Schema.Types.ObjectId,ref:'CommonServiceType',default:[]}],
    workingDays:    {type: [Boolean], max: 7},                   // days true or false from sun-0 to sat-6 index
    description:    {type: String},
    termCondition:  {type: String},
    //FIELDS ADDED AS PER NEW CONTRACT TEMPLATE

    teamManagerId:  {type: Schema.Types.ObjectId,ref:'Users'}, //professional or facility id who is hiring professionals
    professionalId: {type: Schema.Types.ObjectId,ref:'Users'},
    teamManagerType:{type: String, enum: ['PROFESSIONAL','FACILITY'],default:'PROFESSIONAL'}, // type of hiring manager
    //hiringDuration:	{type: String,default:"" }, //time period for which a professional will be hired
    startDate:      {type: String},
    endDate:      	{type: String},
    startTime:      {type: String},
    endTime:        {type: String},
    //status: 		{type: String, enum: ['PENDING','HIRED'],default:'PENDING'},
    status: 		{type: String, enum: ['1','2','3','4'],default:'1'},//1 - Pending requests list, 2 - accepted requests list, 3 - team members list, 4 - cancelled agreement (need to discuss cancelled status as I have to  hide agreement in case of status 4)
	templateId:   	{type: Schema.Types.ObjectId,ref:'CommonServiceType'},
    contract:       {type: String}, //save complete contract instead of template id
    teamManagerSignature:{
        original:   {type:String, default:""},
        thumbnail:  {type:String, default:""},
    },
    professionalSignature: {
        original:   {type:String, default:""},
        thumbnail:  {type:String, default:""},
    },
    cancelDescription: {type: String}, //details on cacellation of a contract
    isDeleted: 		{type: Boolean,default:false }
},{timestamps:true});

module.exports = mongoose.model('Team',TeamSchema);



