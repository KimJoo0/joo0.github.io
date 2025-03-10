// UI 요소 및 유틸리티 함수 관련 코드
function isMobile() {
    return window.innerWidth <= 768;
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

    // 기존 인포윈도우 닫기
    if (window.currentOverlay) {
        window.currentOverlay.setMap(null);
    }

    // 커스텀 오버레이 생성
    const customOverlay = new kakao.maps.CustomOverlay({
        position: marker.getPosition(),
        content: content,
        yAnchor: 1, // 마커 위에 표시
        zIndex: 3
    });

    if (isMobile()) {
        document.getElementById('menu_wrap').style.zIndex = '0';
    }

    content.addEventListener('click', function(e) {
        if (e.target.tagName !== 'SELECT' && e.target.tagName !== 'OPTION') {
            customOverlay.setMap(null);
            window.currentOverlay = null;
            if (isMobile()) {
                document.getElementById('menu_wrap').style.zIndex = '10';
            }
        }
    });

    customOverlay.setMap(window.map);
    window.currentOverlay = customOverlay;

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

function removeAllChildNods(el) {
    while (el.hasChildNodes()) {
        el.removeChild(el.lastChild);
    }
}

function updateStats(placeName) {
    console.log(`${placeName}에 대한 통계 업데이트 중`);
}