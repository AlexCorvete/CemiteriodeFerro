var nextBtn = document.querySelector('.next'),
    prevBtn = document.querySelector('.prev'),
    carousel = document.querySelector('.carousel'),
    list = document.querySelector('.list'),
    runningTime = document.querySelector('.carousel .timeRunning');

let timeRunning = 1000; 
let runTimeOut;
let autoPlayTimeout;

nextBtn.onclick = function(){ showSlider('next'); }
prevBtn.onclick = function(){ showSlider('prev'); }

function showSlider(type) {
    let sliderItemsDom = list.querySelectorAll('.carousel .list .item');
    
    document.querySelectorAll('audio').forEach(audio => {
        audio.pause();
        audio.currentTime = 0; 
    });
    
    document.querySelectorAll('.btn button:nth-child(1)').forEach(btn => {
        if(btn.id) { btn.innerText = "TOCAR FAIXA"; }
    });

    if(type === 'next'){
        list.appendChild(sliderItemsDom[0]);
        carousel.classList.add('next');
    } else {
        list.prepend(sliderItemsDom[sliderItemsDom.length - 1]);
        carousel.classList.add('prev');
    }

    clearTimeout(runTimeOut);
    runTimeOut = setTimeout( () => {
        carousel.classList.remove('next');
        carousel.classList.remove('prev');
    }, timeRunning);

    resetTimeAnimation();

    clearTimeout(autoPlayTimeout);
    autoPlayTimeout = setTimeout(() => {
        let currentActiveItem = list.querySelectorAll('.carousel .list .item')[1];
        let nextAudio = currentActiveItem.querySelector('audio');
        if(nextAudio) {
            let nextId = nextAudio.id.split('-')[1];
            togglePlay(nextId);
        }
    }, timeRunning);
}

function resetTimeAnimation() {
    runningTime.style.animation = 'none';
    runningTime.offsetHeight; 
    runningTime.style.animation = null; 
    runningTime.style.animation = 'runningTime 1s linear 1 forwards';
}

function togglePlay(id) {
    const audio = document.getElementById('audio-' + id);
    const btn = document.getElementById('btn-' + id);
    
    if (audio.paused) {
        document.querySelectorAll('audio').forEach(a => {
            if(a.id !== 'audio-' + id) {
                a.pause();
                a.currentTime = 0;
            }
        });
        document.querySelectorAll('.btn button:nth-child(1)').forEach(b => {
             if(b.id !== 'btn-' + id && b.id) { b.innerText = "TOCAR FAIXA"; }
        });

        audio.play();
        btn.innerText = "PAUSAR FAIXA";
    } else {
        audio.pause();
        btn.innerText = "TOCAR FAIXA";
    }
}

function formatTime(seconds) {
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);
    return `${min < 10 ? '0'+min : min}:${sec < 10 ? '0'+sec : sec}`;
}

document.querySelectorAll('audio').forEach((audio) => {
    let id = audio.id.split('-')[1];

    audio.addEventListener('loadedmetadata', () => {
        let totalEl = document.getElementById('total-' + id);
        if(totalEl) totalEl.innerText = formatTime(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
        let currentEl = document.getElementById('current-' + id);
        let fillEl = document.getElementById('fill-' + id);
        if(audio.duration && fillEl && currentEl) {
            let percent = (audio.currentTime / audio.duration) * 100;
            fillEl.style.width = percent + '%';
            currentEl.innerText = formatTime(audio.currentTime);
        }
    });

    let fillEl = document.getElementById('fill-' + id);
    if(fillEl) {
        let progressBar = fillEl.parentElement;
        progressBar.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percent = clickX / rect.width;
            if (audio.duration) {
                audio.currentTime = percent * audio.duration;
            }
        });
    }

    audio.addEventListener('ended', () => {
        nextBtn.click();
    });
});

// MOTOR DO MODAL (DOSSIÊ HISTÓRICO E VÍDEOS)
function openModal(id) {
    const modal = document.getElementById('modal-dossie');
    const modalBody = document.getElementById('modal-body');
    const dossieContent = document.getElementById('conteudo-dossie-' + id);
    
    if(dossieContent) {
        // Copia a estrutura, mas os vídeos ainda não vão carregar
        modalBody.innerHTML = dossieContent.innerHTML;
        modal.classList.add('active');
        
        // Esperamos 300ms (o tempo da animação do CSS abrir o modal na tela)
        setTimeout(() => {
            // Agora ativamos os iframes! O Facebook vai ler o tamanho correto
            const iframes = modalBody.querySelectorAll('iframe');
            iframes.forEach(iframe => {
                let realSrc = iframe.getAttribute('data-src');
                if (realSrc) {
                    iframe.setAttribute('src', realSrc);
                }
            });
        }, 300); 
    }
}

function closeModal() {
    const modal = document.getElementById('modal-dossie');
    modal.classList.remove('active');
    
    // Limpa os vídeos e os textos ao fechar
    setTimeout(() => {
        document.getElementById('modal-body').innerHTML = ''; 
    }, 300);
}
// --- FUNÇÕES DO LIGHTBOX DE IMAGENS ---

function abrirLightbox(src, caption) {
    // Pega os elementos do Lightbox
    var lightbox = document.getElementById("image-lightbox");
    var img = document.getElementById("lightbox-img");
    var captionText = document.getElementById("lightbox-caption");
    
    // Injeta a imagem clicada e o texto no Lightbox e exibe
    lightbox.style.display = "block";
    img.src = src;
    captionText.innerHTML = caption;
}

function fecharLightbox() {
    document.getElementById("image-lightbox").style.display = "none";
}

// BÔNUS: Permite fechar a imagem clicando em qualquer lugar no fundo preto
document.getElementById("image-lightbox").addEventListener('click', function(e) {
    if (e.target !== document.getElementById("lightbox-img")) {
        fecharLightbox();
    }
});

// BÔNUS 2: Permite fechar a imagem apertando a tecla "Esc" do teclado
document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
        fecharLightbox();
    }
});