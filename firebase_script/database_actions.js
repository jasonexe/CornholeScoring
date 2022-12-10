// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBTnRlaSGfP9Hzk0YhfdwDRmaNSzfrmDy0",
    authDomain: "scorehole.firebaseapp.com",
    projectId: "scorehole",
    storageBucket: "scorehole.appspot.com",
    messagingSenderId: "30214043784",
    appId: "1:30214043784:web:f081b1e00f626e469e873d",
    measurementId: "G-C6Y8B7WYG8",
    databaseURL: "https://scorehole-default-rtdb.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

function writeUserData(gameId) {
    set(ref(database, 'test'), JSON.parse(localStorage.getItem("__HISTORICAL_GAMES__"), reviver).get(gameId));
}

window.writeUserData = writeUserData;