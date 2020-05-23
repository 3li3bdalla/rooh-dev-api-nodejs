var request = require("request");
var RESPONSE_MESSAGE = require("../../config/response-messages");


//sendOTP
module.exports = (payload) => {
    return new Promise((resolve, reject) => {
        // console.log("payload--", payload);
        //http://www.jawalbsms.ws/api.php/sendsms?user=csfhealth&pass=k0pQ4K&to=966596075551&message=SENDING-TEST&sender=ROOH
        var to = payload.countryCode + payload.phone;

        var options = {
            method: "GET",
            url: process.env.SMS_URL,
            qs: {
                user: process.env.SMS_USER,
                pass: process.env.SMS_PASS,
                sender: process.env.SENDER,
                to: to,
                message: payload.message,
            },
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: "Bearer OGE4Mjk0MTc0YjdlY2IyODAxNGI5Njk5MjIwMDE1Y2N8c3k2S0pzVDg=", // + process.env.Token
            },
        };

        request(options, function (error, response, body) {
            // console.log("error-----", error);
            //console.log("response-----",response)
            // console.log("body-----", body);
            if (error) {
                // console.log(" ************** ERROR COMING ***************", error);
                if (error.code === "ETIMEDOUT" && e.connect === true) {
                    reject(RESPONSE_MESSAGE.STATUS_MSG.ERROR.PAYMENT_ERROR);
                } else {
                    reject(RESPONSE_MESSAGE.STATUS_MSG.ERROR.PAYMENT_ERROR);
                }
            } else {
                resolve(body);
            }
        });
    });
}