// 지도 초기화 관련 코드
function waitForKakao() {
  if (typeof kakao === "undefined" || !kakao.maps) {
    setTimeout(waitForKakao, 100)
    return
  }
  initializeMap()
}

function initializeMap() {
  var markers = []
  var currentMarker = null

  var mapContainer = document.getElementById("map"),
    mapOption = {
      center: new kakao.maps.LatLng(37.566826, 126.9786567),
      level: 3,
    }

  var map = new kakao.maps.Map(mapContainer, mapOption)
  var ps = new kakao.maps.services.Places()
  var infowindow = new kakao.maps.InfoWindow({ zIndex: 20 })

  window.addEventListener("resize", () => {
    map.relayout()
  })

  // 전역 변수로 노출
  window.map = map
  window.ps = ps
  window.infowindow = infowindow
  window.markers = markers
  window.currentMarker = currentMarker
}

document.addEventListener("DOMContentLoaded", () => {
  waitForKakao()
})

