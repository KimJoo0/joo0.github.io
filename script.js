// 카카오 SDK가 로드되었는지 확인하는 함수
function waitForKakao() {
    if (typeof kakao === 'undefined' || !kakao.maps) {
        setTimeout(waitForKakao, 100);
        return;
    }
    initializeMap();
}

function initializeMap() {
    var markers = [];
    var currentMarker = null;

    var mapContainer = document.getElementById('map'),
        mapOption = {
            center: new kakao.maps.LatLng(37.566826, 126.9786567),
            level: 3
        };

    var map = new kakao.maps.Map(mapContainer, mapOption);
    var ps = new kakao.maps.services.Places();
    var infowindow = new kakao.maps.InfoWindow({zIndex: 20});

    var searchForm = document.getElementById('searchForm');
    var menuWrap = document.getElementById('menu_wrap'); // 검색창 요소 참조

    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        searchPlaces();
    });

    window.addEventListener('resize', function() {
        map.relayout();
    });

    function searchPlaces() {
        var keyword = document.getElementById('keyword').value;
        if (!keyword.replace(/^\s+|\s+$/g, '')) {
            alert('키워드를 입력해주세요!');
            return false;
        }
        ps.keywordSearch(keyword, placesSearchCB);
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

        removeAllChildNods(listEl);
        removeMarker();

        for (var i = 0; i < places.length; i++) {
            var placePosition = new kakao.maps.LatLng(places[i].y, places[i].x),
                marker = addMarker(placePosition, i),
                itemEl = getListItem(i, places[i]);

            bounds.extend(placePosition);

            (function(marker, place) {
                kakao.maps.event.addListener(marker, 'click', function() {
                    if (currentMarker === marker) {
                        infowindow.close();
                        currentMarker = null;
                        menuWrap.style.zIndex = '10'; // 인포윈도우 닫힐 때 복구
                    } else {
                        infowindow.close();
                        displayInfowindow(marker, place);
                        currentMarker = marker;
                    }
                });

                itemEl.onclick = function() {
                    if (currentMarker === marker) {
                        infowindow.close();
                        currentMarker = null;
                        menuWrap.style.zIndex = '10'; // 인포윈도우 닫힐 때 복구
                    } else {
                        infowindow.close();
                        displayInfowindow(marker, place);
                        currentMarker = marker;
                    }
                };
            })(marker, places[i]);

            fragment.appendChild(itemEl);
        }

        listEl.appendChild(fragment);
        menuEl.scrollTop = 0;
        map.setBounds(bounds);
    }

    function getListItem(index, places) {
        var el = document.createElement('li'),
            itemStr = '<span class="markerbg marker_' + (index+1) + '"></span>' +
                      '<div class="info">' +
                      '   <h5>' + places.place_name + '</h5>';

        if (places.road_address_name) {
            itemStr += '    <span>' + places.road_address_name + '</span>' +
                       '   <span class="jibun gray">' + places.address_name + '</span>';
        } else {
            itemStr += '    <span>' + places.address_name + '</span>';
        }

        itemStr += '  <span class="tel">' + places.phone + '</span>' +
                   '</div>';

        el.innerHTML = itemStr;
        el.className = 'item';
        return el;
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

        marker.setMap(map);
        markers.push(marker);
        return marker;
    }

    function removeMarker() {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
        markers = [];
    }

    function displayPagination(pagination) {
        var paginationEl = document.getElementById('pagination'),
            fragment = document.createDocumentFragment();

        while (paginationEl.hasChildNodes()) {
            paginationEl.removeChild(paginationEl.lastChild);
        }

        for (var i = 1; i <= pagination.last; i++) {
            var el = document.createElement('a');
            el.href = "#";
            el.innerHTML = i;

            if (i === pagination.current) {
                el.className = 'on';
            } else {
                el.onclick = (function(i) {
                    return function() {
                        pagination.gotoPage(i);
                    }
                })(i);
            }
            fragment.appendChild(el);
        }
        paginationEl.appendChild(fragment);
    }

    function displayInfowindow(marker, place) {
        const placeData = {
            name: place.place_name,
            revisitIntent: place.revisitIntent || 70,
            revisitRate: place.revisitRate || { "1": 30, "2": 20, "3+": 10 },
            likeProbability: place.likeProbability || 85
        };
        
        const totalRevisitRate = Object.values(placeData.revisitRate).reduce((a, b) => a + b, 0);

        const content = document.createElement('div');
        content.className = 'infowindow-content';
        content.innerHTML = `
            <b>${placeData.name}</b><br>
            <div class="select-group">
                <label>나이:</label>
                <select id="ageSelect_${placeData.name}" onchange="updateStats('${placeData.name}')">
                    <option value="전체">전체</option>
                    <option value="10대">10대</option>
                    <option value="20대">20대</option>
                    <option value="30대">30대</option>
                    <option value="40대">40대</option>
                    <option value="50대">50대</option>
                    <option value="60+">60+</option>
                </select>
                <label>성별:</label>
                <select id="genderSelect_${placeData.name}" onchange="updateStats('${placeData.name}')">
                    <option value="전체">전체</option>
                    <option value="남자">남자</option>
                    <option value="여자">여자</option>
                </select>
            </div>
            <div class="bar-container">
                <div class="bar-label">재방문 의사 (${placeData.revisitIntent}%)</div>
                <div class="bar">
                    <div class="bar-segment revisit-intent" style="width: ${placeData.revisitIntent}%;">
                        ${placeData.revisitIntent}%
                    </div>
                </div>
            </div>
            <div class="bar-container">
                <div class="bar-label">재방문율(1,2,3+) (총 ${totalRevisitRate}%)</div>
                <div class="revisit-bar">
                    <div class="revisit-segment revisit-1" style="width: ${placeData.revisitRate["1"]}%; left: 0;">
                        ${placeData.revisitRate["1"]}%
                    </div>
                    <div class="revisit-segment revisit-2" style="width: ${placeData.revisitRate["2"]}%; left: ${placeData.revisitRate["1"]}%;">
                        ${placeData.revisitRate["2"]}%
                    </div>
                    <div class="revisit-segment revisit-3" style="width: ${placeData.revisitRate["3+"]}%; left: ${placeData.revisitRate["1"] + placeData.revisitRate["2"]}%;">
                        ${placeData.revisitRate["3+"]}%
                    </div>
                </div>
            </div>
            <div class="bar-container">
                <div class="bar-label">내가 좋아할 확률 (${placeData.likeProbability}%)</div>
                <div class="bar">
                    <div class="bar-segment like-probability" style="width: ${placeData.likeProbability}%;">
                        ${placeData.likeProbability}%
                    </div>
                </div>
            </div>
            <div class="revisit-section">
                <label>재방문 의사:</label>
                <select id="revisitIntent_${placeData.name}" class="revisit-intent-select">
                    <option value="아직방문안함">아직방문안함</option>
                    <option value="X">X</option>
                    <option value="O">O</option>
                </select>
            </div>
            <div id="revisitCount_${placeData.name}" class="revisit-count-section">
                <label>재방문 횟수:</label>
                <select id="revisitCountSelect_${placeData.name}" class="revisit-count-select">
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3+">3+</option>
                </select>
            </div>
        `;

        // 인포윈도우 열릴 때 검색창 z-index를 0으로 설정
        menuWrap.style.zIndex = '0';

        content.addEventListener('click', function(e) {
            if (e.target.tagName !== 'SELECT' && e.target.tagName !== 'OPTION') {
                infowindow.close();
                currentMarker = null;
                menuWrap.style.zIndex = '10'; // 인포윈도우 닫힐 때 복구
            }
        });

        infowindow.setContent(content);
        infowindow.open(map, marker);

        const revisitIntentSelect = document.getElementById(`revisitIntent_${placeData.name}`);
        const revisitCountSection = document.getElementById(`revisitCount_${placeData.name}`);

        revisitCountSection.style.display = revisitIntentSelect.value === "O" ? "block" : "none";

        revisitIntentSelect.addEventListener('change', function() {
            if (this.value === "O") {
                revisitCountSection.style.display = "block";
                revisitCountSection.classList.add('visible');
            } else {
                revisitCountSection.classList.remove('visible');
                setTimeout(() => {
                    revisitCountSection.style.display = "none";
                }, 300);
            }
            console.log(`${placeData.name}의 재방문 의사: ${this.value}`);
        });
    }

    function removeAllChildNods(el) {
        while (el.hasChildNodes()) {
            el.removeChild(el.lastChild);
        }
    }

    function updateStats(placeName) {
        console.log(`${placeName}에 대한 통계 업데이트 중`);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    waitForKakao();
});