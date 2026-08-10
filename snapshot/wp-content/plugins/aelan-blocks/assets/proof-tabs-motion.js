(function () {
    'use strict';

    var HASH = '#aelan-bizonyitekok';

    function isDirectDestination() {
        return window.location.hash === HASH;
    }

    function init(root) {
        var gsap = window.gsap;
        var ScrollTrigger = window.ScrollTrigger;
        var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var bypassNextEntry = isDirectDestination();
        var current = null;
        var matchMedia;

        if (! gsap || ! ScrollTrigger || reducedMotion) {
            root.classList.add('is-aelan-proof-motion-complete');
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        function clearAnimated(elements) {
            if (! elements || ! elements.length) {
                return;
            }
            gsap.set(elements, { clearProps: 'opacity,visibility,transform,filter,willChange' });
        }

        function clearAllAnimated() {
            clearAnimated(Array.prototype.slice.call(root.querySelectorAll(
                '.aelan-proof-tabs__tab, ' +
                '.aelan-proof-tabs__accordion-trigger, ' +
                '.aelan-proof-tabs__focus-glow, ' +
                '.aelan-proof-tabs__media, ' +
                '.aelan-proof-tabs__content h2, ' +
                '.aelan-proof-tabs__description'
            )));
        }

        function finishImmediately() {
            if (current && current.timeline) {
                current.timeline.kill();
            }
            clearAllAnimated();
            root.classList.remove('is-aelan-proof-motion-entering');
            root.classList.add('is-aelan-proof-motion-complete');
            current = null;
        }

        function createTimeline(isMobile, controls) {
            var activePanel = root.querySelector('.aelan-proof-tabs__panel.is-active');
            var activeControl = controls.filter(function (control) {
                return control.classList.contains('is-active');
            })[0] || controls[0];
            var media = activePanel ? activePanel.querySelector('.aelan-proof-tabs__media') : null;
            var title = activePanel ? activePanel.querySelector('.aelan-proof-tabs__content h2') : null;
            var description = activePanel ? activePanel.querySelector('.aelan-proof-tabs__description') : null;
            var glow = root.querySelector('.aelan-proof-tabs__focus-glow');
            var elements = controls.concat([glow, media, title, description].filter(Boolean));
            var timeline;

            if (! activePanel) {
                return null;
            }

            if (current && current.timeline) {
                current.timeline.kill();
                clearAnimated(current.elements);
            }

            root.classList.add('is-aelan-proof-motion-entering');
            root.classList.remove('is-aelan-proof-motion-complete');

            gsap.set(controls, {
                autoAlpha: 0,
                y: isMobile ? 16 : 24,
                scale: isMobile ? 1 : 0.985
            });
            if (glow) {
                gsap.set(glow, { autoAlpha: 0, xPercent: -12, scale: 0.92 });
            }
            if (media) {
                gsap.set(media, {
                    autoAlpha: 0,
                    filter: isMobile ? 'none' : 'blur(6px)',
                    scale: isMobile ? 1 : 1.025,
                    y: isMobile ? 22 : 32
                });
            }
            if (title) {
                gsap.set(title, { autoAlpha: 0, y: isMobile ? 16 : 22 });
            }
            if (description) {
                gsap.set(description, { autoAlpha: 0, y: isMobile ? 14 : 18 });
            }

            timeline = gsap.timeline({
                paused: true,
                defaults: { ease: 'power2.out' },
                onComplete: function () {
                    clearAnimated(elements);
                    root.classList.remove('is-aelan-proof-motion-entering');
                    root.classList.add('is-aelan-proof-motion-complete');
                    current = null;
                }
            });

            if (glow) {
                timeline
                    .to(glow, {
                        autoAlpha: isMobile ? 0.22 : 0.32,
                        duration: isMobile ? 0.48 : 0.72,
                        ease: 'sine.inOut',
                        scale: 1,
                        xPercent: isMobile ? 54 : 72
                    }, 0)
                    .to(glow, {
                        autoAlpha: 0,
                        duration: isMobile ? 0.34 : 0.46,
                        ease: 'sine.out',
                        xPercent: isMobile ? 76 : 98
                    }, isMobile ? 0.42 : 0.68);
            }

            timeline.to(controls, {
                autoAlpha: 1,
                duration: isMobile ? 0.38 : 0.52,
                scale: 1,
                stagger: {
                    amount: isMobile ? 0.18 : 0.28,
                    ease: 'power1.inOut',
                    from: 'center'
                },
                y: 0
            }, isMobile ? 0.04 : 0.1);

            if (! isMobile && activeControl) {
                timeline
                    .to(activeControl, { duration: 0.16, ease: 'power1.out', scale: 1.018 }, 0.84)
                    .to(activeControl, { duration: 0.26, ease: 'power2.out', scale: 1 }, 1);
            }

            if (media) {
                timeline.to(media, {
                    autoAlpha: 1,
                    duration: isMobile ? 0.46 : 0.66,
                    filter: 'blur(0px)',
                    scale: 1,
                    y: 0
                }, isMobile ? 0.34 : 0.5);
            }
            if (title) {
                timeline.to(title, {
                    autoAlpha: 1,
                    duration: isMobile ? 0.42 : 0.56,
                    y: 0
                }, isMobile ? 0.47 : 0.64);
            }
            if (description) {
                timeline.to(description, {
                    autoAlpha: 1,
                    duration: isMobile ? 0.4 : 0.54,
                    y: 0
                }, isMobile ? 0.58 : 0.77);
            }

            current = { elements: elements, timeline: timeline };
            return timeline;
        }

        function setup(isMobile) {
            var controls = Array.prototype.slice.call(
                root.querySelectorAll(isMobile ? '.aelan-proof-tabs__accordion-trigger' : '.aelan-proof-tabs__tab')
            );
            var entryTrigger;

            function playEntry() {
                var timeline;

                if (bypassNextEntry) {
                    bypassNextEntry = false;
                    finishImmediately();
                    return;
                }

                timeline = createTimeline(isMobile, controls);
                if (timeline) {
                    timeline.play(0);
                }
            }

            if (! controls.length) {
                return undefined;
            }

            if (bypassNextEntry) {
                root.classList.add('is-aelan-proof-motion-complete');
            } else {
                createTimeline(isMobile, controls);
            }

            entryTrigger = ScrollTrigger.create({
                trigger: root,
                start: isMobile ? 'top 86%' : 'top 78%',
                end: 'bottom 22%',
                onEnter: playEntry,
                onEnterBack: playEntry
            });

            return function () {
                entryTrigger.kill();
                if (current && current.timeline) {
                    current.timeline.kill();
                }
                clearAllAnimated();
                root.classList.remove('is-aelan-proof-motion-entering');
                root.classList.add('is-aelan-proof-motion-complete');
                current = null;
            };
        }

        function onHashChange() {
            if (isDirectDestination()) {
                bypassNextEntry = true;
                finishImmediately();
            }
        }

        matchMedia = gsap.matchMedia();
        matchMedia.add('(min-width: 783px)', function () { return setup(false); });
        matchMedia.add('(max-width: 782px)', function () { return setup(true); });
        window.addEventListener('hashchange', onHashChange);
    }

    document.querySelectorAll('[data-aelan-proof-tabs]').forEach(init);
}());
