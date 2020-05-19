let mongoose=require('mongoose');
let Schema=mongoose.Schema;

let TeamTasksSchema = new Schema({
    patientId:  	{type: Schema.Types.ObjectId,ref:'Users', default: null}, //professional or facility id who is hiring professionals
    facilityId: 	{type: Schema.Types.ObjectId,ref:'Users', default: null},
    professionalId: {type: Schema.Types.ObjectId,ref:'Users'},
    assignedById:   {type: Schema.Types.ObjectId,ref:'Users'}, //
    taskType: 		{type: Schema.Types.ObjectId,ref:'CommonServiceType'},
    description:	{type: String,default:"" },
    duration:		{type: String,default:"" },
    date:			{type: String,default:"" },
    time:			{type: String,default:"" },
    location: 		{type: [Number], index: '2dsphere', sparse: true}, //[long, lat]
    address: 		{type: String, default: ""},
    fees:			{type: String,default:"" },
    status: 		{type: String, enum: ['1','2','3','4'],default:'1'}, // 1 - pending tasks,  2 - accepted tasks, 3 - rejected tasks, 4 - completed tasks, 
    isDeleted: 		{type: Boolean,default:false }
},{timestamps:true});

module.exports = mongoose.model('TeamTasks',TeamTasksSchema);



