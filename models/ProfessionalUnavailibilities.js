let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let ProfessionalUnavailibilitiesSchema= new Schema({
    userId:                 {type: String,default:""  },// professional's ID
    type:                   {type: String, enum: ["DATE","TIME"], default:"DATE"}, //type of duration - if unavailability is in terms of days then type will be DATE and if it is in terms of hours/minutes then type will be TIME
    start:                  {type: String,default:""  }, // type is DATE then start and end will be a Start Date and End Date, else it'll be Start Time and End Time
    end:                    {type: String,default:"" },      
},{timestamps:true});
//Userschema.index({'currentLocation': "2dsphere"});
const ProfessionalUnavailibilities = mongoose.model('ProfessionalUnavailibilities',ProfessionalUnavailibilitiesSchema);
module.exports = ProfessionalUnavailibilities;