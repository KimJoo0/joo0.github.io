// 모바일 UI 관련 기능
document.addEventListener("DOMContentLoaded", () => {
  // 검색 패널 토글 기능
  const searchToggleBtn = document.getElementById("search-toggle")
  const menuWrap = document.getElementById("menu_wrap")

  if (searchToggleBtn && menuWrap) {
    searchToggleBtn.addEventListener("click", (e) => {
      // 이벤트 전파 중지 - 버그 수정
      e.stopPropagation()
      menuWrap.classList.toggle("active")

      // 검색창이 열리면 자동으로 포커스
      if (menuWrap.classList.contains("active")) {
        const keyword = document.getElementById("keyword")
        if (keyword) {
          setTimeout(() => {
            keyword.focus()
          }, 300)
        }
      }
    })

    // 검색창 내부 클릭 시 이벤트 전파 중지 - 버그 수정
    menuWrap.addEventListener("click", (e) => {
      e.stopPropagation()
    })
  }

  // 검색 결과 클릭 시 검색 패널 닫기
  const placesList = document.getElementById("placesList")
  if (placesList) {
    placesList.addEventListener("click", (e) => {
      if (e.target.closest(".item")) {
        if (menuWrap.classList.contains("active")) {
          menuWrap.classList.remove("active")
        }
      }
    })
  }

  // 지도 클릭 시 검색 패널 닫기 (document 대신 map 요소에만 적용)
  const map = document.getElementById("map")
  if (map) {
    map.addEventListener("click", () => {
      if (menuWrap && menuWrap.classList.contains("active")) {
        menuWrap.classList.remove("active")
      }
    })
  }

  // 모바일에서 더블탭 방지 (줌 방지)
  document.addEventListener(
    "dblclick",
    (e) => {
      e.preventDefault()
    },
    { passive: false },
  )

  // 모바일에서 핀치 줌 방지
  document.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    },
    { passive: false },
  )

  // 스크롤 이벤트 처리
  let lastScrollTop = 0
  window.addEventListener(
    "scroll",
    () => {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop

      if (currentScroll > lastScrollTop) {
        // 아래로 스크롤
        document.querySelector(".mobile-header").style.transform = "translateY(-100%)"
      } else {
        // 위로 스크롤
        document.querySelector(".mobile-header").style.transform = "translateY(0)"
      }

      lastScrollTop = currentScroll <= 0 ? 0 : currentScroll
    },
    { passive: true },
  )

  // 화면 크기 변경 시 UI 조정
  window.addEventListener("resize", () => {
    adjustUIForScreenSize()
  })

  // 초기 화면 크기에 따른 UI 조정
  adjustUIForScreenSize()

  // 화면 크기에 따른 UI 조정 함수
  function adjustUIForScreenSize() {
    const isMobileView = window.innerWidth <= 768

    // 모바일 뷰에서는 기본적으로 검색 패널 닫기
    if (isMobileView) {
      menuWrap.classList.remove("active")
    }
  }
})

