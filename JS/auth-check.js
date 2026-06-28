// auth-check.js

let auth0Client = null;

// Esta función inicializa el cliente y lo guarda en la ventana para que otros scripts lo usen
async function initAuth0() {
  if (auth0Client) return auth0Client;

  auth0Client = await auth0.createAuth0Client({
    domain: window.AUTH0_DOMAIN,
    client_id: window.AUTH0_CLIENT_ID,
    cacheLocation: 'localstorage',
    useRefreshTokens: true
  });

  // Guardamos el cliente en window para acceder desde otros archivos
  window.auth0Client = auth0Client;
  return auth0Client;
}

// Esta función verifica si el usuario está logueado
async function checkAuth(isProtectedPage = true) {
  const client = await initAuth0();

  // 1. Manejar el regreso del login (si hay ?code= en la URL)
  const query = window.location.search;
  if (query.includes("code=") && query.includes("state=")) {
    await client.handleRedirectCallback();
    // Limpiamos la URL para que no quede el código ahí
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // 2. Verificar sesión
  const isAuthenticated = await client.isAuthenticated();

  // 3. Si no está logueado y la página es protegida, enviarlo a login
  if (!isAuthenticated && isProtectedPage) {
    window.location.href = "login.html";
  }

  return isAuthenticated;
}
