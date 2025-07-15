
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  // Você precisa adicionar suas credenciais do Firebase aqui
  apiKey: "AIzaSyCcK4hM_lFXIKeRdi3xeZ9O0H4b2smI9K8",
  authDomain: "todolist-c3fa3.firebaseapp.com",
  projectId: "todolist-c3fa3",
  storageBucket: "todolist-c3fa3.appspot.com",
  messagingSenderId: "123456789",
  appId: "todolist-c3fa3.appspot.com"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Firebase Messaging
export const getMessagingInstance = async () => {
  if (await isSupported()) {
    return getMessaging(app);
  }
  return null;
};
