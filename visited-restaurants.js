document.addEventListener("DOMContentLoaded", () => {
  const visitedBtn = document.getElementById("visitedRestaurantsBtn")
  let visitedOverlay = null

  // 방문했던 식당 목록 생성 함수
  function createVisitedList() {
    const overlayDiv = document.createElement("div")
    overlayDiv.className = "overlaybox fade-in"

    const titleDiv = document.createElement("div")
    titleDiv.className = "boxtitle"
    titleDiv.textContent = "방문한 식당"
    overlayDiv.appendChild(titleDiv)

    const ul = document.createElement("ul")
    ul.className = "visited-list"
    ul.style.maxHeight = isMobile() ? "50vh" : "60vh"
    ul.style.overflowY = "auto"

    // 로딩 메시지 표시
    const loadingLi = document.createElement("li")
    loadingLi.innerHTML = '<span class="title">데이터 로딩 중...</span>'
    ul.appendChild(loadingLi)
    overlayDiv.appendChild(ul)

    // 데이터 가져오기 (Firebase 또는 localStorage)
    const getVisitedPlaces = () => {
      if (window.currentUser && window.getAllVisitedRestaurants) {
        // Firebase에서 데이터 가져오기
        return window.getAllVisitedRestaurants()
      } else {
        // localStorage에서 데이터 가져오기
        const visitedPlaces = []
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            try {
              const data = JSON.parse(localStorage.getItem(key))
              if (data && ["X", "O"].includes(data.revisitIntent)) {
                visitedPlaces.push({
                  name: key,
                  intent: data.revisitIntent,
                  count: data.revisitCount || "0",
                })
              }
            } catch (e) {
              console.error(`Error parsing localStorage data for key ${key}:`, e)
            }
          }
          return Promise.resolve(visitedPlaces)
        } catch (e) {
          console.error("Error accessing localStorage:", e)
          return Promise.resolve([])
        }
      }
    }

    // 데이터 저장 함수
    const savePlaceData = (name, data) => {
      if (window.currentUser && window.saveRestaurantData) {
        // Firebase에 데이터 저장
        return window.saveRestaurantData(name, data)
      } else {
        // localStorage에 데이터 저장
        try {
          localStorage.setItem(name, JSON.stringify(data))
          return Promise.resolve(data)
        } catch (e) {
          console.error("localStorage 데이터 저장 오류:", e)
          return Promise.reject(e)
        }
      }
    }

    getVisitedPlaces()
      .then((visitedPlaces) => {
        // 기존 목록 비우기
        while (ul.firstChild) {
          ul.removeChild(ul.firstChild)
        }

        if (visitedPlaces.length === 0) {
          const li = document.createElement("li")
          li.innerHTML = '<span class="title">방문한 식당이 없습니다.</span>'
          ul.appendChild(li)
        } else {
          visitedPlaces.forEach((place) => {
            const li = document.createElement("li")
            li.innerHTML = `
                        <span class="title">${place.name}</span>
                        <select class="intent-select" data-name="${place.name}">
                            <option value="아직방문안함" ${place.intent === "아직방문안함" ? "selected" : ""}>아직방문안함</option>
                            <option value="X" ${place.intent === "X" ? "selected" : ""}>X</option>
                            <option value="O" ${place.intent === "O" ? "selected" : ""}>O</option>
                        </select>
                        <select class="count-select" data-name="${place.name}">
                            <option value="0" ${place.count === "0" ? "selected" : ""}>0</option>
                            <option value="1" ${place.count === "1" ? "selected" : ""}>1</option>
                            <option value="2" ${place.count === "2" ? "selected" : ""}>2</option>
                            <option value="3+" ${place.count === "3+" ? "selected" : ""}>3+</option>
                        </select>
                    `
            ul.appendChild(li)
          })

          // 이벤트 리스너 추가
          ul.querySelectorAll(".intent-select").forEach((select) => {
            select.addEventListener("change", function () {
              const name = this.dataset.name
              const newIntent = this.value
              const countSelect = ul.querySelector(`.count-select[data-name="${name}"]`)

              const data = {
                revisitIntent: newIntent,
                revisitCount: countSelect.value,
              }

              // 데이터 저장
              savePlaceData(name, data).catch((error) => {
                console.error("데이터 저장 실패:", error)
              })

              if (newIntent === "아직방문안함") {
                // 목록에서 제거
                const listItem = select.closest("li")
                if (listItem) {
                  listItem.remove()
                }

                // 목록이 비었는지 확인
                if (ul.children.length === 0) {
                  const emptyLi = document.createElement("li")
                  emptyLi.innerHTML = '<span class="title">방문한 식당이 없습니다.</span>'
                  ul.appendChild(emptyLi)
                }
              }
            })
          })

          ul.querySelectorAll(".count-select").forEach((select) => {
            select.addEventListener("change", function () {
              const name = this.dataset.name
              const intentSelect = ul.querySelector(`.intent-select[data-name="${name}"]`)

              const data = {
                revisitIntent: intentSelect.value,
                revisitCount: this.value,
              }

              // 데이터 저장
              savePlaceData(name, data).catch((error) => {
                console.error("데이터 저장 실패:", error)
              })
            })
          })
        }
      })
      .catch((error) => {
        console.error("방문 식당 데이터 로딩 실패:", error)
        const errorLi = document.createElement("li")
        errorLi.innerHTML = '<span class="title">데이터 로딩 실패</span>'
        ul.innerHTML = ""
        ul.appendChild(errorLi)
      })

    return overlayDiv
  }

  // 오버레이 위치 계산 함수 (모바일 최적화)
  function getOverlayPosition() {
    if (!window.map) {
      console.error("Map is not initialized")
      return null
    }

    // 지도 중앙에 오버레이 표시
    const center = window.map.getCenter()

    return center
  }

  // 오버레이 토글 함수
  function toggleVisitedOverlay() {
    if (!window.map) {
      console.error("Map is not initialized")
      return
    }

    if (visitedOverlay) {
      visitedOverlay.setMap(null)
      visitedOverlay = null
      console.log("Overlay closed")
      return
    }

    const content = createVisitedList()
    const position = getOverlayPosition()

    if (!position) {
      console.error("Invalid position for overlay")
      return
    }

    // kakao 변수 선언 (kakao maps api 사용을 위해)
    const kakao = window.kakao

    visitedOverlay = new kakao.maps.CustomOverlay({
      position: position,
      content: content,
      xAnchor: 0.5,
      yAnchor: 2,
      zIndex: 20,
    })

    try {
      visitedOverlay.setMap(window.map)
      console.log("Overlay opened")

      // 오버레이 외부 클릭 시 닫기
      document.addEventListener("click", function closeOverlayOnOutsideClick(e) {
        if (!content.contains(e.target) && e.target !== visitedBtn) {
          if (visitedOverlay) {
            visitedOverlay.setMap(null)
            visitedOverlay = null
            console.log("Overlay closed by outside click")
            document.removeEventListener("click", closeOverlayOnOutsideClick)
          }
        }
      })

      // 스크롤 이벤트 전파 방지
      content.addEventListener("wheel", (e) => {
        e.stopPropagation()
      })
      content.addEventListener("touchmove", (e) => {
        e.stopPropagation()
      })
    } catch (e) {
      console.error("Error setting overlay:", e)
    }
  }

  if (visitedBtn) {
    visitedBtn.addEventListener("click", toggleVisitedOverlay)
  } else {
    console.error("Visited restaurants button not found")
  }

  // 지도 중심 변경 시 오버레이 위치 업데이트
  if (window.kakao && kakao.maps && kakao.maps.event) {
    kakao.maps.event.addListener(window.map, "center_changed", () => {
      if (visitedOverlay) {
        const newPosition = getOverlayPosition()
        if (newPosition) {
          visitedOverlay.setPosition(newPosition)
        }
      }
    })
  } else {
    console.error("Kakao Maps event system not available")
  }

  function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }
})

