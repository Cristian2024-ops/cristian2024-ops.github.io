// ===== Partículas (Igual) =====
function cargarParticulas(colorParticula) {
    if (typeof particlesJS === 'undefined') return;
    particlesJS("particles-js", {
        "particles": {
            "number": { "value": 70, "density": { "enable": true, "value_area": 800 } },
            "color": { "value": colorParticula },
            "shape": { "type": "circle" },
            "opacity": { "value": 0.75, "random": false },
            "size": { "value": 4.5, "random": true },
            "line_linked": { "enable": true, "distance": 145, "color": colorParticula, "opacity": 0.45, "width": 1.5 },
            "move": { "enable": true, "speed": 2.2, "direction": "none", "random": true, "straight": false, "out_mode": "out" }
        },
        "interactivity": { "detect_on": "canvas", "events": { "resize": true } }
    });
}
cargarParticulas("#ffffff");

const toggleBtn = document.getElementById('bb8-checkbox');
if (toggleBtn) {
    toggleBtn.addEventListener('change', function () {
        setTimeout(() => cargarParticulas("#ffffff"), 50);
    });
}

// ===== Lógica Moderna Auth0 (SDK v2) =====
let auth0Client = null;

window.onload = async () => {
    // 1. Inicializar el cliente (usando los datos de auth0-config.js)
    auth0Client = await auth0.createAuth0Client({
        domain: window.AUTH0_DOMAIN,
        client_id: window.AUTH0_CLIENT_ID,
        cacheLocation: 'localstorage' // ¡IMPORTANTE! Esto permite que juegos.html y dashboard.html vean la sesión
    });

    // 2. Verificar si el usuario está autenticado
    const isAuthenticated = await auth0Client.isAuthenticated();

    if (isAuthenticated) {
        showProfile();
    } else {
        showLoggedOut();
    }

    // 3. Manejar el clic de login
    document.getElementById('login').onclick = () => {
        auth0Client.loginWithRedirect({
            authorizationParams: {
                redirect_uri: "https://cristian2024-ops.github.io/juegos.html"
            }
        });
    };

    // 4. Manejar el clic de logout
    document.getElementById('logout').onclick = () => {
        auth0Client.logout({
            logoutParams: { returnTo: window.AUTH0_LOGOUT_REDIRECT_URI || window.location.origin }
        });
    };
};

async function showProfile() {
    document.getElementById('login').style.display = 'none';
    document.getElementById('logout').style.display = '';
    document.getElementById('auth-msg').style.display = 'none';
    
    // Obtener info del usuario de forma moderna
    const user = await auth0Client.getUser();
    if (user) {
        document.getElementById('user-profile').innerHTML =
            `<div>
                <img src="${user.picture}" alt="avatar" style="width:65px;border-radius:50%;margin-bottom:10px;box-shadow: 0 4px 10px rgba(0,0,0,0.2);"><br>
                <strong style="font-size: 1.2rem; display:block; margin-bottom:2px;">${user.nickname || user.name}</strong>
                <small style="opacity:0.8;">${user.email || ''}</small>
            </div>`;
    }
}

function showLoggedOut() {
    document.getElementById('login').style.display = '';
    document.getElementById('logout').style.display = 'none';
    document.getElementById('auth-msg').style.display = '';
    document.getElementById('user-profile').innerHTML = '';
}
