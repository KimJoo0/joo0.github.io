// 장소 검색 및 표시 관련 코드
function searchPlaces() {
    var keyword = document.getElementById('keyword').value;
    if (!keyword.replace(/^\s+|\s+$/g, '')) {
        alert('키워드를 입력해주세요!');
        return false;
    }
    window.ps.keywordSearch(keyword, placesSearchCB);
}

function placesSearchCB(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {
        displayPlaces(data);
        displayPagination(pagination);
    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        alert('검색 결과가 존재하지 않습니다.');
        return;
    } else if (status === kakao.maps.services.Status.ERROR) {
        alert('검색 결과 중 오류가 발생했습니다.');
        return;
    }
}

function displayPlaces(places) {
    var listEl = document.getElementById('placesList'),
        menuEl = document.getElementById('menu_wrap'),
        fragment = document.createDocumentFragment(),
        bounds = new kakao.maps.LatLngBounds();

    removeAllChildNodes(listEl);
    removeMarker();

    for (var i = 0; i < places.length; i++) {
        var placePosition = new kakao.maps.LatLng(places[i].y, places[i].x),
            marker = addMarker(placePosition, i),
            itemEl = getListItem(i, places[i]);

        bounds.extend(placePosition);

        (function(marker, place) {
            kakao.maps.event.addListener(marker, 'click', function() {
                toggleInfowindow(marker, place);
            });

            itemEl.onclick = function() {
                toggleInfowindow(marker, place);
            };
        })(marker, places[i]);

        fragment.appendChild(itemEl);
    }

    listEl.appendChild(fragment);
    menuEl.scrollTop = 0;
    window.map.setBounds(bounds);
}

function toggleInfowindow(marker, place) {
    if (window.currentMarker === marker) {
        window.infowindow.close();
        window.currentMarker = null;
        if (isMobile()) {
            document.getElementById('menu_wrap').style.zIndex = '10';
        }
    } else {
        window.infowindow.close();
        displayInfowindow(marker, place);
        window.currentMarker = marker;
    }
}

function addMarker(position, idx) {
    var imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png',
        imageSize = new kakao.maps.Size(36, 37),
        imgOptions = {
            spriteSize: new kakao.maps.Size(36, 691),
            spriteOrigin: new kakao.maps.Point(0, (idx*46)+10),
            offset: new kakao.maps.Point(13, 37)
        },
        markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions),
        marker = new kakao.maps.Marker({
            position: position,
            image: markerImage
        });

    marker.setMap(window.map);
    window.markers.push(marker);
    return marker;
}

function removeMarker() {
    for (var i = 0; i < window.markers.length; i++) {
        window.markers[i].setMap(null);
    }
    window.markers = [];
}

// 검색 폼 이벤트 리스너 설정
document.getElementById('searchForm').addEventListener('submit', function(e) {
    e.preventDefault();
    searchPlaces();
});

// 기존 코드에 추가할 이벤트 핸들러
function setupMapClickHandler() {
    kakao.maps.event.addListener(window.map, 'click', function() {
        // 검색창 포커스 제거
        document.getElementById('keyword').blur();
        
        // 모바일에서 키패드 강제 숨김
        if (isMobile()) {
            document.activeElement.blur();
            document.body.focus();
        }
    });
}

// 터치 이벤트도 추가 (모바일 지원)
function setupMapTouchHandler() {
    kakao.maps.event.addListener(window.map, 'touchstart', function() {
        // 검색창 포커스 제거
        document.getElementById('keyword').blur();
        
        // 모바일에서 키패드 강제 숨김
        if (isMobile()) {
            document.activeElement.blur();
            document.body.focus();
        }
    });
}

// 기존 searchPlaces 함수에 이벤트 핸들러 호출 추가
function searchPlaces() {
    var keyword = document.getElementById('keyword').value;
    if (!keyword.replace(/^\s+|\s+$/g, '')) {
        alert('키워드를 입력해주세요!');
        return false;
    }
    window.ps.keywordSearch(keyword, placesSearchCB);
    
    // 검색 후 즉시 포커스 제거
    document.getElementById('keyword').blur();
}

// 초기화 시 이벤트 핸들러 설정 (지도가 로드된 후 호출해야 함)
function initializeMapHandlers() {
    setupMapClickHandler();
    setupMapTouchHandler();
}

// 문서 로드 후 초기화 (기존 코드 맨 아래에 추가)
document.addEventListener('DOMContentLoaded', function() {
    // 기존 검색 폼 이벤트 리스너
    document.getElementById('searchForm').addEventListener('submit', function(e) {
        e.preventDefault();
        searchPlaces();
    });
    
    // 지도 이벤트 핸들러 초기화
    // 주의: 이 부분은 지도 객체(window.map)가 생성된 후 호출되어야 합니다
    // 지도 초기화 코드가 별도로 있다면 그 이후에 호출해야 함
    initializeMapHandlers();
});

// 모바일 장치 체크 함수 (기존에 없던 경우 추가)
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}