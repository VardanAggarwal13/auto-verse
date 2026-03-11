const admin = require('firebase-admin');

// Initialize Firebase Admin with just the projectId
// We only need it to verify ID tokens, which doesn't strictly 
// require a full service account JSON if we just use core auth features.
admin.initializeApp({
  projectId: 'auto-verse-22683'
});

module.exports = admin;
