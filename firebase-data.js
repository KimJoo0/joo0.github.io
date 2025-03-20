// Firebase 데이터 처리 함수

// 식당 데이터 저장 함수
function saveRestaurantData(placeName, data) {
  if (!window.currentUser) {
    console.log("로그인이 필요합니다.")
    alert("데이터를 저장하려면 로그인이 필요합니다.")
    return Promise.reject("로그인이 필요합니다.")
  }

  const userId = window.currentUser.uid
  return window.db
    .collection("users")
    .doc(userId)
    .collection("restaurants")
    .doc(placeName)
    .set(data, { merge: true })
    .then(() => {
      console.log(`${placeName} 데이터 저장 성공`)
      return data
    })
    .catch((error) => {
      console.error(`${placeName} 데이터 저장 오류:`, error)
      throw error
    })
}

// 식당 데이터 조회 함수
function getRestaurantData(placeName) {
  if (!window.currentUser) {
    console.log("로그인이 필요합니다.")
    return Promise.resolve(null)
  }

  const userId = window.currentUser.uid
  return window.db
    .collection("users")
    .doc(userId)
    .collection("restaurants")
    .doc(placeName)
    .get()
    .then((doc) => {
      if (doc.exists) {
        console.log(`${placeName} 데이터 조회 성공:`, doc.data())
        return doc.data()
      } else {
        console.log(`${placeName} 데이터 없음`)
        return null
      }
    })
    .catch((error) => {
      console.error(`${placeName} 데이터 조회 오류:`, error)
      return null
    })
}

// 모든 방문 식당 데이터 조회 함수
function getAllVisitedRestaurants() {
  if (!window.currentUser) {
    console.log("로그인이 필요합니다.")
    return Promise.resolve([])
  }

  const userId = window.currentUser.uid
  return window.db
    .collection("users")
    .doc(userId)
    .collection("restaurants")
    .get()
    .then((querySnapshot) => {
      const restaurants = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        if (data && ["X", "O"].includes(data.revisitIntent)) {
          restaurants.push({
            name: doc.id,
            intent: data.revisitIntent,
            count: data.revisitCount || "0",
          })
        }
      })
      console.log("방문 식당 목록 조회 성공:", restaurants)
      return restaurants
    })
    .catch((error) => {
      console.error("방문 식당 목록 조회 오류:", error)
      return []
    })
}

// 식당 데이터 삭제 함수
function deleteRestaurantData(placeName) {
  if (!window.currentUser) {
    console.log("로그인이 필요합니다.")
    return Promise.reject("로그인이 필요합니다.")
  }

  const userId = window.currentUser.uid
  return window.db
    .collection("users")
    .doc(userId)
    .collection("restaurants")
    .doc(placeName)
    .delete()
    .then(() => {
      console.log(`${placeName} 데이터 삭제 성공`)
      return true
    })
    .catch((error) => {
      console.error(`${placeName} 데이터 삭제 오류:`, error)
      return false
    })
}

// 로컬스토리지 데이터를 Firebase로 마이그레이션하는 함수
function migrateLocalStorageToFirebase() {
  if (!window.currentUser) {
    console.log("로그인이 필요합니다.")
    return Promise.resolve(false)
  }

  const promises = []

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    try {
      const data = JSON.parse(localStorage.getItem(key))
      if (data && data.revisitIntent) {
        promises.push(saveRestaurantData(key, data))
      }
    } catch (e) {
      console.error(`로컬스토리지 데이터 파싱 오류 (${key}):`, e)
    }
  }

  return Promise.all(promises)
    .then(() => {
      console.log("로컬스토리지 데이터 마이그레이션 완료")
      return true
    })
    .catch((error) => {
      console.error("로컬스토리지 데이터 마이그레이션 오류:", error)
      return false
    })
}

// 전역 스코프에 함수 노출
window.saveRestaurantData = saveRestaurantData
window.getRestaurantData = getRestaurantData
window.getAllVisitedRestaurants = getAllVisitedRestaurants
window.deleteRestaurantData = deleteRestaurantData
window.migrateLocalStorageToFirebase = migrateLocalStorageToFirebase

