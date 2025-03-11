// visited-restaurants.js
document.addEventListener('DOMContentLoaded', function() {
    const visitedBtn = document.getElementById('visitedRestaurantsBtn');
    let visitedOverlay = null;

    // 방문했던 식당 목록 생성 함수 (X, O만 표시)
    function createVisitedList() {
        const visitedPlaces = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const data = JSON.parse(localStorage.getItem(key));
            // revisitIntent가 "X" 또는 "O"인 경우만 추가
            if (data && (data.revisitIntent === "X" || data.revisitIntent === "O")) {
                visitedPlaces.push({
                    name: key,
                    intent: data.revisitIntent,
                    count: data.revisitCount || '0'
                });
            }
        }

        if (visitedPlaces.length === 0) {
            return '<div class="overlaybox">' +
                   '    <div class="boxtitle">방문했던 식당</div>' +
                   '    <ul><li><span class="title">재방문 의사가 설정된 식당이 없습니다.</span></li></ul>' +
                   '</div>';
        }

        let listItems = '';
        visitedPlaces.forEach(place => {
            listItems += `<li>
                <span class="title">${place.name}</span>
                <span class="intent">의사: ${place.intent}</span>
                <span class="count">횟수: ${place.count}</span>
            </li>`;
        });

        return '<div class="overlaybox">' +
               '    <div class="boxtitle">방문했던 식당</div>' +
               '    <ul>' + listItems + '</ul>' +
               '</div>';
    }

    // 버튼의 화면 좌표를 지도 좌표로 변환
    function getButtonPosition() {
        const btnRect = visitedBtn.getBoundingClientRect();
        const mapContainer = document.getElementById('map');
        const mapRect = mapContainer.getBoundingClientRect();
        
        const screenX = btnRect.right - mapRect.left;
        const screenY = btnRect.bottom - mapRect.top + 10;
        
        return window.map.getProjection().latlngFromContainerPixel(new kakao.maps.Point(screenX, screenY));
    }

    // 오버레이 토글 함수
    function toggleVisitedOverlay() {
        if (visitedOverlay) {
            visitedOverlay.setMap(null);
            visitedOverlay = null;
            return;
        }

        const content = createVisitedList();
        const position = getButtonPosition();

        visitedOverlay = new kakao.maps.CustomOverlay({
            position: position,
            content: content,
            xAnchor: 1,
            yAnchor: 0,
            zIndex: 20
        });

        visitedOverlay.setMap(window.map);

        // 목록 항목에 클릭 이벤트 추가
        const overlayContent = visitedOverlay.getContent();
        if (typeof overlayContent === 'string') {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = overlayContent;
            const listItems = tempDiv.querySelectorAll('li');
            listItems.forEach(item => {
                item.addEventListener('click', function() {
                    if (visitedOverlay) {
                        visitedOverlay.setMap(null);
                        visitedOverlay = null;
                    }
                });
            });
            visitedOverlay.setContent(tempDiv);
        }
    }

    visitedBtn.addEventListener('click', toggleVisitedOverlay);

    kakao.maps.event.addListener(window.map, 'center_changed', function() {
        if (visitedOverlay) {
            visitedOverlay.setPosition(getButtonPosition());
        }
    });
});
