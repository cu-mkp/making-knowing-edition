// Mobile menu toggle for the static mirror header.
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        var toggle = document.getElementById('menu-toggle');
        var nav = document.getElementById('main-nav');
        if (!toggle || !nav) return;

        toggle.addEventListener('click', function(event) {
            event.stopPropagation();
            var open = nav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });

        document.addEventListener('click', function(event) {
            if (nav.classList.contains('open') && !nav.contains(event.target)) {
                nav.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && nav.classList.contains('open')) {
                nav.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    });
})();
