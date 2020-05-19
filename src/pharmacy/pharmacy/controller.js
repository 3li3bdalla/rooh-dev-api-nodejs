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
    NotificationManager = require('../../../Lib/NotificationManager'),
    CommonController = require('../../commonController');
if(process.env.ENABLE_DB_ENCRYPTION=="1"){
    var rsaWrapper          = require('../../../Lib/rsa-wrapper');
    //var aesWrapper          = require('../Lib/aes-wrapper');
}

module.exports = {
    createRequest: async (req, res) => {
        try {
            let obj = req.body;
            let location = typeof obj.location === "string" ? JSON.parse(obj.location) : obj.location;
            /*let getPharmacyVars = {facilityType : obj.facilityType, lat :location[1], long :location[0] }
            let pharmacyList = await getPharmacyIds(getPharmacyVars);  */
            let pharmacyList = await getPharmacyIds(obj.facilityType);  
            /*var encryptColumns = ['address','houseNumber','addressName'];
            if(process.env.ENABLE_DB_ENCRYPTION=="1"){
                await encryptDBData(obj, encryptColumns);
            }*/
            if(pharmacyList && pharmacyList.length > 0){
                let request = new Models.PharmacyRequests({
                    customerId:     ObjectId(userData._id),
                    deliveryType:   obj.deliveryType,
                    file:           typeof obj.file === "string" ? JSON.parse(obj.file) : obj.file,
                    address:        obj.address,
                    location:       location,
                    allPharmacyIds: pharmacyList,
                    facilityType:   obj.facilityType,
                    medicationId:   obj.medicationId
                });
                request.save(async function (error, result) {
                    if (error) {
                        return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,error,res);
                    } else {
    
                        /*Models.Users.find({"facility.serviceCategory":ObjectId("5cfe54893952e9155c7899a3")},{_id:1}, async function (pharmacyListErr, pharmacyList) {*/
                            if(pharmacyList.length > 0){
                                for(let x of pharmacyList){ //output.push(ObjectId(x.followedId))}
                                    await sendPush(
                                        Constants.NOTIFICATION_TYPE.CREATE_PHARMACY_REQUEST,
                                        Constants.NOTIFICATION_TITLE.CREATE_PHARMACY_REQUEST,
                                        Constants.NOTIFICATION_MESSAGE.CREATE_PHARMACY_REQUEST,
                                        x, //pharmacy id - receiver id
                                        result._id, //content id
                                        req.credentials._id //sender id
                                    )
                                }
                            }
                        //});
    
                        return sendResponse.sendSuccessData(result,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                    }
                });
            }else{
                return sendResponse.sendSuccessData({},400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.NO_NEARBY_PHARMACY,res);
            }
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    myList: (req, res) => {
        try {
            let obj = req.query;
            let criteria = {};


            /*if(obj.type == "1"){
                criteria.status = "1";
            }else if(obj.type == "3"){
                criteria.status = "3";
            }else if(obj.type == "4"){
                criteria.status = "4";
            }*/ 
            if(obj.type == "6"){
                criteria = {$or: [{"status": "4"},{ "allPharmacyIds": { $exists: true, $eq: [] } }]}
            }else{
                criteria.status = obj.type;
            }            
            criteria.customerId = ObjectId(userData._id);

            // changed type from 1,2,3 to 1,3,4 as asked by Ankit IOS
            if (is.undefined(obj.count) || is.empty(obj.count)) {
                obj.count = 100;
            }else{
                obj.count = Number(obj.count);
            }
            if(obj.lastId){
                criteria._id = {$lt:ObjectId(obj.lastId)};
            }
            let long = parseFloat(userData.location[0]),
                lat = parseFloat(userData.location[1]);
            let aggregate = [
                /*{
                    $geoNear: {
                        near: {
                            type: "Point",
                            coordinates: [long, lat] || [0, 0]
                        },
                        distanceField: "distance",
                        maxDistance: 100000,
                        //num: parseInt(req.query.limit) || 20,
                        //query: {_id: {$in: output}},
                        spherical: true
                    }
                },*/
                {
                    $match: criteria
                },
                {
                    $lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "customerId",
                        as: 'customerId'
                    }
                },
                { "$unwind": {
                    "path": "$customerId",
                    "preserveNullAndEmptyArrays": true
                } },
                {
                    $lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "pharmacyId",
                        as: 'pharmacyId'
                    }
                },
                { "$unwind": {
                    "path": "$pharmacyId",
                    "preserveNullAndEmptyArrays": true
                } },
                {
                    $lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "acceptedPharmacyIds",
                        as: 'acceptedPharmacyIds'
                    }
                },
                { "$unwind": {
                    "path": "$acceptedPharmacyIds",
                    "preserveNullAndEmptyArrays": true
                } },

                {
                    $lookup: {
                        from: "patientappointmentreports",
                        foreignField: "_id",
                        localField: "medicationId",
                        as: 'medicationId'
                    }
                },
                { "$unwind": {
                    "path": "$medicationId",
                    "preserveNullAndEmptyArrays": true
                } },

                {"$group":{
                  "_id":"$_id",
                  "file":{"$last":"$file"},
                  "deliveryType":{"$last":"$deliveryType"},
                  "deliveredDate":{"$last":"$deliveredDate"},
                  "location":{"$last":"$location"},
                  "address":{"$last":"$address"},
                  "customerId":{"$last":"$customerId"},
                  "allPharmacyIds":{"$last":"$allPharmacyIds"},
                  "createdAt":{"$last":"$createdAt"},
                  "pharmacyId":{"$last":"$pharmacyId"},
                  "medicationId":{"$last":"$medicationId"},
                  "orderId":{"$last":"$orderId"},
                  //"distance":{"$first":"$distance"},
                  "acceptedPharmacyIds": {
                        "$push": { "$cond": [
                            { "$ne": [ "$acceptedPharmacyIds", {} ] },
                            "$acceptedPharmacyIds",
                            ""
                        ]}
                    },
                }},
                {
                    $project: {
                        _id: 1,
                        file: 1,
                        deliveryType: 1,
                        deliveredDate: 1,
                        location: 1,
                        address: 1,
                        orderId: 1,
                        distance:"1.1",
                        /*distance: {
                            "$cond": {
                                if: { "$gte": ["$distance", 1]}, 
                                then: { 
                                    $divide: [ {$trunc: { $multiply: [ "$distance" , 0.1 ] } }, 100 ]
                                }, else: 0
                            }
                        },*/
                        requestCounts:{$size: "$allPharmacyIds"},
                        medicationId:1,
                        customerId: {
                            _id: 1,
                            name: 1,
                            defaultLoginRole: 1,
                            profilePic: 1,
                            coverPic: 1
                        },
                        pharmacyId: {
                            _id: 1,
                            name: 1,
                            defaultLoginRole: 1,
                            profilePic: 1,
                            coverPic: 1,
                            distance:"1.1"
                        },
                        acceptedPharmacyIds: {
                            _id: 1,
                            name: 1,
                            defaultLoginRole: 1,
                            profilePic: 1,
                            coverPic: 1,                            
                            distance:"1.1"
                        },
                        createdAt: 1
                    }
                },
                { $sort: {_id: -1} },                
                { $limit:obj.count }
            ];
            Models.PharmacyRequests.aggregate(aggregate, (err, result) => {
                if (err) {
                    console.log(err)
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
    requestList: async (req, res) => {
        try {
            let obj = req.query;
            //let pharmacyList = await getRequestIds();            
            let criteria = {};
            if(obj.type == "1"){
                criteria = {status : "1", "allPharmacyIds": {$in: [ObjectId(userData._id)]} };
            }else if(obj.type == "2"){
                criteria = {status : "1", "acceptedPharmacyIds": {$in: [ObjectId(userData._id)]} };
            }else{
                criteria = {status : obj.type, pharmacyId: ObjectId(userData._id) };
            }
            if (is.undefined(obj.count) || is.empty(obj.count)) {
                obj.count = 100;
            }else{
                obj.count = Number(obj.count);
            }
            if(obj.lastId){
                criteria._id = {$lt:ObjectId(obj.lastId)};
            }

            let long = parseFloat(userData.location[0]),
                lat = parseFloat(userData.location[1]);
            let aggregate = [
                /*{
                    $geoNear: {
                        near: {
                            type: "Point",
                            coordinates: [long, lat] || [0, 0]
                        },
                        distanceField: "distance",
                        maxDistance: 100000,
                        //num: parseInt(req.query.limit) || 20,
                        //query: {_id: {$in: output}},
                        spherical: true
                    }
                },*/
                {
                    $match: criteria
                },
                {
                    $lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "customerId",
                        as: 'customerId'
                    }
                },
                { "$unwind": {
                    "path": "$customerId",
                    "preserveNullAndEmptyArrays": true
                } },
                {
                    $lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "pharmacyId",
                        as: 'pharmacyId'
                    }
                },
                { "$unwind": {
                    "path": "$pharmacyId",
                    "preserveNullAndEmptyArrays": true
                } },                

                {
                    $lookup: {
                        from: "patientappointmentreports",
                        foreignField: "_id",
                        localField: "medicationId",
                        as: 'medicationId'
                    }
                },
                { "$unwind": {
                    "path": "$medicationId",
                    "preserveNullAndEmptyArrays": true
                } },
                {
                    $project: {
                        _id: 1,
                        file: 1,
                        deliveryType: 1,
                        deliveredDate: 1,
                        location: 1,
                        address: 1,
                        orderId: 1,
                        distance:"1.1",
                        /*distance: {
                            "$cond": {
                                if: { "$gte": ["$distance", 1]}, 
                                then: { 
                                    $divide: [ {$trunc: { $multiply: [ "$distance" , 0.1 ] } }, 100 ]
                                }, else: 0
                            }
                        },*/
                        medicationId:1,
                        customerId: {
                            _id: 1,
                            name: 1,
                            defaultLoginRole: 1,
                            profilePic: 1,
                            coverPic: 1,
                        },
                        pharmacyId: {
                            _id: 1,
                            name: 1,
                            defaultLoginRole: 1,
                            profilePic: 1,
                            coverPic: 1,
                        },
                        createdAt: 1
                    }
                },
                { $sort: {_id: -1} },                
                { $limit:obj.count }
            ];
            Models.PharmacyRequests.aggregate(aggregate, (err, result) => {
                if (err) {
                    console.log(err)
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
    acceptRejectRequest: async (req, res) => {
        try {
            var obj = req.body;
            console.log(obj)
            let dataToSet = {};
            let criteria = { _id: ObjectId(obj.requestId)};
            if(obj.type=="1"){
                dataToSet = {$addToSet: { acceptedPharmacyIds:  ObjectId(userData._id) }, $pull: { allPharmacyIds: ObjectId(userData._id) }};
            }else if(obj.type=="2"){
                dataToSet = {status:"3", pharmacyId: ObjectId(obj.pharmacyId)}
            }else if(obj.type=="3"){
                dataToSet = { $pull: { allPharmacyIds:  ObjectId(userData._id),acceptedPharmacyIds:  ObjectId(userData._id) }};
            }else if(obj.type=="4"){
                dataToSet = {$pull: { allPharmacyIds:  ObjectId(obj.pharmacyId),acceptedPharmacyIds:  ObjectId(obj.pharmacyId) }};
            }else if(obj.type=="5"){
                let dateCheck = new Date().toISOString();
                dataToSet = {status:"4", deliveredDate:dateCheck}
            }
            let result = await Models.PharmacyRequests.findOneAndUpdate(criteria, dataToSet, {new: true});
            if(result){
                if((result.allPharmacyIds && result.allPharmacyIds.length == 0) && (result.acceptedPharmacyIds && result.acceptedPharmacyIds.length == 0)){
                    await Models.PharmacyRequests.updateOne(criteria, {"status":"5"}, {upsert: true}); //mark status 5 ie rejected request if there is no pharmacy id left in allpharmacyids param
                }
                var recId = result.customerId;
                if((req.credentials._id).toString() ==  (result.customerId).toString()){
                    recId = obj.pharmacyId;
                }
                var pushTitle = Constants.NOTIFICATION_TITLE.CREATE_PHARMACY_REQUEST
                var pushMsg = Constants.NOTIFICATION_MESSAGE.CREATE_PHARMACY_REQUEST
                if(obj.type == "1" || obj.type == "2"){
                    pushTitle = Constants.NOTIFICATION_TITLE.PHARMACY_ACTIONS_ACCEPTED
                    pushMsg = Constants.NOTIFICATION_MESSAGE.PHARMACY_ACTIONS_ACCEPTED
                }else if(obj.type == "3" || obj.type == "4"){
                    pushTitle = Constants.NOTIFICATION_TITLE.PHARMACY_ACTIONS_REJECTED
                    pushMsg = Constants.NOTIFICATION_MESSAGE.PHARMACY_ACTIONS_REJECTED
                }else if(obj.type == "5"){
                    pushTitle = Constants.NOTIFICATION_TITLE.PHARMACY_ACTIONS_COMPLETED
                    pushMsg = Constants.NOTIFICATION_MESSAGE.PHARMACY_ACTIONS_COMPLETED
                }
                sendPush(
                    Constants.NOTIFICATION_TYPE.PHARMACY_ACTIONS,
                    pushTitle,
                    pushMsg,
                    recId, //receiver id
                    obj.requestId, //content id
                    req.credentials._id //sender id
                )
                return sendResponse.sendSuccessData({},200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
            }else{
                return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
            }
        } catch (err) {
            console.log(err)
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    requestDetail: async (req, res) => {
         try {
            let obj = req.query;
            let aggregate = [
                {
                    $match: {"_id":ObjectId(obj.requestId)}
                },
                {
                    $lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "customerId",
                        as: 'customerId'
                    }
                },
                { "$unwind": {
                    "path": "$customerId",
                    "preserveNullAndEmptyArrays": true
                } },
                /*{
                    $lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "pharmacyId",
                        as: 'pharmacyId'
                    }
                },
                { "$unwind": {
                    "path": "$pharmacyId",
                    "preserveNullAndEmptyArrays": true
                } },*/                
                {
                    $lookup: {
                        from: "users",
                        foreignField: "_id",
                        localField: "acceptedPharmacyIds",
                        as: 'acceptedPharmacyIds'
                    }
                },
                { "$unwind": {
                    "path": "$acceptedPharmacyIds",
                    "preserveNullAndEmptyArrays": true
                } },


                {
                    $lookup: {
                        from: "patientappointmentreports",
                        foreignField: "_id",
                        localField: "medicationId",
                        as: 'medicationId'
                    }
                },
                { "$unwind": {
                    "path": "$medicationId",
                    "preserveNullAndEmptyArrays": true
                } },
                {"$group":{
                      "_id":"$_id",
                      "file":{"$last":"$file"},
                      "deliveryType":{"$last":"$deliveryType"},
                      "deliveredDate":{"$last":"$deliveredDate"},
                      "location":{"$last":"$location"},
                      "address":{"$last":"$address"},
                      "orderId":{"$last":"$orderId"},
                      "status":{"$last":"$status"},
                      "customerId":{"$last":"$customerId"},
                      "createdAt":{"$last":"$createdAt"},
                      "pharmacyId":{"$last":"$pharmacyId"},
                      "allPharmacyIds":{"$last":"$allPharmacyIds"},
                      "medicationId":{"$last":"$medicationId"},
                      "acceptedPharmacyIds": {
                            "$push": { "$cond": [
                                { "$ne": [ "$acceptedPharmacyIds", {} ] },
                                "$acceptedPharmacyIds",
                                ""
                            ]}
                      },                    
                      "acceptedPharmacyIdsArrray":{"$push":"$acceptedPharmacyIds._id"},
                }},
                {
                    $project: {
                        _id: 1,
                        file: 1,
                        deliveryType: 1,
                        deliveredDate: 1,
                        location: 1,
                        address: 1,
                        orderId: 1,
                        deliveredDate:1,
                        status: 1, 
                        acceptedPharmacyIdsArrray:"$acceptedPharmacyIds._id",  
                        medicationId:1,
                        acceptedPharmacyIds: {
                            _id: 1,
                            name: 1,
                            defaultLoginRole: 1,
                            profilePic: 1,
                            coverPic: 1,
                            address: 1,
                            location: 1
                        },
                        customerId: {
                            _id: 1,
                            name: 1,
                            defaultLoginRole: 1,
                            address: 1,
                            location: 1,
                            profilePic: 1,
                            coverPic: 1
                        },
                        allPharmacyIds:1,
                        pharmacyId: 1,/*{
                            _id: 1,
                            name: 1,
                            address: 1,
                            defaultLoginRole: 1,
                            location: 1,
                            profilePic: 1,
                            coverPic: 1,
                            distance:"1.1"
                        },*/
                        createdAt: 1
                    }
                }
            ];
            Models.PharmacyRequests.aggregate(aggregate, async (err, result) => {
                if (err) {
                    console.log(err)
                    return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,err,res);
                } else {
                    result = JSON.parse(JSON.stringify(result));
                    /*console.log("result.allPharmacyIds ---- ",result[0].allPharmacyIds)
                    console.log("result.pharmacyId ---- ",result[0].pharmacyId)*/
                    let allPharmacyIds = await getAllpharmaciesDistance(result[0].allPharmacyIds,"1");
                    result[0].allPharmacyIds = allPharmacyIds;
                    let pharmacyId = await getAllpharmaciesDistance([result[0].pharmacyId],"2");
                    console.log("result.pharmacyId ---- ",pharmacyId)
                    result[0].pharmacyId = pharmacyId[0];
                    if(result[0].status == "1" && result[0].acceptedPharmacyIdsArrray!= undefined && result[0].acceptedPharmacyIdsArrray.length != 0 && (result[0].acceptedPharmacyIdsArrray).indexOf(userData._id.toString()) != -1){
                        result[0].status = "2"
                    }
                    delete result[0].acceptedPharmacyIdsArrray;
                    return sendResponse.sendSuccessData(result[0],200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });
        } catch (err) {
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    }
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
    /*listCourses: (req, res) => {
        try {
            let obj = req.query;
            let criteria = {};
            if (is.undefined(obj.count) || is.empty(obj.count)) {
                obj.count = 100;
            }else{
                obj.count = Number(obj.count);
            }
            if(obj.lastId){
                criteria._id = {$lt:ObjectId(obj.lastId)};
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
                        category: "$category."+req.headers.language,
                        image: 1,
                        credits: 1                        
                    }
                },                
                { $sort: {_id: -1} },                
                { $limit:obj.count }
            ];
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
                                    isLocked: "$$option.isLocked"

                                }
                            }
                        },
                        category: 1,
                        cost: 1,
                        image: 1,
                        credits: 1,
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
                    return sendResponse.sendSuccessData(result,200,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.SUCCESS.DEFAULT,res);
                }
            });
        } catch (err) {
            return sendResponse.sendErrorMessage(500,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.APP_ERROR,res);
        }
    },
    cmeList: (req, res) => {
        try {
            let obj = req.query;

            if (is.undefined(obj.count) || is.empty(obj.count)) {
                obj.count = 100;
            }else{
                obj.count = Number(obj.count);
            }
            if(obj.lastId){
                criteria._id = {$lt:ObjectId(obj.lastId)};
            }

            Models.CmeEvents.find(
                {"type":obj.type},
                {__v:0,updatedAt:0,isDeleted:0},
                {sort: {_id: -1}, limit: obj.count})
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
    /*myCourses: (req, res) => {
        try {
            let obj = req.query;
            let criteria = {};
            if (is.undefined(obj.count) || is.empty(obj.count)) {
                obj.count = 100;
            }else{
                obj.count = Number(obj.count);
            }
            if(obj.lastId){
                criteria._id = {$lt:ObjectId(obj.lastId)};
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
                        category: "$category."+req.headers.language,
                        image: 1,
                        credits: 1                        
                    }
                },                
                { $sort: {_id: -1} },                
                { $limit:obj.count }
            ];
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
    },*/
    /*buyCourse: async (req, res) => {
        try {
            let obj = req.body;
            let courseData = await Models.Courses.findOne({"_id": ObjectId(obj.courseId)});
            if (courseData == null) {
                return sendResponse.sendErrorMessageData(400,req.headers.language,RESPONSE_MESSAGES.STATUS_MSG.ERROR.DEFAULT,error,res);
            } else {
                let userCourse = new Models.UserCourses({
                    userId:         ObjectId(userData._id),
                    courseId:       ObjectId(obj.courseId),
                    courseCost:     courseData.courseCost,
                    courseCredits:  courseData.courseCredits,
                    curriculum:     courseData.curriculum
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
            let isCompleted = false;
            if(obj.type=="2"){
                isCompleted = true;
            }
            let criteria = {"isCompleted":isCompleted, "userId":ObjectId(userData._id)};
            if (is.undefined(obj.count) || is.empty(obj.count)) {
                obj.count = 100;
            }else{
                obj.count = Number(obj.count);
            }
            if(obj.lastId){
                criteria._id = {$lt:ObjectId(obj.lastId)};
            }

            Models.UserCourses.find(
                criteria,
                {__v:0,updatedAt:0,isDeleted:0},
                {sort: {_id: -1}, limit: obj.count})
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
    }*/
    /*cmeTabs: (req, res) => {
        try {
            let aggregate = [
                {
                    $match: {"type": "cmeTabs"}
                },
                { $unwind: "$title"},
                {
                    "$match": {
                        "title.type": req.headers.language || 'en'
                    }
                },
                {
                    $project: {
                        _id: 1,
                        "type": "$title.type",
                        "name": "$title.name",
                        template: 1
                    }
                },
                {
                    "$sort": {"_id": -1}
                }
            ];
            Models.CommonServiceType.aggregate(aggregate, (err, result) => {
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
    }*/
    /*cmeTabs: (req, res) => {
        try {            
            Models.Courses.find(
                {"type":"cmeTabs"},
                {__v:0,updatedAt:0,isDeleted:0})
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
    }*/

};
function getAllpharmaciesDistance(pharmacyIdsArray, type){

    let output = [];
    for(let x of pharmacyIdsArray){output.push(ObjectId(x))}
    let long = parseFloat(userData.location[0]),
    lat = parseFloat(userData.location[1]);

    let geoCriteria = {
        near: {
            type: "Point",
            coordinates: [long, lat] || [0, 0]
        },
        distanceField: "distance",
        //maxDistance: /*10000000000,//*/25000,
        //num: parseInt(req.query.limit) || 20,
        query: {_id: {$in: output}},
        spherical: true
    };
    /*if(type == "1"){
        geoCriteria.maxDistance = 25000;
    }*/
    return Models.Users.aggregate([{
        $geoNear: geoCriteria
        },
        {
            $project: {
                distance: {
                    "$cond": {
                        if: { "$gte": ["$distance", 1]}, 
                        then: {
                            $toString:{$divide: [ {$trunc: { $multiply: [ "$distance" , 0.1 ] } }, 100 ]}
                        }, else: "0"
                    }
                },
                _id: 1,
                name: 1,
                address: 1,
                defaultLoginRole: 1,
                location: 1,
                profilePic: 1,
                coverPic: 1
            }
        },
        {$sort: {_id: -1}}
    ]);
}
async function getRequestIds() {
    let requestList = await Models.Notification.find({"receiverId":ObjectId(userData._id), "createdAt":{ $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000)}},{contentId:1});
    let output = [];
    for(let x of requestList){output.push(ObjectId(x.contentId))}
    return output;
};
async function getPharmacyIds(facilityType) {
//async function getPharmacyIds(data) {
    let pharmacistId = await Models.ServiceCategory.findOne({"templateType":"3"},{_id:1});

    
    //let getPharmacyIds = await Models.Users.find({"facility.serviceCategory":ObjectId(pharmacistId._id), "facility.facilityType":ObjectId(facilityType)},{_id:1});

    let long = parseFloat(userData.location[0]),
    lat = parseFloat(userData.location[1]);

    let geoCriteria = {
        near: {
            type: "Point",
            coordinates: [long, lat] || [0, 0]
        },
        distanceField: "distance",
        maxDistance: 20000,
        //query: {_id: {$in: output}},
        spherical: true
    };
    let getPharmacyIds = await Models.Users.aggregate([{
        $geoNear: geoCriteria
        },
        {
            $match:{"facility.serviceCategory":ObjectId(pharmacistId._id), "facility.facilityType":ObjectId(facilityType)}
        },
        {
            $project: {
                _id: 1
            }
        }
    ]);

    let output = [];
    for(let x of getPharmacyIds){output.push(ObjectId(x._id))}
    return output;
};

async function sendPush(type, title, message, receiverId, contentId, senderId ){ // contentId - post id, user id,appointmentid, comment id, etc

    let userSettings = await Models.Users.findOne({"_id":ObjectId(receiverId)},{deviceType: 1, deviceToken: 1, language: 1});
    var usernm = userData.name ? userData.name: '';
    let notificationData = {
        "name": usernm, // sender's name who is owner or sender
        //"id": contentId, //postid / appointmentid / userid / commentid / etc
        "contentId": (contentId).toString(),
        "type": type, //APP_CONSTANTS.NOTIFICATION_TYPE.CREATE_APPOINTMENT, // type of notification
        "title": title[userSettings.language], //APP_CONSTANTS.NOTIFICATION_TITLE.CREATE_APPOINMENT[userSettings.language],
        "message": usernm+message[userSettings.language], //APP_CONSTANTS.NOTIFICATION_MESSAGE.CREATE_APPOINMENT[userSettings.language],
        "userId": (receiverId).toString()//payload.user // push notification receiver's id
    };
    let notificationDataInsert = {
        senderId: senderId, //
        receiverId: receiverId,//payload.doctor, //owner of post, user who posted comment in case of reply, all followers, etc
        contentId: contentId, //pharmacy request id / postid / appointmentid / userid / commentid / etc
        timeStamp: (new Date()).getTime(),
        "type": type,//APP_CONSTANTS.NOTIFICATION_TYPE.CREATE_APPOINTMENT, //type of notification
        "title": title[userSettings.language], //APP_CONSTANTS.NOTIFICATION_TITLE.CREATE_APPOINMENT[userSettings.language],
        "message": {
            'en': usernm+message['en'],//APP_CONSTANTS.NOTIFICATION_MESSAGE.CREATE_APPOINMENT['en'],
            'ar': usernm+message['ar']//APP_CONSTANTS.NOTIFICATION_MESSAGE.CREATE_APPOINMENT['ar']
        }
    };

      console.log(notificationData, " ------------- push data ========== ", notificationDataInsert);

    CommonController.sendPushNotification({
        deviceType: userSettings.deviceType,
        deviceToken: userSettings.deviceToken
    }, notificationData);
    CommonController.notificationUpdate(notificationDataInsert);
}
async function encryptDBData(data,fieldCheck){    
    for(let x of fieldCheck){
         data[x] = await rsaWrapper.encrypt(rsaWrapper.serverDBPub, (data[x].toString('base64')));
    }
    return data;
}

//await decryptDBData(response.encryptedobj, ["facebookId","role"]);
async function decryptDBData(data,fieldCheck){
    if(process.env.ENABLE_DB_ENCRYPTION=="1"){
        for(let x of fieldCheck){
             data[x] = await rsaWrapper.decrypt(rsaWrapper.serverDBPrivate, data[x]);
        }
        return data;
    }else{
        return data;
    }
}