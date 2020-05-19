let mongoose=require('mongoose');
let Schema=mongoose.Schema;

const curriculum = {
    fileUrl:  {type: String, default: ""},//audio url, video url ie if category is 1 or 2
    thumbnail:{type:String, default:""},
    title:   {
                 en:{type:String,default:""},
                 ar:{type:String,default:""}
             },
    textData:{
                 en:{type:String,default:""},
                 ar:{type:String,default:""}
             },//text ie if category is 3
    isLocked:{type: Boolean, default:false}
}

let userCourseSchema = new Schema({    
    userId:         {type: Schema.Types.ObjectId,ref:'Users'},
    courseId:       {type: Schema.Types.ObjectId,ref:'Courses'}, //purchased course id
    courseCost:     {type: String, default:""},
    courseCredits:  {type: String, default:""},
    curriculum:     {type: [curriculum], default: [], required: true},
    isCompleted:    {type: Boolean,default:false },
    completedOn:    {type: String, default:""}, //date on which all the chapters of courses are completed
    completedChapters:[{type: String}], //ids of curriculum from courses mongo model
    paymentStatus:  {type: String, enum: ['Pending','Cancelled','Completed'],default:'Pending'},
    isActive:       {type: Boolean,default:true },
    isDeleted:      {type: Boolean,default:false }
},{timestamps:true});

module.exports = mongoose.model('UserCourses',userCourseSchema);



