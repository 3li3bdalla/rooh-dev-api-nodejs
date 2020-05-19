let mongoose=require('mongoose');
let Schema=mongoose.Schema;

/*let title = {
    name: { type: String, required: true },
    type: { type: String, required: true },
};*/

let ServiceCategory = new Schema({
    /*serviceName:	{ type:String,default:"" },
    serviceName_ar:	{ type:String,default:"" },*/
    serviceName:    {
                        en:{type:String,default:""},
                        ar:{type:String,default:""}
                    },
    serviceIcon:    { type:String,default:"" },
    serviceType:	[{ type:String,default:"" }],// 1 - professional, 2 - facility, 3 - User
    templateType:	{ type:String,default:"" }, // 1 - doctor, 2 - hospital, 3 - pharmacy
    orderNumber:	{ type:Number,default:"1" },
    isActive: 		{ type:Boolean,default:true },
    isDeleted: 		{ type:Boolean,default:false },
    visible: 		{ type:Boolean,default:false },
},{timestamps:true});

module.exports = mongoose.model('ServiceCategory',ServiceCategory);



