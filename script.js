// ==============================================
// LÓGICA CENTRAL DO MOTOR (DESKTOP E MOBILE)
// ==============================================

const list = document.querySelector('.carousel .list');
const mainPlayer = document.getElementById('mainPlayer');

// Referências Mobile
const mobileBgArt = document.getElementById('mobileBgArt');
const mobileCoverImg = document.getElementById('mobileCoverImg');
const mobileSongTitle = document.getElementById('mobileSongTitle');
const mobileArtistName = document.getElementById('mobileArtistName');
const mobilePlayPauseBtn = document.getElementById('mobilePlayPauseBtn');
const mobileScrubberFill = document.getElementById('mobileScrubberFill');
const mobileCurrentTime = document.getElementById('mobileCurrentTime');
const mobileTotalDuration = document.getElementById('mobileTotalDuration');
const mobileDrawer = document.getElementById('mobileSheetDrawer');
const mobileDrawerTitle = document.getElementById('mobileDrawerTitle');
const mobileDrawerBody = document.getElementById('mobileDrawerBody');

// Variáveis de Controle
let timeRunning = 1000;
let runTimeOut;
let activeId = 'capa'; // Inicia na Capa

// Menu Fixo de Faixas para o Celular
const trackMenu = [
    { id: '10', label: '10 - O Crepúsculo (A Virada)', icon: '🦅' },
    { id: 'capa', label: 'Capa - Batalha de Kursk', icon: '🖼️' },
    { id: '1', label: '1 - A Saliência', icon: '🗺️' },
    { id: '2', label: '2 - A Forja do Medo', icon: '⚙️' },
    { id: '3', label: '3 - Ecos no Rádio', icon: '📻' },
    { id: '4', label: '4 - Terra e Fogo', icon: '🔥' },
    { id: '5', label: '5 - Sangue na Madrugada', icon: '🩸' },
    { id: '6', label: '6 - A Pinça Quebrada', icon: '❄️' },
    { id: '7', label: '7 - O Avanço do Sul', icon: '⚡' },
    { id: '8', label: '8 - O Encontro Marcado', icon: '🚩' },
    { id: '9', label: '9 - Tempestade de Aço', icon: '⚔️' }
];

// === ATUALIZADOR VISUAL (Sincroniza Tudo) ===
function syncUI() {
    // Acha qual é o item central do Carrossel Desktop (Index 1)
    let centerItem = list.querySelectorAll('.item')[1];
    activeId = centerItem.getAttribute('data-id');
    
    // Captura os dados direto do HTML do Desktop
    let title = centerItem.querySelector('.title').innerText;
    let name = centerItem.querySelector('.name').innerText;
    let bgStyle = centerItem.style.backgroundImage;
    let coverUrl = bgStyle.slice(5, -2); // Pega só o link da imagem
    let audioSrc = centerItem.getAttribute('data-audio');
    
    // Atualiza o Celular
    mobileSongTitle.innerText = title;
    mobileArtistName.innerText = name.replace(/[()]/g, ''); // Tira parênteses
    mobileCoverImg.src = coverUrl;
    mobileBgArt.style.backgroundImage = bgStyle;

    // Lida com o Áudio (Para se mudar de faixa)
    let wasPlaying = !mainPlayer.paused && mainPlayer.currentTime > 0;
    mainPlayer.pause();
    
    if (audioSrc && audioSrc.trim() !== "") {
        mainPlayer.src = audioSrc;
        // Se já estava tocando uma, toca a próxima automaticamente
        if (wasPlaying) {
            mainPlayer.play().catch(e => console.log(e));
        }
    } else {
        mainPlayer.removeAttribute('src'); // Capa não tem música
        mainPlayer.load();
    }
    
    // Reseta as barras de progresso virtuais
    updateProgressBar(0);
    updatePlayIcons();
}

// === CONTROLE DO CARROSSEL (Troca a música/imagem) ===
function showSlider(type) {
    let items = list.querySelectorAll('.item');
    if(type === 'next'){
        list.appendChild(items[0]);
        document.querySelector('.carousel').classList.add('next');
    } else {
        list.prepend(items[items.length - 1]);
        document.querySelector('.carousel').classList.add('prev');
    }

    clearTimeout(runTimeOut);
    runTimeOut = setTimeout(() => {
        document.querySelector('.carousel').classList.remove('next');
        document.querySelector('.carousel').classList.remove('prev');
    }, timeRunning);

    resetTimeAnimation();
    syncUI();
}

function resetTimeAnimation() {
    const runningTime = document.querySelector('.carousel .timeRunning');
    if(runningTime) {
        runningTime.style.animation = 'none';
        runningTime.offsetHeight; // force reflow
        runningTime.style.animation = 'runningTime 1s linear 1 forwards';
    }
}

// Pulo direto (Usado pela gaveta do Celular ou Nav do Desktop)
function jumpToTrack(id) {
    closeDrawer();
    let items = Array.from(list.querySelectorAll('.item'));
    let centerId = items[1].getAttribute('data-id');
    
    if (centerId === id) return;
    
    // Gira o DOM até achar a música
    while(items[1].getAttribute('data-id') !== id) {
        list.appendChild(items[0]);
        items = Array.from(list.querySelectorAll('.item'));
    }
    syncUI();
    resetTimeAnimation();
}

// === MOTOR DE ÁUDIO ===
function toggleGlobalPlay() {
    if (!mainPlayer.src || mainPlayer.src.endsWith(window.location.host + "/")) return; // Ex: Capa
    
    if (mainPlayer.paused) {
        mainPlayer.play().catch(e => console.log("Bloqueado:", e));
    } else {
        mainPlayer.pause();
    }
}

