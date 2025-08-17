// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const auth = firebase.auth();
const db = firebase.firestore();

// Export the services
export { auth, db };
