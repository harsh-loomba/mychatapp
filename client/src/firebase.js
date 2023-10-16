// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyAjsLlXIwPaDbvszWu7GNxd1y3UC8p0S9I",
	authDomain: "chat-ba572.firebaseapp.com",
	projectId: "chat-ba572",
	storageBucket: "chat-ba572.appspot.com",
	messagingSenderId: "192648033976",
	appId: "1:192648033976:web:af0dcc831dcb4c80d5a64d",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const db = getFirestore();
