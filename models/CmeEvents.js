let mongoose=require('mongoose');
let Schema=mongoose.Schema;

let CmeEventsSchema = new Schema({
    title:      {
            en:{type:String,default:""},
            ar:{type:String,default:""}
    },
    image:      {
        original:   {type:String, default:""},
        thumbnail:  {type:String, default:""},
    },
    date:       {type: String, default:""},
    address:    {type: String, default:""},
    url:        {type: String, default:""},
    type:       {type: String, enum: ['1','2'],default:'1'}, // 1 - event, 2 - event organizer
    isDeleted:  {type: Boolean,default:false }
},{timestamps:true});

module.exports = mongoose.model('CmeEvents',CmeEventsSchema);



