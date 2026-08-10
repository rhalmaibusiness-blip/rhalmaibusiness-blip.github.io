(function () {
    'use strict';

    var HASH = '#aelan-kredo';

    function isDirectDestination() {
        return window.location.hash === HASH;
    }

    function init(root) {
        var gsap = window.gsap;
        var ScrollTrigger = window.ScrollTrigger;
        var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        var panel = root.querySelector('[data-aelan-credo-panel]');
        var orb = root.querySelector('[data-aelan-credo-orb]');
        var bubble = root.querySelector('.aelan-credo__bubble-image');
        var statement = root.querySelector('[data-aelan-credo-statement]');
        var emphasis = root.querySelector('[data-aelan-credo-emphasis]');
        var bypassNextEntry = isDirectDestination();
        var directLockUntil = bypassNextEntry ? Date.now() + 1800 : 0;
        var bypassTimer = null;
        var entryTimeline = null;
        var ambientTween = null;
        var driftTween = null;
        var interactionReady = false;
        var orbX;
        var orbY;
        var matchMedia;

        if (! panel || ! orb || ! bubble) {
            return;
        }

        if (! gsap || ! ScrollTrigger || reducedMotion) {
            root.classList.add('is-aelan-credo-motion-complete');
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        if (finePointer) {
            orbX = gsap.quickTo(orb, 'x', { duration: 0.85, ease: 'power3.out' });
            orbY = gsap.quickTo(orb, 'y', { duration: 0.85, ease: 'power3.out' });

            panel.addEventListener('pointermove', function (event) {
                var rect;
                var x;
                var y;

                if (! interactionReady) {
                    return;
                }

                rect = panel.getBoundingClientRect();
                x = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
                y = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2));
                orbX(x * 12);
                orbY(y * 7);
            });

            panel.addEventListener('pointerleave', function () {
                if (! interactionReady) {
                    return;
                }
                orbX(0);
                orbY(0);
            });
        }

        function animatedElements() {
            return [panel, bubble, statement, emphasis].filter(Boolean);
        }

        function clearAnimated() {
            gsap.set(animatedElements(), {
                clearProps: 'opacity,visibility,transform,transformOrigin,willChange'
            });
        }

        function stopAmbient() {
            interactionReady = false;
            if (ambientTween) {
                ambientTween.kill();
                ambientTween = null;
            }
            if (driftTween) {
                driftTween.kill();
                driftTween = null;
            }
            if (finePointer && orbX && orbY) {
                orbX(0);
                orbY(0);
            } else {
                gsap.set(orb, { x: 0, y: 0 });
            }
        }

        function startAmbient() {
            stopAmbient();
            interactionReady = true;
            ambientTween = gsap.to(bubble, {
                duration: finePointer ? 5.8 : 7.4,
                ease: 'sine.inOut',
                repeat: -1,
                scale: 1.012,
                yoyo: true
            });

            if (! finePointer) {
                driftTween = gsap.to(orb, {
                    duration: 8.5,
                    ease: 'sine.inOut',
                    repeat: -1,
                    x: 4,
                    y: -3,
                    yoyo: true
                });
            }
        }

        function markEntering() {
            root.classList.add('is-aelan-credo-motion-entering');
            root.classList.remove('is-aelan-credo-motion-complete');
        }

        function markComplete() {
            root.classList.remove('is-aelan-credo-motion-entering');
            root.classList.add('is-aelan-credo-motion-complete');
        }

        function killEntry() {
            if (entryTimeline) {
                entryTimeline.kill();
                entryTimeline = null;
            }
        }

        function isSectionOutsideViewport() {
            var rect = root.getBoundingClientRect();

            return rect.bottom <= 0 || rect.top >= window.innerHeight;
        }

        function finishImmediately() {
            killEntry();
            stopAmbient();
            clearAnimated();
            markComplete();
            startAmbient();
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
            var timeline;

            killEntry();
            stopAmbient();
            clearAnimated();
            gsap.set(panel, {
                autoAlpha: 0,
                scale: isMobile ? 0.997 : 0.994,
                y: isMobile ? 14 : 20
            });
            gsap.set(bubble, { autoAlpha: 0.2, scale: isMobile ? 1.025 : 1.04 });
            if (statement) {
                gsap.set(statement, { autoAlpha: 0, y: isMobile ? 10 : 16 });
            }
            if (emphasis) {
                gsap.set(emphasis, { autoAlpha: 0, y: isMobile ? 12 : 20 });
            }

            timeline = gsap.timeline({
                paused: true,
                defaults: { ease: 'power3.out' },
                onComplete: function () {
                    entryTimeline = null;
                    clearAnimated();
                    markComplete();
                    startAmbient();
                }
            });
            timeline.to(panel, {
                autoAlpha: 1,
                duration: isMobile ? 0.48 : 0.62,
                scale: 1,
                y: 0
            }, 0);
            timeline.to(bubble, {
                autoAlpha: 1,
                duration: isMobile ? 0.68 : 0.88,
                ease: 'power2.inOut',
                scale: 1
            }, 0.05);
            if (statement) {
                timeline.to(statement, {
                    autoAlpha: 1,
                    duration: isMobile ? 0.38 : 0.48,
                    y: 0
                }, isMobile ? 0.16 : 0.2);
            }
            if (emphasis) {
                timeline.to(emphasis, {
                    autoAlpha: 1,
                    duration: isMobile ? 0.46 : 0.58,
                    y: 0
                }, isMobile ? 0.28 : 0.36);
            }

            entryTimeline = timeline;
            return timeline;
        }

        function play(isMobile) {
            var timeline;

            if (isSectionOutsideViewport()) {
                finishImmediately();
                return;
            }
            if (shouldBypassEntry()) {
                bypassNextEntry = false;
                finishImmediately();
                return;
            }

            timeline = prepareTimeline(isMobile);
            markEntering();
            timeline.play(0);
        }

        function setup(isMobile) {
            var trigger;

            if (shouldBypassEntry()) {
                finishImmediately();
            } else {
                prepareTimeline(isMobile);
            }

            trigger = ScrollTrigger.create({
                id: isMobile ? 'aelan-credo-motion-mobile' : 'aelan-credo-motion',
                trigger: root,
                start: isMobile ? 'top 86%' : 'top 78%',
                end: 'bottom 22%',
                invalidateOnRefresh: true,
                onEnter: function () { play(isMobile); },
                onEnterBack: function () { play(isMobile); },
                onLeave: function () {
                    if (entryTimeline) {
                        finishImmediately();
                    }
                },
                onLeaveBack: function () {
                    if (entryTimeline) {
                        finishImmediately();
                    }
                },
                onRefresh: function (self) {
                    if (self.progress === 1 && entryTimeline) {
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

    document.querySelectorAll('[data-aelan-credo]').forEach(init);
}());
