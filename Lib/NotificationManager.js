var admin = require("firebase-admin");

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FCM_PROJECT_ID,
        clientEmail: process.env.FCM_CLIENT_EMAIL,
        privateKey: process.env.FCM_PRIVATE_KEY
    })
});

exports.newSendPushNotifications = async (fcmSocketId, pushData) => {

    //userDevices.forEach(function(fcmSocketId) {
        try{
            console.log("newSendPushNotifications ------------------ ")

            pushData.badgeCount = pushData.badgeCount ? (pushData.badgeCount).toString() : "1";

            if(fcmSocketId.deviceToken != "")
            {///////////////////////////////	Send Push 	////////////////////

                let payload = {};

                if(fcmSocketId.deviceType == "IOS")
                {

                    pushData.title = process.env.APP_NAME;
                    pushData.sound = "default";
                    pushData.body = pushData.message;
                    pushData.roohNotification = "true";

                    payload = {
                        notification: pushData
                    };

                    payload.notification.badge = pushData.badgeCount;
                    delete payload.notification.badgeCount;

                }
                else
                {
                    payload = {
                        data: pushData
                    };

                    payload.data.badge = pushData.badgeCount;
                    payload.data.roohNotification = "true";
                    delete payload.data.badgeCount;

                }
                console.log("==================== newSendPushNotifications ------------------ ")
                admin.messaging().sendToDevice(fcmSocketId.deviceToken, payload)
                    .then(function(response) {
                        console.log("Push Messageeeeeeeeeeeeeeeeeeeeeeeeeeeeeee -");
                    })
                    .catch(function(error) {
                        console.log("Error sending FCM push:", payload, JSON.stringify(error.message, null, 2));
                    });

            }
        }
        catch(e)
        {
            console.log("Error Simple Push Chat -", fcmSocketId, e.message);
        }
   // });
};
