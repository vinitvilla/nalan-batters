const admin = require("firebase-admin");
const path = require("path");

// Adjust the path if your service account file is elsewhere
const serviceAccount = require(path.join(__dirname, "../nalan-batters-firebase-adminsdk-fbsvc-0b103d9719.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uid = process.argv[2]; // Pass UID as a command-line argument

if (!uid) {
  console.error("Usage: node setAdmin.js <USER_UID>");
  process.exit(1);
}

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log("Admin claim set for user:", uid);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error setting admin claim:", error);
    process.exit(1);
  });
