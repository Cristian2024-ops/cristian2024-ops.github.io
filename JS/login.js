// ===== Partículas (idéntico al index) =====
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

// ===== Lógica SPA Auth0 =====
// Tomamos las credenciales desde JS/auth0-config.js (variables globales window.AUTH0_*).
// Usamos "webAuth" para NO pisar el objeto global "auth0" de la librería.
var webAuth = new auth0.WebAuth({
    domain:      window.AUTH0_DOMAIN,
    clientID:    window.AUTH0_CLIENT_ID,
    redirectUri: window.AUTH0_REDIRECT_URI,
    responseType: 'token id_token',
    scope: 'openid profile email'
});

window.onload = function () { handleAuth(); };

function handleAuth() {
    webAuth.parseHash(function (err, authResult) {
        if (authResult && authResult.accessToken && authResult.idToken) {
            window.location.hash = '';
            localLogin(authResult);
        } else if (err) {
            alert('Error: ' + err.error + '\n' + err.errorDescription);
        } else {
            renewTokens();
        }
    });
}

function localLogin(authResult) {
    sessionStorage.setItem('access_token', authResult.accessToken);
    sessionStorage.setItem('id_token', authResult.idToken);
    var expiresIn = authResult.expiresIn || 7200;
    sessionStorage.setItem('expires_at', JSON.stringify((expiresIn * 1000) + new Date().getTime()));
    // Login exitoso: redirigimos a la página de juegos
    window.location.href = 'juegos.html';
}

function renewTokens() {
    var expiresAt = JSON.parse(sessionStorage.getItem('expires_at') || '0');
    if (new Date().getTime() < expiresAt) {
        showProfile();
    } else {
        showLoggedOut();
    }
}

function showProfile() {
    document.getElementById('login').style.display = 'none';
    document.getElementById('logout').style.display = '';
    document.getElementById('auth-msg').style.display = 'none';
    webAuth.client.userInfo(sessionStorage.getItem('access_token'), function (err, profile) {
        if (profile) {
            document.getElementById('user-profile').innerHTML =
                `<div>
                    <img src="${profile.picture}" alt="avatar" style="width:65px;border-radius:50%;margin-bottom:10px;box-shadow: 0 4px 10px rgba(0,0,0,0.2);"><br>
                    <strong style="font-size: 1.2rem; display:block; margin-bottom:2px;">${profile.nickname || profile.name}</strong>
                    <small style="opacity:0.8;">${profile.email || ''}</small>
                </div>`;
        }
    });
}

function showLoggedOut() {
    document.getElementById('login').style.display = '';
    document.getElementById('logout').style.display = 'none';
    document.getElementById('auth-msg').style.display = '';
    document.getElementById('user-profile').innerHTML = '';
}

document.getElementById('login').onclick = function () {
    webAuth.authorize();
};
document.getElementById('logout').onclick = function () {
    sessionStorage.clear();
    var returnTo = window.AUTH0_LOGOUT_REDIRECT_URI || window.location.origin;
    window.location.href =
        `https://${window.AUTH0_DOMAIN}/v2/logout?returnTo=${encodeURIComponent(returnTo)}&client_id=${window.AUTH0_CLIENT_ID}`;
};
