// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCg7U3vczZeSxBWN34S1gtpQyCuF_vT9F8",
  authDomain: "tenis-komedi.firebaseapp.com",
  databaseURL: "https://tenis-komedi-default-rtdb.firebaseio.com",
  projectId: "tenis-komedi",
  storageBucket: "tenis-komedi.firebasestorage.app",
  messagingSenderId: "7187557039",
  appId: "1:7187557039:web:f2d4ec74c5f417a83dc25a",
  measurementId: "G-1NYNJSZCZC"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);