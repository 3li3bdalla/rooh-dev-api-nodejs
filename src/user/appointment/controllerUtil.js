'use strict';


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

                if(am_pm === "AM") minsArray.push((time[0]*60) + time[1]);
                else {
                    if(time[0] === 12) minsArray.push((time[0]*60) + time[1]);
                    else {
                        time[0] = time[0] + 12;
                        minsArray.push((time[0]*60) + time[1]);
                    }
                }
            }
            resolve(minsArray);
        })
    }
};