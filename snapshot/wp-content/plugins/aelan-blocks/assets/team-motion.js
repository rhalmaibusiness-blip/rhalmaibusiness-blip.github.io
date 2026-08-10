(function () {
    'use strict';

    var HASH = '#csapatunk';

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
            root.classList.add('is-aelan-team-motion-complete');
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        function toArray(selector, scope) {
            return Array.prototype.slice.call((scope || root).querySelectorAll(selector));
        }

        function headerElements() {
            return toArray(
                '.aelan-team__intro > .aelan-eyebrow, ' +
                '.aelan-team__intro > h2, ' +
                '.aelan-team__lead, ' +
                '.aelan-team__cta'
            );
        }

        function cardElements(card) {
            return [card]
                .concat(toArray(
                    '.aelan-person-card__image, ' +
                    '.aelan-person-card__meta, ' +
                    '.aelan-person-card__meta-line, ' +
                    '.aelan-person-card__meta h3, ' +
                    '.aelan-person-card__meta p, ' +
                    '.aelan-person-card__meta a',
                    card
                ));
        }

        function allAnimatedElements() {
            var elements = headerElements();
            var horizon = root.querySelector('.aelan-team__horizon');

            if (horizon) {
                elements.push(horizon);
            }
            toArray('.aelan-person-card').forEach(function (card) {
                elements = elements.concat(cardElements(card));
            });

            return elements;
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
            root.classList.add('is-aelan-team-motion-entering');
            root.classList.remove('is-aelan-team-motion-complete');
        }

        function hasActiveTimeline() {
            return Boolean(desktopTimeline || headerTimeline || cardTimelines.some(Boolean));
        }

        function markCompleteIfIdle() {
            if (! hasActiveTimeline()) {
                root.classList.remove('is-aelan-team-motion-entering');
                root.classList.add('is-aelan-team-motion-complete');
            }
        }

        function markComplete() {
            root.classList.remove('is-aelan-team-motion-entering');
            root.classList.add('is-aelan-team-motion-complete');
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

        function setHeaderStart(isMobile) {
            var eyebrow = root.querySelector('.aelan-team__intro > .aelan-eyebrow');
            var title = root.querySelector('.aelan-team__intro > h2');
            var lead = root.querySelector('.aelan-team__lead');
            var cta = root.querySelector('.aelan-team__cta');

            if (eyebrow) {
                gsap.set(eyebrow, { autoAlpha: 0, y: isMobile ? 12 : 20 });
            }
            if (title) {
                gsap.set(title, { autoAlpha: 0, y: isMobile ? 18 : 24 });
            }
            if (lead) {
                gsap.set(lead, { autoAlpha: 0, y: isMobile ? 14 : 22 });
            }
            if (cta) {
                gsap.set(cta, { autoAlpha: 0, scale: 0.985, y: isMobile ? 12 : 20 });
            }

            return {
                eyebrow: eyebrow,
                title: title,
                lead: lead,
                cta: cta
            };
        }

        function addHeaderTweens(timeline, elements, isMobile) {
            if (elements.eyebrow) {
                timeline.to(elements.eyebrow, {
                    autoAlpha: 1,
                    duration: isMobile ? 0.28 : 0.34,
                    y: 0
                }, 0);
            }
            if (elements.title) {
                timeline.to(elements.title, {
                    autoAlpha: 1,
                    duration: isMobile ? 0.42 : 0.54,
                    y: 0
                }, 0.06);
            }
            if (elements.lead) {
                timeline.to(elements.lead, {
                    autoAlpha: 1,
                    duration: isMobile ? 0.38 : 0.48,
                    y: 0
                }, 0.15);
            }
            if (elements.cta) {
                timeline.to(elements.cta, {
                    autoAlpha: 1,
                    duration: isMobile ? 0.36 : 0.44,
                    scale: 1,
                    y: 0
                }, 0.24);
            }
        }

        function setCardStart(card, index, isMobile) {
            var image = card.querySelector('.aelan-person-card__image');
            var meta = card.querySelector('.aelan-person-card__meta');
            var line = card.querySelector('.aelan-person-card__meta-line');
            var copy = toArray(
                '.aelan-person-card__meta h3, ' +
                '.aelan-person-card__meta p, ' +
                '.aelan-person-card__meta a',
                card
            );

            gsap.set(card, {
                autoAlpha: 0,
                scale: isMobile ? 0.992 : 0.988,
                x: isMobile ? 0 : (index % 2 === 0 ? -24 : 24),
                y: isMobile ? 16 : 28
            });
            if (image) {
                gsap.set(image, { autoAlpha: 0, scale: isMobile ? 1.05 : 1.06, y: isMobile ? 10 : 16 });
            }
            if (meta) {
                gsap.set(meta, { autoAlpha: 0, y: isMobile ? 12 : 16 });
            }
            if (line) {
                gsap.set(line, { autoAlpha: 0, scaleX: 0, transformOrigin: '0% 50%' });
            }
            if (copy.length) {
                gsap.set(copy, { autoAlpha: 0, y: isMobile ? 9 : 12 });
            }

            return {
                image: image,
                meta: meta,
                line: line,
                copy: copy
            };
        }

        function addCardTweens(timeline, card, elements, start, isMobile) {
            timeline.to(card, {
                autoAlpha: 1,
                duration: isMobile ? 0.4 : 0.62,
                scale: 1,
                x: 0,
                y: 0
            }, start);
            if (elements.image) {
                timeline.to(elements.image, {
                    autoAlpha: 1,
                    duration: isMobile ? 0.5 : 0.72,
                    ease: 'sine.out',
                    scale: 1.035,
                    y: 0
                }, start + 0.05);
            }
            if (elements.meta) {
                timeline.to(elements.meta, {
                    autoAlpha: 1,
                    duration: isMobile ? 0.38 : 0.52,
                    y: 0
                }, start + 0.16);
            }
            if (elements.line) {
                timeline.to(elements.line, {
                    autoAlpha: 0.7,
                    duration: isMobile ? 0.3 : 0.4,
                    ease: 'power2.inOut',
                    scaleX: 1
                }, start + 0.22);
            }
            if (elements.copy.length) {
                timeline.to(elements.copy, {
                    autoAlpha: 1,
                    duration: isMobile ? 0.32 : 0.4,
                    stagger: isMobile ? 0.045 : 0.06,
                    y: 0
                }, start + 0.27);
            }
        }

        function prepareDesktopTimeline() {
            var horizon = root.querySelector('.aelan-team__horizon');
            var cards = toArray('.aelan-person-card');
            var cardStates = [];
            var header;
            var timeline;

            if (! cards.length || ! root.querySelector('.aelan-team__intro > h2')) {
                finishImmediately();
                return null;
            }

            killAllTimelines();
            clearAnimated(allAnimatedElements());
            header = setHeaderStart(false);
            if (horizon) {
                gsap.set(horizon, { autoAlpha: 0.1, scaleX: 0.18, transformOrigin: '50% 50%' });
            }
            cards.forEach(function (card, index) {
                cardStates[index] = setCardStart(card, index, false);
            });

            timeline = gsap.timeline({
                paused: true,
                defaults: { ease: 'power3.out' },
                onComplete: function () {
                    desktopTimeline = null;
                    clearAnimated(allAnimatedElements());
                    markCompleteIfIdle();
                }
            });

            addHeaderTweens(timeline, header, false);
            if (horizon) {
                timeline.to(horizon, {
                    autoAlpha: 0.62,
                    duration: 0.82,
                    ease: 'power2.inOut',
                    scaleX: 1
                }, 0.13);
            }
            cards.forEach(function (card, index) {
                addCardTweens(timeline, card, cardStates[index], 0.42 + (index * 0.11), false);
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
            clearAnimated(headerElements().concat(toArray('.aelan-team__horizon')));
            markCompleteIfIdle();
        }

        function prepareMobileHeaderTimeline() {
            var horizon = root.querySelector('.aelan-team__horizon');
            var header;
            var timeline;

            finishHeader();
            if (! root.querySelector('.aelan-team__intro > h2')) {
                return null;
            }

            header = setHeaderStart(true);
            if (horizon) {
                gsap.set(horizon, { autoAlpha: 0.08, scaleX: 0.3, transformOrigin: '50% 50%' });
            }
            timeline = gsap.timeline({
                paused: true,
                defaults: { ease: 'power3.out' },
                onComplete: function () {
                    headerTimeline = null;
                    clearAnimated(headerElements().concat(horizon ? [horizon] : []));
                    markCompleteIfIdle();
                }
            });
            addHeaderTweens(timeline, header, true);
            if (horizon) {
                timeline.to(horizon, {
                    autoAlpha: 0.48,
                    duration: 0.54,
                    ease: 'power2.inOut',
                    scaleX: 1
                }, 0.1);
            }

            headerTimeline = timeline;
            return timeline;
        }

        function playMobileHeader() {
            var timeline;

            if (isSectionOutsideViewport()) {
                finishHeader();
                return;
            }
            if (shouldBypassEntry()) {
                finishHeader();
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
            markCompleteIfIdle();
        }

        function prepareMobileCardTimeline(card, index) {
            var elements;
            var timeline;

            finishCard(card, index);
            elements = setCardStart(card, index, true);
            timeline = gsap.timeline({
                paused: true,
                defaults: { ease: 'power3.out' },
                onComplete: function () {
                    cardTimelines[index] = null;
                    clearAnimated(cardElements(card));
                    markCompleteIfIdle();
                }
            });
            addCardTweens(timeline, card, elements, 0, true);
            cardTimelines[index] = timeline;

            return timeline;
        }

        function playMobileCard(card, index) {
            var timeline;

            if (isSectionOutsideViewport()) {
                finishCard(card, index);
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
            var trigger;

            if (shouldBypassEntry()) {
                finishImmediately();
            } else {
                prepareDesktopTimeline();
            }

            trigger = ScrollTrigger.create({
                id: 'aelan-team-motion',
                trigger: root,
                start: 'top 78%',
                end: 'bottom 22%',
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
                onRefresh: function (self) {
                    if (self.progress === 1 && desktopTimeline) {
                        finishAfterFastPass();
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

        function setupMobile() {
            var cards = toArray('.aelan-person-card');
            var triggers = [];
            var safetyTrigger;
            var headerTrigger;

            cardTimelines = new Array(cards.length);
            if (shouldBypassEntry()) {
                finishImmediately();
            } else {
                prepareMobileHeaderTimeline();
                cards.forEach(prepareMobileCardTimeline);
            }

            safetyTrigger = ScrollTrigger.create({
                id: 'aelan-team-motion-safety',
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
            triggers.push(safetyTrigger);

            headerTrigger = ScrollTrigger.create({
                id: 'aelan-team-motion-header',
                trigger: root.querySelector('.aelan-team__intro') || root,
                start: 'top 86%',
                end: 'bottom 18%',
                invalidateOnRefresh: true,
                onEnter: playMobileHeader,
                onEnterBack: playMobileHeader,
                onLeave: finishHeader,
                onLeaveBack: finishHeader
            });
            triggers.push(headerTrigger);

            cards.forEach(function (card, index) {
                triggers.push(ScrollTrigger.create({
                    id: 'aelan-team-motion-card-' + index,
                    trigger: card,
                    start: 'top 88%',
                    end: 'bottom 12%',
                    invalidateOnRefresh: true,
                    onEnter: function () { playMobileCard(card, index); },
                    onEnterBack: function () { playMobileCard(card, index); },
                    onLeave: function () { finishCard(card, index); },
                    onLeaveBack: function () { finishCard(card, index); }
                }));
            });

            if (shouldBypassEntry()) {
                releaseDirectBypass();
            }

            return function () {
                triggers.forEach(function (item) { item.kill(); });
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

    document.querySelectorAll('[data-aelan-team]').forEach(init);
}());
