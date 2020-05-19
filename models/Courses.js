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
    isLocked:{type: Boolean, default:false},
    duration:  {type: String, default: ""} //asked by Sandeep to add 20nov19
}


let CourseSchema = new Schema({
    //title:          {type: String, default:""}, 
    title:          {
                        en:{type:String,default:""},
                        ar:{type:String,default:""}
                    },
    about:          {
                        en:{type:String,default:""},
                        ar:{type:String,default:""}
                    }, //about this course
    category:       {type: String, enum: ['1','2','3'],default:'1'},//1 - Audio, 2 - Video, 3 - Text*
    description:    {
                        en:{type:String,default:""},
                        ar:{type:String,default:""}
                    }, //who can take this course
    instructions:   {
                        en:{type:String,default:""},
                        ar:{type:String,default:""}
                    },
    //curriculum:     {type: String, default:""},
    curriculum:     {type: [curriculum], default: [], required: true},
    image:          {
        original:   {type:String, default:""},
        thumbnail:  {type:String, default:""},
    },
    cost:           {type: String, default:""},
    credits:        {type: String, default:""},
    expiryDate:     {type: String, default:""},
    status:         {type: String, enum: ['0','1'],default:'0'},//0 - Admin approval pending, 1 - approved and credits added by admin
    authorId:       {type: Schema.Types.ObjectId,ref:'Users'},
    isActive:       {type: Boolean,default:true },
    isDeleted: 		{type: Boolean,default:false }
},{timestamps:true});

module.exports = mongoose.model('Course',CourseSchema);



