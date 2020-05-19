'use strict';

// npm modules
const moment = require('moment');

// local modules
const Models = require('../../../models'),
    Dao = require('../../../dao').queries,
    appointmentUtil = require('../../controllersutil').appointmentUtil;


// export controllersutil functions
module.exports = {
    // professional available on date
    dateAvailability: async (model, query) => {
        try {
            console.log("facility_professional controllersutil----", query);

            let weekDayOnDate = moment(query.date).isoWeekday(),
                unAvailability = (await Dao.aggregateData(model, [
                    {
                        $match: {
                            _id: ObjectId(query.professional),
                            // "notAvailableOn.dates": {$elemMatch: {$eq: query.date}}
                        }
                    }, {
                        $project: {
                            notAvailableOn: 1,
                            "professional.workingHours": 1,
                            available: {                                // check date appointment in notAvailableOn Key
                                $map: {
                                    input: "$notAvailableOn.dates",
                                    as: "date",
                                    in: {$eq: ["$$date", query.date]}
                                }
                            }
                        }
                    }, {
                        $project: {
                            dateAvailability: {
                                $cond: {
                                    if: {$eq: ['$notAvailableOn.isAllDay', false]},
                                    then: {
                                        endTime: "$notAvailableOn.endTime",
                                        startTime: "$notAvailableOn.startTime",
                                    }, else: {}
                                }
                            },
                            dataOnAvailable: {
                                $cond: {
                                    if: {
                                        $and: [         // available in key from above project
                                            {$eq: ['$notAvailableOn.isAllDay', false]},
                                            {$or: [
                                                    {$in: [true, "$available"]},
                                                    {$gte: [{$size: "$available"}, 0]}
                                                ]}],
                                            // {$in: [true, "$available"]}]
                                    },
                                    then: {
                                        notAvailableOn: "$notAvailableOn",
                                        workingHours: {
                                            $cond: {
                                                if: {$eq: [{$arrayElemAt: ["$professional.workingHours.working", weekDayOnDate]}, true]},
                                                then: "$professional.workingHours",
                                                else: []
                                            }
                                        }
                                    },
                                    else: {}
                                }
                            },
                            dataOnNotAvailable: {          // available in key from above project
                                $cond: {
                                    if: {
                                        $and: [
                                            {$or: [
                                                    {$in: [false, "$available"]},
                                                    {$gte: [{$size: "$available"}, 0]}
                                                ]},
                                            // {$in: [false, "$available"]},
                                            {$eq: [{$arrayElemAt: ["$professional.workingHours.working", weekDayOnDate]}, true]}
                                        ]
                                    },
                                    then: {
                                        workingHours: "$professional.workingHours"
                                    },
                                    else: {}
                                }
                            }
                        }
                    }
                ]))[0];

            console.log("unavailability----", JSON.stringify(unAvailability))

            if (unAvailability && unAvailability.dateAvailability.isAllDay) return {
                available: false
            };
            else return {
                available: true,
                notAvailableTime: unAvailability && unAvailability.dataOnAvailable.notAvailableOn ? {
                    endTime: unAvailability.dataOnAvailable.notAvailableOn.endTime || "",
                    startTime: unAvailability.dataOnAvailable.notAvailableOn.startTime || ""
                } : {},
                workingHours: unAvailability && unAvailability.dataOnAvailable.workingHours || unAvailability && unAvailability.dataOnNotAvailable.workingHours
            }

            // let unAvailability = await Dao.getData(model,
            //     {_id: ObjectId(query.professional), "notAvailableOn.dates": {$elemMatch: {$eq: query.date}}},
            //     {notAvailableOn: 1, "professional.workingHours": 1}, {lean: true});
            // if(unAvailability) {
            //     let notAvailable =  unAvailability.notAvailableOn;
            //     if(notAvailable && notAvailable.isAllDay) return {
            //         available: false
            //     };
            //     else return {
            //         available: true,
            //         workingHours: notAvailable && notAvailable.professional.workingHours || [],
            //         notAvailableTime: {
            //             endTime: notAvailable && notAvailable.endTime || "",
            //             startTime: notAvailable && notAvailable.startTime || ""
            //         }
            //     }
            // }
            //  else return {
            //     available: true,
            //     notAvailableTime: {},
            //     workingHours: notAvailable && notAvailable.professional.workingHours || []
            // }
        } catch (e) {
            console.log("err in date availability in controller controllersutil under facility_professional in src---", e);
            throw e;
        }
    },

    // professional facility working hrs on particular date
    getWorkingHoursForFacility: async (model, query) => {
        try {
            let weekDay = moment(query.date).isoWeekday(),
                onDateFacilities = [],
                criteria = {professional: ObjectId(query.professional)};

            if (query.facility) criteria.facility = ObjectId(query.facility);

            let facilities = await Dao.getData(model, criteria, {facility: 1, workingHours: 1}, {lean: true});

            if (query.facility || query.type !== "ONSITE") {
                return facilities[0].workingHours;
            } else {

                for (let facility of facilities) {
                    if (facility.workingHours[weekDay].working) onDateFacilities.push(facility.facility);
                }

                return await Dao.aggregateData(Models.Users, [{
                    $geoNear: {
                        near: {
                            type: "Point",
                            coordinates: [parseInt(query.long), parseInt(query.lat)] || [0, 0]
                        },
                        distanceField: "distance",
                        num: parseInt(query.limit) || 20,
                        query: {_id: {$in: onDateFacilities}},
                        spherical: true
                    }
                }, {
                    $project: {
                        _id: 1,
                        name: 1,
                        distance: 1,
                        "facility.address": 1
                    }
                }])
            }

        } catch (e) {
            console.log("err in get working hours for facility in controller controllersutil in facility_professional under src---", e);
            throw e;
        }
    },

    // slots with 30 mins interval, workingHours on date -> if slots boooked || not Available On lie -> available false else true
    createSlots: async (data) => {
        try {
            console.log("create slots----");
            let slotsBooked = data.slotsBooked,
                weekDay = moment(data.date).isoWeekday(),
                endTimeForDay = await appointmentUtil.convertTimeStringInMins([data.workingHours[weekDay].endTime]),
                startTimeForDay = await appointmentUtil.convertTimeStringInMins([data.workingHours[weekDay].startTime]),
                notAvailableEndTime = data.notAvailableOn.endTime ? await appointmentUtil.convertTimeStringInMins([data.notAvailableOn.endTime]) : [],
                notAvailableStartTime = data.notAvailableOn.startTime ? await appointmentUtil.convertTimeStringInMins([data.notAvailableOn.startTime]) : [];
            console.log("slotsBooked endTimeForDay startTimeForDay notAvailableEndTime notAvailableStartTime", slotsBooked, endTimeForDay, startTimeForDay, notAvailableEndTime, notAvailableStartTime);
            return {};
        } catch (e) {
            console.log("err in create slots in controller util under facility_profeaasional---", e);
            throw e;
        }
    }
};