(function () {
    'use strict';

    var navigation = document.querySelector('.aelan-section-navigation');
    if (!navigation || !('IntersectionObserver' in window)) {
        return;
    }

    var links = Array.prototype.slice.call(navigation.querySelectorAll('[data-aelan-nav]'));
    var sections = links.map(function (link) {
        return document.getElementById(link.getAttribute('data-aelan-nav'));
    }).filter(Boolean);

    function activate(id) {
        links.forEach(function (link) {
            var active = link.getAttribute('data-aelan-nav') === id;
            link.classList.toggle('is-active', active);
            if (active) {
                link.setAttribute('aria-current', 'true');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    if (sections.length) {
        activate(sections[0].id);
    }

    var observer = new IntersectionObserver(function (entries) {
        if (navigation.dataset.aelanMotionLock === 'true') {
            return;
        }

        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                activate(entry.target.id);
            }
        });
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });

    sections.forEach(function (section) { observer.observe(section); });
}());
