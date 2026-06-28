// JS/login.js
window.onload = async () => {
    console.log("--- DEBUG START ---");
    
    // 1. ¿Existe el objeto auth0 global?
    if (typeof auth0 === 'undefined') {
        alert("¡ERROR CRÍTICO! La librería auth0-spa-js no se cargó. Revisa tu etiqueta <script>.");
        return;
    }
    console.log("Librería Auth0 cargada:", auth0);

    // 2. Inicialización con logs
    try {
        console.log("Intentando inicializar Auth0...");
        
        const auth0Client = await auth0.createAuth0Client({
            domain: 'dev-ekkbx30j1ns6gm5g.us.auth0.com',
            client_id: 'Qlsh3WVqus5Hwwl4nWp96Uq0yo8gbUnC',
            cacheLocation: 'localstorage'
        });
        
        console.log("Auth0 cliente inicializado:", auth0Client);

        // 3. Botón login
        document.getElementById('login').onclick = async () => {
            console.log("Botón login clickeado");
            try {
                await auth0Client.loginWithRedirect({
                    authorizationParams: {
                        redirect_uri: "https://cristian2024-ops.github.io/juegos.html"
                    }
                });
            } catch (err) {
                console.error("Error al redirigir:", err);
                alert("Error al intentar redirigir a Auth0: " + err.message);
            }
        };

        // Mostrar botones
        document.getElementById('login').style.display = 'block';
        
    } catch (e) {
        console.error("Error al crear cliente Auth0:", e);
        alert("Error al inicializar Auth0: " + e.message);
    }
};
