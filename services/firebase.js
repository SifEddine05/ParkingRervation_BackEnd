const admin = require('firebase-admin');
const serviceAccount = require('./tdm-project-904da-firebase-adminsdk-4ghdn-f8f7fe9bb2.json'); // Replace with the path to your service account key file

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://tdm-project-904da-default-rtdb.firebaseio.com"
});

module.exports = admin;