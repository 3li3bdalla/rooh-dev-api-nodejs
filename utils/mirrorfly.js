const request = require('request');


module.exports = {

    login: async (data) => {
    
        try {
            console.log("mirrorfly data --------- ",data)
            let options = { method: 'POST',
                url: process.env.MIRRIORFLY_URL + process.env.MIRRIORFLY_LOGIN,
                headers:
                    { 'Postman-Token': 'bb8a79ce-24c2-4497-949d-f683eca94156',
                        'cache-control': 'no-cache',
                        'Content-Type': 'application/json' },
                body: { 
                    password: data.password, 
                    type: data.type, 
                    username: data.username 
                },
                json: true };

           let data1 = await doRequest(options); 
           console.log(`api mirrorfly ${data1}`);
           return data1;
        }
        catch (e) {
            throw e;
        }
    },
    /*updateDevice: async (data) => {
        try {

            let options = { method: 'POST',
                url: process.env.MIRRIORFLY_URL + process.env.MIRRIORFLY_UPDATE_DEVICE_TOKEN,
                headers:
                    { 'Postman-Token': 'bb8a79ce-24c2-4497-949d-f683eca94156',
                        'cache-control': 'no-cache',
                        'Content-Type': 'application/json' },
                body: {
                    deviceToken: data.deviceToken,
                    deviceType: data.deviceType
                },
                json: true };

            console.log(options);

            let data1 = await doRequest(options);
            return data1;
        }
        catch (e) {
            console.log(e);
            throw e;
        }
    },*/
    register: async (data) => {
        try {

            if(data.deviceType == "ANDROID"){
                data.deviceType = "android";
            }
            if(data.deviceType == "IOS"){
                data.deviceType = "ios";
            }
            let options = { method: 'POST',
                url: process.env.MIRRIORFLY_URL + process.env.MIRRIORFLY_REGISTER,
                headers:
                    { 'Postman-Token': 'bb8a79ce-24c2-4497-949d-f683eca94156',
                        'cache-control': 'no-cache',
                        'Content-Type': 'application/json' },
                body: {
                    deviceToken: data.deviceToken,
                    deviceType: data.deviceType,
                    password: data.password,
                    userId: data.userId,
                    mode: process.env.MIRRIORFLY_MODE
                },
                json: true };

            console.log(options);

            let data1 = await doRequest(options);
            return data1;
        }
        catch (e) {
            console.log(e);
            throw e;
        }
    },
    logout: async (data) => {
        try {
            console.log("dt --- ",data)

            let options = { method: 'GET',
                url: process.env.MIRRIORFLY_URL + process.env.MIRRIORFLY_LOGOUT,
                headers:
                    { 'Postman-Token': 'bb8a79ce-24c2-4497-949d-f683eca94156',
                        'cache-control': 'no-cache',
                        'Authorization': data.token,
                        'Content-Type': 'application/json' },
                //body: {},
                json: true };

            console.log(options);

            let data1 = await doRequest(options);

            console.log("data1 ----- ",data1);
            return data1;
        }
        catch (e) {
            throw e;
        }
    }

}


async function doRequest (options) {

    try {
        let data = await new Promise((resolve, reject) => {
            request(options, (error, response, body) => {
                if (error) reject(error)
                else resolve(body)
            })
        });
          console.log(data, "   data ");
        // let json = JSON.parse(data);
        return data;
    }
    catch (err) {
        console.log("error r", err)
        throw err;
    }
}
