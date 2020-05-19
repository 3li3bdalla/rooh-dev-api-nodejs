let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let ProfessionalType = new Schema({
    /*typeName:      { type:String,default:"" },
    typeName_ar:    { type:String,default:"" },*/
    typeName:    	{
                        en:{type:String,default:""},
                        ar:{type:String,default:""}
                    },
    isActive:       { type:Boolean,default:true },    
},{timestamps:true});

module.exports = mongoose.model('ProfessionalType',ProfessionalType);



