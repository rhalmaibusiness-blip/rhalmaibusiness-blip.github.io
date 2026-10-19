(function () {
    'use strict';

    document.querySelectorAll('[data-aelan-elementor-header]').forEach(function (header) {
        var nav = header.querySelector('[data-aelan-header-nav]');
        var menuButton = header.querySelector('[data-aelan-header-open]');
        var serviceButtons = Array.prototype.slice.call(header.querySelectorAll('[data-aelan-services-toggle]'));
        var submenu = header.querySelector('[data-aelan-services-menu]');
        var mobileQuery = window.matchMedia('(max-width: 900px)');
        var inner = header.querySelector('.aelan-site-header__inner');
        var servicesItem = submenu && submenu.parentElement;
        var hoverClose;

        function positionSubmenu() {
            if (! inner || ! servicesItem || mobileQuery.matches) return;
            var offset = inner.getBoundingClientRect().bottom - servicesItem.getBoundingClientRect().top - 1;
            servicesItem.style.setProperty('--aelan-dropdown-top', offset + 'px');
        }

        function updateCurrentLinks() {
            var path = function (value) { return value.replace(/\/index\.html$/, '/').replace(/\/$/, ''); };
            header.querySelectorAll('.aelan-header-navigation a[href]').forEach(function (link) {
                var target = new URL(link.href, location.href);
                var samePage = target.origin === location.origin && path(target.pathname) === path(location.pathname);
                var current = samePage && (target.hash ? target.hash === location.hash : true);
                if (current) link.setAttribute('aria-current', target.hash ? 'location' : 'page');
                else link.removeAttribute('aria-current');
            });
        }

        function navIsOpen() {
            return Boolean(nav && nav.classList.contains('is-menu-open'));
        }

        function setServicesOpen(isOpen) {
            window.clearTimeout(hoverClose);
            if (isOpen) positionSubmenu();
            serviceButtons.forEach(function (button) {
                button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });
            if (submenu) {
                submenu.classList.toggle('is-open', isOpen);
            }
        }

        function returnFocus() {
            if (! menuButton || typeof menuButton.focus !== 'function') {
                return;
            }
            try {
                menuButton.focus({ preventScroll: true });
            } catch (error) {
                menuButton.focus();
            }
        }

        function updateScrollState() {
            if (navIsOpen()) {
                return;
            }
            header.classList.toggle('is-scrolled', window.scrollY > 48);
            window.requestAnimationFrame(positionSubmenu);
        }

        function closeNav(restoreFocus) {
            if (! nav) {
                return;
            }
            var wasOpen = navIsOpen();
            nav.classList.remove('is-menu-open');
            document.documentElement.classList.remove('aelan-menu-open');
            setServicesOpen(false);
            if (menuButton) {
                menuButton.setAttribute('aria-expanded', 'false');
                menuButton.setAttribute('aria-label', 'Menü megnyitása');
            }
            updateScrollState();
            if (wasOpen && restoreFocus) {
                returnFocus();
            }
        }

        function openNav() {
            if (! nav || ! menuButton) {
                return;
            }
            setServicesOpen(false);
            nav.classList.add('is-menu-open');
            if (mobileQuery.matches) {
                document.documentElement.classList.add('aelan-menu-open');
            }
            menuButton.setAttribute('aria-expanded', 'true');
            menuButton.setAttribute('aria-label', 'Menü bezárása');
        }

        function menuFocusables() {
            if (! nav || ! menuButton) {
                return [];
            }

            return [menuButton].concat(Array.prototype.slice.call(nav.querySelectorAll('a[href], button:not([disabled])'))).filter(function (element) {
                var styles = window.getComputedStyle(element);
                return styles.display !== 'none' && styles.visibility !== 'hidden' && element.getClientRects().length > 0;
            });
        }

        if (menuButton && nav) {
            menuButton.addEventListener('click', function () {
                if (navIsOpen()) {
                    closeNav(true);
                } else {
                    openNav();
                }
            });
        }

        serviceButtons.forEach(function (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                setServicesOpen(button.getAttribute('aria-expanded') !== 'true');
            });
        });

        if (servicesItem) {
            servicesItem.addEventListener('pointerenter', function (event) {
                if (! mobileQuery.matches && event.pointerType !== 'touch') setServicesOpen(true);
            });
            servicesItem.addEventListener('pointerleave', function (event) {
                if (! mobileQuery.matches && event.pointerType !== 'touch') {
                    hoverClose = window.setTimeout(function () {
                        if (! servicesItem.contains(document.activeElement)) setServicesOpen(false);
                    }, 160);
                }
            });
            servicesItem.addEventListener('focusout', function (event) {
                if (! mobileQuery.matches && ! servicesItem.contains(event.relatedTarget)) setServicesOpen(false);
            });
            servicesItem.addEventListener('keydown', function (event) {
                if (event.key === 'ArrowDown' && ! mobileQuery.matches) {
                    event.preventDefault();
                    setServicesOpen(true);
                    var firstLink = submenu.querySelector('a[href]');
                    if (firstLink) {
                        window.requestAnimationFrame(function () {
                            window.requestAnimationFrame(function () {
                                if (submenu.classList.contains('is-open')) firstLink.focus();
                            });
                        });
                    }
                }
            });
        }

        header.addEventListener('click', function (event) {
            if (event.target.closest('a[href]') && navIsOpen()) {
                closeNav(false);
                window.requestAnimationFrame(returnFocus);
            }
        });

        document.addEventListener('click', function (event) {
            if (header.contains(event.target)) {
                return;
            }
            if (navIsOpen()) {
                closeNav(true);
            } else {
                setServicesOpen(false);
            }
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Tab' && navIsOpen() && mobileQuery.matches) {
                var focusables = menuFocusables();
                var first = focusables[0];
                var last = focusables[focusables.length - 1];

                if (! first || ! last) {
                    return;
                }
                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (! event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
                return;
            }

            if (event.key !== 'Escape') {
                return;
            }
            if (navIsOpen()) {
                closeNav(true);
            } else if (serviceButtons.some(function (button) { return button.getAttribute('aria-expanded') === 'true'; })) {
                setServicesOpen(false);
                serviceButtons[0].focus();
            }
        });

        window.addEventListener('scroll', function () {
            updateScrollState();
        }, { passive: true });

        function syncBreakpoint() {
            closeNav(false);
            setServicesOpen(false);
            updateScrollState();
        }

        if (typeof mobileQuery.addEventListener === 'function') {
            mobileQuery.addEventListener('change', syncBreakpoint);
        } else if (typeof mobileQuery.addListener === 'function') {
            mobileQuery.addListener(syncBreakpoint);
        }

        setServicesOpen(false);
        updateCurrentLinks();
        window.addEventListener('hashchange', updateCurrentLinks);
        window.addEventListener('resize', positionSubmenu);
        if (inner && typeof ResizeObserver === 'function') {
            new ResizeObserver(positionSubmenu).observe(inner);
        }
        updateScrollState();
    });
}());
