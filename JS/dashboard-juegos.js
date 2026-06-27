// Configuracion de Auth0 - Credenciales cargadas desde config
const AUTH0_CONFIG = {
    domain: window.AUTH0_DOMAIN || '',
    clientId: window.AUTH0_CLIENT_ID || '',
    redirectUri: window.AUTH0_REDIRECT_URI || '',
    logoutRedirectUri: window.AUTH0_LOGOUT_REDIRECT_URI || ''
};

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

// Inicializar Auth0 si las credenciales existen
function initAuth0() {
    if (!AUTH0_CONFIG.domain || !AUTH0_CONFIG.clientId) {
        console.warn('Auth0 no configurado - falta configuracion');
        return null;
    }

    return new auth0.WebAuth({
        domain: AUTH0_CONFIG.domain,
        clientID: AUTH0_CONFIG.clientId,
        redirectUri: AUTH0_CONFIG.redirectUri,
        responseType: 'token id_token',
        scope: 'openid profile email'
    });
}

// Verificar si hay una sesion valida (NO redirige: el login es opcional)
function hasValidSession() {
    const expiresAt = JSON.parse(sessionStorage.getItem('expires_at') || '0');
    const accessToken = sessionStorage.getItem('access_token');
    return !!accessToken && new Date().getTime() < expiresAt;
}

// Mostrar perfil del usuario
function displayUserProfile(profile) {
    if (!profile) return;

    const rightContainer = document.getElementById('navbar-right-side');
    if (!rightContainer) return;

    const userBar = document.createElement('div');
    userBar.className = 'user-bar';

    const picture = profile.picture ? `<img src="${escapeHtml(profile.picture)}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:2px solid #00bcff;" alt="Avatar">` : '';
    const name = escapeHtml(profile.nickname || profile.name || 'Usuario');

    userBar.innerHTML = `
        ${picture}
        <span class="username">${name}</span>
        <button class="btn" aria-label="Cerrar sesion" style="padding: 4px 8px; font-size: 12px; background: rgba(255,65,77,0.2); border-color: rgba(255,65,77,0.4);">
            Salir
        </button>
    `;

    const logoutBtn = userBar.querySelector('button');
    logoutBtn.addEventListener('click', function() {
        sessionStorage.clear();
        const logoutUrl = `https://${AUTH0_CONFIG.domain}/v2/logout?returnTo=${encodeURIComponent(AUTH0_CONFIG.logoutRedirectUri)}&client_id=${AUTH0_CONFIG.clientId}`;
        window.location.href = logoutUrl;
    });

    rightContainer.insertBefore(userBar, rightContainer.firstChild);
}

// Mostrar boton de iniciar sesion cuando NO hay sesion activa
function displayLoginButton() {
    const rightContainer = document.getElementById('navbar-right-side');
    if (!rightContainer) return;

    const loginBar = document.createElement('div');
    loginBar.className = 'user-bar';
    loginBar.innerHTML = `
        <button class="btn" aria-label="Iniciar sesion" style="padding: 4px 12px; font-size: 12px; background: rgba(0,188,255,0.2); border-color: rgba(0,188,255,0.4);">
            Iniciar sesion
        </button>
    `;

    const loginBtn = loginBar.querySelector('button');
    loginBtn.addEventListener('click', function() {
        window.location.href = 'login.html';
    });

    rightContainer.insertBefore(loginBar, rightContainer.firstChild);
}

// Lanzar juego
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

    // Manejar boton de fullscreen para Among Us
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
    } catch (e) {
        console.warn('Error handling fullscreen toggle:', e);
    }

    visor.onload = function() {
        if (visorLoadTimer) clearTimeout(visorLoadTimer);
        if (loader) {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
        }
    };

    visorLoadTimer = setTimeout(function() {
        if (loader) {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
        }
        if (errorBox) errorBox.style.display = 'flex';
    }, 120000);

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Cerrar juego
function cerrarJuego() {
    const pantalla = document.getElementById('pantalla');
    const visor = document.getElementById('visor');
    const loader = document.getElementById('game-loader');
    const errorBox = document.getElementById('game-error');

    pantalla.style.display = 'none';
    if (visor) visor.src = '';
    if (visorLoadTimer) {
        clearTimeout(visorLoadTimer);
        visorLoadTimer = null;
    }
    if (loader) {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
    }
    if (errorBox) errorBox.style.display = 'none';
    exitFullscreen();
}

// Pantalla completa
function pantallaCompleta() {
    if (isFullscreen()) {
        exitFullscreen();
        return;
    }
    const pantalla = document.getElementById('pantalla');
    const request = pantalla.requestFullscreen || pantalla.webkitRequestFullscreen || pantalla.mozRequestFullScreen || pantalla.msRequestFullscreen;
    if (request) {
        request.call(pantalla);
    }
}