mainPlayer.addEventListener('play', updatePlayIcons);
mainPlayer.addEventListener('pause', updatePlayIcons);

function updatePlayIcons() {
    let isPlaying = !mainPlayer.paused && mainPlayer.currentTime > 0;
    
    // Celular
    if(mobilePlayPauseBtn) {
        mobilePlayPauseBtn.textContent = isPlaying ? '⏸' : '▶';
        // Ajusta o padding para o ícone de Pause não ficar torto no circulo
        mobilePlayPauseBtn.style.paddingLeft = isPlaying ? '0px' : '4px';
    }
    
    // Resetar todos os botões do Desktop para "TOCAR FAIXA"
    document.querySelectorAll('.btn button:nth-child(1)').forEach(btn => {
        btn.innerText = "TOCAR FAIXA";
        btn.style.background = "#8b0000";
    });
    
    // Atualiza apenas o botão do Desktop que está visível no centro
    let centerItem = list.querySelectorAll('.item')[1];
    let deskBtn = centerItem.querySelector('.btn button:nth-child(1)');
    
    if (deskBtn && mainPlayer.src && !mainPlayer.src.endsWith("/")) {
        deskBtn.innerText = isPlaying ? "PAUSAR FAIXA" : "TOCAR FAIXA";
        if (isPlaying) deskBtn.style.background = "#cba135"; // Fica dourado quando toca
    }
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0'+sec : sec}`;
}

mainPlayer.addEventListener('loadedmetadata', () => {
    let dur = formatTime(mainPlayer.duration);
    mobileTotalDuration.innerText = dur;
    
    let centerItem = list.querySelectorAll('.item')[1];
    let deskTotal = centerItem.querySelector('.time-total');
    if (deskTotal) deskTotal.innerText = dur;
});

mainPlayer.addEventListener('timeupdate', () => {
    if (!mainPlayer.duration) return;
    let percent = (mainPlayer.currentTime / mainPlayer.duration) * 100;
    updateProgressBar(percent);
    
    let curTime = formatTime(mainPlayer.currentTime);
    mobileCurrentTime.innerText = curTime;
    
    let centerItem = list.querySelectorAll('.item')[1];
    let deskCurrent = centerItem.querySelector('.time-current');
    if (deskCurrent) deskCurrent.innerText = curTime;
});

mainPlayer.addEventListener('ended', () => {
    showSlider('next');
});

function updateProgressBar(percent) {
    if (mobileScrubberFill) mobileScrubberFill.style.width = percent + '%';
    let centerItem = list.querySelectorAll('.item')[1];
    let deskFill = centerItem.querySelector('.progress-fill');
    if (deskFill) deskFill.style.width = percent + '%';
}

function seekAudio(e) {
    if (!mainPlayer.duration) return;
    let bar = e.currentTarget;
    let rect = bar.getBoundingClientRect();
    let pos = (e.clientX - rect.left) / rect.width;
    mainPlayer.currentTime = pos * mainPlayer.duration;
}

// === MODAL DESKTOP ===
function openModal(id) {
    const modal = document.getElementById('modal-dossie');
    const modalBody = document.getElementById('modal-body');
    const dossieContent = document.getElementById('conteudo-dossie-' + id);
    
    if(dossieContent) {
        modalBody.innerHTML = dossieContent.innerHTML;
        modal.classList.add('active');
        
        setTimeout(() => {
            const iframes = modalBody.querySelectorAll('iframe');
            iframes.forEach(iframe => {
                let realSrc = iframe.getAttribute('data-src');
                if (realSrc) iframe.setAttribute('src', realSrc);
            });
        }, 300);
    }
}

function closeModal() {
    const modal = document.getElementById('modal-dossie');
    modal.classList.remove('active');
    setTimeout(() => { document.getElementById('modal-body').innerHTML = ''; }, 300);
}

// === GAVETA MOBILE (BOTTOM SHEET) ===
function openDrawer(type) {
    mobileDrawer.classList.add('open');
    
    if (type === 'tracks') {
        mobileDrawerTitle.textContent = "Faixas (Kursk)";
        let html = "";
        
        // Puxa do array fixo para manter a ordem numérica exata
        trackMenu.forEach((track) => {
            let isActive = (track.id === activeId);
            html += `
                <div class="drawer-track-row ${isActive ? 'active' : ''}" onclick="jumpToTrack('${track.id}')">
                    <span class="icon">${isActive ? '▶' : track.icon}</span>
                    <span>${track.label}</span>
                </div>
            `;
        });
        mobileDrawerBody.innerHTML = html;
        
    } else if (type === 'dossie') {
        let centerItem = list.querySelectorAll('.item')[1];
        mobileDrawerTitle.textContent = centerItem.querySelector('.title').innerText;
        
        // O celular rouba o HTML do dossiê invisível do desktop!
        let baseDossieHTML = centerItem.querySelector('[id^="conteudo-dossie-"] .dossie-text').innerHTML;
        mobileDrawerBody.innerHTML = `<div class="drawer-lyrics-content">${baseDossieHTML}</div>`;
        
        // Ativa iframes se houver vídeos (como na Capa)
        setTimeout(() => {
            const iframes = mobileDrawerBody.querySelectorAll('iframe');
            iframes.forEach(iframe => {
                let realSrc = iframe.getAttribute('data-src');
                if (realSrc) iframe.setAttribute('src', realSrc);
            });
        }, 200);
    }
}

function closeDrawer() {
    mobileDrawer.classList.remove('open');
    setTimeout(() => { mobileDrawerBody.innerHTML = ''; }, 350);
}

// Inicializa interface na primeira carga
window.addEventListener('DOMContentLoaded', () => {
    syncUI();
});