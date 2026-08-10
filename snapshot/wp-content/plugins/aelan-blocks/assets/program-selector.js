(function () {
    'use strict';

    var mobileQuery = window.matchMedia('(max-width: 782px)');

    function setScrollPosition(position) {
        var previousInlineBehavior = document.documentElement.style.scrollBehavior;

        document.documentElement.style.scrollBehavior = 'auto';
        window.scrollTo(0, position);
        document.documentElement.style.scrollBehavior = previousInlineBehavior;
    }

    function requestMotionRefresh(anchor, anchorTop) {
        window.requestAnimationFrame(function () {
            var stableScrollY;
            var currentTop;

            function restoreScrollPosition() {
                if (Math.abs(window.scrollY - stableScrollY) > 1) {
                    setScrollPosition(stableScrollY);
                }
                if (window.ScrollTrigger) {
                    window.ScrollTrigger.update();
                }
            }

            if (anchor && Number.isFinite(anchorTop)) {
                currentTop = anchor.getBoundingClientRect().top;
                if (Number.isFinite(currentTop)) {
                    setScrollPosition(window.scrollY + currentTop - anchorTop);
                }
            }

            stableScrollY = window.scrollY;
            if (window.ScrollTrigger) {
                window.ScrollTrigger.refresh();
            }
            restoreScrollPosition();
            window.requestAnimationFrame(restoreScrollPosition);
        });
    }

    function init(root) {
        var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
        var panels = Array.prototype.slice.call(root.querySelectorAll('[role="tabpanel"]'));
        var accordionTriggers = Array.prototype.slice.call(root.querySelectorAll('.aelan-programs__accordion-trigger'));
        var activeIndex = 0;
        var panelHashes = panels.map(function (panel) {
            return panel.id ? '#' + panel.id : '';
        });

        if (! tabs.length || tabs.length !== panels.length) {
            return;
        }

        root.classList.add('is-enhanced');

        function applyState(focusTab, anchor, anchorTop) {
            tabs.forEach(function (tab, index) {
                var selected = index === activeIndex;
                tab.setAttribute('aria-selected', selected ? 'true' : 'false');
                tab.setAttribute('tabindex', selected ? '0' : '-1');
                tab.classList.toggle('is-active', selected);
            });

            panels.forEach(function (panel, index) {
                var selected = index === activeIndex;
                var body = panel.querySelector('.aelan-programs__body');
                var trigger = accordionTriggers[index];

                panel.classList.toggle('is-active', selected);
                if (mobileQuery.matches) {
                    panel.hidden = false;
                    if (body) {
                        body.hidden = ! selected;
                    }
                } else {
                    panel.hidden = ! selected;
                    if (body) {
                        body.hidden = false;
                    }
                }

                if (trigger) {
                    trigger.setAttribute('aria-expanded', selected ? 'true' : 'false');
                    trigger.classList.toggle('is-active', selected);
                }
            });

            if (focusTab && tabs[activeIndex]) {
                try {
                    tabs[activeIndex].focus({ preventScroll: true });
                } catch (error) {
                    tabs[activeIndex].focus();
                }
            }

            requestMotionRefresh(anchor, anchorTop);
        }

        function activate(index, focusTab) {
            var anchor;
            var anchorTop;

            if (index < 0 || index >= tabs.length) {
                return;
            }

            if (index === activeIndex) {
                return;
            }

            anchor = mobileQuery.matches ? accordionTriggers[index] : tabs[index];
            anchorTop = anchor ? anchor.getBoundingClientRect().top : null;
            activeIndex = index;
            root.dispatchEvent(new window.CustomEvent('aelan:internal-panel-change', {
                detail: { block: 'program-selector', index: index }
            }));
            applyState(focusTab, anchor, anchorTop);
        }

        function activateFromHash(shouldScroll, behavior) {
            var index = panelHashes.indexOf(window.location.hash);
            if (index < 0) {
                return false;
            }

            activate(index, false);
            if (shouldScroll) {
                window.requestAnimationFrame(function () {
                    root.scrollIntoView({ behavior: behavior || 'smooth', block: 'start' });
                });
            }
            return true;
        }

        tabs.forEach(function (tab, index) {
            tab.addEventListener('click', function () {
                activate(index, false);
            });
            tab.addEventListener('keydown', function (event) {
                var next = activeIndex;
                if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
                    next = (activeIndex + 1) % tabs.length;
                } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
                    next = (activeIndex - 1 + tabs.length) % tabs.length;
                } else if (event.key === 'Home') {
                    next = 0;
                } else if (event.key === 'End') {
                    next = tabs.length - 1;
                } else {
                    return;
                }
                event.preventDefault();
                activate(next, true);
            });
        });

        accordionTriggers.forEach(function (trigger, index) {
            trigger.addEventListener('click', function () {
                activate(index, false);
            });
        });

        function syncBreakpoint() {
            applyState(false);
        }

        if (typeof mobileQuery.addEventListener === 'function') {
            mobileQuery.addEventListener('change', syncBreakpoint);
        } else if (typeof mobileQuery.addListener === 'function') {
            mobileQuery.addListener(syncBreakpoint);
        }

        if (! activateFromHash(Boolean(window.location.hash), 'auto')) {
            applyState(false);
        }

        document.addEventListener('click', function (event) {
            var anchor = event.target.closest ? event.target.closest('a[href]') : null;
            var targetUrl;

            if (! anchor) {
                return;
            }

            try {
                targetUrl = new URL(anchor.href, window.location.href);
            } catch (error) {
                return;
            }

            if (
                targetUrl.origin !== window.location.origin ||
                targetUrl.pathname !== window.location.pathname ||
                panelHashes.indexOf(targetUrl.hash) < 0 ||
                targetUrl.hash !== window.location.hash
            ) {
                return;
            }

            event.preventDefault();
            activateFromHash(true, 'smooth');
        });

        window.addEventListener('hashchange', function () {
            activateFromHash(true, 'smooth');
        });
    }

    document.querySelectorAll('[data-aelan-programs]').forEach(init);
}());
