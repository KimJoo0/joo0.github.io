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