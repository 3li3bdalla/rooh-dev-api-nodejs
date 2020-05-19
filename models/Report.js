let mongoose=require('mongoose');
let Schema=mongoose.Schema;

let ReportSchema = new Schema({
    postId:     	{ type:Schema.Types.ObjectId,ref:'Post'},
    reportText:    	{ type:String,default:"" },
    userId:      	{ type:Schema.Types.ObjectId,ref:'Users'}
},{timestamps:true});

module.exports = mongoose.model('Report',ReportSchema);



