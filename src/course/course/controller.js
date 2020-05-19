'use strict';

//npm modules
const async = require('async');
const is = require("is_js");

 // local modules
const Models = require('../../../models'),
    Dao = require('../../../dao').queries,
    //controllerUtil = require('./controllerUtil'),
    Constants = require('../../../config/appConstants'),
    RESPONSE_MESSAGES = require('../../../config/response-messages'),
    UniversalFunctions = require('../../../utils').universalFunctions,
    SocketManager = require('../../../Lib/SocketManager'),
    sendResponse = require('../../sendResponse'),
    NotificationManager = require('../../../Lib/NotificationManager');


module.exports = {

    /*addCourse: (req, res) => {
        try {
            let obj = req.body;
            let course = new Models.Courses({
                authorId:       ObjectId(obj.authorId),
                title:          obj.title,
                cost:           obj.cost,
                about:          obj.about,
                category:       obj.category,
                description:    obj.description,
                instructions:   obj.instructions,
                curriculum:     obj.curriculum,
                image:          typeof obj.image === "string" ? JSON.parse(obj.image) : obj.image,
            });
            course.save(function (error, result) {
                if (error) {
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,error,res);
                } else {
                    return sendResponse.sendSuccessData(result,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },*/

    /*listCourses: (req, res) => {
        try {
            let criteria = {};
            //if()
            Models.Courses.find(
                criteria,
                {__v:0,updatedAt:0,isDeleted:0},
                {sort: {_id: -1}})
                //.populate('authorId', '_id name profilePic coverPic defaultLoginRole')
                .exec(function (err, result) {
                if (err) {
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,err,res);
                } else {
                    return sendResponse.sendSuccessData(result,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });
        } catch (err) {
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },*/
    listCourses: (req, res) => {
        try {
            let obj = req.query;
            let criteria = {};

            if(obj.category){
                criteria = {category:obj.category};
            }

            if (is.undefined(obj.count) || is.empty(obj.count)) {
                obj.count = 100;
            }else{
                obj.count = Number(obj.count);
            }
            if(obj.lastId){
                criteria._id = {$lt:ObjectId(obj.lastId)};
            }

            if (!is.undefined(obj.searchUser) && !is.empty(obj.searchUser)) {
                criteria['title.'+req.headers.language] = {'$regex': ".*" + obj.searchUser + ".*", '$options': 'i'};
            }

            let aggregate = [
                {
                    $match: criteria
                },
                {
                    $project: {
                        _id: 1,
                        title: "$title."+req.headers.language,
                        cost: 1,
                        //category: "$category."+req.headers.language,
                        category: 1,
                        image: 1,
                        credits: 1,
                        expiryDate:1
                    }
                },
                { $sort: {_id: -1} },
                { $limit:obj.count }
            ];
            if (!is.undefined(obj.status) && !is.empty(obj.status)) {
                aggregate.push({
                    $lookup: {
                        from: 'usercourses',
                        localField: '_id',
                        foreignField: 'courseId',
                        as: 'coursestatus'
                    }
                });
            }

            Models.Courses.aggregate(aggregate, (err, result) => {
                if (err) {
                    console.log(err)
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,err,res);
                } else {
                    return sendResponse.sendSuccessData(result,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });
        } catch (err) {
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    courseDetail: (req, res) => {
         try {
            let obj = req.query;
            let aggregate = [
                {
                    $match: {"_id":ObjectId(obj.id)}
                },


                {$lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "authorId",
                        as: 'authorId'
                    }
                },
                { "$unwind": {
                    "path": "$authorId",
                    "preserveNullAndEmptyArrays": true
                } },

                {
                    $lookup: {
                        from: "professionalspecialities",
                        let: {userId: '$authorId.professional.professionalSpeciality'},
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
                        as: 'authorId.professional.professionalSpeciality'
                    }
                },
                { "$unwind": {
                    "path": "$authorId.professional.professionalSpeciality",
                    "preserveNullAndEmptyArrays": true
                } },

                {
                    $project: {
                        _id: 1,
                        title: "$title."+req.headers.language,
                        about: "$about."+req.headers.language,
                        description: "$description."+req.headers.language,
                        instructions: "$instructions."+req.headers.language,
                        "curriculum": {
                            $map: {
                                "input": "$curriculum",
                                "as": "option",
                                in: {
                                    textData: "$$option.textData."+req.headers.language,
                                    title: "$$option.title."+req.headers.language,
                                    _id: "$$option._id",
                                    fileUrl: "$$option.fileUrl",
                                    thumbnail: "$$option.thumbnail",
                                    isLocked: "$$option.isLocked",
                                    duration: "$$option.duration"

                                }
                            }
                        },
                        category: 1,
                        cost: 1,
                        image: 1,
                        credits: 1,
                        expiryDate:1,
                        authorId: {
                            _id: 1,
                            name: 1,
                            profilePic: 1,
                            coverPic: 1,
                            defaultLoginRole: 1,
                            professional : {
                                professionalSpeciality:{
                                    _id:1,
                                    specialityIcon:1,
                                    specialityName:"$authorId.professional.professionalSpeciality.specialityName."+req.headers.language,
                                    specialist:"$authorId.professional.professionalSpeciality.specialist."+req.headers.language,
                                }
                            }
                        },
                    }
                },
            ];
            Models.Courses.aggregate(aggregate, (err, result) => {
                if (err) {
                    console.log(err)
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,err,res);
                } else {
                    return sendResponse.sendSuccessData(result[0],200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });
        } catch (err) {
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    cmeList: (req, res) => {
        try {
            let obj = req.query;
            let criteria = {"type":obj.type};
            if (is.undefined(obj.count) || is.empty(obj.count)) {
                obj.count = 100;
            }else{
                obj.count = Number(obj.count);
            }
            if(obj.lastId){
                criteria._id = {$lt:ObjectId(obj.lastId)};
            }
            if (!is.undefined(obj.searchUser) && !is.empty(obj.searchUser)) {
                criteria['title.'+req.headers.language] = {'$regex': ".*" + obj.searchUser + ".*", '$options': 'i'};
            }


            let aggregate = [
                {
                    $match: criteria
                },
                {
                    $project: {
                        _id: 1,
                        title: "$title."+req.headers.language,
                        image: 1,
                        date: 1,
                        address: 1,
                        url: 1,
                        type: 1,
                        createdAt: 1
                    }
                },
                { $sort: {_id: -1} },
                { $limit:obj.count }
            ];
            Models.CmeEvents.aggregate(aggregate, (err, result) => {
                if (err) {
                    console.log(err)
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,err,res);
                } else {
                    return sendResponse.sendSuccessData(result,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });
        } catch (err) {
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    buyCourse: async (req, res) => {
        try {
            let obj = req.body;
            let courseData = await Models.Courses.findOne({"_id": ObjectId(obj.courseId)});
            if (courseData == null) {
                return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,{},res);
            } else {
                let userCourse = new Models.UserCourses({
                    userId:         ObjectId(userData._id),
                    courseId:       ObjectId(obj.courseId),
                    courseCost:     courseData.courseCost,
                    courseCredits:  courseData.courseCredits,
                    curriculum:     courseData.curriculum,
                    credits:        courseData.credits
                });
                userCourse.save(function (error, result) {
                    if (error) {
                        return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,error,res);
                    } else {
                        return sendResponse.sendSuccessData(result,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                    }
                });
            }
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    myCourses: (req, res) => {
        try {
            let obj = req.query;
            // let isCompleted = false;
            // if(obj.type=="2"){
            //     isCompleted = true;
            // }
            // "isCompleted":isCompleted,
            let criteria = {"userId":ObjectId(userData._id)};
            if (is.undefined(obj.count) || is.empty(obj.count)) {
                obj.count = 100;
            }else{
                obj.count = Number(obj.count);
            }
            if(obj.lastId){
                criteria._id = {$lt:ObjectId(obj.lastId)};
            }
            if(!is.undefined(obj.type) && obj.type=="2"){
                criteria['isCompleted'] = true;
            }
            if(!is.undefined(obj.type) && obj.type=="1"){
                criteria['isCompleted'] = false;
            }
            console.log('Course Credteria.....', criteria);

            let aggregate = [
                {
                    $match: criteria
                },
                {
                    $lookup: {
                        from: 'courses',
                        localField: 'courseId',
                        foreignField: '_id',
                        as: 'courseId'
                    }
                },
                // {
                //     $project: {
                //         _id: 1,
                //         title: "$title."+req.headers.language,
                //         image: 1,
                //         date: 1,
                //         address: 1,
                //         courseId: 1,
                //         url: 1,
                //         type: 1,
                //         createdAt: 1
                //     }
                // },
                { $sort: {_id: -1} },
                { $limit:obj.count }
            ];
            Models.UserCourses.aggregate(aggregate, (err, result) => {
                // Models.UserCourses.find(
                //     criteria,
                //     {__v:0,updatedAt:0,isDeleted:0},
                //     {sort: {_id: -1}, limit: obj.count}).populate('courseId')
                //     .exec(function (err, result) {
                if (err) {
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,err,res);
                } else {
                    return sendResponse.sendSuccessData(result,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });
        } catch (err) {
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    }
};
