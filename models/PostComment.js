
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
// let Configs = require('../Configs');

/*let likes={
    userId:{type:Schema.ObjectId,ref:"Users"},
    time:{type:Number,default:0},
};*/

let CommentSchema = new Schema({

    postId:     {type: Schema.ObjectId, ref: 'Posts'},
    commentBy:  {type: Schema.ObjectId,ref:'Users'},
    comment:    {type: String,default:''},
    commentId:  {type: Schema.ObjectId,ref:'PostComment', default:null},
    likeByIds:  [{type:Schema.ObjectId,ref:"Users"}],
    likeCount:  {type:Number,default:0},
    replyCount: {type:Number,default:0},
    isBlocked:  {type:Boolean,default:false},
    isDeleted:  {type:Boolean,default:false},


    // replyIds: [{type:Schema.ObjectId, ref: 'Replies'}],
    // userIdTag: [{type: Schema.ObjectId, ref: 'Users'}],
    //createdOn:  {type: Number,default:0},
    //editAt:     {type: Number,default:0},

}, {timestamps: true});

module.exports = mongoose.model('PostComment', CommentSchema);
