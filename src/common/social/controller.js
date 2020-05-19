'use strict';

//npm modules
const async = require('async');
const is = require("is_js");
const bcrypt = require('bcryptjs');
const Joi = require('joi');
var saltRounds          = 10;


 // local modules
const Models = require('../../../models'),
    Dao = require('../../../dao').queries,
    controllerUtil = require('./controllerUtil'),
    Constants = require('../../../config/appConstants'),
    RESPONSE_MESSAGES = require('../../../config/response-messages'),
    UniversalFunctions = require('../../../utils').universalFunctions,
    commonFunctions = require('../../../utils').commonController,
    SocketManager = require('../../../Lib/SocketManager'),
    sendResponse = require('../../sendResponse'),
    NotificationManager = require('../../../Lib/NotificationManager'),
    CommonController = require('../../commonController');


module.exports = {
    homeData: async (req, res) => {
        try {
            let obj = req.query;
            let countLimit = 7
            let explorePostCountLimit = 5
            if (!is.undefined(obj.countLimit) && !is.empty(obj.countLimit)) {
                countLimit = Number(obj.countLimit);
                explorePostCountLimit = Number(obj.countLimit);
            }
            let dataToSend = {speakouts:""}//, criteria, commentsCriteria;
            await Promise.all([
                getPostsList("1", countLimit),
                getPostsList("2", explorePostCountLimit),
                getNotificationCount()
            ])
            .then(response => {
                dataToSend.speakouts = response[0].posts;
                dataToSend.speakoutsCount = response[0].postsCount;
                dataToSend.explorePosts = response[1].posts;
                dataToSend.explorePostsCount = response[1].postsCount;
                dataToSend.notificationCount = response[2];
                return sendResponse.sendSuccessData(dataToSend,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
            })
            .catch(err => {
                console.log(err);
                return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,err,res);
            });

        } catch (err) {
            console.log(err);
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    createPost: (req, res) => {
        try {
            let obj = req.body;
            let tagsData = [];
            if (is.undefined(obj.tags) || is.empty(obj.tags)) {
                obj.tags = [];
            }else{
                tagsData = obj.tags.split(",");
                obj.tags = tagsData.map(i => i.replace('#', ''));
            }
            console.log(obj)
            let post = new Models.Post({
                postBy: ObjectId(userData._id),
                postText: obj.postText ? obj.postText : "",
                type: obj.type,
                tags: tagsData,
                imageUrl: typeof obj.imageUrl === 'string' ? JSON.parse(obj.imageUrl) : obj.imageUrl,
                taggedUsers: typeof obj.taggedUsers === 'string' ? JSON.parse(obj.taggedUsers) : obj.taggedUsers
            });
            post.save(function (error, result) {
                if (error) {
                    console.log(error)
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,error,res);
                } else {
                    Models.Users.findOne({"_id": ObjectId(result.postBy)}, function (userErr, userResult) {
                        let socketData = {
                            _id         : result._id,
                            imageUrl    : result.imageUrl,
                            taggedUsers : result.taggedUsers,
                            tags        : result.tags,
                            postText    : result.postText,
                            type        : result.type,
                            isLiked     : false,
                            isViewed    : false,
                            commentCount: result.commentCount,
                            likeCount   : result.likeCount,
                            shareCount  : result.shareCount,
                            viewCount   : result.viewCount,
                            createdAt   : result.createdAt,
                            postBy      : {
                                            _id : result.postBy,
                                            name : userResult.name,
                                            profilePic : userResult.profilePic,
                                            coverPic : userResult.coverPic,
                                            defaultLoginRole : userResult.defaultLoginRole
                                        }
                        }
                        SocketManager.createPost(socketData);

                        Models.Follow.find({"followedId": ObjectId(userData._id), "type": "1"},{followById:1}, async function (followByIdError, followByIdResult) {
                            //let output = [];
                            for(let x of followByIdResult){ //output.push(ObjectId(x.followedId))}
                                await sendPush(
                                    Constants.NOTIFICATION_TYPE.CREATE_POST,
                                    Constants.NOTIFICATION_TITLE.CREATE_POST,
                                    Constants.NOTIFICATION_MESSAGE.CREATE_POST,
                                    x.followById,
                                    result._id,
                                    req.credentials._id,
                                    obj.type
                                )
                            }
                        });

                        if(obj.tags.length > 0){
                            let tagCriteria = [];
                            for(let x of obj.tags){
                                tagCriteria.push({tag:x,postId:ObjectId(result._id),userId:ObjectId(userData._id)})
                            }
                            Models.PostTags.insertMany(tagCriteria, function (tagsError, tagsResult) {
                                return sendResponse.sendSuccessData(socketData,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                            });
                        }else{
                            return sendResponse.sendSuccessData(socketData,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                        }

                    });
                }
            });
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    deletePost: (req, res) => {
        try {
            let obj = req.body;
            Models.Post.updateOne({"_id": ObjectId(obj.postId)},{"isDeleted":true},function (err, result) {
                if (err) {
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,err,res);
                } else {
                    return sendResponse.sendSuccessData({},200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });
        } catch (err) {
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    getTagsByUser: (req, res) => {
        try {
            let obj = req.query;
            Models.PostTags.find({"userId": ObjectId(userData._id)/*,"tag": { '$regex': ".*" + obj.tag + ".*", '$options': 'i' }*/ },{tag:1,_id:0},function (err, result) {
                if (err) {
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,err,res);
                } else {
                    return sendResponse.sendSuccessData(result,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });
        } catch (err) {
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    getPostsByTag: (req, res) => {
        try {
            let obj = req.query;
            if (is.undefined(obj.tag) || is.empty(obj.tag)) {
                return res.status(400).json({status: 0, message: "Tag name is required"});
            }
            Models.Post.find({"tags":{$in:"#"+obj.tag}, "isDeleted":false,"isBlocked":false},function (err, result) {
                if (err) {
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,err,res);
                } else {
                    return sendResponse.sendSuccessData(result,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });
        } catch (err) {
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    reportPost: (req, res) => {
        try {
            let obj = req.body;
            let reportPost = new Models.Report({
                postId: ObjectId(obj.postId),
                reportText: obj.reportText,
                userId: ObjectId(userData._id)
            });
            reportPost.save(function (error, result) {
                if (error) {
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,error,res);
                } else {
                    Models.Post.findOne({"_id": ObjectId(obj.postId), "isDeleted":false},{postBy:1,posttype:1}, function (err, result) {
                        sendPush(
                            Constants.NOTIFICATION_TYPE.USER_LIKE,
                            Constants.NOTIFICATION_TITLE.USER_LIKE,
                            Constants.NOTIFICATION_MESSAGE.USER_LIKE,
                            result.postBy, //rec
                            result.postBy, //content
                            req.credentials._id, //sender
                            result.posttype // posttype
                        )
                    });
                    return sendResponse.sendSuccessData({},200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });
        } catch (err) {
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    listExplorePosts: async (req, res) => {
        try {
            let obj = req.query;
            let match;
            let criteria, lookup, unwind, project;
            let output = await getFollowingIds();
            if (is.undefined(obj.count) || is.empty(obj.count)) {
                obj.count = 100;
            }else{
                obj.count = Number(obj.count);
            }
            let reportedPosts = await getReportedPosts();
            match = {
              "type": "2",
              "isDeleted":false,
              "isBlocked":false
            }
            if(obj.lastId){
                match._id = {$lt:ObjectId(obj.lastId)};
            }

            if (obj.otherUserId) {
                match.postBy = ObjectId(obj.otherUserId);
            }

            Models.Post.aggregate([
                {
                    $match: match
                },
                { $lookup: {
                    from: "users",
                    localField: "postBy",
                    foreignField: "_id",
                    as: "postBy"
                } },
                {$unwind: "$postBy"},
                {$project:{
                    imageUrl:1,
                    taggedUsers:1,
                    tags:1,
                    postText:1,
                    "isLiked": {$cond: { if: {
                                    $in: [ ObjectId(userData._id), "$likeByIds" ]
                                }, then: true, else: false }},
                    "isViewed": {$cond: { if: {
                            $in: [ ObjectId(userData._id), "$viewedByIds" ]
                        }, then: true, else: false }},
                    commentCount:1,
                    likeCount:1,
                    shareCount:1,
                    viewCount:1,
                    isDeleted:1,
                    isBlocked:1,
                    createdAt:1,
                    "postBy._id":"$postBy._id",
                    "postBy.name":"$postBy.name",
                    "postBy.profilePic":"$postBy.profilePic",
                    "postBy.coverPic":"$postBy.coverPic",
                    "postBy.defaultLoginRole":"$postBy.defaultLoginRole"
                }},
                {$sort: {_id: -1}},
                {$limit:obj.count}
            ], (err, result) => {
                if (err) {
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,err,res);
                } else {
                    return sendResponse.sendSuccessData(result,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });

        } catch (err) {
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    listSpeakouts: async (req, res) => {
        try {
            let obj = req.query;
            let reportedPosts,match;
            let criteria, lookup, unwind, project;
            let uId;
            if (is.undefined(obj.count) || is.empty(obj.count)) {
                obj.count = 100;
            }else{
                obj.count = Number(obj.count);
            }

            if(obj.type=="1"){

                if (obj.otherUserId) {
                    uId = ObjectId(obj.otherUserId);
                }else{
                    uId = ObjectId(userData._id);
                }
                let output = await getFollowingIds();
                if(obj.lastId){
                    match = {
                        $or: [
                            {"postBy": { "$in": output }},
                            {"postBy": uId}
                        ],
                        //"postBy": uId,
                        "type":"1",
                        "_id":{$lt:ObjectId(obj.lastId)}, 
                        "isDeleted":false,
                        "isBlocked":false
                    }
                }else{
                    match = {
                        $or: [
                            {"postBy": { "$in": output }},
                            {"postBy": uId}
                        ],
                        //"postBy": uId,
                        "type":"1", 
                        "isDeleted":false,
                        "isBlocked":false
                    }
                }
                if(obj.keyword && obj.keyword!=""){
                    match.postText =  { '$regex': ".*" + obj.keyword + ".*", '$options': 'i' }
                }
                criteria = [
                    {
                        $match: match
                    },
                    { $lookup: {
                        from: "users",
                        localField: "postBy",
                        foreignField: "_id",
                        as: "postBy"
                    } },
                    {$unwind: "$postBy"},
                    {$project:{
                        _id:1,
                        imageUrl:1,
                        taggedUsers:1,
                        tags:1,
                        postText:1,
                        commentCount:1,
                        likeCount:1,
                        shareCount:1,
                        viewCount:1,
                        isDeleted:1,
                        isBlocked:1,
                        "isLiked": {$cond: { if: {
                            $in: [ ObjectId(userData._id), "$likeByIds" ]
                        }, then: true, else: false }},
                        "isViewed": {$cond: { if: {
                            $in: [ ObjectId(userData._id), "$viewedByIds" ]
                        }, then: true, else: false }},
                        "postBy._id":"$postBy._id",
                        "postBy.name":"$postBy.name",
                        "postBy.profilePic":"$postBy.profilePic",
                        "postBy.coverPic":"$postBy.coverPic",
                        "postBy.defaultLoginRole":"$postBy.defaultLoginRole",
                        createdAt:1
                    }},
                    {$sort: {_id: -1}},
                    {$limit:obj.count}
                ]
            }else{
                reportedPosts = await getReportedPosts();
                if(obj.lastId){
                    match = {
                        $and:[
                            {"_id": {$nin: reportedPosts}},
                            {"_id":{$lt:ObjectId(obj.lastId)}},
                            {"postBy": {$ne : ObjectId(userData._id)}}
                        ],
                        "type":"1",
                        "isDeleted":false,
                        "isBlocked":false
                    }
                }else{
                    match = {
                        "postBy": {$ne : ObjectId(userData._id)},
                        "_id": {$nin: reportedPosts},
                        "type":"1", 
                        "isDeleted":false,
                        "isBlocked":false
                    }
                }
                
                if(obj.keyword && obj.keyword!=""){
                    match.postText =  { '$regex': ".*" + obj.keyword + ".*", '$options': 'i' }
                }
                //console.log("match--------------",match)

                criteria = [
                    {
                        $match: match
                    },
                    /*{$lookup:{
                        "from": "follows",
                        "localField":"postBy",
                        "foreignField": "followedId",
                        "as": "follow"
                    }},
                    {$unwind: "$follow"},*/
                    {$lookup: {
                        "from": "users",
                        "localField": "postBy",
                        "foreignField": "_id",
                        "as": "postBy"
                    }},
                    {$unwind: "$postBy"},
                    /*{$match: {
                        "follow.followById": ObjectId(userData._id),
                        "type":"1"
                    }},*/
                    {$project:{
                        _id:"$_id",
                        imageUrl:1,
                        taggedUsers:1,
                        tags:1,
                        postText:1,
                        commentCount:1,
                        likeCount:1,
                        shareCount:1,
                        viewCount:1,
                        isDeleted:1,
                        isBlocked:1,
                        "isLiked": {$cond: { if: {
                            $in: [ ObjectId(userData._id), "$likeByIds" ]
                        }, then: true, else: false }},
                        "isViewed": {$cond: { if: {
                            $in: [ ObjectId(userData._id), "$viewedByIds" ]
                        }, then: true, else: false }},
                        "postBy._id":"$postBy._id",
                        "postBy.name":"$postBy.name",
                        "postBy.profilePic":"$postBy.profilePic",
                        "postBy.coverPic":"$postBy.coverPic",
                        "postBy.defaultLoginRole":"$postBy.defaultLoginRole",
                        createdAt:1
                    }},
                    {$sort: {_id: -1}},
                    {$limit:obj.count}
                ]
            }
            //console.log("criteria---------------",JSON.stringify(criteria))
            Models.Post.aggregate(criteria, (err, result) => {
                if (err) {
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,err,res);
                } else {
                    return sendResponse.sendSuccessData(result,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    followUnfollowUser: async (req, res) => {
        try {
            let obj = req.body;
            let result;
            let followersCountBeforeAction  = await Models.Follow.countDocuments({"followedId": ObjectId(obj.userId), "type": "1"});
            let criteria = { followById: ObjectId(userData._id), followedId: ObjectId(obj.userId), "type": "1" };
            

            if(obj.action == "1"){
                result = await Models.Follow.updateOne(criteria, criteria, {upsert: true});
            }else{
                result = await Models.Follow.deleteOne(criteria);
            }
            if(result){

                var userCriteria = {"_id": ObjectId(obj.userId)};
                var championResult = await Models.Users.findOne(userCriteria, { _id:0, isChampion:1, role:1});
                let followersCount  = await Models.Follow.countDocuments({"followedId": ObjectId(obj.userId), "type": "1"});
                if (championResult.role.indexOf("USER") != -1 && 
                    championResult.isChampion != undefined && 
                    championResult.isChampion!="2" && 
                    championResult.isChampion!="3"){
                    var championValue = "0";
                    if(followersCount > 499){championValue="1";}
                    await Models.Users.updateOne(userCriteria, {isChampion:championValue});
                    var pushTitle = "", pushMessage = "";
                    if(followersCountBeforeAction == 500 && followersCount == 499){
                        pushTitle = Constants.NOTIFICATION_TITLE.NOT_USER_CHAMPION
                        pushMessage = Constants.NOTIFICATION_MESSAGE.NOT_USER_CHAMPION
                    }else if(followersCountBeforeAction == 499 && followersCount == 500){
                        pushTitle = Constants.NOTIFICATION_TITLE.USER_CHAMPION
                        pushMessage = Constants.NOTIFICATION_MESSAGE.USER_CHAMPION
                    }
                    if(pushTitle!="" && pushMessage!=""){
                        sendPush(
                            Constants.NOTIFICATION_TYPE.USER_CHAMPION,
                            pushTitle,
                            pushMessage,
                            obj.userId, //rec
                            obj.userId, //content
                            req.credentials._id, //sender
                            "0"
                        )
                    }
                }
                if(obj.action=="1"){
                    sendPush(
                        Constants.NOTIFICATION_TYPE.FOLLOW_USER,
                        Constants.NOTIFICATION_TITLE.FOLLOW_USER,
                        Constants.NOTIFICATION_MESSAGE.FOLLOW_USER,
                        obj.userId, //rec
                        obj.userId, //content
                        req.credentials._id, //sender
                        "0"
                    )
                }
                return sendResponse.sendSuccessData({},200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
            }else{
                return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
            }
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    followList: async (req, res) => {
        try {

            let obj = req.query;
            let criteria, searchCriteria={}, match;
            let userIds = [];
            if (is.undefined(obj.count) || is.empty(obj.count)) {
                obj.count = 100;
            }else{
                obj.count = Number(obj.count);
            }

            if(obj.type == "1"){
                if (!is.undefined(obj.searchUser) && !is.empty(obj.searchUser)) {
                    searchCriteria = {"followedId.name": { '$regex': ".*" + obj.searchUser + ".*", '$options': 'i' } }
                }
                if(obj.lastId){
                    if (obj.otherUserId) {
                        match = {"followById": ObjectId(obj.otherUserId),"_id":{$lt:ObjectId(obj.lastId)}, "type": "1"}
                    }
                    else {
                        match = {"followById": ObjectId(userData._id),"_id":{$lt:ObjectId(obj.lastId)}, "type": "1"}
                    }
                }else{
                    if (obj.otherUserId) {
                        match = {"followById": ObjectId(obj.otherUserId), "type": "1"}
                    }
                    else {
                        match = {"followById": ObjectId(userData._id), "type": "1"}
                    }
                }

                criteria = [
                    {$match: match},
                    { $lookup: {
                        from: "users",
                        localField: "followedId",
                        foreignField: "_id",
                        as: "followedId"
                    } },
                    {$unwind: "$followedId"},
                    {$project:{
                        isFollowed:{$literal: true},
                        "followedId._id":"$followedId._id",
                        "followedId.name":"$followedId.name",
                        "followedId.profilePic":"$followedId.profilePic",
                        "followedId.coverPic":"$followedId.coverPic",
                        "followedId.defaultLoginRole":"$followedId.defaultLoginRole"
                    }},
                    {$match: searchCriteria},
                    {$sort: {_id: -1}},
                    {$limit:obj.count}
                ]
            }else{
                if (!is.undefined(obj.searchUser) && !is.empty(obj.searchUser)) {
                    searchCriteria = {"followById.name": { '$regex': ".*" + obj.searchUser + ".*", '$options': 'i' }};
                }
                if(obj.lastId){
                    if (obj.otherUserId) {
                        match = {"followedId": ObjectId(obj.otherUserId),"_id":{$lt:ObjectId(obj.lastId)}, "type": "1"}
                    }
                    else {
                        match = {"followedId": ObjectId(userData._id),"_id":{$lt:ObjectId(obj.lastId)}, "type": "1"}
                    }
                }else{
                    if (obj.otherUserId) {
                        match = {"followedId": ObjectId(obj.otherUserId), "type": "1"}
                    }
                    else {
                        match = {"followedId": ObjectId(userData._id), "type": "1"}
                    }
                }
                let output = await getFollowingIds();
                criteria = [
                    {$match: match},
                    { $lookup: {
                        from: "users",
                        localField: "followById",
                        foreignField: "_id",
                        as: "followById"
                    } },
                    {$unwind: "$followById"},
                    {$project:{
                        // followedId:1,
                        isFollowed: {$cond: { if: {
                            $in: [ "$followById._id", output ]
                        }, then: true, else: false }},
                        "followById._id":"$followById._id",
                        "followById.name":"$followById.name",
                        "followById.profilePic":"$followById.profilePic",
                        "followById.coverPic":"$followById.coverPic",
                        "followById.defaultLoginRole":"$followById.defaultLoginRole"
                    }},
                    {$match: searchCriteria},
                    {$sort: {_id: -1}},
                    {$limit:obj.count}
                ]
            }

            Models.Follow.aggregate(criteria, (err, result) => {
                if (err) {
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,err,res);
                } else {
                    return sendResponse.sendSuccessData(result,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });
        } catch (err) {
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    postComment: async (req, res) => {
        try {
            let obj = req.body;
            let result;
            if (is.undefined(obj.commentId) || is.empty(obj.commentId)) {
                obj.commentId = null;
            }
            let comment = new Models.PostComment({
                commentBy: ObjectId(userData._id),
                comment: obj.comment,
                postId: obj.postId,
                commentId: obj.commentId
            });
            result  = await comment.save();
            if(!result){
                return sendResponse.sendErrorMessage(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,res);
            } else {
                //await Models.Post.updateOne({ _id : ObjectId(obj.postId) }, {$inc : { commentCount:1 }});
                let postData = await Models.Post.findOneAndUpdate({ _id : ObjectId(obj.postId) }, {$inc : { commentCount:1 }});
                if(obj.commentId != null){
                    await Models.PostComment.updateOne({ _id : ObjectId(obj.commentId) }, {$inc : { replyCount:1 }});
                }
                if(req.credentials._id.toString() != postData.postBy.toString()){
                    sendPush(
                        Constants.NOTIFICATION_TYPE.POST_COMMENT,
                        Constants.NOTIFICATION_TITLE.POST_COMMENT,
                        Constants.NOTIFICATION_MESSAGE.POST_COMMENT,
                        postData.postBy, //rec
                        obj.postId, //content
                        req.credentials._id, //sender
                        postData.type // posttype
                    )
                }

                return sendResponse.sendSuccessData(result,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
            }
        } catch (err) {
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    deleteComment: async (req, res) => {
        try {
            let obj = req.body;
            let criteria= {};
            let dataToSet = {};
            let postData = await Models.PostComment.findOne({"_id": ObjectId(obj.commentId), "isDeleted":false},{postId:1});
            if(postData){
                console.log("postData-------",postData)
                criteria = {_id : ObjectId(postData.postId)}
                dataToSet.$inc = { commentCount: -1 } //increment like count
                await Models.Post.updateOne(criteria, dataToSet);
            }
            Models.PostComment.updateOne({"_id": ObjectId(obj.commentId)},{"isDeleted":true},function (err, result) {
                if (err) {
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,err,res);
                } else {
                    return sendResponse.sendSuccessData({},200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });
        } catch (err) {
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    likeUnlike: async (req, res) => {
        try {
            let obj = req.body;
            let criteria = {}
            let dataToSet = {}
            let result;
            if(obj.action == 1){
                criteria = {
                    _id : ObjectId(obj.id), // comment id or post id
                    likeByIds: {$nin: ObjectId(obj.userId)}
                }
                dataToSet.$addToSet = { likeByIds:ObjectId(obj.userId) } // push user ids to array
                dataToSet.$inc = { likeCount:1 } //increment like count
                if(obj.type == 1){ //post
                    result = await Models.Post.updateOne(criteria, dataToSet);
                }else{ //comment/reply
                    result = await Models.PostComment.updateOne(criteria, dataToSet);
                }
            }else{
                criteria = {
                    _id : ObjectId(obj.id), // comment id or post id
                    likeByIds: {$in: ObjectId(obj.userId)}
                }
                dataToSet.$pull = { likeByIds:ObjectId(obj.userId) } // push user ids to array
                dataToSet.$inc = { likeCount: -1 } //increment like count
                if(obj.type == 1){ //post
                    result = await Models.Post.updateOne(criteria, dataToSet);
                }else{ //comment/reply
                    result = await Models.PostComment.updateOne(criteria, dataToSet);
                }
            }
            if(result){
                if(obj.action == 1){
                    var pushType = ""
                    var pushTitle = ""
                    var pushMsg = ""
                    var recId = "";
                    var contentId = "";
                    var contentType = "0";
                    if(obj.type == 1){
                        var postData = await Models.Post.findOne({ _id : ObjectId(obj.id) },{_id:1,postBy:1,type:1});
                        pushType = Constants.NOTIFICATION_TYPE.POST_LIKE
                        pushTitle = Constants.NOTIFICATION_TITLE.POST_LIKE
                        pushMsg = Constants.NOTIFICATION_MESSAGE.POST_LIKE                        
                        recId = postData.postBy;
                        contentId = postData._id;
                        contentType = postData.type;
                    }else{                        
                        var commentData = await Models.PostComment.findOne({ _id : ObjectId(obj.id) },{_id:1,postBy:1,type:1});
                        pushType = Constants.NOTIFICATION_TYPE.COMMENT_LIKE
                        pushTitle = Constants.NOTIFICATION_TITLE.COMMENT_LIKE
                        pushMsg = Constants.NOTIFICATION_MESSAGE.COMMENT_LIKE
                        recId = commentData.commentBy;
                        contentId = commentData._id;
                        contentType = "0";
                    }
                    if(req.credentials._id.toString() != recId.toString()){
                        sendPush(
                            pushType,
                            pushTitle,
                            pushMsg,
                            recId, //rec
                            contentId, //content
                            req.credentials._id, //sender
                            contentType // posttype
                        )
                    }
                }
                return sendResponse.sendSuccessData({},200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
            }else{
                return sendResponse.sendErrorMessage(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,res);
            }
        } catch (err) {
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    sharePost: async (req, res) => {
        try {
            let obj = req.body;
            let result;
            let dataToSet = {};
            let sharedData = {};
            result = await Models.Post.findOne({"_id": ObjectId(obj.postId)});
            if(!result){
                return sendResponse.sendErrorMessage(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,res);
            }else{
                dataToSet.$addToSet = { shareByIds : ObjectId(userData._id) } // push user ids to array
                dataToSet.$inc = { shareCount:1 } //increment like count
                await Models.Post.updateOne({_id : ObjectId(obj.postId)}, dataToSet);

                let post = new Models.Post({
                    postBy: ObjectId(userData._id),
                    postText: result.postText,
                    imageUrl: result.imageUrl,
                    type: result.type,
                    taggedUsers: result.taggedUsers,
                    tags: result.tags
                });
                sharedData = await post.save();
            }
            if(result){
                sharedData = JSON.parse(JSON.stringify(sharedData));
                sharedData.postBy = {"_id":sharedData.postBy}
                return sendResponse.sendSuccessData(sharedData,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
            }else{
                return sendResponse.sendErrorMessage(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,res);
            }
        } catch (err) {
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    postDetails: async (req, res) => {
        try {
            let obj = req.query;
            let dataToSend = [];
            let criteria, commentsCriteria;
            if (is.undefined(obj.postId) || is.empty(obj.postId)) {
                return res.status(400).json({status: 0, message: "Post id is required"});
            }
            let id = ObjectId(obj.postId);
            await Promise.all([
                getPostData(id),
                getPostComments(id)
            ])
            .then(response => {
                //console.log("response ----------- ",response)
                dataToSend = response[0][0];
                //console.log("dataToSend ----------- ",dataToSend)
                dataToSend.comments = response[1];
                return sendResponse.sendSuccessData(dataToSend,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
            })
            .catch(err => {
                console.log(err)
                return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,err,res);
            });

        } catch (err) {
            console.log("error in view user full details in user controller under controllers---", err);
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    viewPost: (req, res) => {
        try {
            let obj = req.body;
            let dataToSet = {};
            dataToSet.$addToSet = { viewedByIds : ObjectId(userData._id) } // push user ids to array
            dataToSet.$inc = { viewCount:1 } //increment view count
            Models.Post.updateOne({_id : ObjectId(obj.postId), viewedByIds: {$nin: ObjectId(userData._id)}}, dataToSet,function (err, result) {
                if (err) {
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,err,res);
                } else {
                    return sendResponse.sendSuccessData({},200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });
        } catch (err) {
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    addRemoveContact: async (req, res) => {//followById = senderid, followedId= receiverid
        try {
            let obj = req.body;
            let result;
            let criteria

            //let criteria = { followById: ObjectId(userData._id), followedId: ObjectId(obj.userId), "type": "2" };
            let dataToSet = { followById: ObjectId(userData._id), followedId: ObjectId(obj.userId), "type": "2","contactStatus":"0" };

            if(obj.action == "1"){
                criteria = { followById: ObjectId(userData._id), followedId: ObjectId(obj.userId), "type": "2" }
                result = await Models.Follow.updateOne(criteria, dataToSet, {upsert: true});
            }else if(obj.action == "2"){
                criteria = {
                    $or: [
                        {followById: ObjectId(userData._id), followedId: ObjectId(obj.userId)},
                        {followById: ObjectId(obj.userId), followedId: ObjectId(userData._id)}
                    ],
                    "type": "2" }
                result = await Models.Follow.deleteOne(criteria);
            }else if(obj.action == "3"){
                criteria = { followById: ObjectId(obj.userId), followedId: ObjectId(userData._id), "type": "2" }
                result = await Models.Follow.updateOne(criteria, { "contactStatus":"1" }, {upsert: true});
            }
            if(result){
                return sendResponse.sendSuccessData({},200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
            }else{
                return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
            }
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    /*acceptRejectContact: async (req, res) => {
        try {
            let obj = req.body;
            let result;

            let criteria = { followById: ObjectId(userData._id), followedId: ObjectId(obj.userId), "type": "2" };
            let dataToSet = {"contactStatus":"1" };

            result = await Models.Follow.updateOne(criteria, dataToSet, {upsert: true});
            if(result){
                return sendResponse.sendSuccessData({},200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
            }else{
                return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
            }
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },*/
    contactsList: async (req, res) => {
        try {

            let obj = req.query;
            let criteria, searchCriteria={
                _id: {$ne : ObjectId(userData._id)}
            },searchCriteria1={
                _id: {$ne : ObjectId(userData._id)}
            }, match1,match2, result;
            let userIds = [];
            if (is.undefined(obj.count) || is.empty(obj.count)) {
                obj.count = 100;
            }else{
                obj.count = Number(obj.count);
            }

            if (!is.undefined(obj.searchUser) && !is.empty(obj.searchUser)) {

                let keyword ={$regex:commonFunctions.escapeRegExp(obj.searchUser),$options:'i'};
                searchCriteria.$or = [{"name": keyword}, {phone: keyword}];
                searchCriteria1.$or = [{"name": keyword}, {phone: keyword}];


                //searchCriteria = {"followedId.name": { '$regex': ".*" + obj.searchUser + ".*", '$options': 'i' } }
            }

            if(obj.lastId){
                //match1 = {"followById": ObjectId(userData._id),"_id":{$lt:ObjectId(obj.lastId)}, "type": "2"}
                criteria = {
                  $or: [{"followById": ObjectId(userData._id)},{"followedId": ObjectId(userData._id)}],
                  "type": "2",
                  "_id":{$lt:ObjectId(obj.lastId)}
                };
            }else{
                //match1 = {"followById": ObjectId(userData._id), "type": "2"}
                criteria = {
                  $or: [{"followById": ObjectId(userData._id)},{"followedId": ObjectId(userData._id)}],
                  "type": "2"
                };
            }
            /*let criteria = {
              $or: [{"followById": ObjectId(userData._id)},{"followedId": ObjectId(userData._id)}],
              "type": "2"
            };*/
            console.log(searchCriteria1,"--------searchCriteria -**** ",searchCriteria)
            result = await Models.Follow.find(criteria/*,{followedId:1}*/)
            .populate('followById', '_id name email coverPic profilePic defaultLoginRole phone countryCode jid', searchCriteria)
            .populate('followedId', '_id name email coverPic profilePic defaultLoginRole phone countryCode jid', searchCriteria1)
            .exec();
            let queryPromises = [];
            //console.log("result -- ",JSON.stringify(result))
            result = JSON.parse(JSON.stringify(result));
            for (let ress of result){
                    if (ress.followedId != null) {
                        ress.userData = ress.followedId;
                    } else {
                        ress.userData = ress.followById;
                    }
                    if(ress.userData!=null){
                        if(ress.userData._id == userData.rescuerId){
                            ress.isRescuer = true;
                        }else{
                            ress.isRescuer = false;
                        }
                        delete ress.followById
                        delete ress.followedId
                        if (ress.userData != null) {
                            queryPromises.push(ress);
                        }
                    }
            }
            queryPromises = queryPromises.filter(function (a) {
                if (!this[a.userData._id]) {
                    this[a.userData._id] = true;
                    return true;
                }
            }, Object.create(null));
            /*if (!is.undefined(obj.searchUser) && !is.empty(obj.searchUser)) {
                searchCriteria = {"followedId.name": { '$regex': ".*" + obj.searchUser + ".*", '$options': 'i' } }
            }
            if(obj.lastId){
                match1 = {"followById": ObjectId(userData._id),"_id":{$lt:ObjectId(obj.lastId)}, "type": "2"}
            }else{
                match1 = {"followById": ObjectId(userData._id), "type": "2"}
            }
            let friendsGroup1 = await Models.Follow.aggregate([{$match: match1},{$project:{friendsId:"$followedId",_id:0}}]);

            if (!is.undefined(obj.searchUser) && !is.empty(obj.searchUser)) {
                searchCriteria = {"followById.name": { '$regex': ".*" + obj.searchUser + ".*", '$options': 'i' } }
            }
            if(obj.lastId){
                match2 = {"followedId": ObjectId(userData._id),"_id":{$lt:ObjectId(obj.lastId)}, "type": "2"}
            }else{
                match2 = {"followedId": ObjectId(userData._id), "type": "2"}
            }
            let friendsGroup2 = await Models.Follow.aggregate([{$match: match2},{$project:{friendsId:"$followById",_id:0}}]);
            console.log(friendsGroup1,"-------",friendsGroup2 )*/
            //result = friendsGroup1.concat(friendsGroup2)
            if (!result) {
                return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,err,res);
            } else {
                return sendResponse.sendSuccessData(queryPromises,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
            }
            /*Models.Follow.aggregate(criteria, (err, result) => {
                if (err) {
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,err,res);
                } else {
                    return sendResponse.sendSuccessData(result,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });*/

                /*criteria = [
                    {$match: match},*/
                    /*{ $lookup: {
                        from: "users",
                        localField: "followedId",
                        foreignField: "_id",
                        as: "followedId"
                    } },
                    {$unwind: "$followedId"},
                    { $lookup: {
                        from: "users",
                        localField: "followById",
                        foreignField: "_id",
                        as: "followById"
                    } },
                    {$unwind: "$followById"},
                    {$project:{
                        isFollowed:{$literal: true},
                        "followedId._id":"$followedId._id",
                        "followedId.name":"$followedId.name",
                        "followedId.profilePic":"$followedId.profilePic",
                        "followedId.coverPic":"$followedId.coverPic",
                        "followedId.defaultLoginRole":"$followedId.defaultLoginRole"
                    }},
                    {$match: searchCriteria},
                    {$sort: {_id: -1}},
                    {$limit:obj.count}*/
                //]
            /*}else{
                if (!is.undefined(obj.searchUser) && !is.empty(obj.searchUser)) {
                    searchCriteria = {"followById.name": { '$regex': ".*" + obj.searchUser + ".*", '$options': 'i' }};
                }
                if(obj.lastId){
                    match = {"followedId": ObjectId(userData._id),"_id":{$lt:ObjectId(obj.lastId)}, "type": "1"}
                }else{
                    match = {"followedId": ObjectId(userData._id), "type": "1"}
                }
                let output = await getFollowingIds();
                criteria = [
                    {$match: match},
                    { $lookup: {
                        from: "users",
                        localField: "followById",
                        foreignField: "_id",
                        as: "followById"
                    } },
                    {$unwind: "$followById"},
                    {$project:{
                        // followedId:1,
                        isFollowed: {$cond: { if: {
                            $in: [ "$followById._id", output ]
                        }, then: true, else: false }},
                        "followById._id":"$followById._id",
                        "followById.name":"$followById.name",
                        "followById.profilePic":"$followById.profilePic",
                        "followById.coverPic":"$followById.coverPic",
                        "followById.defaultLoginRole":"$followById.defaultLoginRole"
                    }},
                    {$match: searchCriteria},
                    {$sort: {_id: -1}},
                    {$limit:obj.count}
                ]
            }*/

            /*Models.Follow.aggregate(criteria, (err, result) => {
                if (err) {
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,err,res);
                } else {
                    return sendResponse.sendSuccessData(result,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });*/
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    addRemoveFavourite: async (req, res) => {
        try {
            let obj = req.body;
            let result;
            let criteria = {"_id":ObjectId(userData._id)};

            let dataToSet = {};
            if(obj.action=="1"){
                if(obj.role=="1"){
                    dataToSet.$addToSet = { favoriteProfessionals : ObjectId(obj.userId) } // push user ids to array
                }else{
                    dataToSet.$addToSet = { favoriteFacilities : ObjectId(obj.userId) } // push user ids to array
                }                
            }else{                
                if(obj.role=="1"){
                    dataToSet.$pull = { favoriteProfessionals : ObjectId(obj.userId) } // pull user id from array
                }else{
                    dataToSet.$pull = { favoriteFacilities : ObjectId(obj.userId) } // pull user id from array
                }
            }            
            result = await Models.Users.updateOne(criteria, dataToSet);

            if(result){

                if(obj.action == "1"){
                    sendPush(
                        Constants.NOTIFICATION_TYPE.USER_LIKE,
                        Constants.NOTIFICATION_TITLE.USER_LIKE,
                        Constants.NOTIFICATION_MESSAGE.USER_LIKE,
                        obj.userId, //rec
                        obj.userId, //content
                        req.credentials._id, //sender
                        "0" // posttype
                    )
                }

                return sendResponse.sendSuccessData({},200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
            }else{
                return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
            }

        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    addRemoveRescuer: async (req, res) => {
        try {
            let obj = req.body;
            let result;
            let criteria = {"_id":ObjectId(userData._id)};

            let dataToSet = {};
            if(obj.action=="1"){
                dataToSet = {"rescuerId":ObjectId(obj.contactId)}
            }else{
                dataToSet = {"rescuerId":null}
            }            
            result = await Models.Users.updateOne(criteria, dataToSet);

            if(result){
                return sendResponse.sendSuccessData({},200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
            }else{
                return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
            }

        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },    
    getMyRescuer: async (req, res) => {
        try {
            let obj = req.query;
            let result = {};
            if(userData.rescuerId){
                result = await Models.Users.findOne({_id: ObjectId(userData.rescuerId)},{_id:1, name:1, email:1, coverPic:1, profilePic:1, defaultLoginRole:1, phone:1, countryCode:1, jid:1});
            }
            return sendResponse.sendSuccessData(result,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    getFavouritesList: async (req, res) => {
        try {
            let obj = req.query;
            let result = {};
            if(obj.type=="1"){
                result = await getFavoriteProfessionals(req.headers.language,obj);
            }else{
                result = await getFavoriteFacility(req.headers.language,obj);
            }
            if (!result) {
                return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,{},res);
            } else {
                return sendResponse.sendSuccessData(result,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
            }
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },

    getFavouritesLikeList: async (req, res) => {
        try {
            let obj = req.query;
            let result = {};
            let criteria = {
                $or: [
                    {"favoriteFacilities": { "$in": [ObjectId(obj.userId)] }},
                    {"favoriteProfessionals": { "$in": [ObjectId(obj.userId)] }}
                ]
            }

            if(obj.lastId && obj.lastId!=""){ criteria._id = {$lt:ObjectId(obj.lastId)} } //FOR PAGINATION
            
            if (is.undefined(obj.count) || is.empty(obj.count)) { obj.count = 100; }
            else{ obj.count = Number(obj.count); } //FOR PAGINATION

            if(obj.keyword && obj.keyword!=""){
                criteria.name =  { '$regex': ".*" + obj.keyword + ".*", '$options': 'i' }
            }
            Models.Users.aggregate([
                { "$match": criteria },
                {
                    $lookup: {
                        from: "professionalspecialities",
                        let: {userId: '$professional.professionalSpeciality'},
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {$eq: ["$_id", "$$userId"]},
                                            {$eq: ["$isActive", true]}
                                        ]
                                    }
                                }
                            }],
                        as: 'professional.professionalSpeciality'
                    }
                },
                { "$unwind": {
                        "path": "$professional.professionalSpeciality",
                        "preserveNullAndEmptyArrays": true
                } },

                {$project:{
                    _id:1,
                    name:1,
                    profilePic:1,
                    coverPic:1,
                    defaultLoginRole:1,
                    professional : {
                        professionalSpeciality:{
                            _id:1,
                            specialityIcon:1,
                            specialityName:"$professional.professionalSpeciality.specialityName."+req.headers.language,
                            specialist:"$professional.professionalSpeciality.specialist."+req.headers.language,
                        }
                    }
                }},
                {$sort: {_id: -1}},
                {$limit:obj.count}
            ], (err, result) => {
                if (err) {
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,err,res);
                } else {                    
                    return sendResponse.sendSuccessData(result,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });


        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    changePassword: async (req, res) => {
        let language = req.headers.language;
        try {
            let schema = Joi.object().keys({
                oldPassword: Joi.string().required(),
                newPassword: Joi.string().required()
            });

            let payload = await UniversalFunctions.validateSchema(req.body, schema, {presence: "required"});

            let checkPassword1 = await Models.Users.findOne({
                _id: req.credentials._id
            });

            let checkPassword = await bcrypt.compareSync(payload.oldPassword, checkPassword1.password);
            if (!checkPassword) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INCORRECT_OLD_PASSWORD;
            let checkNewPassword = await bcrypt.compareSync(payload.newPassword, checkPassword1.password);
            if (checkNewPassword) throw RESPONSE_MESSAGES.STATUS_MSG.ERROR.INCORRECT_OLD_NEW_PASSWORD;

            let query = {
                "_id": ObjectId(req.credentials._id)
            };
            let updateData = {
                "password": bcrypt.hashSync(payload.newPassword, saltRounds)
            };
            await DAO.findAndUpdate(Models.Users, query, updateData, {lean: true});

            return sendResponse.sendSuccessData({}, 200, req.headers.language, RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT, res);

        }
        catch (err) {
            //console.log(err, '===============error================');
            if (err.isJoi) {
                return sendResponse.sendError(Constants.STATUSCODE.BAD_REQUEST, err.message, req.headers.language, res);
            }
            else {
                return sendResponse.sendErrorMessage(Constants.STATUSCODE.BAD_REQUEST, req.headers.language, err, res);
            }
        }
    }
};
function getNotificationCount(){
    return Models.Notification.countDocuments({"receiverId":ObjectId(userData._id), "isRead" : false});
}

async function getPostsList(type,countLimit) { //type : 1=speakouts, 2-explorePosts
    let output = await getFollowingIds();
    let reportedPosts = await getReportedPosts();

    console.log(reportedPosts, "reportedPosts");

    let criteria = {};

    /*if (type == "2") {
        criteria = {
            "type": type,
            "isDeleted":false,
            "isBlocked":false
        }
    }
    else {
        criteria = {
            $or: [
                {"postBy": { "$in": output }},
                {"postBy": ObjectId(userData._id)}
            ],
            "_id": {$nin: reportedPosts},
            "type": type,
            "isDeleted":false,
            "isBlocked":false
        }
    }*/

    //UPDATED CRITERIA TO BELOW AS PER NEW REQUIREMENTS IN 31ST OCT MEETING
    criteria = {
        "_id": {$nin: reportedPosts},
        "type": type,
        "isDeleted":false,
        "isBlocked":false
    }


    let match = criteria;
    let lookup = {
            from: "users",
            localField: "postBy",
            foreignField: "_id",
            as: "postBy"
        };
    let project = {
            imageUrl:1,
            postText:1,
            taggedUsers:1,
            "isLiked": {$cond: { if: {
                            $in: [ ObjectId(userData._id), "$likeByIds" ]
                        }, then: true, else: false }},
            "isViewed": {$cond: { if: {
                            $in: [ ObjectId(userData._id), "$viewedByIds" ]
                        }, then: true, else: false }},
            commentCount:1,
            likeCount:1,
            shareCount:1,
            viewCount:1,
            isDeleted:1,
            isBlocked:1,
            createdAt:1,
            "postBy._id":"$postBy._id",
            "postBy.name":"$postBy.name",
            "postBy.profilePic":"$postBy.profilePic",
            "postBy.coverPic":"$postBy.coverPic",
            "postBy.defaultLoginRole":"$postBy.defaultLoginRole"
        }
    let postsCount = await Models.Post.countDocuments(match);
    let posts = await Models.Post.aggregate(/*[
            {
                $facet: {
                  data: [
                            { $match: match },
                            { $lookup: lookup },
                            { $unwind: "$postBy" },
                            { $project: project },
                            { $sort: {_id: -1} },
                            { $limit:2 }
                        ],
                  totalCount: [
                            { $match: match },
                            {$count: 'total' }
                        ]
                }
            }
        ]*/

        [
            { $match: match },
            { $lookup: lookup },
            { $unwind: "$postBy" },
            { $project: project },
            { $sort: {_id: -1} },
            { $limit:countLimit }
        ]
    );
    return {"posts":posts,"postsCount":postsCount}
};



async function getPostData(id) {
    /*let dataToSet = {};
    dataToSet.$addToSet = { viewedByIds : ObjectId(userData._id) } // push user ids to array
    dataToSet.$inc = { viewCount:1 } //increment view count
    await Models.Post.updateOne({_id : id, viewedByIds: {$nin: ObjectId(userData._id)}}, dataToSet);*/

    let userInfo = await Models.Post.aggregate([
        {$match: {"_id": id}},
        { $lookup: {
            from: "users",
            localField: "postBy",
            foreignField: "_id",
            as: "postBy"
        } },
        {$unwind: "$postBy"},
        {$project:{
            imageUrl:1,
            postText:1,
            taggedUsers:1,
            commentCount:1,
            likeCount:1,
            shareCount:1,
            viewCount:1,
            isDeleted:1,
            isBlocked:1,
            createdAt:1,
            "isLiked": {$cond: { if: {
                            $in: [ ObjectId(userData._id), "$likeByIds" ]
                        }, then: true, else: false }},
            "isViewed": {$cond: { if: {
                            $in: [ ObjectId(userData._id), "$viewedByIds" ]
                        }, then: true, else: false }},
            "postBy._id":"$postBy._id",
            "postBy.name":"$postBy.name",
            "postBy.profilePic":"$postBy.profilePic",
            "postBy.coverPic":"$postBy.coverPic",
            "postBy.defaultLoginRole":"$postBy.defaultLoginRole",
            }}
        ]);
        if(userData && (userInfo[0].postBy._id).toString() != (userData._id).toString()){ //if viewer is not owner of post
            let dataToSet = {};
            dataToSet.$addToSet = { viewedByIds : ObjectId(userData._id) } // push user ids to array
            dataToSet.$inc = { viewCount:1 } //increment view count
            await Models.Post.updateOne({_id : id, viewedByIds: {$nin: ObjectId(userData._id)}}, dataToSet);
        }
        return userInfo;

};

function getPostComments(id) {
    return Models.PostComment.aggregate([
        {$match: {"postId": id,"commentId":null, "isDeleted":false}},
        { $lookup: {
            from: "users",
            localField: "commentBy",
            foreignField: "_id",
            as: "commentBy"
        } },
        {$unwind: "$commentBy"},

        { $lookup: {
            from: "postcomments",
            localField: "_id",
            foreignField: "commentId",
            as: "reply"
        } },
        { "$unwind": {
            "path": "$reply",
            "preserveNullAndEmptyArrays": true
        } },
        { $lookup: {
            from: "users",
            localField: "reply.commentBy",
            foreignField: "_id",
            as: "reply.commentBy"
        } },
        { "$unwind": {
            "path": "$reply.commentBy",
            "preserveNullAndEmptyArrays": true
        } },

        {"$group":{
          "_id":"$_id",
          "comment":{"$last":"$comment"},
          "commentId":{"$last":"$commentId"},
          "likeCount":{"$last":"$likeCount"},
          "replyCount":{"$last":"$replyCount"},
          "createdAt":{"$last":"$createdAt"},
          "commentBy":{"$last":"$commentBy"},
          "reply": {
                "$push": { "$cond": [
                    { "$ne": [ "$reply", {} ] },
                    "$reply",
                    ""
                ]}
            },
        }},

        {$project:{
            comment:1,
            likeCount:1,
            replyCount:1,
            commentId:1,
            createdAt:1,
            commentBy:{
                _id:1,
                name:1,
                profilePic:1,
                coverPic:1,
                defaultLoginRole:1
            },
            reply: {
                comment:1,
                likeCount:1,
                replyCount:1,
                commentId:1,
                createdAt:1,
                commentBy:{
                    _id:1,
                    name:1,
                    profilePic:1,
                    coverPic:1,
                    defaultLoginRole:1
                }
            }
        }},
        {$sort: {_id: -1}}
    ]);
};

async function sendPush(type, title, message, receiverId, contentId, senderId, postType ){ // contentId - post id, user id,appointmentid, comment id, etc

    let userSettings = await Models.Users.findOne({"_id":ObjectId(receiverId)},{deviceType: 1, deviceToken: 1, language: 1});
    var usernm = userData.name ? userData.name: ''
    if(type == "USER_CHAMPION"){usernm = ""}
    let notificationData = {
        "name": usernm, // sender's name who is owner or sender
        "contentId": (contentId).toString(), //postid / appointmentid / userid / commentid / etc
        "type": type, //APP_CONSTANTS.NOTIFICATION_TYPE.CREATE_APPOINTMENT, // type of notification
        "title": title[userSettings.language], //APP_CONSTANTS.NOTIFICATION_TITLE.CREATE_APPOINMENT[userSettings.language],
        "message": usernm + message[userSettings.language], //APP_CONSTANTS.NOTIFICATION_MESSAGE.CREATE_APPOINMENT[userSettings.language],
        "userId": (receiverId).toString(),//payload.user // push notification receiver's id
        "postType": (postType).toString() // 1 - speakout, 2 - explore posts, 0 - if not 1 and not 2
    };
    let notificationDataInsert = {
        "contentId": (contentId).toString(), //postid / appointmentid / userid / commentid / etc
        senderId: senderId, //
        receiverId: receiverId,//payload.doctor, //owner of post, user who posted comment in case of reply, all followers, etc
        timeStamp: (new Date()).getTime(),
        "type": type,//APP_CONSTANTS.NOTIFICATION_TYPE.CREATE_APPOINTMENT, //type of notification
        "title": title[userSettings.language], //APP_CONSTANTS.NOTIFICATION_TITLE.CREATE_APPOINMENT[userSettings.language],
        "message": {
            'en': usernm + message['en'],//APP_CONSTANTS.NOTIFICATION_MESSAGE.CREATE_APPOINMENT['en'],
            'ar': usernm + message['ar']//APP_CONSTANTS.NOTIFICATION_MESSAGE.CREATE_APPOINMENT['ar']
        },
        "postType": postType // 1 - speakout, 2 - explore posts, 0 - if not 1 and not 2
    };

    console.log(message,"------ message ----- ",notificationData,"=============================", notificationDataInsert);

    CommonController.sendPushNotification({
        deviceType: userSettings.deviceType,
        deviceToken: userSettings.deviceToken
    }, notificationData);
    CommonController.notificationUpdate(notificationDataInsert);
}

async function getFollowingIds() {
    let followingIds = await Models.Follow.find({"followById": ObjectId(userData._id), "type": "1"},{followedId:1});
    let output = [];
    for(let x of followingIds){output.push(ObjectId(x.followedId))}
    return output;
};
async function getReportedPosts() {
    let reportedPosts = await Models.Report.find({"userId": ObjectId(userData._id)},{postId:1,_id:0}).distinct('postId');
    let output = [];
    for(let postId of reportedPosts){output.push(ObjectId(postId))}

    return output;
};


async function getFavoriteProfessionals(lang,obj){
    let ids = (userData.favoriteProfessionals).map(function(el) { return ObjectId(el) })
    var criteria = { "_id": { "$in": ids } }

    if(obj.lastId && obj.lastId!=""){ criteria._id = {$lt:ObjectId(obj.lastId)} } //FOR PAGINATION            
    if (is.undefined(obj.count) || is.empty(obj.count)) { obj.count = 100; }
    else{ obj.count = Number(obj.count); } //FOR PAGINATION
    
    return Models.Users.aggregate([
        { "$match": criteria },
        {
            $lookup: {
                from: "professionalspecialities",
                let: {userId: '$professional.professionalSpeciality'},
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {$eq: ["$_id", "$$userId"]},
                                    {$eq: ["$isActive", true]}
                                ]
                            }
                        }
                    }],
                as: 'professional.professionalSpeciality'
            }
        },
        { "$unwind": {
                "path": "$professional.professionalSpeciality",
                "preserveNullAndEmptyArrays": true
        } },

        {$lookup: {
                from: "countries",
                foreignField: "_id",
                localField: "professional.city",
                as: 'professional.city'
            }
        },
        { "$unwind": {
            "path": "$professional.city",
            "preserveNullAndEmptyArrays": true
        } },

        {
            $lookup: {
                from: "professionalspecialities",
                let: {"specialityId": '$professional.professionalSubSpeciality'},
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {$in: ["$_id", {$ifNull :['$$specialityId',[]]}]},
                                    {$eq: ["$isActive", true]}
                                ]
                            }
                        }
                    }],
                as: 'professional.professionalSubSpeciality'
            }
        },


        { //to count number of people who marked my favorite professional as his/her favourite
            $lookup: {
                from: "users",
                let: {"id": '$_id'},
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {$in: ["$$id", {$ifNull :['$favoriteProfessionals',[]]}]}
                                ]
                            }
                        }
                    }],
                as: 'favoriteProfessionalsData'
            }
        },


        //RATING
        {"$lookup":{
            "from":"apointmentfeedbacks",
            "localField":"_id",
            "foreignField":"userId",
            "as":"ratingData"
        }},
        //RATING


        {$project:{
                _id:1,
                name:1,
                profilePic:1,
                coverPic:1,
                defaultLoginRole:1,
                /*favoriteCount: { '$add': [ { '$size': { "$ifNull": [ "$favoriteProfessionals", [] ] } }, { '$size': { "$ifNull": [ "$favoriteFacilities", [] ] } } ] },*/
                favoriteProfessionalsData:{ '$size': { "$ifNull": [ "$favoriteProfessionalsData", [] ] } },
                professional : {
                    professionalSpeciality:{
                        _id:1,
                        specialityIcon:1,
                        specialityName:"$professional.professionalSpeciality.specialityName."+lang,
                        specialist:"$professional.professionalSpeciality.specialist."+lang,
                    },
                    skillDescription:1,
                    city: {
                        _id:1,
                        locationName:"$professional.city.locationName."+lang,
                    },
                    professionalSubSpeciality: {
                        $map: {
                            "input": "$professional.professionalSubSpeciality",
                            "as": "option",
                            in: {
                                specialityName: "$$option.specialityName."+lang,
                                _id: "$$option._id",

                            }
                        }
                    }
                },
                "feedbackRating": {
                    "$cond": {
                        if: {
                            "$gte": [{$size: "$ratingData.rating"}, 1]
                        }, then: {
                            "$divide": [
                                { $sum: "$ratingData.rating" },
                                { $size: "$ratingData.rating" }
                            ]
                        }, else: 0
                    }
                },
                "feedbackCount": {
                    "$cond": {
                        if: {
                            "$gte": [{$size: "$ratingData.rating"}, 1]
                        }, then: {
                             "$size": "$ratingData.rating"
                        }, else: 0
                    }
                }
        }}/*,
        {$sort: {_id: -1}},
        {$limit:obj.count}*/
    ])
};

async function getFavoriteFacility(lang,obj){
    let ids = (userData.favoriteFacilities).map(function(el) { return ObjectId(el) })
    var criteria = { "_id": { "$in": ids } }

    if(obj.lastId && obj.lastId!=""){ criteria._id = {$lt:ObjectId(obj.lastId)} } //FOR PAGINATION            
    if (is.undefined(obj.count) || is.empty(obj.count)) { obj.count = 100; }
    else{ obj.count = Number(obj.count); } //FOR PAGINATION

    return Models.Users.aggregate([
        { "$match": criteria },
        {
            $lookup: {
                from: "professionalspecialities",
                let: {userId: '$facility.facilityType'},
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {$eq: ["$_id", "$$userId"]},
                                    {$eq: ["$isActive", true]}
                                ]
                            }
                        }
                    }],
                as: 'facility.facilityType'
            }
        },
        { "$unwind": {
                "path": "$facility.facilityType",
                "preserveNullAndEmptyArrays": true
        } },

        { //to count number of people who marked my favorite facility as his/her favourite
            $lookup: {
                from: "users",
                let: {"id": '$_id'},
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {$in: ["$$id", {$ifNull :['$favoriteFacilities',[]]}]}
                                ]
                            }
                        }
                    }],
                as: 'favoriteFacilitiesData'
            }
        },

        
        //RATING
        {"$lookup":{
            "from":"apointmentfeedbacks",
            "localField":"_id",
            "foreignField":"userId",
            "as":"ratingData"
        }},
        //RATING
        
        {$project:{
                _id:1,
                name:1,
                profilePic:1,
                coverPic:1,
                defaultLoginRole:1,
                favoriteFacilitiesData:{ '$size': { "$ifNull": [ "$favoriteFacilitiesData", [] ] } },
                facility : {
                    facilityType:{
                        _id:1,
                        specialityIcon:1,
                        specialityName:"$facility.facilityType.specialityName."+lang,
                        specialist:"$facility.facilityType.specialist."+lang,
                    }
                },
                "feedbackRating": {
                    "$cond": {
                        if: {
                            "$gte": [{$size: "$ratingData.rating"}, 1]
                        }, then: {
                            "$divide": [
                                { $sum: "$ratingData.rating" },
                                { $size: "$ratingData.rating" }
                            ]
                        }, else: 0
                    }
                },
                "feedbackCount": {
                    "$cond": {
                        if: {
                            "$gte": [{$size: "$ratingData.rating"}, 1]
                        }, then: {
                             "$size": "$ratingData.rating"
                        }, else: 0
                    }
                }
        }},
        {$sort: {_id: -1}},
        {$limit:obj.count}
    ])
};