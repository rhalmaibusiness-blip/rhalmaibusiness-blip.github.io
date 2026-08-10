(function () {
    'use strict';

    var HASH = '#aelan-allapotfelmeres';

    function isDirectDestination() {
        return window.location.hash === HASH;
    }

    function init(root) {
        var gsap = window.gsap;
        var ScrollTrigger = window.ScrollTrigger;
        var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var bypassNextEntry = isDirectDestination();
        var directLockUntil = bypassNextEntry ? Date.now() + 1800 : 0;
        var bypassTimer = null;
        var current = null;
        var breakpoint = window.matchMedia('(max-width: 782px)');
        var cleanupBreakpoint = null;

        if (! gsap || ! ScrollTrigger || reducedMotion) {
            root.classList.add('is-aelan-measurement-motion-complete');
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        function animatedElements() {
            return Array.prototype.slice.call(root.querySelectorAll(
                '.aelan-measurement__title, ' +
                '.aelan-measurement__intro, ' +
                '.aelan-measurement__surface, ' +
                '.aelan-measurement__scan, ' +
                '.aelan-measurement__item, ' +
                '.aelan-measurement__icon, ' +
                '.aelan-measurement__number, ' +
                '.aelan-measurement__text, ' +
                '.aelan-measurement__closing, ' +
                '.aelan-measurement__cta'
            ));
        }

        function clearAnimated() {
            gsap.set(animatedElements(), {
                clearProps: 'opacity,visibility,transform,willChange'
            });
        }

        function finishImmediately() {
            if (current && current.timeline) {
                current.timeline.kill();
            }
            clearAnimated();
            root.classList.remove('is-aelan-measurement-motion-entering');
            root.classList.add('is-aelan-measurement-motion-complete');
            current = null;
        }

        function createTimeline(isMobile) {
            var title = root.querySelector('.aelan-measurement__title');
            var intro = root.querySelector('.aelan-measurement__intro');
            var surfaces = Array.prototype.slice.call(root.querySelectorAll('.aelan-measurement__surface'));
            var visibleSurfaces = isMobile ? surfaces.slice(0, 1) : surfaces;
            var scans = visibleSurfaces.map(function (surface) {
                return surface.querySelector('.aelan-measurement__scan');
            }).filter(Boolean);
            var items = Array.prototype.slice.call(root.querySelectorAll('.aelan-measurement__item'));
            var icons = Array.prototype.slice.call(root.querySelectorAll('.aelan-measurement__icon'));
            var numbers = Array.prototype.slice.call(root.querySelectorAll('.aelan-measurement__number'));
            var texts = Array.prototype.slice.call(root.querySelectorAll('.aelan-measurement__text'));
            var closing = root.querySelector('.aelan-measurement__closing');
            var cta = root.querySelector('.aelan-measurement__cta');
            var timeline;
            var row;

            if (! title || ! items.length || ! visibleSurfaces.length) {
                finishImmediately();
                return null;
            }

            if (current && current.timeline) {
                current.timeline.kill();
            }
            clearAnimated();

            root.classList.add('is-aelan-measurement-motion-entering');
            root.classList.remove('is-aelan-measurement-motion-complete');

            gsap.set(title, { autoAlpha: 0, y: isMobile ? 18 : 28 });
            if (intro) {
                gsap.set(intro, { autoAlpha: 0, y: isMobile ? 12 : 18 });
            }
            gsap.set(visibleSurfaces, {
                autoAlpha: 0,
                scale: isMobile ? 0.992 : 0.985
            });
            if (! isMobile && visibleSurfaces.length > 1) {
                gsap.set(visibleSurfaces[0], { x: -24 });
                gsap.set(visibleSurfaces[1], { x: 24 });
            }
            gsap.set(scans, { autoAlpha: 0, y: -36 });
            gsap.set(items, { autoAlpha: 0, y: isMobile ? 14 : 18 });
            gsap.set(icons, { scale: 0.82, transformOrigin: '50% 50%' });
            gsap.set(numbers, { y: isMobile ? 10 : 14 });
            gsap.set(texts, { y: isMobile ? 8 : 12 });
            if (closing) {
                gsap.set(closing, { autoAlpha: 0, y: isMobile ? 12 : 18 });
            }
            if (cta) {
                gsap.set(cta, { autoAlpha: 0, scale: 0.98, y: isMobile ? 12 : 18 });
            }

            timeline = gsap.timeline({
                paused: true,
                defaults: { ease: 'power3.out' },
                onComplete: function () {
                    clearAnimated();
                    root.classList.remove('is-aelan-measurement-motion-entering');
                    root.classList.add('is-aelan-measurement-motion-complete');
                    current = null;
                }
            });

            timeline.to(title, {
                autoAlpha: 1,
                duration: isMobile ? 0.4 : 0.58,
                y: 0
            }, 0);

            if (intro) {
                timeline.to(intro, {
                    autoAlpha: 1,
                    duration: isMobile ? 0.34 : 0.48,
                    y: 0
                }, isMobile ? 0.08 : 0.1);
            }

            timeline.to(visibleSurfaces, {
                autoAlpha: 1,
                duration: isMobile ? 0.46 : 0.66,
                scale: 1,
                stagger: isMobile ? 0 : 0.04,
                x: 0
            }, isMobile ? 0.13 : 0.18);

            timeline
                .to(scans, {
                    autoAlpha: isMobile ? 0.34 : 0.44,
                    duration: isMobile ? 0.13 : 0.18,
                    ease: 'sine.inOut'
                }, isMobile ? 0.22 : 0.34)
                .to(scans, {
                    duration: isMobile ? 0.62 : 0.94,
                    ease: 'sine.inOut',
                    y: function (index, scan) {
                        return scan.parentNode.offsetHeight + 176;
                    }
                }, isMobile ? 0.22 : 0.34)
                .to(scans, {
                    autoAlpha: 0,
                    duration: isMobile ? 0.18 : 0.24,
                    ease: 'sine.out'
                }, isMobile ? 0.7 : 1.08);

            if (isMobile) {
                timeline.to(items, {
                    autoAlpha: 1,
                    duration: 0.32,
                    stagger: 0.075,
                    y: 0
                }, 0.29);
                timeline.to(icons, {
                    duration: 0.34,
                    scale: 1,
                    stagger: 0.075
                }, 0.29);
                timeline.to(numbers, {
                    duration: 0.32,
                    stagger: 0.075,
                    y: 0
                }, 0.3);
                timeline.to(texts, {
                    duration: 0.32,
                    stagger: 0.075,
                    y: 0
                }, 0.31);
            } else {
                for (row = 0; row < 3; row += 1) {
                    timeline.to(items.slice(row * 2, row * 2 + 2), {
                        autoAlpha: 1,
                        duration: 0.43,
                        stagger: 0.035,
                        y: 0
                    }, 0.48 + (row * 0.22));
                    timeline.to(icons.slice(row * 2, row * 2 + 2), {
                        duration: 0.4,
                        scale: 1,
                        stagger: 0.035
                    }, 0.48 + (row * 0.22));
                    timeline.to(numbers.slice(row * 2, row * 2 + 2), {
                        duration: 0.38,
                        stagger: 0.035,
                        y: 0
                    }, 0.5 + (row * 0.22));
                    timeline.to(texts.slice(row * 2, row * 2 + 2), {
                        duration: 0.38,
                        stagger: 0.035,
                        y: 0
                    }, 0.51 + (row * 0.22));
                }
            }

            if (closing) {
                timeline.to(closing, {
                    autoAlpha: 1,
                    duration: isMobile ? 0.38 : 0.48,
                    y: 0
                }, isMobile ? 0.74 : 1.08);
            }
            if (cta) {
                timeline.to(cta, {
                    autoAlpha: 1,
                    duration: isMobile ? 0.38 : 0.46,
                    scale: 1,
                    y: 0
                }, isMobile ? 0.8 : 1.17);
            }

            current = { timeline: timeline };
            return timeline;
        }

        function releaseDirectBypass() {
            window.clearTimeout(bypassTimer);
            bypassTimer = window.setTimeout(function () {
                bypassNextEntry = false;
            }, Math.max(0, directLockUntil - Date.now()));
        }

        function shouldBypassEntry() {
            return bypassNextEntry || (isDirectDestination() && Date.now() < directLockUntil);
        }

        function setup(isMobile) {
            var entryTrigger;

            function playEntry() {
                var timeline;

                if (shouldBypassEntry()) {
                    window.clearTimeout(bypassTimer);
                    bypassNextEntry = false;
                    finishImmediately();
                    return;
                }

                timeline = createTimeline(isMobile);
                if (timeline) {
                    timeline.play(0);
                }
            }

            if (shouldBypassEntry()) {
                finishImmediately();
            } else {
                createTimeline(isMobile);
            }

            entryTrigger = ScrollTrigger.create({
                id: 'aelan-measurement-motion',
                trigger: root,
                start: isMobile ? 'top 86%' : 'top 78%',
                end: 'bottom 22%',
                invalidateOnRefresh: true,
                onEnter: playEntry,
                onEnterBack: playEntry,
                onLeave: function () {
                    if (current) {
                        finishImmediately();
                    }
                },
                onLeaveBack: function () {
                    if (current) {
                        finishImmediately();
                    }
                },
                onRefresh: function (self) {
                    if (self.progress === 1 && current) {
                        finishImmediately();
                    }
                }
            });

            if (shouldBypassEntry()) {
                releaseDirectBypass();
            }

            return function () {
                entryTrigger.kill();
                finishImmediately();
            };
        }

        function onHashChange() {
            if (isDirectDestination()) {
                bypassNextEntry = true;
                directLockUntil = Date.now() + 1800;
                finishImmediately();
                releaseDirectBypass();
            }
        }

        function onBreakpointChange(event) {
            if (cleanupBreakpoint) {
                cleanupBreakpoint();
            }
            cleanupBreakpoint = setup(event.matches);
            ScrollTrigger.refresh();
        }

        cleanupBreakpoint = setup(breakpoint.matches);
        if (typeof breakpoint.addEventListener === 'function') {
            breakpoint.addEventListener('change', onBreakpointChange);
        } else {
            breakpoint.addListener(onBreakpointChange);
        }
        window.addEventListener('hashchange', onHashChange);
    }

    document.querySelectorAll('[data-aelan-measurement]').forEach(init);
}());
