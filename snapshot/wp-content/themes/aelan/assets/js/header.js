(function () {
    'use strict';

    var header = document.querySelector('.aelan-site-header');
    var navigation = document.querySelector('.aelan-header-navigation');

    if (!header || !navigation) {
        return;
    }

    var links = Array.prototype.slice.call(
        navigation.querySelectorAll('.wp-block-navigation-item__content[href*="#"]')
    );
    var sections = links.map(function (link) {
        var hash;

        try {
            hash = new URL(link.href, window.location.href).hash;
        } catch (error) {
            return null;
        }

        if (!hash || hash === '#') {
            return null;
        }

        return {
            link: link,
            section: document.getElementById(decodeURIComponent(hash.slice(1)))
        };
    }).filter(function (item) {
        return item && item.section;
    });

    function setScrolledState() {
        header.classList.toggle('is-scrolled', window.scrollY > 20);
    }

    function setCurrentLink(activeLink) {
        links.forEach(function (link) {
            if (link === activeLink) {
                link.setAttribute('aria-current', 'location');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    setScrolledState();
    window.addEventListener('scroll', setScrolledState, { passive: true });

    navigation.addEventListener('click', function (event) {
        var link = event.target.closest ? event.target.closest('.wp-block-navigation-item__content') : null;
        var responsiveContainer;
        var closeButton;

        if (! link || ! window.matchMedia('(max-width: 840px)').matches) {
            return;
        }

        responsiveContainer = link.closest('.wp-block-navigation__responsive-container.is-menu-open');
        if (! responsiveContainer) {
            return;
        }

        closeButton = responsiveContainer.querySelector('.wp-block-navigation__responsive-container-close');
        if (! closeButton) {
            return;
        }

        window.requestAnimationFrame(function () {
            closeButton.click();
        });
    });

    if ('IntersectionObserver' in window && sections.length) {
        var visibleSections = new Map();
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    visibleSections.set(entry.target, entry.boundingClientRect.top);
                } else {
                    visibleSections.delete(entry.target);
                }
            });

            var visible = sections.filter(function (item) {
                return visibleSections.has(item.section);
            }).sort(function (a, b) {
                return Math.abs(visibleSections.get(a.section)) - Math.abs(visibleSections.get(b.section));
            });

            if (visible.length) {
                setCurrentLink(visible[0].link);
            }
        }, {
            rootMargin: '-28% 0px -58% 0px',
            threshold: [0, 0.01, 0.25]
        });

        sections.forEach(function (item) {
            observer.observe(item.section);
        });
    }
}());
