import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyCELrUE6qFQrESj4hmENIJOZ8PjwvgEAuw",
  authDomain: "todo-list-c98c4.firebaseapp.com",
  projectId: "todo-list-c98c4",
  storageBucket: "todo-list-c98c4.appspot.com",
  messagingSenderId: "550961443572",
  appId: "1:550961443572:web:ca2cc6de3c0a771d10a4a1",
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

export { db };
