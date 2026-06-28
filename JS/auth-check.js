async function checkSession() {
  const client = await auth0.createAuth0Client({
    domain: window.AUTH0_DOMAIN,
    client_id: window.AUTH0_CLIENT_ID,
    cacheLocation: 'localstorage' // ESTO ES LO QUE MANTIENE LA SESIÓN
  });

  const isAuthenticated = await client.isAuthenticated();
  if (!isAuthenticated) {
    // Si no está autenticado, manda al login
    if (window.location.pathname !== '/login.html') {
      window.location.href = 'login.html';
    }
  }
}
