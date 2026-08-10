(function () {
    'use strict';

    var mobileQuery = window.matchMedia('(max-width: 782px)');

    function requestMotionRefresh() {
        if (! window.ScrollTrigger) {
            return;
        }

        window.requestAnimationFrame(function () {
            window.ScrollTrigger.refresh();
        });
    }

    function init(root) {
        var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
        var panels = Array.prototype.slice.call(root.querySelectorAll('[role="tabpanel"]'));
        var accordionTriggers = Array.prototype.slice.call(root.querySelectorAll('.aelan-proof-tabs__accordion-trigger'));
        var activeIndex = 0;

        if (! tabs.length || tabs.length !== panels.length) {
            return;
        }

        root.classList.add('is-enhanced');

        function applyState(focusTab) {
            tabs.forEach(function (tab, index) {
                var selected = index === activeIndex;
                tab.setAttribute('aria-selected', selected ? 'true' : 'false');
                tab.setAttribute('tabindex', selected ? '0' : '-1');
                tab.classList.toggle('is-active', selected);
            });

            panels.forEach(function (panel, index) {
                var selected = index === activeIndex;
                var body = panel.querySelector('.aelan-proof-tabs__body');
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
                tabs[activeIndex].focus();
            }

            requestMotionRefresh();
        }

        function activate(index, focusTab) {
            if (index < 0 || index >= tabs.length) {
                return;
            }
            activeIndex = index;
            applyState(focusTab);
        }

        tabs.forEach(function (tab, index) {
            tab.addEventListener('click', function () {
                activate(index, false);
            });
            tab.addEventListener('keydown', function (event) {
                var next = activeIndex;
                if (event.key === 'ArrowRight') {
                    next = (activeIndex + 1) % tabs.length;
                } else if (event.key === 'ArrowLeft') {
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

        if (typeof mobileQuery.addEventListener === 'function') {
            mobileQuery.addEventListener('change', function () { applyState(false); });
        } else if (typeof mobileQuery.addListener === 'function') {
            mobileQuery.addListener(function () { applyState(false); });
        }

        applyState(false);
    }

    document.querySelectorAll('[data-aelan-proof-tabs]').forEach(init);
}());
