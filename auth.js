// 사용자 인증 관련 기능
document.addEventListener("DOMContentLoaded", () => {
  const authButton = document.getElementById("auth-button")

  if (!authButton) {
    console.error("인증 버튼을 찾을 수 없습니다.")
    return
  }

  console.log("인증 버튼 이벤트 리스너 설정됨")

  authButton.addEventListener("click", () => {
    console.log("인증 버튼 클릭됨")

    // Firebase가 로드되었는지 확인
    if (typeof firebase === "undefined" || !firebase.auth) {
      console.error("Firebase가 로드되지 않았습니다.")
      alert("Firebase가 로드되지 않았습니다. 페이지를 새로고침하거나 나중에 다시 시도해주세요.")
      return
    }

    if (window.currentUser) {
      // 로그아웃
      console.log("로그아웃 시도 중...")
      firebase
        .auth()
        .signOut()
        .then(() => {
          console.log("로그아웃 성공")
          alert("로그아웃되었습니다.")
        })
        .catch((error) => {
          console.error("로그아웃 오류:", error)
          alert("로그아웃 중 오류가 발생했습니다: " + error.message)
        })
    } else {
      // 로그인
      console.log("로그인 시도 중...")
      const provider = new firebase.auth.GoogleAuthProvider()

      firebase
        .auth()
        .signInWithPopup(provider)
        .then((result) => {
          console.log("로그인 성공:", result.user.email)
          alert("로그인 성공: " + result.user.email)

          // 로그인 성공 후 로컬스토리지 데이터 마이그레이션 제안
          if (localStorage.length > 0) {
            const confirmMigration = confirm(
              "로컬에 저장된 식당 데이터가 있습니다. Firebase로 마이그레이션하시겠습니까?",
            )

            if (confirmMigration && window.migrateLocalStorageToFirebase) {
              window.migrateLocalStorageToFirebase().then((success) => {
                if (success) {
                  alert("데이터 마이그레이션이 완료되었습니다.")
                } else {
                  alert("일부 데이터 마이그레이션에 실패했습니다.")
                }
              })
            }
          }
        })
        .catch((error) => {
          console.error("로그인 오류:", error)
          alert("로그인에 실패했습니다: " + error.message)
        })
    }
  })
})

