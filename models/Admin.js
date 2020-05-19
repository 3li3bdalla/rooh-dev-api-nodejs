let mongoose=require('mongoose');
let Schema=mongoose.Schema;
let Adminschema= new Schema({
    name:                   { type: String, required:true, index:true },
    email:                  { type: String,index:true },
    password:               { type: String, required:true },
    lastLogin:              { type: Date, default:null },
    token:                  { type: String, default: "" }
},{timestamps:true});
//Userschema.index({'currentLocation': "2dsphere"});
const admin = mongoose.model('Admin',Adminschema);
module.exports = admin;
