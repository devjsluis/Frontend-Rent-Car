// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCNn1iYsA1qHBXERrb8HR4xMQbvObKyr54",
  authDomain: "rent-car-vue.firebaseapp.com",
  projectId: "rent-car-vue",
  storageBucket: "rent-car-vue.appspot.com",
  messagingSenderId: "846401037277",
  appId: "1:846401037277:web:9dddaf06592bd19a668c34",
  measurementId: "G-9N92EZKRGC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
