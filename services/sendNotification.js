const admin = require('./firebase'); // Import initialized Firebase Admin
const { google } = require('googleapis');
const prisma = require("../models/prisma.client");

async function getAccessToken() {
    return new Promise((resolve, reject) => {
        const key = require('./service.json');
        const jwtClient = new google.auth.JWT(
            key.client_email,
            null,
            key.private_key,
            ['https://www.googleapis.com/auth/firebase.messaging'],
            null
        );
        jwtClient.authorize((err, tokens) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(tokens.access_token);
        });
    });
}

async function sendNotification(userId, message, status) {
    try {
        if (status === "active") {
            // Fetch the FCM token from your database based on userId
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { fcmToken: true } // Assuming you store FCM tokens in the user table
            });

            if (user && user.fcmToken) {
                const accessToken = await getAccessToken();

                const payload = {
                    message: {
                        token: user.fcmToken,
                        notification: {
                            title: "Reservation Reminder",
                            body: message,
                        }
                    }
                };

                const response = await fetch(`https://fcm.googleapis.com/v1/projects/tdm-project-904da/messages:send`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    console.log("Notification sent successfully:", await response.json());
                } else {
                    console.error("Error sending notification:", await response.text());
                }
            } else {
                console.error("No FCM token found for user:", userId);
            }
        }
    } catch (error) {
        console.error("Error sending notification:", error);
    }
}

module.exports = { sendNotification };
