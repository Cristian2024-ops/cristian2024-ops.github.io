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
