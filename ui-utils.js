// UI 요소 및 유틸리티 함수 관련 코드
function isMobile() {
  return window.innerWidth <= 768
}

function getListItem(index, places) {
  var el = document.createElement("li"),
    itemStr =
      '<span class="markerbg marker_' +
      (index + 1) +
      '"></span>' +
      '<div class="info">' +
      "   <h5>" +
      places.place_name +
      "</h5>"

  if (places.road_address_name) {
    itemStr +=
      "    <span>" +
      places.road_address_name +
      "</span>" +
      '   <span class="jibun gray">' +
      places.address_name +
      "</span>"
  } else {
    itemStr += "    <span>" + places.address_name + "</span>"
  }

  itemStr += '  <span class="tel">' + places.phone + "</span>" + "</div>"

  el.innerHTML = itemStr
  el.className = "item"
  return el
}

function displayPagination(pagination) {
  var paginationEl = document.getElementById("pagination"),
    fragment = document.createDocumentFragment()

  while (paginationEl.hasChildNodes()) {
    paginationEl.removeChild(paginationEl.lastChild)
  }

  for (var i = 1; i <= pagination.last; i++) {
    var el = document.createElement("a")
    el.href = "#"
    el.innerHTML = i

    if (i === pagination.current) {
      el.className = "on"
    } else {
      el.onclick = ((i) => () => {
        pagination.gotoPage(i)
      })(i)
    }
    fragment.appendChild(el)
  }
  paginationEl.appendChild(fragment)
}

function removeAllChildNodes(el) {
  while (el.hasChildNodes()) {
    el.removeChild(el.lastChild)
  }
}

function updateStats(placeName) {
  console.log(`${placeName}에 대한 통계 업데이트 중`)
}

