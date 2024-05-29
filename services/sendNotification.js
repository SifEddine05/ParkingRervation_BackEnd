const admin = require('./firebase'); // Import initialized Firebase Admin
const prisma = require("../models/prisma.client");

async function sendNotification(userId, message,status) {
    try {
        // Fetch the FCM token from your database based on userId
        if(status ==="active")
        {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { fcmToken: true } // Assuming you store FCM tokens in the user table
            });
    
            if (user && user.fcmToken) {
                const payload = {
                    notification: {
                        title: "Reservation Reminder",
                        body: message,
                    }
                };
    
                const response = await admin.messaging().sendToDevice(user.fcmToken, payload);
                console.log("Notification sent successfully:", response);
            } else {
                console.error("No FCM token found for user:", userId);
            }
        }
        
    } catch (error) {
        console.error("Error sending notification:", error);
    }
}

module.exports = { sendNotification };