function isFullscreen() {
    return !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
    );
}

function exitFullscreen() {
    const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
    if (exit) {
        exit.call(document);
    }
}

// Toggle modo oscuro
function initDarkMode() {
    const toggle = document.querySelector('.bb8-toggle__checkbox');
    if (!toggle) return;

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        toggle.checked = true;
    }

    toggle.addEventListener('change', function(e) {
        if (e.target.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    });
}

// Estado de red
function actualizarEstadoRed() {
    const mensaje = document.getElementById('offline-message');
    if (!mensaje) return;

    if (navigator.onLine) {
        mensaje.style.display = 'none';
    } else {
        mensaje.style.display = 'block';
    }
}

// Filtros de juegos
function initFilters() {
    const buttons = document.querySelectorAll('.filter-btn');

    function showAll() {
        document.querySelectorAll('.card-juego').forEach(el => el.style.display = 'block');
    }

    function filterCategory(cat) {
        document.querySelectorAll('.card-juego').forEach(el => {
            const categories = (el.getAttribute('data-category') || '').trim().split(/\s+/);
            if (!cat || cat === '') {
                el.style.display = 'block';
            } else if (categories.includes(cat)) {
                el.style.display = 'block';
            } else {
                el.style.display = 'none';
            }
        });
    }

    function setActiveButton(btn) {
        buttons.forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
    }

    // Restaurar filtro guardado
    const saved = localStorage.getItem('activeFilter');
    if (saved !== null) {
        const btn = Array.from(buttons).find(b => b.getAttribute('data-filter') === saved);
        if (btn) {
            setActiveButton(btn);
            if (saved === '') showAll();
            else filterCategory(saved);
        } else {
            showAll();
        }
    } else {
        showAll();
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            const cat = this.getAttribute('data-filter');
            if (this.classList.contains('active')) {
                setActiveButton(null);
                localStorage.removeItem('activeFilter');
                showAll();
            } else {
                setActiveButton(this);
                if (cat === '') showAll();
                else filterCategory(cat);
                localStorage.setItem('activeFilter', cat);
            }
        });
    });
}

// Botones de error
function initErrorButtons() {
    const openBtn = document.getElementById('open-external');
    const retryBtn = document.getElementById('retry-load');

    if (openBtn) {
        openBtn.addEventListener('click', function() {
            if (currentGameUrl) window.open(currentGameUrl, '_blank');
        });
    }

    if (retryBtn) {
        retryBtn.addEventListener('click', function() {
            if (currentGameUrl) lanzar(currentGameUrl);
        });
    }
}

// Particulas
function cargarParticulas(colorParticula) {
    if (typeof particlesJS === 'undefined') {
        console.warn('particlesJS no esta disponible');
        return;
    }

    particlesJS('particles-js', {
        particles: {
            number: { value: 70, density: { enable: true, value_area: 800 } },
            color: { value: colorParticula },
            opacity: { value: 0.75 },
            size: { value: 4.5, random: true },
            move: { enable: true, speed: 2.2 }
        }
    });
}

// Inicializacion principal
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar Auth0 (opcional: ya NO es obligatorio iniciar sesion)
    const auth0Instance = initAuth0();

    if (auth0Instance && hasValidSession()) {
        // Hay sesion activa: mostramos el perfil del usuario
        const accessToken = sessionStorage.getItem('access_token');
        auth0Instance.client.userInfo(accessToken, function(err, profile) {
            if (err) {
                console.error('Error obteniendo perfil:', err);
                return;
            }
            displayUserProfile(profile);
        });
    } else {
        // Sin sesion: dejamos entrar igual y ofrecemos un boton para iniciar sesion
        displayLoginButton();
    }

    // Inicializar componentes
    initDarkMode();
    initFilters();
    initErrorButtons();
    actualizarEstadoRed();

    // Listeners de red
    window.addEventListener('online', actualizarEstadoRed);
    window.addEventListener('offline', actualizarEstadoRed);

    // Cargar particulas
    cargarParticulas('#ffffff');

    // Recargar particulas al cambiar tema
    const toggle = document.querySelector('.bb8-toggle__checkbox');
    if (toggle) {
        toggle.addEventListener('change', function() {
            setTimeout(() => cargarParticulas('#ffffff'), 50);
        });
    }
});

// Exponer funciones globales necesarias
window.lanzar = lanzar;
window.cerrarJuego = cerrarJuego;
window.pantallaCompleta = pantallaCompleta;
