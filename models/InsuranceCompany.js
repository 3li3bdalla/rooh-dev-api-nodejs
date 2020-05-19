let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let InsuranceCompany = new Schema({
    /*companyName:	{ type:String,default:"" },
    companyName_ar:	{ type:String,default:"" },*/
    companyName:    {
                        en:{type:String,default:""},
                        ar:{type:String,default:""}
                    },
    isActive: 		{ type:Boolean,default:true },
    isDeleted: 		{ type:Boolean,default:false },
},{timestamps:true});

module.exports = mongoose.model('InsuranceCompany',InsuranceCompany);



