document.addEventListener('DOMContentLoaded', function(){
// 마커를 담을 배열입니다
var markers = [];
var currentMarker = null; // 현재 열려있는 마커를 추적

var mapContainer = document.getElementById('map'), // 지도를 표시할 div 
    mapOption = {
        center: new kakao.maps.LatLng(37.566826, 126.9786567), // 지도의 중심좌표
        level: 3 // 지도의 확대 레벨
    };  

// 지도를 생성합니다    
var map = new kakao.maps.Map(mapContainer, mapOption); 

// 장소 검색 객체를 생성합니다
var ps = new kakao.maps.services.Places();  

// 검색 결과 목록이나 마커를 클릭했을 때 장소명을 표출할 인포윈도우를 생성합니다
var infowindow = new kakao.maps.InfoWindow({zIndex:1});

// 키워드로 장소를 검색합니다
searchPlaces();

// 창 크기 변경 시 지도 크기 재조정
window.addEventListener('resize', function() {
    map.relayout();
});

// 키워드 검색을 요청하는 함수입니다
function searchPlaces() {
    var keyword = document.getElementById('keyword').value;

    if (!keyword.replace(/^\s+|\s+$/g, '')) {
        alert('키워드를 입력해주세요!');
        return false;
    }

    // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
    ps.keywordSearch(keyword, placesSearchCB); 
}

// 장소검색이 완료됐을 때 호출되는 콜백함수 입니다
function placesSearchCB(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {
        // 정상적으로 검색이 완료됐으면 검색 목록과 마커를 표출합니다
        displayPlaces(data);
        // 페이지 번호를 표출합니다
        displayPagination(pagination);
    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        alert('검색 결과가 존재하지 않습니다.');
        return;
    } else if (status === kakao.maps.services.Status.ERROR) {
        alert('검색 결과 중 오류가 발생했습니다.');
        return;
    }
}

// 검색 결과 목록과 마커를 표출하는 함수입니다
function displayPlaces(places) {
    var listEl = document.getElementById('placesList'), 
        menuEl = document.getElementById('menu_wrap'),
        fragment = document.createDocumentFragment(), 
        bounds = new kakao.maps.LatLngBounds(), 
        listStr = '';
    
    // 검색 결과 목록에 추가된 항목들을 제거합니다
    removeAllChildNods(listEl);

    // 지도에 표시되고 있는 마커를 제거합니다
    removeMarker();
    
    for (var i = 0; i < places.length; i++) {
        // 마커를 생성하고 지도에 표시합니다
        var placePosition = new kakao.maps.LatLng(places[i].y, places[i].x),
            marker = addMarker(placePosition, i), 
            itemEl = getListItem(i, places[i]); // 검색 결과 항목 Element를 생성합니다

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
        bounds.extend(placePosition);

        // 마커와 검색결과 항목에 클릭 이벤트 추가
        (function(marker, place) {
            kakao.maps.event.addListener(marker, 'click', function() {
                if (currentMarker === marker) {
                    // 이미 열려있는 마커를 다시 클릭하면 닫음
                    infowindow.close();
                    currentMarker = null;
                } else {
                    // 다른 마커를 클릭하면 기존 인포윈도우 닫고 새로 열음
                    infowindow.close();
                    displayInfowindow(marker, place);
                    currentMarker = marker;
                }
            });

            itemEl.onclick = function() {
                if (currentMarker === marker) {
                    infowindow.close();
                    currentMarker = null;
                } else {
                    infowindow.close();
                    displayInfowindow(marker, place);
                    currentMarker = marker;
                }
            };
        })(marker, places[i]);

        fragment.appendChild(itemEl);
    }

    // 검색결과 항목들을 검색결과 목록 Element에 추가합니다
    listEl.appendChild(fragment);
    menuEl.scrollTop = 0;

    // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
    map.setBounds(bounds);
}

// 검색결과 항목을 Element로 반환하는 함수입니다
function getListItem(index, places) {
    var el = document.createElement('li'),
    itemStr = '<span class="markerbg marker_' + (index+1) + '"></span>' +
                '<div class="info">' +
                '   <h5>' + places.place_name + '</h5>';

    if (places.road_address_name) {
        itemStr += '    <span>' + places.road_address_name + '</span>' +
                    '   <span class="jibun gray">' +  places.address_name  + '</span>';
    } else {
        itemStr += '    <span>' +  places.address_name  + '</span>'; 
    }
                 
    itemStr += '  <span class="tel">' + places.phone  + '</span>' +
                '</div>';           

    el.innerHTML = itemStr;
    el.className = 'item';

    return el;
}

// 마커를 생성하고 지도 위에 마커를 표시하는 함수입니다
function addMarker(position, idx, title) {
    var imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png', 
        imageSize = new kakao.maps.Size(36, 37),  
        imgOptions =  {
            spriteSize : new kakao.maps.Size(36, 691), 
            spriteOrigin : new kakao.maps.Point(0, (idx*46)+10), 
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

// 지도 위에 표시되고 있는 마커를 모두 제거합니다
function removeMarker() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }   
    markers = [];
}

// 검색결과 목록 하단에 페이지번호를 표시는 함수입니다
function displayPagination(pagination) {
    var paginationEl = document.getElementById('pagination'),
        fragment = document.createDocumentFragment(),
        i; 

    while (paginationEl.hasChildNodes()) {
        paginationEl.removeChild(paginationEl.lastChild);
    }

    for (i = 1; i <= pagination.last; i++) {
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

// 인포윈도우를 표시하는 함수입니다
function displayInfowindow(marker, place) {
    const placeData = {
        name: place.place_name,
        revisitIntent: place.revisitIntent || 70,
        revisitRate: place.revisitRate || { "1": 30, "2": 20, "3+": 10 },
        likeProbability: place.likeProbability || 85
    };
    
    const totalRevisitRate = Object.values(placeData.revisitRate).reduce((a, b) => a + b, 0);

    const content = `
        <div style="padding:5px;z-index:1;width:300px;">
            <b>${placeData.name}</b><br>
            
            <div>
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
                    <div class="bar-segment" style="width: ${placeData.revisitIntent}%; background-color: #4CAF50;">
                        ${placeData.revisitIntent}%
                    </div>
                </div>
            </div>

            <div class="bar-container">
                <div class="bar-label">재방문율(1,2,3+) (총 ${totalRevisitRate}%)</div>
                <div class="revisit-bar">
                    <div class="revisit-segment" style="width: ${placeData.revisitRate["1"]}%; left: 0; background-color: #2196F3;">
                        ${placeData.revisitRate["1"]}%
                    </div>
                    <div class="revisit-segment" style="width: ${placeData.revisitRate["2"]}%; left: ${placeData.revisitRate["1"]}%; background-color: #1976D2;">
                        ${placeData.revisitRate["2"]}%
                    </div>
                    <div class="revisit-segment" style="width: ${placeData.revisitRate["3+"]}%; left: ${placeData.revisitRate["1"] + placeData.revisitRate["2"]}%; background-color: #0D47A1;">
                        ${placeData.revisitRate["3+"]}%
                    </div>
                </div>
            </div>

            <div class="bar-container">
                <div class="bar-label">내가 좋아할 확률 (${placeData.likeProbability}%)</div>
                <div class="bar">
                    <div class="bar-segment" style="width: ${placeData.likeProbability}%; background-color: #FF5722;">
                        ${placeData.likeProbability}%
                    </div>
                </div>
            </div>

            <div>
                <label>재방문 의사:</label>
                <select id="revisitIntent_${placeData.name}" onchange="updateRevisit(this, '${placeData.name}')">
                    <option value="아직방문안함">아직방문안함</option>
                    <option value="X">X</option>
                    <option value="O">O</option>
                </select>
            </div>

            <div id="revisitCount_${placeData.name}" style="display: none;">
                <label>재방문 횟수:</label>
                <select id="revisitCountSelect_${placeData.name}">
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3+">3+</option>
                </select>
            </div>
        </div>
    `;

    infowindow.setContent(content);
    infowindow.open(map, marker);
}

// 검색결과 목록의 자식 Element를 제거하는 함수입니다
function removeAllChildNods(el) {   
    while (el.hasChildNodes()) {
        el.removeChild(el.lastChild);
    }
}

// 통계 업데이트를 위한 placeholder 함수
function updateStats(placeName) {
    console.log(`${placeName}에 대한 통계 업데이트 중`);
    // 나이/성별 선택에 따라 통계를 업데이트하는 로직을 여기에 추가
}

// 재방문 의사 선택 처리
function updateRevisit(element, placeName) {
    const revisitCountDiv = document.getElementById(`revisitCount_${placeName}`);
    if (element.value === "O") {
        revisitCountDiv.style.display = "block";
    } else {
        revisitCountDiv.style.display = "none";
    }
    console.log(`${placeName}의 재방문 의사 업데이트: ${element.value}`);
    // 재방문 데이터를 저장하거나 업데이트하는 로직을 여기에 추가
}
});