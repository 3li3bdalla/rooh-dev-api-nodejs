let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let UserTempSchema= new Schema({
    userId:                 {type: String,default:""  },//INCASE USER WANT TO MERGE ACCOUNT WITH EXISTING ACCOUNT
    fbId:                   {type: String,default:""}, // USER CAN MERGE ACCOUNT ONLY IF USER IS LOGIN OR REGISTER WITH FB
    name:                   {type: String,default:""  },    
    email:                  {type: String,default:"" },  
    phone:                  {type: String,default:""},
    password:               {type: String,default:""  },
    countryCode:            {type: String,default:""  },
    otp:                    {type: String,default:""},
    otpExpiration:          {type: Date, default:null},
    role:                   [{type: String,default: []}],//USER,PROFESSIONAL
},{timestamps:true});
//Userschema.index({'currentLocation': "2dsphere"});
const UsersTemp = mongoose.model('UsersTemp',UserTempSchema);
module.exports = UsersTemp;