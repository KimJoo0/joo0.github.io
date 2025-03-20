// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyB51pxmbR5yylELZQjcU4LYpdd6GO3Doaw",
  authDomain: "foodmap-ae703.firebaseapp.com",
  projectId: "foodmap-ae703",
  storageBucket: "foodmap-ae703.firebasestorage.app",
  messagingSenderId: "851768962152",
  appId: "1:851768962152:web:6793760084986ab0aa1fdd",
  measurementId: "G-3KDC0ZRVDJ",
}

// Firebase 초기화
console.log("Firebase 초기화 시도 중...")
try {
  // Firebase import
  import { initializeApp } from "firebase/app";
  import { getDocs } from "firebase/firestore";
  import { onAuthStateChanged } from "firebase/auth";
  import * as firebase from 'firebase/app';
  import 'firebase/auth';
  import 'firebase/firestore';

  // 이미 초기화되었는지 확인
  if (!firebase.apps || !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig)
    console.log("Firebase 초기화 성공")
  } else {
    console.log("Firebase가 이미 초기화되어 있습니다.")
  }

  // Firestore 참조 생성
  const db = firebase.firestore()
  const auth = firebase.auth()

  // 전역 변수로 노출
  window.db = db
  window.auth = auth

  // 현재 로그인한 사용자 정보를 저장할 전역 변수
  window.currentUser = null

  // 사용자 인증 상태 변경 감지
  auth.onAuthStateChanged((user) => {
    if (user) {
      // 사용자가 로그인한 경우
      window.currentUser = user
      console.log("로그인 상태:", user.email)
      updateAuthUI(true)
    } else {
      // 사용자가 로그아웃한 경우
      window.currentUser = null
      console.log("로그아웃 상태")
      updateAuthUI(false)
    }
  })

  // 인증 UI 업데이트 함수
  function updateAuthUI(isLoggedIn) {
    const loginStatus = document.getElementById("login-status")
    const authButton = document.getElementById("auth-button")

    if (!loginStatus || !authButton) {
      console.error("인증 UI 요소를 찾을 수 없습니다.")
      return
    }

    if (isLoggedIn && window.currentUser) {
      loginStatus.textContent = `${window.currentUser.email}`
      authButton.textContent = "로그아웃"
    } else {
      loginStatus.textContent = "로그인하세요"
      authButton.textContent = "로그인"
    }
  }

  // 전역 스코프에 함수 노출
  window.updateAuthUI = updateAuthUI
} catch (error) {
  console.error("Firebase 초기화 오류:", error)
}

