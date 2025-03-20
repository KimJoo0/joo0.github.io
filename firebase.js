// Firebase 초기화 (firebase-config.js에서 가져옴)
import firebase from "firebase/app"
import "firebase/firestore"

// Firebase 설정 (firebase-config.js에 정의되어 있다고 가정)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
}

// Firebase 초기화
firebase.initializeApp(firebaseConfig)

// Firestore 참조 생성
const db = firebase.firestore()

export { db }

