
const Models = require('../models'),
    Dao = require('../dao').queries,
    NotificationManager = require('../Lib/NotificationManager');

module.exports = {
    sendPushNotification: async (deviceData, notificationData) => {
        if (notificationData.deviceType === "WEB") {
            let badeCount = await Dao.count(Models.Notification, { "isRead": false, "receiverId": notificationData.receiverId });
            badeCount = badeCount + 1;
            notificationData.badeCount = badeCount;
           // Socket.sendSocketToUser(notificationData.type, notificationData);
        }
        else {
          //  console.log("push notification")
            NotificationManager.newSendPushNotifications(deviceData, notificationData);
        }
    },
    notificationUpdate: async (notificationData) => {
        await Dao.saveData(Models.Notification, notificationData);
    }
};
