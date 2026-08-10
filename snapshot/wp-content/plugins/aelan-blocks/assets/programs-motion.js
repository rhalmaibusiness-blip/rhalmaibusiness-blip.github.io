(function () {
    'use strict';

    var DIRECT_HASHES = [
        '#szolgaltatasok',
        '#medical-programok',
        '#beauty-programok',
        '#longevity-programok',
        '#longevity-kezelesek',
        '#supplement-shop'
    ];

    function isDirectDestination() {
        return DIRECT_HASHES.indexOf(window.location.hash) !== -1;
    }

    function init(root) {
        var gsap = window.gsap;
        var ScrollTrigger = window.ScrollTrigger;
        var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var directVisit = isDirectDestination();
        var desktopTimeline = null;
        var mobileTimelines = [];
        var fastPassTimer = null;
        var matchMedia;

        if (! gsap || ! ScrollTrigger || reducedMotion) {
            root.classList.add('is-aelan-programs-motion-complete');
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        function toArray(selector, scope) {
            return Array.prototype.slice.call((scope || root).querySelectorAll(selector));
        }

        function activePanel() {
            return root.querySelector('.aelan-programs__panel.is-active');
        }

        function visibleMembrane(panel) {
            var selector = window.matchMedia('(max-width: 1160px)').matches ?
                '.aelan-programs__membrane--mobile' :
                '.aelan-programs__membrane--desktop';

            return panel ? panel.querySelector(selector) : null;
        }

        function panelElements(panel) {
            if (! panel) {
                return [];
            }

            return toArray(
                '.aelan-programs__accordion-trigger, ' +
                '.aelan-programs__accordion-trigger .aelan-programs__icon, ' +
                '.aelan-programs__content h2, ' +
                '.aelan-programs__description, ' +
                '.aelan-programs__cta, ' +
                '.aelan-programs__media-clip, ' +
                '.aelan-programs__membrane path',
                panel
            );
        }

        function allAnimatedElements() {
            return toArray(
                '.aelan-programs__frame, ' +
                '.aelan-programs__tab, ' +
                '.aelan-programs__tab .aelan-programs__icon, ' +
                '.aelan-programs__accordion-trigger, ' +
                '.aelan-programs__accordion-trigger .aelan-programs__icon, ' +
                '.aelan-programs__content h2, ' +
                '.aelan-programs__description, ' +
                '.aelan-programs__cta, ' +
                '.aelan-programs__media-clip, ' +
                '.aelan-programs__membrane path'
            );
        }

        function clearAnimated(elements) {
            if (! elements || ! elements.length) {
                return;
            }

            gsap.set(elements, {
                clearProps: 'opacity,visibility,transform,transformOrigin,willChange,strokeDasharray,strokeDashoffset'
            });
        }

        function killTimeline(timeline) {
            if (timeline) {
                timeline.kill();
            }
        }

        function killAllTimelines() {
            killTimeline(desktopTimeline);
            mobileTimelines.forEach(killTimeline);
            desktopTimeline = null;
            mobileTimelines = [];
        }

        function markEntering() {
            root.classList.add('is-aelan-programs-motion-entering');
            root.classList.remove('is-aelan-programs-motion-complete');
        }

        function markComplete() {
            root.classList.remove('is-aelan-programs-motion-entering');
            root.classList.add('is-aelan-programs-motion-complete');
        }

        function isSectionOutsideViewport() {
            var rect = root.getBoundingClientRect();

            return rect.bottom <= 0 || rect.top >= window.innerHeight;
        }

        function finishImmediately() {
            killAllTimelines();
            clearAnimated(allAnimatedElements());
            markComplete();
        }

        function finishAfterFastPass() {
            finishImmediately();
            window.requestAnimationFrame(function () {
                if (isSectionOutsideViewport()) {
                    finishImmediately();
                }
            });
            window.clearTimeout(fastPassTimer);
            fastPassTimer = window.setTimeout(function () {
                fastPassTimer = null;
                if (isSectionOutsideViewport()) {
                    finishImmediately();
                }
            }, 120);
        }

        function prepareDesktopTimeline() {
            var frame = root.querySelector('.aelan-programs__frame');
            var tabs = toArray('.aelan-programs__tab');
            var icons = toArray('.aelan-programs__tab .aelan-programs__icon');
            var panel = activePanel();
            var title = panel ? panel.querySelector('.aelan-programs__content h2') : null;
            var description = panel ? panel.querySelector('.aelan-programs__description') : null;
            var cta = panel ? panel.querySelector('.aelan-programs__cta') : null;
            var media = panel ? panel.querySelector('.aelan-programs__media-clip') : null;
            var membrane = visibleMembrane(panel);
            var glow = membrane ? membrane.querySelector('.aelan-programs__membrane-glow') : null;
            var line = membrane ? membrane.querySelector('.aelan-programs__membrane-line') : null;
            var timeline;

            if (! frame || ! tabs.length || ! panel) {
                finishImmediately();
                return null;
            }

            killAllTimelines();
            clearAnimated(allAnimatedElements());

            gsap.set(frame, { autoAlpha: 0, scale: 0.992, y: 24 });
            gsap.set(tabs, { autoAlpha: 0, scale: 0.992, y: 16 });
            gsap.set(icons, { autoAlpha: 0.38, scale: 0.86 });
            if (title) {
                gsap.set(title, { autoAlpha: 0, y: 24 });
            }
            if (description) {
                gsap.set(description, { autoAlpha: 0, y: 18 });
            }
            if (cta) {
                gsap.set(cta, { autoAlpha: 0, scale: 0.98, y: 14 });
            }
            if (media) {
                gsap.set(media, {
                    autoAlpha: 0,
                    scale: 1.025,
                    transformOrigin: '50% 50%',
                    x: 32
                });
            }
            if (line) {
                gsap.set(line, { opacity: 0, strokeDasharray: '1 1', strokeDashoffset: 1 });
            }
            if (glow) {
                gsap.set(glow, { opacity: 0, strokeDasharray: '1 1', strokeDashoffset: 1 });
            }

            timeline = gsap.timeline({
                paused: true,
                defaults: { ease: 'power3.out' },
                onComplete: function () {
                    clearAnimated(allAnimatedElements());
                    desktopTimeline = null;
                    markComplete();
                }
            });

            timeline.to(frame, {
                autoAlpha: 1,
                duration: 0.5,
                scale: 1,
                y: 0
            }, 0);

            tabs.forEach(function (tab, index) {
                var start = 0.1 + (index * 0.075);
                var icon = icons[index];

                timeline.to(tab, {
                    autoAlpha: 1,
                    duration: 0.44,
                    scale: 1,
                    y: 0
                }, start);

                if (icon) {
                    timeline.to(icon, {
                        autoAlpha: 1,
                        duration: 0.42,
                        scale: 1
                    }, start + 0.05);
                }
            });

            if (title) {
                timeline.to(title, { autoAlpha: 1, duration: 0.52, y: 0 }, 0.42);
            }
            if (description) {
                timeline.to(description, { autoAlpha: 1, duration: 0.52, y: 0 }, 0.54);
            }
            if (cta) {
                timeline.to(cta, {
                    autoAlpha: 1,
                    duration: 0.48,
                    scale: 1,
                    y: 0
                }, 0.66);
            }
            if (media) {
                timeline.to(media, {
                    autoAlpha: 1,
                    duration: 0.82,
                    ease: 'sine.out',
                    scale: 1,
                    x: 0
                }, 0.4);
            }
            if (line) {
                timeline.to(line, {
                    duration: 0.78,
                    ease: 'power2.inOut',
                    opacity: 0.72,
                    strokeDashoffset: 0
                }, 0.5);
            }
            if (glow) {
                timeline.to(glow, {
                    duration: 0.8,
                    ease: 'power2.inOut',
                    opacity: 0.16,
                    strokeDashoffset: 0
                }, 0.62);
            }

            desktopTimeline = timeline;
            return timeline;
        }

        function playDesktop() {
            var timeline;

            if (isSectionOutsideViewport() || directVisit) {
                finishImmediately();
                return;
            }

            timeline = prepareDesktopTimeline();
            if (timeline) {
                markEntering();
                timeline.play(0);
            }
        }

        function mobileMotionComplete() {
            return ! mobileTimelines.some(function (timeline) { return Boolean(timeline); });
        }

        function finishMobilePanel(panel, index) {
            killTimeline(mobileTimelines[index]);
            mobileTimelines[index] = null;
            clearAnimated(panelElements(panel));
            if (mobileMotionComplete()) {
                markComplete();
            }
        }

        function playMobilePanel(panel, index) {
            var trigger = panel.querySelector('.aelan-programs__accordion-trigger');
            var icon = trigger ? trigger.querySelector('.aelan-programs__icon') : null;
            var body = panel.querySelector('.aelan-programs__body');
            var isOpen = Boolean(body && ! body.hidden && panel.classList.contains('is-active'));
            var title = isOpen ? panel.querySelector('.aelan-programs__content h2') : null;
            var description = isOpen ? panel.querySelector('.aelan-programs__description') : null;
            var cta = isOpen ? panel.querySelector('.aelan-programs__cta') : null;
            var media = isOpen ? panel.querySelector('.aelan-programs__media-clip') : null;
            var membrane = isOpen ? visibleMembrane(panel) : null;
            var glow = membrane ? membrane.querySelector('.aelan-programs__membrane-glow') : null;
            var line = membrane ? membrane.querySelector('.aelan-programs__membrane-line') : null;
            var timeline;

            if (! trigger || directVisit || isSectionOutsideViewport()) {
                finishMobilePanel(panel, index);
                return;
            }

            finishMobilePanel(panel, index);
            gsap.set(trigger, { autoAlpha: 0, scale: 0.992, y: 16 });
            if (icon) {
                gsap.set(icon, { autoAlpha: 0.4, scale: 0.86 });
            }
            if (title) {
                gsap.set(title, { autoAlpha: 0, y: 16 });
            }
            if (description) {
                gsap.set(description, { autoAlpha: 0, y: 14 });
            }
            if (cta) {
                gsap.set(cta, { autoAlpha: 0, scale: 0.985, y: 12 });
            }
            if (media) {
                gsap.set(media, { autoAlpha: 0, scale: 1.018, transformOrigin: '50% 50%' });
            }
            if (line) {
                gsap.set(line, { opacity: 0, strokeDasharray: '1 1', strokeDashoffset: 1 });
            }
            if (glow) {
                gsap.set(glow, { opacity: 0, strokeDasharray: '1 1', strokeDashoffset: 1 });
            }

            timeline = gsap.timeline({
                paused: true,
                defaults: { ease: 'power3.out' },
                onComplete: function () {
                    mobileTimelines[index] = null;
                    clearAnimated(panelElements(panel));
                    if (mobileMotionComplete()) {
                        markComplete();
                    }
                }
            });

            timeline.to(trigger, {
                autoAlpha: 1,
                duration: 0.42,
                scale: 1,
                y: 0
            }, 0);
            if (icon) {
                timeline.to(icon, { autoAlpha: 1, duration: 0.4, scale: 1 }, 0.05);
            }
            if (title) {
                timeline.to(title, { autoAlpha: 1, duration: 0.42, y: 0 }, 0.12);
            }
            if (description) {
                timeline.to(description, { autoAlpha: 1, duration: 0.42, y: 0 }, 0.22);
            }
            if (cta) {
                timeline.to(cta, {
                    autoAlpha: 1,
                    duration: 0.4,
                    scale: 1,
                    y: 0
                }, 0.34);
            }
            if (media) {
                timeline.to(media, {
                    autoAlpha: 1,
                    duration: 0.64,
                    ease: 'sine.out',
                    scale: 1
                }, 0.16);
            }
            if (line) {
                timeline.to(line, {
                    duration: 0.56,
                    ease: 'power2.inOut',
                    opacity: 0.68,
                    strokeDashoffset: 0
                }, 0.2);
            }
            if (glow) {
                timeline.to(glow, {
                    duration: 0.5,
                    ease: 'power2.inOut',
                    opacity: 0.14,
                    strokeDashoffset: 0
                }, 0.3);
            }

            mobileTimelines[index] = timeline;
            markEntering();
            timeline.play(0);
        }

        function createSafetyTrigger() {
            return ScrollTrigger.create({
                id: 'aelan-programs-motion-safety',
                trigger: root,
                start: 'top bottom',
                end: 'bottom top',
                invalidateOnRefresh: true,
                onLeave: function () {
                    directVisit = false;
                    finishAfterFastPass();
                },
                onLeaveBack: function () {
                    directVisit = false;
                    finishAfterFastPass();
                },
                onRefresh: function () {
                    if (isSectionOutsideViewport()) {
                        finishImmediately();
                    }
                }
            });
        }

        function setupDesktop() {
            var triggers = [createSafetyTrigger()];

            finishImmediately();
            triggers.push(ScrollTrigger.create({
                id: 'aelan-programs-motion-desktop',
                trigger: root,
                start: 'top 78%',
                end: 'bottom 12%',
                invalidateOnRefresh: true,
                onEnter: playDesktop,
                onEnterBack: playDesktop,
                onLeave: function () {
                    if (desktopTimeline) {
                        finishAfterFastPass();
                    }
                },
                onLeaveBack: function () {
                    if (desktopTimeline) {
                        finishAfterFastPass();
                    }
                },
                onRefresh: function () {
                    if (isSectionOutsideViewport() && desktopTimeline) {
                        finishAfterFastPass();
                    }
                }
            }));

            return function () {
                triggers.forEach(function (trigger) { trigger.kill(); });
                finishImmediately();
            };
        }

        function setupMobile() {
            var panels = toArray('.aelan-programs__panel');
            var triggers = [createSafetyTrigger()];

            finishImmediately();
            mobileTimelines = new Array(panels.length);
            panels.forEach(function (panel, index) {
                triggers.push(ScrollTrigger.create({
                    id: 'aelan-programs-motion-mobile-' + index,
                    trigger: panel.querySelector('.aelan-programs__accordion-trigger') || panel,
                    start: 'top 88%',
                    end: 'bottom 12%',
                    invalidateOnRefresh: true,
                    onEnter: function () { playMobilePanel(panel, index); },
                    onEnterBack: function () { playMobilePanel(panel, index); },
                    onLeave: function () {
                        if (mobileTimelines[index]) {
                            finishMobilePanel(panel, index);
                        }
                    },
                    onLeaveBack: function () {
                        if (mobileTimelines[index]) {
                            finishMobilePanel(panel, index);
                        }
                    },
                    onRefresh: function (self) {
                        if (self.progress === 1 && mobileTimelines[index]) {
                            finishMobilePanel(panel, index);
                        }
                    }
                }));
            });

            return function () {
                triggers.forEach(function (trigger) { trigger.kill(); });
                finishImmediately();
            };
        }

        function onHashChange() {
            if (isDirectDestination()) {
                directVisit = true;
                finishImmediately();
            }
        }

        function onProgramInteraction(event) {
            var target = event.target.closest ? event.target.closest(
                '.aelan-programs__tab, .aelan-programs__accordion-trigger'
            ) : null;

            if (target && root.classList.contains('is-aelan-programs-motion-entering')) {
                finishImmediately();
            }
        }

        matchMedia = gsap.matchMedia();
        matchMedia.add('(min-width: 783px)', setupDesktop);
        matchMedia.add('(max-width: 782px)', setupMobile);
        window.addEventListener('hashchange', onHashChange);
        root.addEventListener('click', onProgramInteraction);
    }

    document.querySelectorAll('[data-aelan-programs]').forEach(init);
}());
