const admin = require('firebase-admin');
const path = require('path');

// Resolve path to serviceAccountKey.json relative to the root of the backend folder
const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.cert(serviceAccount)
});

module.exports = admin;
