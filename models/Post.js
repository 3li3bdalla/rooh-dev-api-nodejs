'use strict';
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let PostSchema = new Schema({
    postBy:         {type:Schema.ObjectId,index:true,ref:"Users",sparse:true},
    postText:       {type:String, trim: true,default:""},
    imageUrl:       [{
        original:   {type:String, default:""},
        thumbnail:  {type:String, default:""},
        type:       {type:String, default:"img", enum: ["VIDEO","IMAGE", "img","video"]},
        fileName:   {type:String, default:""},
    }],
    likeByIds:      [{type:Schema.ObjectId,ref:"Users"}],
    likeCount:      {type:Number, default:0},
    shareByIds:     [{type:Schema.ObjectId,ref:"Users"}],
    shareCount:     {type:Number, default:0},
    viewedByIds:    [{type:Schema.ObjectId,ref:"Users"}],
    viewCount:      {type:Number, default:0},
    commentCount:   {type:Number, default:0},
    tags:           [{type: String}],
    taggedUsers:    [{
        userId:     {type:Schema.ObjectId,ref:"Users"},
        name:       {type:String, default:""}
    }],
    type:           {type:String,index:true, default:"1", enum: ["1","2"]}, // /speakout - 1 | explore - 2
    isDeleted:      {type:Boolean, default:false},
    isBlocked:      {type:Boolean, default:false},

    //sharecount

    //reportby
    //sharedby



    //groupId:{type:Schema.ObjectId,ref:"PostGroups",sparse:true},
    //readBy: [{type: Schema.ObjectId, ref: 'Users'}],
    //postCategoryId: {type: Schema.ObjectId, ref: 'Categories'},
    //hashTags: [{type: String}],
    // commentIds:[{type: Schema.ObjectId, ref: 'Comments'}],
}, {timestamps: true});

module.exports = mongoose.model('Post', PostSchema);
