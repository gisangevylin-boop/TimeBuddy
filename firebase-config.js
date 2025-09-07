// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5N0pzxGjxNUnFxJlZbkpXvPSkqg5jGdw",
  authDomain: "timebuddy-d54a3.firebaseapp.com",
  projectId: "timebuddy-d54a3",
  storageBucket: "timebuddy-d54a3.firebasestorage.app",
  messagingSenderId: "235396426991",
  appId: "1:235396426991:web:c97868da076cd0f58abf1a",
  measurementId: "G-KF4YRMJ6YE"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Make them globally available
window.auth = auth;

window.db = db;
