let mongoose=require('mongoose');
let Schema=mongoose.Schema;
const DB_CONSTANTS = require("../config/appConstants").DATABASE;

let title = {
    name: { type: String, required: true },
    type: { type: String, required: true },
};

let CommonServiceType = new Schema({
    isActive: 	{ type: Boolean, default: true },
    type: 		{ type: String, default: "" },
    template: 	{ type: String, default: "" },
    title: 		[title],
    duration: 	{ type: Number, default: 0 },
    userType:   { type: String,default: "PROFESSIONAL", enum: ["PROFESSIONAL","FACILITY"] }

},{timestamps:true});

module.exports = mongoose.model('CommonServiceType',CommonServiceType);
