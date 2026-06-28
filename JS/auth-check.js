// JS/auth-check.js
let auth0Client = null;

async function initAuth0() {
    if (auth0Client) return auth0Client;
    
    // Esperamos a la librería
    if (typeof auth0 === 'undefined') {
        await new Promise(r => setTimeout(r, 500));
    }

    auth0Client = await auth0.createAuth0Client({
        domain: 'dev-ekkbx30j1ns6gm5g.us.auth0.com',
        client_id: 'Qlsh3WVqus5Hwwl4nWp96Uq0yo8gbUnC',
        cacheLocation: 'localstorage'
    });
    
    window.auth0Client = auth0Client;
    return auth0Client;
}

async function checkAuth(isProtectedPage = true) {
    const client = await initAuth0();
    if (!client) return false;

    // Si volvemos de Auth0 (trae ?code= en la URL)
    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {
        try {
            await client.handleRedirectCallback();
            // Limpiamos la URL y redirigimos a una página limpia para evitar errores de refresco
            window.history.replaceState({}, document.title, window.location.pathname);
            window.location.href = window.location.pathname; 
            return true;
        } catch (e) {
            console.error("Error al procesar callback:", e);
            // Si el estado es inválido, limpiamos todo y forzamos re-login
            alert("La sesión expiró o es inválida. Iniciando proceso de nuevo...");
            window.location.href = "login.html";
            return false;
        }
    }

    const isAuthenticated = await client.isAuthenticated();
    if (!isAuthenticated && isProtectedPage) {
        window.location.href = "login.html";
    }
    return isAuthenticated;
}
