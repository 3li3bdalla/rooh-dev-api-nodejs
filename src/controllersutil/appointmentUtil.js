'use strict';

//local modules
const Models = require('../../models'),
    Dao = require('../../dao').queries;

// export controllersutil functions
module.exports = {
    // convert [10:00 AM] -> [600] (minutes)
    convertTimeStringInMins: async (timeStringArray) => {
        return new Promise((resolve, reject) => {
            console.log("appointment controllersutil----", timeStringArray);
            let minsArray = [];
            for(let string of timeStringArray) {
                let splitedString = string.split(' '),        // split 10:00 AM -> 10:00 & AM
                    am_pm = splitedString[1],
                    time = splitedString[0];

                time = time.split(':');   // split 10:05 in 10 and 05
                time = [parseInt(time[0]), parseInt(time[1])];

                if(am_pm === "AM"){
                    if(time[0]==12){
                        time[0] = 0;
                    }
                    minsArray.push((time[0]*60) + time[1]);
                } else {
                    if(time[0] === 12) minsArray.push((time[0]*60) + time[1]);
                    else {
                        time[0] = time[0] + 12;
                        minsArray.push((time[0]*60) + time[1]);
                    }
                }
            }
            resolve(minsArray);
        })
    },

    // fetch the time for which there is already an appointment
    professionalSlots: async (query) =>  {
        let criteria = {_id: query.professional};
        try {
            console.log("criteria---------------- ",criteria)
            return await Dao.getData(Models.Users, criteria, {"professional.workingHours": 1}, {lean: true});
        } catch (e) {
            console.log("error in booked slots in appointment util under controllers util in src---", e);
            throw e;
        }
    },
    professionalFacilitySlots: async (facilityCriteria,facilityProject,populateData) =>  {
        //let criteria = {_id: query.professional};
        try {
            //ADD DISTANCE CHECK HERE
            let populateData = 'facility'//,'_id name facility.address'
            console.log("facilityCriteria------",facilityCriteria)
            let facilityData = await Models.ProfessionalFacilities.find(facilityCriteria, facilityProject, {lean: true})//.populate('facility','_id name address location profilePic coverPic defaultLoginRole').sort({"_id":-1}).exec();
            if(facilityData && facilityData.length > 0){
                let output = [];
                for(let x of facilityData){output.push(ObjectId(x.facility))}
                /*let long = -73.99279,//parseFloat(req.query.long),
                lat = 40.719296;//parseFloat(req.query.lat);*/
                let long = parseFloat(userData.location[0]),
                lat = parseFloat(userData.location[1]);
                var user_data = await Models.Users.aggregate([{
                    $geoNear: {
                            near: {
                                type: "Point",
                                coordinates: [long, lat] || [0, 0]
                            },
                            distanceField: "distance",
                           // maxDistance: 10000,
                            //num: parseInt(req.query.limit) || 20,
                            query: {_id: {$in: output}},
                            spherical: true
                        }
                    },
                    {
                        $project: {
                            //distance:1,
                            distance: {
                                "$cond": {
                                    if: { "$gte": ["$distance", 1]}, 
                                    then: {
                                        $divide: [ {$trunc: { $multiply: [ "$distance" , 0.1 ] } }, 100 ]
                                    }, else: 0
                                }
                            },
                            facility: {
                                _id:"$_id",
                                name:"$name",
                                address:"$address",
                                location:"$location",
                                profilePic:"$profilePic",
                                coverPic:"$coverPic",
                                defaultLoginRole:"$defaultLoginRole"
                            }
                        }
                    },
                    {$sort: {_id: -1}}
                ]);
                if(facilityProject.workingHours != undefined){ 
                //  if this function get second time hit then do below check otherwise return user_data as it is.
                    let output1 = [];
                    user_data = JSON.parse(JSON.stringify(user_data))
                    for (let x in user_data) {
                        user_data[x].workingHours = facilityData[x].workingHours
                    }
                }
                return user_data;

            }else{
                return facilityData;
            }

            //return Models.ProfessionalFacilities.find(facilityCriteria, facilityProject, {lean: true}).populate('facility','_id name address location profilePic coverPic defaultLoginRole location').sort({"_id":-1}).exec();
            
            /*facilityCriteria.location  = { $near : [ -73.9667, 40.78 ], $maxDistance: 5000 }
            return  Models.ProfessionalFacilities
                    .find(facilityCriteria, facilityProject, {lean: true})
                    .populate('facility','_id name address location profilePic coverPic defaultLoginRole')
                    .sort({"_id":-1})
                    .exec();*/


            /*let long = "-73.99279",//parseFloat(req.query.long),
                lat = "40.719296";//parseFloat(req.query.lat);
            return Models.ProfessionalFacilities.aggregate([{
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [long, lat] || [0, 0]
                    },
                    distanceField: "distance",
                    maxDistance: 2,
                    num: parseInt(req.query.limit) || 20,
                    //query: {_id: {$in: userData.professional.facilities}},
                    spherical: true
                }
            }, 
            {
                $match: facilityCriteria
            },
            { $lookup: {
                from: "users",
                localField: "facility",
                foreignField: "_id",
                as: "facility"
            } },
            {$unwind: "$facility"},
            {
                $project: {
                    distance:1,
                    facility: {
                        _id:1,
                        name:1,
                        address:1,
                        location:1,
                        profilePic:1,
                        coverPic:1,
                        defaultLoginRole:1
                    }
                }
            },{$sort: {_id: -1}}])*/

        } catch (e) {
            console.log("error in booked slots in appointment util under controllers util in src---", e);
            throw e;
        }
    },
    bookedSlots: async (query) =>  {
        let criteria = {
          professional: query.professional,
          "status" : "PLACED",
          "scheduledService.date": query.date
        };
        try {
            console.log("booked slots in controllersutil appointment----");
            if(query.facility)
                criteria["scheduledService.clinicHospital"] =  query.facility;

            return await Dao.getData(Models.Appointment, criteria, {"scheduledService.slots": 1}, {lean: true});
        } catch (e) {
            console.log("error in booked slots in appointment util under controllers util in src---", e);
            throw e;
        }
    },
    facilityUnavailable: async (query) =>  {
        let criteria = {
            "doctor": ObjectId(query.professional),
            "type":"SELF",
            "status" : "PLACED",
            "selfAppointment.dates":{$elemMatch:{$eq:query.date}}
        };
        try {
            return await Dao.getData(Models.Appointment, criteria, {"selfAppointment.isAllDay": 1});
        } catch (e) {
            console.log("error in booked slots in appointment util under controllers util in src---", e);
            throw e;
        }
    },
    slotsUnavailable: async (query) =>  {
        let criteria = {
            "doctor": ObjectId(query.professional),
            //"status" : "PLACED",
            $or: [
                {
                    "type":"SELF", 
                    "selfAppointment.dates":{$elemMatch:{$eq:query.date}}
                },
                {
                    "scheduledService.date": {$eq:query.date},
                    $and: [
                        {"status": {$ne: "REJECTED"}},
                        {"status": {$ne: "CANCELLED"}}
                    ]
                }
            ],
        };
        console.log("SLOTS $$$$$$$$$$$$ criteria --------",JSON.stringify(criteria))
        try {
            return await Dao.getData(Models.Appointment, criteria, {slots:1,"selfAppointment.isAllDay": 1},{$sort:{"selfAppointment.isAllDay":1}});
        } catch (e) {
            console.log("error in booked slots in appointment util under controllers util in src---", e);
            throw e;
        }
    },
    facilityCriteria: async (professional,facilityId,dow) =>  {
        try {
            let crit;
            if(dow == 0){ crit = {"professional":ObjectId(professional), "facility": {$ne: facilityId}, "workingHours.0.working":true};}
            if(dow == 1){ crit = {"professional":ObjectId(professional), "facility": {$ne: facilityId}, "workingHours.1.working":true};}
            if(dow == 2){ crit = {"professional":ObjectId(professional), "facility": {$ne: facilityId}, "workingHours.2.working":true};}
            if(dow == 3){ crit = {"professional":ObjectId(professional), "facility": {$ne: facilityId}, "workingHours.3.working":true};}
            if(dow == 4){ crit = {"professional":ObjectId(professional), "facility": {$ne: facilityId}, "workingHours.4.working":true};}
            if(dow == 5){ crit = {"professional":ObjectId(professional), "facility": {$ne: facilityId}, "workingHours.5.working":true};}
            if(dow == 6){ crit = {"professional":ObjectId(professional), "facility": {$ne: facilityId}, "workingHours.6.working":true};}            
            return crit;
        } catch (e) {
            console.log("error in booked slots in appointment util under controllers util in src---", e);
            throw e;
        }
    }
};