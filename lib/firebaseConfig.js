// lib/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCs18d3PvGIr1T-HqiM3kW_J3_o2bMx0vc",
  authDomain: "bookingrusalina.firebaseapp.com",
  projectId: "bookingrusalina",
  storageBucket: "bookingrusalina.appspot.com",
  messagingSenderId: "832837519615",
  appId: "1:832837519615:web:374f9e99c3c027cb3aa4ca",
  measurementId: "G-7BQQFREF4P"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };