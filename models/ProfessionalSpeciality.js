let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let ProfessionalSpeciality = new Schema({
    /*specialityName:    	{type:String,default:"" },
    specialityName_ar:  {type:String,default:"" },*/
    specialityName: {
                        en:{type:String,default:""},
                        ar:{type:String,default:""}
                    },
    /*specialist:    		{type:String,default:"" },
    specialist_ar:    	{type:String,default:"" },*/
    specialist:    	{
                        en:{type:String,default:""},
                        ar:{type:String,default:""}
                    },
    specialityIcon:    	{type:String,default:"" },
    serviceCategoryId: 	{type:Schema.Types.ObjectId,ref:'ServiceCategory'},
    parentId: 	       	{type:Schema.Types.ObjectId,ref:'ProfessionalSpeciality'},
    professionalType:  	[{type:Schema.Types.ObjectId,ref:'ProfessionalType'}],
    serviceType: {type: String, enum: [ "Normal", "Labs", "Radiologist" ], default: "Normal"},
    showIcon:           {type:Boolean,default:true }, //some subspeciality icons are not required to show, for that this check will be handled from admin panel
    isActive:    	   	{type:Boolean,default:true },
},{timestamps:true});

module.exports = mongoose.model('ProfessionalSpeciality',ProfessionalSpeciality);



