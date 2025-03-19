// infowindow.js
function displayInfowindow(marker, place) {
    const placeData = {
        name: place.place_name,
        revisitIntent: place.revisitIntent || 70,
        revisitRate: place.revisitRate || { "1": 30, "2": 20, "3+": 10 },
        likeProbability: place.likeProbability || 85
    };
    
    const totalRevisitRate = Object.values(placeData.revisitRate).reduce((a, b) => a + b, 0);
    const savedData = JSON.parse(localStorage.getItem(placeData.name)) || {};
    const initialRevisitIntent = savedData.revisitIntent || "아직방문안함";
    const initialRevisitCount = savedData.revisitCount || "0";

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
                <option value="아직방문안함" ${initialRevisitIntent === "아직방문안함" ? "selected" : ""}>아직방문안함</option>
                <option value="X" ${initialRevisitIntent === "X" ? "selected" : ""}>X</option>
                <option value="O" ${initialRevisitIntent === "O" ? "selected" : ""}>O</option>
            </select>
        </div>
        <div id="revisitCount_${placeData.name}" class="revisit-count-section">
            <label>재방문 횟수:</label>
            <select id="revisitCountSelect_${placeData.name}" class="revisit-count-select">
                <option value="0" ${initialRevisitCount === "0" ? "selected" : ""}>0</option>
                <option value="1" ${initialRevisitCount === "1" ? "selected" : ""}>1</option>
                <option value="2" ${initialRevisitCount === "2" ? "selected" : ""}>2</option>
                <option value="3+" ${initialRevisitCount === "3+" ? "selected" : ""}>3+</option>
            </select>
        </div>
    `;

    if (window.currentOverlay) {
        window.currentOverlay.setMap(null);
    }

    const customOverlay = new kakao.maps.CustomOverlay({
        position: marker.getPosition(),
        content: content,
        yAnchor: 1,
        zIndex: 3
    });

    const markerPosition = marker.getPosition();
    window.map.panTo(markerPosition);

    // 모바일에서 인포윈도우가 열릴 때 검색창 z-index 조정
    if (isMobile()) {
        document.getElementById('menu_wrap').style.zIndex = '0';
    }

    // 인포윈도우 내부 클릭 시 이벤트 전파 방지
    content.addEventListener('click', function(e) {
        e.stopPropagation(); // 지도로 이벤트 전파 방지
    });
    content.addEventListener('touchstart', function(e) {
        e.stopPropagation(); // 모바일 터치 이벤트 전파 방지
    });

    customOverlay.setMap(window.map);
    window.currentOverlay = customOverlay;

    // 지도 클릭/터치 시 인포윈도우 닫기
    function closeOverlayOnMapClick() {
        if (window.currentOverlay) {
            window.currentOverlay.setMap(null);
            window.currentOverlay = null;
            if (isMobile()) {
                document.getElementById('menu_wrap').style.zIndex = '10'; // z-index 복구
            }
            console.log('Infowindow closed by map click/touch');
            // 이벤트 리스너 제거
            kakao.maps.event.removeListener(window.map, 'click', closeOverlayOnMapClick);
            kakao.maps.event.removeListener(window.map, 'touchstart', closeOverlayOnMapClick);
        }
    }

    // 지도에 클릭 및 터치 이벤트 리스너 추가
    kakao.maps.event.addListener(window.map, 'click', closeOverlayOnMapClick);
    kakao.maps.event.addListener(window.map, 'touchstart', closeOverlayOnMapClick);

    const revisitIntentSelect = document.getElementById(`revisitIntent_${placeData.name}`);
    const revisitCountSection = document.getElementById(`revisitCount_${placeData.name}`);
    const revisitCountSelect = document.getElementById(`revisitCountSelect_${placeData.name}`);

    revisitCountSection.style.display = initialRevisitIntent === "O" ? "block" : "none";
    if (initialRevisitIntent === "O") {
        revisitCountSection.classList.add('visible');
    }

    revisitIntentSelect.addEventListener('change', function() {
        const data = {
            revisitIntent: this.value,
            revisitCount: revisitCountSelect.value
        };
        localStorage.setItem(placeData.name, JSON.stringify(data));

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

    revisitCountSelect.addEventListener('change', function() {
        const data = {
            revisitIntent: revisitIntentSelect.value,
            revisitCount: this.value
        };
        localStorage.setItem(placeData.name, JSON.stringify(data));
        console.log(`${placeData.name}의 재방문 횟수: ${this.value}`);
    });
}