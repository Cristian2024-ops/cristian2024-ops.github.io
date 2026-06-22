        // Manejo modo oscuro BB8
        document.addEventListener('DOMContentLoaded', function() {
            const toggle = document.querySelector('.bb8-toggle__checkbox');
            if(toggle){
                // Inicial: sincroniza con localStorage
                if(localStorage.getItem('theme') === 'dark'){
                    document.body.classList.add('dark-mode');
                    toggle.checked = true;
                }
                toggle.addEventListener('change', function(e){
                    if(e.target.checked){
                        document.body.classList.add('dark-mode');
                        localStorage.setItem('theme','dark');
                    }else{
                        document.body.classList.remove('dark-mode');
                        localStorage.setItem('theme','light');
                    }
                });
            }
        });
