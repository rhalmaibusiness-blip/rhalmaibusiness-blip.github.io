(function () {
    'use strict';

    var HASH = '#aelan-method';

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
        var fastPassTimer = null;
        var desktopTimeline = null;
        var headerTimeline = null;
        var cardTimelines = [];
        var matchMedia;

        if (! gsap || ! ScrollTrigger || reducedMotion) {
            root.classList.add('is-aelan-method-motion-complete');
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        function toArray(selector, scope) {
            return Array.prototype.slice.call((scope || root).querySelectorAll(selector));
        }

        function headerElements() {
            return toArray(
                '.aelan-method__eyebrow, ' +
                '.aelan-method__title, ' +
                '.aelan-method__intro'
            );
        }

        function cardElements(card) {
            return toArray(
                '.aelan-method__lens, ' +
                '.aelan-method__card-heading, ' +
                '.aelan-method__rule, ' +
                '.aelan-method__description',
                card
            ).concat([card]);
        }

        function allAnimatedElements() {
            return headerElements().concat(toArray(
                '.aelan-method__card, ' +
                '.aelan-method__lens, ' +
                '.aelan-method__card-heading, ' +
                '.aelan-method__rule, ' +
                '.aelan-method__description'
            ));
        }

        function clearAnimated(elements) {
            if (! elements || ! elements.length) {
                return;
            }
            gsap.set(elements, {
                clearProps: 'opacity,visibility,transform,transformOrigin,willChange'
            });
        }

        function killTimeline(timeline) {
            if (timeline) {
                timeline.kill();
            }
        }

        function killAllTimelines() {
            killTimeline(desktopTimeline);
            killTimeline(headerTimeline);
            cardTimelines.forEach(killTimeline);
            desktopTimeline = null;
            headerTimeline = null;
            cardTimelines = [];
        }

        function markEntering() {
            root.classList.add('is-aelan-method-motion-entering');
            root.classList.remove('is-aelan-method-motion-complete');
        }

        function markComplete() {
            root.classList.remove('is-aelan-method-motion-entering');
            root.classList.add('is-aelan-method-motion-complete');
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
            var eyebrow = root.querySelector('.aelan-method__eyebrow');
            var title = root.querySelector('.aelan-method__title');
            var intro = root.querySelector('.aelan-method__intro');
            var cards = toArray('.aelan-method__card');
            var lenses = toArray('.aelan-method__lens');
            var headings = toArray('.aelan-method__card-heading');
            var rules = toArray('.aelan-method__rule');
            var descriptions = toArray('.aelan-method__description');
            var timeline;

            if (! title || ! cards.length) {
                finishImmediately();
                return null;
            }

            killAllTimelines();
            clearAnimated(allAnimatedElements());

            if (eyebrow) {
                gsap.set(eyebrow, { autoAlpha: 0, y: 18 });
            }
            gsap.set(title, { autoAlpha: 0, y: 28 });
            if (intro) {
                gsap.set(intro, { autoAlpha: 0, y: 20 });
            }
            gsap.set(cards, {
                autoAlpha: 0,
                scale: 0.985,
                x: function (index) { return index % 2 === 0 ? -18 : 18; },
                y: 24
            });
            gsap.set(lenses, { autoAlpha: 0.42, scale: 1.025, x: 18, y: 8 });
            gsap.set(headings, { autoAlpha: 0, y: 14 });
            gsap.set(rules, { autoAlpha: 0, scaleX: 0, transformOrigin: '0% 50%' });
            gsap.set(descriptions, { autoAlpha: 0, y: 14 });

            timeline = gsap.timeline({
                paused: true,
                defaults: { ease: 'power3.out' },
                onComplete: function () {
                    clearAnimated(allAnimatedElements());
                    desktopTimeline = null;
                    markComplete();
                }
            });

            if (eyebrow) {
                timeline.to(eyebrow, { autoAlpha: 1, duration: 0.38, y: 0 }, 0);
            }
            timeline.to(title, { autoAlpha: 1, duration: 0.54, y: 0 }, 0.08);
            if (intro) {
                timeline.to(intro, { autoAlpha: 1, duration: 0.5, y: 0 }, 0.18);
            }

            cards.forEach(function (card, index) {
                var start = 0.32 + (index * 0.11);
                var lens = lenses[index];
                var heading = headings[index];
                var rule = rules[index];
                var description = descriptions[index];

                timeline.to(card, {
                    autoAlpha: 1,
                    duration: 0.58,
                    scale: 1,
                    x: 0,
                    y: 0
                }, start);

                if (lens) {
                    timeline.to(lens, {
                        autoAlpha: 1,
                        duration: 0.66,
                        ease: 'sine.out',
                        scale: 1,
                        x: 0,
                        y: 0
                    }, start + 0.05);
                }
                if (heading) {
                    timeline.to(heading, {
                        autoAlpha: 1,
                        duration: 0.44,
                        y: 0
                    }, start + 0.13);
                }
                if (rule) {
                    timeline.to(rule, {
                        autoAlpha: 1,
                        duration: 0.4,
                        ease: 'power2.inOut',
                        scaleX: 1
                    }, start + 0.23);
                }
                if (description) {
                    timeline.to(description, {
                        autoAlpha: 1,
                        duration: 0.46,
                        y: 0
                    }, start + 0.28);
                }
            });

            desktopTimeline = timeline;
            return timeline;
        }

        function playDesktop() {
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

            timeline = prepareDesktopTimeline();
            if (timeline) {
                markEntering();
                timeline.play(0);
            }
        }

        function finishHeader() {
            killTimeline(headerTimeline);
            headerTimeline = null;
            clearAnimated(headerElements());
            settleMobileClass();
        }

        function settleMobileClass() {
            if (isSectionOutsideViewport()) {
                markComplete();
            }
        }

        function prepareMobileHeaderTimeline() {
            var eyebrow = root.querySelector('.aelan-method__eyebrow');
            var title = root.querySelector('.aelan-method__title');
            var intro = root.querySelector('.aelan-method__intro');
            var elements = [eyebrow, title, intro].filter(Boolean);
            var timeline;

            finishHeader();
            if (! title) {
                return null;
            }

            if (eyebrow) {
                gsap.set(eyebrow, { autoAlpha: 0, y: 12 });
            }
            gsap.set(title, { autoAlpha: 0, y: 18 });
            if (intro) {
                gsap.set(intro, { autoAlpha: 0, y: 14 });
            }

            timeline = gsap.timeline({
                paused: true,
                defaults: { ease: 'power3.out' },
                onComplete: function () {
                    clearAnimated(elements);
                    headerTimeline = null;
                    markComplete();
                }
            });
            if (eyebrow) {
                timeline.to(eyebrow, { autoAlpha: 1, duration: 0.3, y: 0 }, 0);
            }
            timeline.to(title, { autoAlpha: 1, duration: 0.42, y: 0 }, 0.05);
            if (intro) {
                timeline.to(intro, { autoAlpha: 1, duration: 0.38, y: 0 }, 0.13);
            }

            headerTimeline = timeline;
            return timeline;
        }

        function playMobileHeader() {
            var timeline;

            if (isSectionOutsideViewport()) {
                finishHeader();
                markComplete();
                return;
            }
            if (shouldBypassEntry()) {
                finishHeader();
                clearAnimated(headerElements());
                return;
            }

            timeline = prepareMobileHeaderTimeline();
            if (timeline) {
                markEntering();
                timeline.play(0);
            }
        }

        function finishCard(card, index) {
            killTimeline(cardTimelines[index]);
            cardTimelines[index] = null;
            clearAnimated(cardElements(card));
            settleMobileClass();
        }

        function prepareMobileCardTimeline(card, index) {
            var lens = card.querySelector('.aelan-method__lens');
            var heading = card.querySelector('.aelan-method__card-heading');
            var rule = card.querySelector('.aelan-method__rule');
            var description = card.querySelector('.aelan-method__description');
            var elements = cardElements(card);
            var timeline;

            finishCard(card, index);
            gsap.set(card, { autoAlpha: 0, scale: 0.992, y: 16 });
            if (lens) {
                gsap.set(lens, { autoAlpha: 0.46, scale: 1.018, y: 10 });
            }
            if (heading) {
                gsap.set(heading, { autoAlpha: 0, y: 10 });
            }
            if (rule) {
                gsap.set(rule, { autoAlpha: 0, scaleX: 0, transformOrigin: '0% 50%' });
            }
            if (description) {
                gsap.set(description, { autoAlpha: 0, y: 10 });
            }

            timeline = gsap.timeline({
                paused: true,
                defaults: { ease: 'power3.out' },
                onComplete: function () {
                    clearAnimated(elements);
                    cardTimelines[index] = null;
                    markComplete();
                }
            });
            timeline.to(card, {
                autoAlpha: 1,
                duration: 0.4,
                scale: 1,
                y: 0
            }, 0);
            if (lens) {
                timeline.to(lens, {
                    autoAlpha: 1,
                    duration: 0.5,
                    ease: 'sine.out',
                    scale: 1,
                    y: 0
                }, 0.03);
            }
            if (heading) {
                timeline.to(heading, { autoAlpha: 1, duration: 0.34, y: 0 }, 0.09);
            }
            if (rule) {
                timeline.to(rule, {
                    autoAlpha: 1,
                    duration: 0.32,
                    ease: 'power2.inOut',
                    scaleX: 1
                }, 0.17);
            }
            if (description) {
                timeline.to(description, { autoAlpha: 1, duration: 0.36, y: 0 }, 0.2);
            }

            cardTimelines[index] = timeline;
            return timeline;
        }

        function playMobileCard(card, index) {
            var timeline;

            if (isSectionOutsideViewport()) {
                finishCard(card, index);
                markComplete();
                return;
            }
            if (shouldBypassEntry()) {
                finishCard(card, index);
                return;
            }

            timeline = prepareMobileCardTimeline(card, index);
            markEntering();
            timeline.play(0);
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

        function setupDesktop() {
            var entryTrigger;

            if (shouldBypassEntry()) {
                finishImmediately();
            } else {
                prepareDesktopTimeline();
            }

            entryTrigger = ScrollTrigger.create({
                id: 'aelan-method-motion',
                trigger: root,
                start: 'top 78%',
                end: 'bottom 22%',
                invalidateOnRefresh: true,
                onEnter: playDesktop,
                onEnterBack: playDesktop,
                onLeave: function () {
                    if (desktopTimeline) {
                        finishImmediately();
                    }
                },
                onLeaveBack: function () {
                    if (desktopTimeline) {
                        finishImmediately();
                    }
                },
                onRefresh: function (self) {
                    if (self.progress === 1 && desktopTimeline) {
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

        function setupMobile() {
            var cards = toArray('.aelan-method__card');
            var triggers = [];
            var headerTrigger;
            var sectionSafetyTrigger;

            cardTimelines = new Array(cards.length);
            if (shouldBypassEntry()) {
                finishImmediately();
            } else {
                prepareMobileHeaderTimeline();
                cards.forEach(prepareMobileCardTimeline);
            }

            sectionSafetyTrigger = ScrollTrigger.create({
                id: 'aelan-method-motion-safety',
                trigger: root,
                start: 'top bottom',
                end: 'bottom top',
                invalidateOnRefresh: true,
                onLeave: finishAfterFastPass,
                onLeaveBack: finishAfterFastPass,
                onRefresh: function (self) {
                    if (self.progress === 1) {
                        finishAfterFastPass();
                    }
                }
            });
            triggers.push(sectionSafetyTrigger);

            headerTrigger = ScrollTrigger.create({
                id: 'aelan-method-motion-header',
                trigger: root.querySelector('.aelan-method__header') || root,
                start: 'top 86%',
                end: 'bottom 20%',
                invalidateOnRefresh: true,
                onEnter: playMobileHeader,
                onEnterBack: playMobileHeader,
                onLeave: function () {
                    if (headerTimeline) {
                        finishHeader();
                    }
                },
                onLeaveBack: function () {
                    if (headerTimeline) {
                        finishHeader();
                    }
                },
                onRefresh: function (self) {
                    if (self.progress === 1 && headerTimeline) {
                        finishHeader();
                    }
                }
            });
            triggers.push(headerTrigger);

            cards.forEach(function (card, index) {
                triggers.push(ScrollTrigger.create({
                    id: 'aelan-method-motion-card-' + index,
                    trigger: card,
                    start: 'top 88%',
                    end: 'bottom 12%',
                    invalidateOnRefresh: true,
                    onEnter: function () { playMobileCard(card, index); },
                    onEnterBack: function () { playMobileCard(card, index); },
                    onLeave: function () {
                        if (cardTimelines[index]) {
                            finishCard(card, index);
                        }
                    },
                    onLeaveBack: function () {
                        if (cardTimelines[index]) {
                            finishCard(card, index);
                        }
                    },
                    onRefresh: function (self) {
                        if (self.progress === 1 && cardTimelines[index]) {
                            finishCard(card, index);
                        }
                    }
                }));
            });

            if (shouldBypassEntry()) {
                releaseDirectBypass();
            }

            return function () {
                triggers.forEach(function (trigger) { trigger.kill(); });
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
        matchMedia.add('(min-width: 783px)', setupDesktop);
        matchMedia.add('(max-width: 782px)', setupMobile);
        window.addEventListener('hashchange', onHashChange);
    }

    document.querySelectorAll('[data-aelan-method]').forEach(init);
}());
