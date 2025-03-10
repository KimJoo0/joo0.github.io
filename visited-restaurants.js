document.addEventListener('DOMContentLoaded', function() {
    const visitedBtn = document.getElementById('visitedRestaurantsBtn');
    const visitedOverlay = document.getElementById('visitedOverlay');

    function createVisitedList() {
        const visitedPlaces = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const data = JSON.parse(localStorage.getItem(key));
            if (data && (data.revisitIntent || data.revisitCount)) {
                visitedPlaces.push({
                    name: key,
                    intent: data.revisitIntent || '아직방문안함',
                    count: data.revisitCount || '0'
                });
            }
        }

        if (visitedPlaces.length === 0) {
            return '<div class="overlaybox">' +
                   '    <div class="boxtitle">방문했던 식당</div>' +
                   '    <ul><li><span class="title">아직 방문 기록이 없습니다.</span></li></ul>' +
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

    function toggleVisitedOverlay() {
        if (visitedOverlay.style.display === 'none' || visitedOverlay.style.display === '') {
            visitedOverlay.innerHTML = createVisitedList();
            visitedOverlay.style.display = 'block';
        } else {
            visitedOverlay.style.display = 'none';
        }
    }

    visitedBtn.addEventListener('click', toggleVisitedOverlay);
});
