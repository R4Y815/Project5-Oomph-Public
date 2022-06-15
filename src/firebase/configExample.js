import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: '<INSERT EXTERNAL API KEY FROM FIREBASE>',
  authDomain: '<INSERT AUTHDOMAIN FROM FIREBASE>',
  projectId: '<INSERT PROJECT ID ON FIREBASE>',
  storageBucket: '<INSERT STORAGE BUCKET NAME>',
  messagingSenderId: '<INSERT MESSAGING SENDER ID',
  appId: '<INSERT APP ID FROM FIREBASE>',
};

// init firebase
firebase.initializeApp(firebaseConfig);

// init service
const projectFirestore = firebase.firestore();
const projectAuth = firebase.auth();

export { projectFirestore, projectAuth };
