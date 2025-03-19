document.addEventListener('DOMContentLoaded', function() {
    const visitedBtn = document.getElementById('visitedRestaurantsBtn');
    let visitedOverlay = null;

    // 방문했던 식당 목록 생성 함수
    function createVisitedList() {
        const visitedPlaces = [];
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data && (data.revisitIntent === "X" || data.revisitIntent === "O")) {
                        visitedPlaces.push({
                            name: key,
                            intent: data.revisitIntent,
                            count: data.revisitCount || '0'
                        });
                    }
                } catch (e) {
                    console.error(`Error parsing localStorage data for key ${key}:`, e);
                }
            }
        } catch (e) {
            console.error('Error accessing localStorage:', e);
        }

        const overlayDiv = document.createElement('div');
        overlayDiv.className = 'overlaybox';

        const titleDiv = document.createElement('div');
        titleDiv.className = 'boxtitle';
        titleDiv.textContent = '방문했던 식당';
        overlayDiv.appendChild(titleDiv);

        const ul = document.createElement('ul');
        if (visitedPlaces.length === 0) {
            const li = document.createElement('li');
            li.innerHTML = '<span class="title">재방문 의사가 설정된 식당이 없습니다.</span>';
            ul.appendChild(li);
        } else {
            visitedPlaces.forEach(place => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="title">${place.name}</span>
                    <span class="intent">의사: ${place.intent}</span>
                    <span class="count">횟수: ${place.count}</span>
                `;
                ul.appendChild(li);
            });
        }
        overlayDiv.appendChild(ul);

        return overlayDiv;
    }

    // 버튼 위치 계산 함수 (대체 방법)
    function getButtonPosition() {
        if (!window.map) {
            console.error('Map is not initialized');
            return null;
        }

        const btnRect = visitedBtn.getBoundingClientRect();
        const mapContainer = document.getElementById('map');
        if (!mapContainer) {
            console.error('Map container not found');
            return null;
        }

        const mapRect = mapContainer.getBoundingClientRect();
        const screenX = btnRect.left - mapRect.left + btnRect.width / 2; // 버튼 중앙
        const screenY = btnRect.bottom - mapRect.top + 10; // 버튼 아래

        // 지도의 현재 중심과 bounds를 사용해 상대적 위치 계산
        const bounds = window.map.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        
        const mapWidth = mapRect.width;
        const mapHeight = mapRect.height;
        
        const lngRange = ne.getLng() - sw.getLng();
        const latRange = ne.getLat() - sw.getLat();
        
        const lng = sw.getLng() + (screenX / mapWidth) * lngRange;
        const lat = ne.getLat() - (screenY / mapHeight) * latRange;

        try {
            return new kakao.maps.LatLng(lat, lng);
        } catch (e) {
            console.error('Error creating LatLng:', e);
            return null;
        }
    }

    // 오버레이 토글 함수
    function toggleVisitedOverlay() {
        if (!window.map) {
            console.error('Map is not initialized');
            return;
        }

        if (visitedOverlay) {
            visitedOverlay.setMap(null);
            visitedOverlay = null;
            console.log('Overlay closed');
            return;
        }

        const content = createVisitedList();
        const position = getButtonPosition();

        if (!position) {
            console.error('Invalid position for overlay');
            return;
        }

        visitedOverlay = new kakao.maps.CustomOverlay({
            position: position,
            content: content,
            xAnchor: 0.85, // 중앙 정렬
            yAnchor: 0,   // 상단 기준
            zIndex: 20
        });

        try {
            visitedOverlay.setMap(window.map);
            console.log('Overlay opened at:', position);

            // 클릭 이벤트 추가
            content.querySelectorAll('li').forEach(item => {
                item.addEventListener('click', () => {
                    if (visitedOverlay) {
                        visitedOverlay.setMap(null);
                        visitedOverlay = null;
                        console.log('Overlay closed by item click');
                    }
                });
            });
        } catch (e) {
            console.error('Error setting overlay:', e);
        }
    }

    if (visitedBtn) {
        visitedBtn.addEventListener('click', toggleVisitedOverlay);
    } else {
        console.error('Visited restaurants button not found');
    }

    // 지도 중심 변경 이벤트
    if (window.kakao && kakao.maps && kakao.maps.event) {
        kakao.maps.event.addListener(window.map, 'center_changed', function() {
            if (visitedOverlay) {
                const newPosition = getButtonPosition();
                if (newPosition) {
                    visitedOverlay.setPosition(newPosition);
                }
            }
        });
    } else {
        console.error('Kakao Maps event system not available');
    }
});