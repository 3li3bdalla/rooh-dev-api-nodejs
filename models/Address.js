let mongoose=require('mongoose');
let Schema=mongoose.Schema;

let AddressSchema = new Schema({
    location:       { type: [Number], index: '2dsphere', sparse: true}, //[long, lat]
    locationName:	{ type:String,default:"" },
    houseNumber:	{ type:String,default:"" },
    addressName:	{ type:String,default:"" },
    userId:      	{ type:Schema.Types.ObjectId,ref:'Users'},
    isDefault: 		{ type:Boolean,default:true }
},{timestamps:true});

module.exports = mongoose.model('Address',AddressSchema);



