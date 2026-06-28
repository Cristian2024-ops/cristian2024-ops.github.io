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

// JS/login.js
window.onload = async () => {
    // 1. Inicializar el cliente con valores explícitos (Hardcoded)
    // Esto descarta cualquier error de carga de variables o caché
    try {
        const auth0Client = await auth0.createAuth0Client({
            domain: 'dev-ekkbx30j1ns6gm5g.us.auth0.com',
            client_id: 'Qlsh3WVqus5Hwwl4nWp96Uq0yo8gbUnC', 
            cacheLocation: 'localstorage'
        });

        // 2. ¿Regresamos de Auth0 con un código?
        const query = window.location.search;
        if (query.includes("code=") && query.includes("state=")) {
            await auth0Client.handleRedirectCallback();
            window.history.replaceState({}, document.title, window.location.pathname);
            window.location.href = "juegos.html";
            return;
        }

        // 3. Verificar si estamos logueados
        const isAuthenticated = await auth0Client.isAuthenticated();
        if (isAuthenticated) {
            document.getElementById('login').style.display = 'none';
            document.getElementById('logout').style.display = 'block';
            document.getElementById('auth-msg').innerText = "Ya has iniciado sesión.";
        } else {
            document.getElementById('login').style.display = 'block';
            document.getElementById('logout').style.display = 'none';
        }

        // 4. Botones
        document.getElementById('login').onclick = () => {
            auth0Client.loginWithRedirect({
                authorizationParams: {
                    redirect_uri: "https://cristian2024-ops.github.io/juegos.html"
                }
            });
        };

        document.getElementById('logout').onclick = () => {
            auth0Client.logout({
                logoutParams: { returnTo: "https://cristian2024-ops.github.io/" }
            });
        };
        
    } catch (e) {
        console.error("Error crítico de Auth0:", e);
        alert("Error de configuración Auth0: " + e.message);
    }
};
