document.addEventListener('DOMContentLoaded', function() {
    const visitedBtn = document.getElementById('visitedRestaurantsBtn');
    const menuWrap = document.getElementById('menu_wrap'); // 검색 목록 요소
    let visitedOverlay = null;

    // 방문했던 식당 목록 생성 함수
    function createVisitedList() {
        const visitedPlaces = [];
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (data && ['X', 'O'].includes(data.revisitIntent)) {
                        visitedPlaces.push({
                            name: key,
                            intent: data.revisitIntent,
                            count: data.revisitCount || '0회'
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
        titleDiv.textContent = '방문한 식당';
        overlayDiv.appendChild(titleDiv);

        const ul = document.createElement('ul');
        ul.className = 'visited-list';
        ul.style.maxHeight = '300px';
        ul.style.overflowY = 'auto';
        ul.style.webkitOverflowScrolling = 'touch';

        if (visitedPlaces.length === 0) {
            const li = document.createElement('li');
            li.innerHTML = '<span class="title">방문한 식당이 없습니다.</span>';
            ul.appendChild(li);
        } else {
            visitedPlaces.forEach(place => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="title">${place.name}</span>
                    <select class="intent-select" data-name="${place.name}">
                        <option value="아직방문안함" ${place.intent === '아직방문안함' ? 'selected' : ''}>아직방문안함</option>
                        <option value="X" ${place.intent === 'X' ? 'selected' : ''}>X</option>
                        <option value="O" ${place.intent === 'O' ? 'selected' : ''}>O</option>
                    </select>
                    <select class="count-select" data-name="${place.name}">
                        <option value="0회" ${place.count === '0회' ? 'selected' : ''}>0회</option>
                        <option value="1회" ${place.count === '1회' ? 'selected' : ''}>1회</option>
                        <option value="2회" ${place.count === '2회' ? 'selected' : ''}>2회</option>
                        <option value="3+" ${place.count === '3+' ? 'selected' : ''}>3+</option>
                    </select>
                `;
                ul.appendChild(li);
            });
        }
        overlayDiv.appendChild(ul);

        ul.querySelectorAll('.intent-select').forEach(select => {
            select.addEventListener('change', function() {
                const name = this.dataset.name;
                const newIntent = this.value;
                updateLocalStorage(name, newIntent, null);
                if (newIntent === '아직방문안함' && visitedOverlay) {
                    visitedOverlay.setMap(null);
                    visitedOverlay = null;
                    toggleVisitedOverlay();
                }
            });
        });

        ul.querySelectorAll('.count-select').forEach(select => {
            select.addEventListener('change', function() {
                const name = this.dataset.name;
                const newCount = this.value;
                updateLocalStorage(name, null, newCount);
            });
        });

        return overlayDiv;
    }

    // localStorage 업데이트 함수
    function updateLocalStorage(name, intent, count) {
        try {
            const data = JSON.parse(localStorage.getItem(name)) || {};
            if (intent !== null) data.revisitIntent = intent;
            if (count !== null) data.revisitCount = count;
            localStorage.setItem(name, JSON.stringify(data));
            console.log(`Updated ${name}:`, data);
        } catch (e) {
            console.error(`Error updating localStorage for ${name}:`, e);
        }
    }

    // 버튼 위치 계산 함수
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
        const screenX = btnRect.left - mapRect.left + btnRect.width / 2;
        const screenY = btnRect.bottom - mapRect.top + 10;

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

    // 모바일 체크 함수 (기존에 정의되어 있다고 가정하거나 새로 추가)
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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
            if (menuWrap && isMobile()) { // 모바일에서만 z-index 복원
                menuWrap.style.zIndex = '10';
            }
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
            xAnchor: 0.85,
            yAnchor: 0,
            zIndex: 20
        });

        try {
            visitedOverlay.setMap(window.map);
            if (menuWrap && isMobile()) { // 모바일에서만 z-index 조정
                menuWrap.style.zIndex = '0';
            }
            console.log('Overlay opened at:', position);

            // 오버레이 내부 클릭 시 이벤트 전파 방지
            content.addEventListener('click', (e) => {
                e.stopPropagation();
            });
            content.addEventListener('touchstart', (e) => {
                e.stopPropagation();
            });
            content.addEventListener('wheel', (e) => {
                e.stopPropagation();
            });
            content.addEventListener('touchmove', (e) => {
                e.stopPropagation();
            });

            // 지도 클릭 시 오버레이 닫기
            kakao.maps.event.addListener(window.map, 'click', closeOverlayOnMapClick);
            kakao.maps.event.addListener(window.map, 'touchstart', closeOverlayOnMapClick);

        } catch (e) {
            console.error('Error setting overlay:', e);
        }
    }

    // 지도 클릭/터치 시 오버레이 닫기 함수
    function closeOverlayOnMapClick() {
        if (visitedOverlay) {
            visitedOverlay.setMap(null);
            visitedOverlay = null;
            if (menuWrap && isMobile()) { // 모바일에서만 z-index 복원
                menuWrap.style.zIndex = '10';
            }
            console.log('Overlay closed by map click/touch');
            // 이벤트 리스너 제거
            kakao.maps.event.removeListener(window.map, 'click', closeOverlayOnMapClick);
            kakao.maps.event.removeListener(window.map, 'touchstart', closeOverlayOnMapClick);
        }
    }

    if (visitedBtn) {
        visitedBtn.addEventListener('click', toggleVisitedOverlay);
    } else {
        console.error('Visited restaurants button not found');
    }

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