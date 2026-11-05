(function () {
    'use strict';

    function init(root) {
        if (root.classList.contains('is-ready')) { return; }
        var studies = Array.from(root.querySelectorAll('.aelan-ihht-research__study'));
        var controls = root.querySelector('.aelan-ihht-research__controls');
        var position = root.querySelector('[data-research-position]');
        var previous = root.querySelector('[data-research-previous]');
        var next = root.querySelector('[data-research-next]');
        if (studies.length < 2 || !controls || !position || !previous || !next) { return; }
        var active = 0;

        function show(index) {
            active = (index + studies.length) % studies.length;
            studies.forEach(function (study, i) {
                var selected = i === active;
                study.classList.toggle('is-active', selected);
                study.setAttribute('aria-hidden', selected ? 'false' : 'true');
                study.toggleAttribute('inert', !selected);
                study.setAttribute('role', 'group');
                study.setAttribute('aria-roledescription', 'dia');
                study.setAttribute('aria-label', (i + 1) + ' / ' + studies.length);
            });
            position.textContent = String(active + 1).padStart(2, '0') + ' / ' + String(studies.length).padStart(2, '0');
        }

        previous.addEventListener('click', function () { show(active - 1); });
        next.addEventListener('click', function () { show(active + 1); });
        controls.addEventListener('keydown', function (event) {
            var index;
            if (event.key === 'ArrowLeft') { index = active - 1; }
            else if (event.key === 'ArrowRight') { index = active + 1; }
            else if (event.key === 'Home') { index = 0; }
            else if (event.key === 'End') { index = studies.length - 1; }
            else { return; }
            event.preventDefault();
            show(index);
        });
        show(0);
        root.setAttribute('role', 'region');
        root.setAttribute('aria-roledescription', 'lapozható vizsgálatok');
        root.setAttribute('aria-label', 'IHHT kutatási eredmények');
        root.classList.add('is-ready');
        controls.hidden = false;
    }

    function initAll() { document.querySelectorAll('[data-aelan-ihht-research]').forEach(init); }
    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initAll); }
    else { initAll(); }
}());
