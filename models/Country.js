let mongoose=require('mongoose');
let Schema=mongoose.Schema;

let Country = new Schema({
    /*locationName:	{ type:String,default:"" },*/
    locationName:   {
                        en:{type:String,default:""},
                        ar:{type:String,default:""}
                    },
    countryFlagIcon:{ type:String,default:"" },
    countryCode:	{ type:String,default:"" },
    parentId:		{type:Schema.Types.ObjectId,ref:'Country', default:null},
    isActive: 		{ type:Boolean,default:true },
    isDeleted: 		{ type:Boolean,default:false },
},{timestamps:true});

module.exports = mongoose.model('Country',Country);



