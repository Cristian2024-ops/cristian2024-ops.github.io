// JS/dashboard-juegos.js

// Variables globales del juego
let visorLoadTimer = null;
let currentGameUrl = '';
let fullscreenTimer = null;
const FULLSCREEN_DELAY_MS = 50000;

// Sanitizacion de HTML para prevenir XSS
function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// --- LÓGICA DE USUARIO (INTEGRADA CON AUTH-CHECK.JS) ---

async function displayUserProfile(profile) {
    if (!profile) return;
    const rightContainer = document.getElementById('navbar-right-side');
    if (!rightContainer) return;

    const userBar = document.createElement('div');
    userBar.className = 'user-bar';
    userBar.style.display = 'flex';
    userBar.style.alignItems = 'center';
    userBar.style.gap = '10px';

    const picture = profile.picture ? `<img src="${escapeHtml(profile.picture)}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:2px solid #00bcff;" alt="Avatar">` : '';
    const name = escapeHtml(profile.nickname || profile.name || 'Usuario');

    userBar.innerHTML = `
        ${picture}
        <span class="username">${name}</span>
        <button class="btn" style="padding: 4px 8px; font-size: 12px; background: rgba(255,65,77,0.2); border-color: rgba(255,65,77,0.4);">
            Salir
        </button>
    `;

    userBar.querySelector('button').addEventListener('click', function() {
        // Usamos el cliente global inicializado por auth-check.js
        window.auth0Client.logout({
            logoutParams: { returnTo: "https://cristian2024-ops.github.io/" }
        });
    });

    rightContainer.insertBefore(userBar, rightContainer.firstChild);
}

function displayLoginButton() {
    const rightContainer = document.getElementById('navbar-right-side');
    if (!rightContainer) return;

    const loginBar = document.createElement('div');
    loginBar.className = 'user-bar';
    loginBar.innerHTML = `
        <button class="btn" style="padding: 4px 12px; font-size: 12px; background: rgba(0,188,255,0.2); border-color: rgba(0,188,255,0.4);">
            Iniciar sesion
        </button>
    `;

    loginBar.querySelector('button').addEventListener('click', function() {
        window.location.href = 'login.html';
    });

    rightContainer.insertBefore(loginBar, rightContainer.firstChild);
}

// --- LÓGICA DE JUEGOS (TU CÓDIGO ORIGINAL) ---
function lanzar(url) {
    currentGameUrl = url;
    const pantalla = document.getElementById('pantalla');
    const visor = document.getElementById('visor');
    const loader = document.getElementById('game-loader');
    const errorBox = document.getElementById('game-error');
    const fsBtn = document.querySelector('.fullscreen-game');

    if (errorBox) errorBox.style.display = 'none';
    if (loader) {
        loader.style.opacity = '1';
        loader.style.visibility = 'visible';
    }
    pantalla.style.display = 'block';
    visor.style.display = 'block';
    visor.src = url;
    if (visorLoadTimer) clearTimeout(visorLoadTimer);

    try {
        const isAmongUs = url.includes('impostor-v4') || (url.includes('kbhgames.com') && url.includes('impostor'));
        if (isAmongUs && fsBtn) {
            fsBtn.style.display = 'none';
            fsBtn.disabled = true;
            if (fullscreenTimer) clearTimeout(fullscreenTimer);
            fullscreenTimer = setTimeout(function() {
                fsBtn.style.display = '';
                fsBtn.disabled = false;
                fullscreenTimer = null;
            }, FULLSCREEN_DELAY_MS);
        } else if (fsBtn) {
            fsBtn.style.display = '';
            fsBtn.disabled = false;
        }
    } catch (e) { console.warn('Error fullscreen:', e); }

    visor.onload = function() {
        if (visorLoadTimer) clearTimeout(visorLoadTimer);
        if (loader) { loader.style.opacity = '0'; loader.style.visibility = 'hidden'; }
    };
    visorLoadTimer = setTimeout(function() {
        if (loader) { loader.style.opacity = '0'; loader.style.visibility = 'hidden'; }
        if (errorBox) errorBox.style.display = 'flex';
    }, 120000);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cerrarJuego() {
    const pantalla = document.getElementById('pantalla');
    const visor = document.getElementById('visor');
    pantalla.style.display = 'none';
    if (visor) visor.src = '';
    if (visorLoadTimer) clearTimeout(visorLoadTimer);
    exitFullscreen();
}

function pantallaCompleta() {
    if (isFullscreen()) { exitFullscreen(); return; }
    const pantalla = document.getElementById('pantalla');
    const request = pantalla.requestFullscreen || pantalla.webkitRequestFullscreen;
    if (request) request.call(pantalla);
}

function isFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
}

function exitFullscreen() {
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (exit) exit.call(document);
}

function initDarkMode() {
    const toggle = document.querySelector('.bb8-toggle__checkbox');
    if (!toggle) return;
    if (localStorage.getItem('theme') === 'dark') { document.body.classList.add('dark-mode'); toggle.checked = true; }
    toggle.addEventListener('change', function(e) {
        if (e.target.checked) { document.body.classList.add('dark-mode'); localStorage.setItem('theme', 'dark'); }
        else { document.body.classList.remove('dark-mode'); localStorage.setItem('theme', 'light'); }
    });
}

function actualizarEstadoRed() {
    const mensaje = document.getElementById('offline-message');
    if (mensaje) mensaje.style.display = navigator.onLine ? 'none' : 'block';
}

function initFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    function showAll() { document.querySelectorAll('.card-juego').forEach(el => el.style.display = 'block'); }
    function filterCategory(cat) {
        document.querySelectorAll('.card-juego').forEach(el => {
            const categories = (el.getAttribute('data-category') || '').trim().split(/\s+/);
            el.style.display = (!cat || categories.includes(cat)) ? 'block' : 'none';
        });
    }
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            const cat = this.getAttribute('data-filter');
            filterCategory(cat);
        });
    });
}

function initErrorButtons() {
    const openBtn = document.getElementById('open-external');
    const retryBtn = document.getElementById('retry-load');
    if (openBtn) openBtn.addEventListener('click', () => window.open(currentGameUrl, '_blank'));
    if (retryBtn) retryBtn.addEventListener('click', () => lanzar(currentGameUrl));
}

function cargarParticulas(colorParticula) {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: { number: { value: 70 }, color: { value: colorParticula }, size: { value: 4.5 } }
        });
    }
}

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', async function() {
    // 1. Esperar a Auth0 (máximo 5 segundos)
    let retries = 0;
    while (!window.auth0Client && retries < 25) {
        await new Promise(r => setTimeout(r, 200));
        retries++;
    }

    // 2. Verificar sesión
    if (window.auth0Client && await window.auth0Client.isAuthenticated()) {
        const user = await window.auth0Client.getUser();
        displayUserProfile(user);
    } else {
        displayLoginButton();
    }

    // 3. Inicializar juegos e interfaz
    initDarkMode();
    initFilters();
    initErrorButtons();
    actualizarEstadoRed();
    window.addEventListener('online', actualizarEstadoRed);
    window.addEventListener('offline', actualizarEstadoRed);
    cargarParticulas('#ffffff');
});

// Exponer funciones globales
window.lanzar = lanzar;
window.cerrarJuego = cerrarJuego;
window.pantallaCompleta = pantallaCompleta;
