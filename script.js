const canvas = document.getElementById('canvas');
let targetX = 0, targetY = 0;
let currentX = 0, currentY = 0;
const friction = 0.05;
let isAutoMoving = false;

let startedZones = { maroc: false, usa: false, ibiza: false, london: false, portugal: false };

window.addEventListener('mousemove', (e) => {
    if (isAutoMoving) return;
    const limitX = canvas.offsetWidth - window.innerWidth;
    const limitY = canvas.offsetHeight - window.innerHeight;
    targetX = (e.clientX / window.innerWidth) * limitX * -1;
    targetY = (e.clientY / window.innerHeight) * limitY * -1;
    updateBackgroundColor(targetX, targetY);
});

function goToLocation(x, y) {
    isAutoMoving = true;
    targetX = -x + (window.innerWidth / 2);
    targetY = -y + (window.innerHeight / 2);
    updateBackgroundColor(targetX, targetY);
    setTimeout(() => { isAutoMoving = false; }, 3000);
}

function updateBackgroundColor(tx, ty) {
    if (tx > -2000) document.body.style.backgroundColor = "#0f059a"; // USA
    else if (tx <= -2000 && tx > -3500) document.body.style.backgroundColor = "#ff9800"; // Portugal
    else if (tx <= -3500 && tx > -4800 && ty > -1000) document.body.style.backgroundColor = "#b0bec5"; // Londres
    else if (tx <= -4800 && ty > -1000) document.body.style.backgroundColor = "#2ec4b6"; // Ibiza
    else document.body.style.backgroundColor = "#f0dc86"; // Maroc
}

function animate() {
    currentX += (targetX - currentX) * friction;
    currentY += (targetY - currentY) * friction;
    canvas.style.transform = `translate(${currentX}px, ${currentY}px)`;
    requestAnimationFrame(animate);
}

function stopOtherZones(currentZone) {
    const allZones = ['maroc', 'usa', 'ibiza', 'london', 'portugal'];
    allZones.forEach(zone => {
        if (zone !== currentZone && startedZones[zone]) {
            document.querySelectorAll(`audio[id^="${zone}-layer"]`).forEach(track => {
                track.pause(); track.currentTime = 0; track.volume = 0;
            });
            document.querySelectorAll(`.postcard.${zone}`).forEach(card => card.classList.remove('is-revealed'));
            startedZones[zone] = false;
        }
    });
}

function toggleZoneCard(element, layerId, zoneName) {
    const audio = document.getElementById(layerId);
    if (!startedZones[zoneName]) {
        stopOtherZones(zoneName); 
        document.querySelectorAll(`audio[id^="${zoneName}-layer"]`).forEach(track => {
            track.volume = 0; track.play();
        });
        startedZones[zoneName] = true;
    }
    if (!element.classList.contains('is-revealed')) {
        element.classList.add('is-revealed'); fadeAudio(audio, 0.5); 
    } else {
        element.classList.remove('is-revealed'); fadeAudio(audio, 0); 
    }
}

function fadeAudio(audio, targetVolume) {
    const step = 0.05;
    const fade = setInterval(() => {
        let vol = parseFloat(audio.volume.toFixed(2));
        if (vol < targetVolume) audio.volume = Math.min(vol + step, targetVolume);
        else if (vol > targetVolume) audio.volume = Math.max(vol - step, targetVolume);
        else clearInterval(fade);
    }, 50);
}

// --- Favoris ---

function toggleFavorite(e, starElement) {
    // Bloque la propagation de l'événement pour ne pas activer le zoom et la musique de la carte
    e.stopPropagation(); 
    
    const card = starElement.closest('.postcard');
    card.classList.toggle('is-favorite');
    
    updateFavoritesUI();
}

function updateFavoritesUI() {
    const favListContainer = document.getElementById('favorites-list');
    

    favListContainer.innerHTML = '⭐ Mes Favoris';
    

    const favoriteCards = document.querySelectorAll('.postcard.is-favorite');
    
    if (favoriteCards.length === 0) {
        favListContainer.innerHTML += '<p class="empty-msg">Aucun favori</p>';
        return;
    }
    

    favoriteCards.forEach(card => {
        const name = card.getAttribute('data-name');
        const x = card.getAttribute('data-x');
        const y = card.getAttribute('data-y');
        
        const btn = document.createElement('button');
        btn.className = 'fav-item';
        btn.innerText = `📍 ${name}`;
        
        btn.onclick = () => { 
            goToLocation(parseInt(x), parseInt(y)); 
        };
        
        favListContainer.appendChild(btn);
    });
}

window.onload = () => {
    document.querySelectorAll('audio').forEach(a => a.volume = 0);
    targetX = currentX = -6000 + (window.innerWidth / 2); // Départ position Maroc
    targetY = currentY = -2000 + (window.innerHeight / 2);
    animate();
};