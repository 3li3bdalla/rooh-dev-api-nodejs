let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let PharmacyRequests_plugin = require("../plugins").PharmacyRequestsplugin;


let PharmacyRequestsSchema = new Schema({
    orderId:        {type: String, default:"000001"},//Unique number
    customerId:     {type: Schema.Types.ObjectId,ref:'Users'},
    pharmacyId:     {type: Schema.Types.ObjectId,ref:'Users', default:null}, // id of pharmacy user
    file:{
        original:   {type:String, default:""},
        thumbnail:  {type:String, default:""},
        fileName:   {type:String, default:""}
    },
    medicationId:     {type: Schema.Types.ObjectId,ref:'PatientAppointmentReport'},
    allPharmacyIds: [{type: Schema.Types.ObjectId,ref:'Users'}], // ids of all pharmacy users to whom request have been sent
    acceptedPharmacyIds: [{type: Schema.Types.ObjectId,ref:'Users'}], // ids of pharmacy users who all have accepted beneficiary request
    facilityType:   {type: Schema.Types.ObjectId,ref:'Users', default:null}, //facility type ie category of pharmacy
    deliveryType:   {type: String, enum: ['1','2'],default:'1'}, // 1 - Home Delivery, 2 - Pickup
    location:       {type: [Number], index: '2dsphere', sparse: true}, //[long, lat]
    address:        {type: String, default: ""},
    //deliveredDate:  {type: String, default: ""},
    deliveredDate:  {type: String, default: ""/*required: true, default: Date.now()*/},
    status:         {type: String, enum: ['1','2','3','4','5'],default:'1'},//1 - new request(request sent to pharmacies), 2 - pending(request accepted by pharmacy but pending on customer end), 3 - open(request accepted on both ends and pharmacy is ready to deliver required products), 4 - delivered(requested products delivered), 5 - rejected request
    isDeleted:      {type: Boolean,default:false }
},{timestamps:true});

//module.exports = mongoose.model('PharmacyRequests',PharmacyRequestsSchema);
PharmacyRequestsSchema.plugin(PharmacyRequests_plugin);

const PharmacyRequests = mongoose.model('PharmacyRequests',PharmacyRequestsSchema);
module.exports = PharmacyRequests;



