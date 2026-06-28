// JS/auth-check.js
let auth0Client = null;

async function initAuth0() {
    if (auth0Client) return auth0Client;
    
    // Si la librería no ha cargado, esperamos un poco
    if (typeof auth0 === 'undefined') {
        console.error("SDK de Auth0 aún no cargado");
        return null;
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
        await client.handleRedirectCallback();
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    const isAuthenticated = await client.isAuthenticated();

    if (!isAuthenticated && isProtectedPage) {
        window.location.href = "login.html";
    }

    return isAuthenticated;
}
