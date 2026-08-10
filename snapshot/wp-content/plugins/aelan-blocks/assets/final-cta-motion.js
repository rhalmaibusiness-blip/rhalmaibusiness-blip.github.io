(function () {
    'use strict';

    var HASH = '#kapcsolat';

    function isDirectDestination() {
        return window.location.hash === HASH;
    }

    function init(root) {
        var gsap = window.gsap;
        var ScrollTrigger = window.ScrollTrigger;
        var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var background = root.querySelector('.aelan-final-cta__background');
        var title = root.querySelector('.aelan-section-heading h2');
        var lead = root.querySelector('.aelan-lead');
        var action = root.querySelector('[data-aelan-final-cta-action]');
        var sheen = root.querySelector('[data-aelan-final-cta-sheen]');
        var bypassNextEntry = isDirectDestination();
        var directLockUntil = bypassNextEntry ? Date.now() + 1800 : 0;
        var bypassTimer = null;
        var timeline = null;
        var matchMedia;

        if (! title) {
            return;
        }

        if (! gsap || ! ScrollTrigger || reducedMotion) {
            root.classList.add('is-aelan-final-cta-motion-complete');
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        function animatedElements() {
            return [background, title, lead, action, sheen].filter(Boolean);
        }

        function clearAnimated() {
            gsap.set(animatedElements(), {
                clearProps: 'opacity,visibility,transform,transformOrigin,willChange'
            });
        }

        function markEntering() {
            root.classList.add('is-aelan-final-cta-motion-entering');
            root.classList.remove('is-aelan-final-cta-motion-complete');
        }

        function markComplete() {
            root.classList.remove('is-aelan-final-cta-motion-entering');
            root.classList.add('is-aelan-final-cta-motion-complete');
        }

        function killTimeline() {
            if (timeline) {
                timeline.kill();
                timeline = null;
            }
        }

        function isSectionOutsideViewport() {
            var rect = root.getBoundingClientRect();

            return rect.bottom <= 0 || rect.top >= window.innerHeight;
        }

        function finishImmediately() {
            killTimeline();
            clearAnimated();
            markComplete();
        }

        function shouldBypassEntry() {
            return bypassNextEntry || (isDirectDestination() && Date.now() < directLockUntil);
        }

        function releaseDirectBypass() {
            window.clearTimeout(bypassTimer);
            bypassTimer = window.setTimeout(function () {
                bypassNextEntry = false;
            }, Math.max(0, directLockUntil - Date.now()));
        }

        function prepareTimeline(isMobile) {
            var entry;

            killTimeline();
            clearAnimated();
            if (background) {
                gsap.set(background, {
                    autoAlpha: 0.58,
                    scale: isMobile ? 1.02 : 1.025,
                    x: isMobile ? 0 : 32,
                    y: isMobile ? 16 : 0
                });
            }
            gsap.set(title, { autoAlpha: 0, y: isMobile ? 16 : 24 });
            if (lead) {
                gsap.set(lead, { autoAlpha: 0, y: isMobile ? 14 : 22 });
            }
            if (action) {
                gsap.set(action, {
                    autoAlpha: 0,
                    scale: 0.985,
                    y: isMobile ? 12 : 20
                });
            }
            if (sheen) {
                gsap.set(sheen, { autoAlpha: 0, xPercent: -175 });
            }

            entry = gsap.timeline({
                paused: true,
                defaults: { ease: 'power3.out' },
                onComplete: function () {
                    timeline = null;
                    clearAnimated();
                    markComplete();
                }
            });
            if (background) {
                entry.to(background, {
                    autoAlpha: 1,
                    duration: isMobile ? 0.68 : 0.88,
                    ease: 'power2.inOut',
                    scale: 1,
                    x: 0,
                    y: 0
                }, 0);
            }
            entry.to(title, {
                autoAlpha: 1,
                duration: isMobile ? 0.44 : 0.56,
                y: 0
            }, isMobile ? 0.12 : 0.16);
            if (lead) {
                entry.to(lead, {
                    autoAlpha: 1,
                    duration: isMobile ? 0.4 : 0.5,
                    y: 0
                }, isMobile ? 0.22 : 0.28);
            }
            if (action) {
                entry.to(action, {
                    autoAlpha: 1,
                    duration: isMobile ? 0.38 : 0.46,
                    scale: 1,
                    y: 0
                }, isMobile ? 0.32 : 0.4);
            }
            if (sheen) {
                entry.to(sheen, {
                    autoAlpha: 0.48,
                    duration: isMobile ? 0.38 : 0.5,
                    ease: 'power2.inOut',
                    xPercent: 190
                }, isMobile ? 0.5 : 0.64);
                entry.to(sheen, {
                    autoAlpha: 0,
                    duration: 0.18
                }, isMobile ? 0.72 : 0.94);
            }

            timeline = entry;
            return entry;
        }

        function play(isMobile) {
            var entry;

            if (isSectionOutsideViewport()) {
                finishImmediately();
                return;
            }
            if (shouldBypassEntry()) {
                bypassNextEntry = false;
                finishImmediately();
                return;
            }

            entry = prepareTimeline(isMobile);
            markEntering();
            entry.play(0);
        }

        function setup(isMobile) {
            var trigger;

            if (shouldBypassEntry()) {
                finishImmediately();
            } else {
                prepareTimeline(isMobile);
            }

            trigger = ScrollTrigger.create({
                id: isMobile ? 'aelan-final-cta-motion-mobile' : 'aelan-final-cta-motion',
                trigger: root,
                start: isMobile ? 'top 86%' : 'top 78%',
                end: 'bottom 22%',
                invalidateOnRefresh: true,
                onEnter: function () { play(isMobile); },
                onEnterBack: function () { play(isMobile); },
                onLeave: function () {
                    if (timeline) {
                        finishImmediately();
                    }
                },
                onLeaveBack: function () {
                    if (timeline) {
                        finishImmediately();
                    }
                },
                onRefresh: function (self) {
                    if (self.progress === 1 && timeline) {
                        finishImmediately();
                    }
                }
            });

            if (shouldBypassEntry()) {
                releaseDirectBypass();
            }

            return function () {
                trigger.kill();
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

        matchMedia = gsap.matchMedia();
        matchMedia.add('(min-width: 783px)', function () { return setup(false); });
        matchMedia.add('(max-width: 782px)', function () { return setup(true); });
        window.addEventListener('hashchange', onHashChange);
    }

    document.querySelectorAll('[data-aelan-final-cta]').forEach(init);
}());
