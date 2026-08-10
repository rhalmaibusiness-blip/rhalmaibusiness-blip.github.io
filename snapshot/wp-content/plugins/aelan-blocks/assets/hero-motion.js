(function () {
    'use strict';

    var hero = document.querySelector('.aelan-hero');
    var manifesto = hero ? hero.nextElementSibling : null;

    if (
        !hero ||
        !manifesto ||
        !manifesto.classList.contains('aelan-manifesto') ||
        !window.gsap ||
        !window.ScrollTrigger ||
        hero.dataset.aelanMotionReady === 'true'
    ) {
        return;
    }

    var visual = hero.querySelector('.aelan-hero__visual');
    var picture = hero.querySelector('.aelan-hero__picture');
    var veil = hero.querySelector('.aelan-hero__veil');
    var mist = hero.querySelector('.aelan-hero__transition-mist');
    var content = hero.querySelector('.aelan-hero__content');
    var manifestoBackground = manifesto.querySelector('.aelan-manifesto__background');
    var manifestoContent = manifesto.querySelector(':scope > .aelan-shell');

    if (
        !visual ||
        !picture ||
        !veil ||
        !mist ||
        !content ||
        !manifestoBackground ||
        !manifestoContent
    ) {
        return;
    }

    var contentItems = [
        content.querySelector('h1'),
        content.querySelector('.aelan-hero__subtitle'),
        content.querySelector('.aelan-lead'),
        content.querySelector('.aelan-actions')
    ].filter(Boolean);

    window.gsap.registerPlugin(window.ScrollTrigger);
    window.ScrollTrigger.config({
        ignoreMobileResize: true,
        limitCallbacks: true
    });
    window.ScrollTrigger.saveStyles(
        [hero, visual, mist, content, manifesto, manifestoBackground, manifestoContent].concat(contentItems)
    );

    hero.dataset.aelanMotionReady = 'true';

    var media = window.gsap.matchMedia();
    var conditions = {
        desktop: '(min-width: 783px) and (prefers-reduced-motion: no-preference)',
        mobile: '(max-width: 782px) and (prefers-reduced-motion: no-preference)'
    };

    media.add(conditions, function (context) {
        var desktop = context.conditions.desktop;
        var config = desktop ? {
            distance: 1.2,
            maxScrollStep: 0.14,
            inputEaseDuration: 0.18,
            scrub: 0.55,
            settleDelay: 120,
            settleMinDuration: 0.35,
            settleMaxDuration: 0.75,
            exitX: -118,
            visualY: -3,
            visualScale: 1.028,
            mistStartY: 36,
            mistPeakY: -18,
            mistEndY: -34,
            manifestoBackgroundY: 10,
            manifestoTargetY: 70
        } : {
            distance: 0.82,
            maxScrollStep: 0.12,
            inputEaseDuration: 0.16,
            scrub: 0.28,
            settleDelay: 120,
            settleMinDuration: 0.35,
            settleMaxDuration: 0.68,
            exitX: -108,
            visualY: -2,
            visualScale: 1.018,
            mistStartY: 34,
            mistPeakY: -16,
            mistEndY: -30,
            manifestoBackgroundY: 7,
            manifestoTargetY: 58
        };

        document.documentElement.classList.add('has-aelan-hero-motion');
        if (desktop) {
            document.documentElement.classList.add('is-aelan-hero-scroll-controlled');
        }
        hero.classList.add('aelan-hero-motion-active');
        manifesto.classList.add('aelan-manifesto-motion-active');

        function setProgressNavigation(id, locked) {
            var navigation = document.querySelector('.aelan-section-navigation');

            if (!navigation) {
                return;
            }

            navigation.dataset.aelanMotionLock = locked ? 'true' : 'false';
            Array.prototype.forEach.call(navigation.querySelectorAll('[data-aelan-nav]'), function (link) {
                var active = link.getAttribute('data-aelan-nav') === id;
                link.classList.toggle('is-active', active);

                if (active) {
                    link.setAttribute('aria-current', 'true');
                } else {
                    link.removeAttribute('aria-current');
                }
            });
        }

        setProgressNavigation('kezdolap', true);

        function motionDistance() {
            return Math.max(1, Math.round(window.innerHeight * config.distance));
        }

        function sectionOffset() {
            var value = parseFloat(window.getComputedStyle(manifesto).scrollMarginTop);
            return Number.isFinite(value) ? value : (desktop ? 132 : 98);
        }

        function updateMotionGap() {
            var gap = Math.max(0, motionDistance() + sectionOffset() - hero.offsetHeight);
            manifesto.style.setProperty('--aelan-motion-gap', gap + 'px');
            return motionDistance();
        }

        updateMotionGap();

        window.gsap.set(contentItems, { willChange: desktop ? 'transform,opacity' : 'auto' });
        window.gsap.set(visual, {
            transformOrigin: '50% 50%',
            willChange: desktop ? 'transform,opacity' : 'auto'
        });
        window.gsap.set(mist, {
            yPercent: config.mistStartY,
            scale: 0.92,
            autoAlpha: 0,
            willChange: desktop ? 'transform,opacity' : 'auto'
        });
        window.gsap.set(manifestoBackground, {
            yPercent: config.manifestoBackgroundY,
            scale: desktop ? 1.035 : 1.022,
            autoAlpha: 0.24,
            transformOrigin: '50% 50%',
            willChange: desktop ? 'transform,opacity' : 'auto'
        });
        window.gsap.set(manifestoContent, {
            y: config.manifestoTargetY,
            autoAlpha: 0,
            willChange: desktop ? 'transform,opacity' : 'auto'
        });

        var scrollState = { y: window.scrollY || window.pageYOffset || 0 };
        var scrollTarget = scrollState.y;
        var scrollTween = null;
        var settleTimer = null;
        var settling = false;
        var lastTouchY = null;

        function currentScroll() {
            return window.scrollY || window.pageYOffset || 0;
        }

        function clearSettleTimer() {
            if (settleTimer !== null) {
                window.clearTimeout(settleTimer);
                settleTimer = null;
            }
        }

        function stopScrollTween() {
            clearSettleTimer();

            if (scrollTween) {
                scrollTween.kill();
                scrollTween = null;
            }

            settling = false;
            scrollState.y = currentScroll();
            scrollTarget = scrollState.y;
        }

        var timeline = window.gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
                id: 'aelan-hero-motion',
                trigger: hero,
                start: 'top top',
                end: function () { return '+=' + updateMotionGap(); },
                pin: hero,
                pinType: 'fixed',
                pinSpacing: false,
                scrub: config.scrub,
                anticipatePin: 2,
                invalidateOnRefresh: true,
                onEnter: function () {
                    if (desktop) {
                        document.documentElement.classList.add('is-aelan-hero-scroll-controlled');
                    }
                    setProgressNavigation('kezdolap', true);
                },
                onEnterBack: function () {
                    if (desktop) {
                        document.documentElement.classList.add('is-aelan-hero-scroll-controlled');
                    }
                    setProgressNavigation('kezdolap', true);
                },
                onLeave: function () {
                    clearSettleTimer();
                    document.documentElement.classList.remove('is-aelan-hero-scroll-controlled');
                    setProgressNavigation('aelan-szemlelet', false);
                },
                onUpdate: function (self) {
                    hero.style.pointerEvents = self.progress > 0.82 ? 'none' : '';
                },
                onLeaveBack: function () {
                    hero.style.pointerEvents = '';
                    if (desktop) {
                        document.documentElement.classList.add('is-aelan-hero-scroll-controlled');
                    }
                    setProgressNavigation('kezdolap', true);
                }
            }
        });

        timeline
            .to(contentItems, {
                xPercent: config.exitX,
                autoAlpha: 0,
                duration: 0.22,
                stagger: 0.02,
                ease: 'power2.in'
            }, 0.04)
            .to(visual, {
                yPercent: config.visualY,
                scale: config.visualScale,
                duration: 0.34,
                ease: 'sine.inOut'
            }, 0.18)
            .to(mist, {
                yPercent: config.mistPeakY,
                scale: 1.12,
                autoAlpha: 1,
                duration: 0.4,
                ease: 'sine.out'
            }, 0.3)
            .to(manifestoBackground, {
                yPercent: 0,
                scale: 1,
                autoAlpha: 1,
                duration: 0.4,
                ease: 'sine.out'
            }, 0.36)
            .to(visual, {
                autoAlpha: 0,
                duration: 0.32,
                ease: 'sine.inOut'
            }, 0.48)
            .to(hero, {
                backgroundColor: 'rgba(255,252,249,0)',
                duration: 0.3,
                ease: 'sine.inOut'
            }, 0.54)
            .to(manifestoContent, {
                y: 0,
                autoAlpha: 1,
                duration: 0.34,
                ease: 'power2.out'
            }, 0.58)
            .to(mist, {
                yPercent: config.mistEndY,
                scale: 1.18,
                autoAlpha: 0,
                duration: 0.26,
                ease: 'sine.inOut'
            }, 0.74);

        function triggerProgress(position) {
            var trigger = timeline.scrollTrigger;

            if (!trigger || trigger.end <= trigger.start) {
                return 0;
            }

            return window.gsap.utils.clamp(0, 1, (position - trigger.start) / (trigger.end - trigger.start));
        }

        function isInsideMotion(direction) {
            var trigger = timeline.scrollTrigger;
            var position = currentScroll();

            if (!trigger || !Number.isFinite(trigger.start) || !Number.isFinite(trigger.end)) {
                return false;
            }

            return direction > 0
                ? position >= trigger.start - 2 && position < trigger.end - 1
                : position > trigger.start + 1 && position <= trigger.end + 2;
        }

        function animateScroll(destination, duration, ease, isSettle) {
            if (scrollTween) {
                scrollTween.kill();
            }

            settling = isSettle;
            scrollState.y = currentScroll();
            scrollTarget = destination;
            scrollTween = window.gsap.to(scrollState, {
                y: destination,
                duration: duration,
                ease: ease,
                overwrite: true,
                onUpdate: function () {
                    window.scrollTo(0, scrollState.y);
                    window.ScrollTrigger.update();
                },
                onComplete: function () {
                    settling = false;
                    scrollTween = null;
                    scrollState.y = currentScroll();
                    scrollTarget = scrollState.y;
                }
            });
        }

        function settleToNearest() {
            var trigger = timeline.scrollTrigger;

            settleTimer = null;

            if (!trigger || !isInsideMotion(scrollTarget >= currentScroll() ? 1 : -1)) {
                return;
            }

            var progress = triggerProgress(scrollTarget);

            if (progress <= 0.001 || progress >= 0.999) {
                return;
            }

            var destination = progress < 0.5 ? trigger.start : trigger.end;
            var remaining = Math.abs(destination - currentScroll());
            var ratio = window.gsap.utils.clamp(0, 1, remaining / Math.max(1, trigger.end - trigger.start));
            var duration = config.settleMinDuration +
                ((config.settleMaxDuration - config.settleMinDuration) * ratio);

            animateScroll(destination, duration, 'power2.inOut', true);
        }

        function queueSettle() {
            clearSettleTimer();
            clearSettleTimer();
            settleTimer = window.setTimeout(settleToNearest, config.settleDelay);
        }

        function controlledScroll(delta, shouldSettle) {
            var trigger = timeline.scrollTrigger;
            var maxStep = Math.max(48, window.innerHeight * config.maxScrollStep);
            var current = currentScroll();

            if (!trigger) {
                return;
            }

            if (!scrollTween || !scrollTween.isActive() || settling) {
                scrollTarget = current;
            }

            if (settling) {
                stopScrollTween();
                scrollTarget = current;
            }

            var step = window.gsap.utils.clamp(-maxStep, maxStep, delta);
            var destination = window.gsap.utils.clamp(trigger.start, trigger.end, scrollTarget + step);

            animateScroll(destination, config.inputEaseDuration, 'power2.out', false);

            if (shouldSettle) {
                queueSettle();
            }
        }

        function normalizeWheelDelta(event) {
            if (event.deltaMode === 1) {
                return event.deltaY * 16;
            }

            if (event.deltaMode === 2) {
                return event.deltaY * window.innerHeight;
            }

            return event.deltaY;
        }

        function onWheel(event) {
            var delta = normalizeWheelDelta(event);

            if (event.ctrlKey || Math.abs(delta) < 1 || !isInsideMotion(delta)) {
                return;
            }

            event.preventDefault();
            clearSettleTimer();
            controlledScroll(delta, true);
        }

        function onTouchStart(event) {
            if (event.touches.length === 1) {
                clearSettleTimer();

                if (settling) {
                    stopScrollTween();
                }

                lastTouchY = event.touches[0].clientY;
                scrollState.y = currentScroll();
                scrollTarget = scrollState.y;
            }
        }

        function onTouchMove(event) {
            if (lastTouchY === null || event.touches.length !== 1) {
                return;
            }

            var touchY = event.touches[0].clientY;
            var delta = (lastTouchY - touchY) * 1.15;
            lastTouchY = touchY;

            if (Math.abs(delta) < 1 || !isInsideMotion(delta)) {
                return;
            }

            event.preventDefault();
            controlledScroll(delta, false);
        }

        function onTouchEnd() {
            if (lastTouchY !== null) {
                lastTouchY = null;
                queueSettle();
            }
        }

        function onKeyDown(event) {
            var delta = 0;

            if (
                event.target &&
                typeof event.target.closest === 'function' &&
                event.target.closest('a, button, input, textarea, select, [contenteditable="true"]')
            ) {
                return;
            }

            if (event.key === 'ArrowDown') {
                delta = 96;
            } else if (event.key === 'ArrowUp') {
                delta = -96;
            } else if (event.key === 'PageDown' || (event.key === ' ' && !event.shiftKey)) {
                delta = window.innerHeight * 0.72;
            } else if (event.key === 'PageUp' || (event.key === ' ' && event.shiftKey)) {
                delta = window.innerHeight * -0.72;
            }

            if (!delta || !isInsideMotion(delta)) {
                return;
            }

            event.preventDefault();
            clearSettleTimer();
            controlledScroll(delta, true);
        }

        function syncManifestoHash() {
            if (window.location.hash !== '#aelan-szemlelet') {
                return;
            }

            stopScrollTween();
            updateMotionGap();
            window.ScrollTrigger.refresh();
            window.requestAnimationFrame(function () {
                window.scrollTo({ top: timeline.scrollTrigger.end, behavior: 'auto' });
                timeline.progress(1);
                window.ScrollTrigger.update();
            });
        }

        function refresh() {
            updateMotionGap();
            window.ScrollTrigger.refresh();
            scrollState.y = currentScroll();
            scrollTarget = scrollState.y;
        }

        var orientationTimer = null;

        function refreshAfterOrientationChange() {
            if (orientationTimer !== null) {
                window.clearTimeout(orientationTimer);
            }

            orientationTimer = window.setTimeout(function () {
                orientationTimer = null;
                refresh();
            }, 180);
        }

        window.addEventListener('load', refresh, { once: true });
        window.addEventListener('pageshow', refresh);
        window.addEventListener('orientationchange', refreshAfterOrientationChange);
        window.addEventListener('hashchange', syncManifestoHash);

        if (desktop) {
            window.addEventListener('wheel', onWheel, { passive: false });
            window.addEventListener('touchstart', onTouchStart, { passive: true });
            window.addEventListener('touchmove', onTouchMove, { passive: false });
            window.addEventListener('touchend', onTouchEnd, { passive: true });
            window.addEventListener('touchcancel', onTouchEnd, { passive: true });
            window.addEventListener('keydown', onKeyDown);
        }
        window.setTimeout(syncManifestoHash, 80);

        return function () {
            window.removeEventListener('pageshow', refresh);
            window.removeEventListener('orientationchange', refreshAfterOrientationChange);
            window.removeEventListener('hashchange', syncManifestoHash);
            window.removeEventListener('wheel', onWheel);
            window.removeEventListener('touchstart', onTouchStart);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
            window.removeEventListener('touchcancel', onTouchEnd);
            window.removeEventListener('keydown', onKeyDown);
            if (orientationTimer !== null) {
                window.clearTimeout(orientationTimer);
            }
            stopScrollTween();
            if (timeline.scrollTrigger) {
                timeline.scrollTrigger.kill(true);
            }
            timeline.kill();
            hero.style.pointerEvents = '';
            manifesto.style.removeProperty('--aelan-motion-gap');
            var progressNavigation = document.querySelector('.aelan-section-navigation');
            if (progressNavigation) {
                progressNavigation.removeAttribute('data-aelan-motion-lock');
            }
            document.documentElement.classList.remove('has-aelan-hero-motion');
            document.documentElement.classList.remove('is-aelan-hero-scroll-controlled');
            hero.classList.remove('aelan-hero-motion-active');
            manifesto.classList.remove('aelan-manifesto-motion-active');
            window.gsap.set(
                [hero, visual, mist, manifestoBackground, manifestoContent].concat(contentItems),
                {
                    clearProps: 'transform,opacity,visibility,backgroundColor,pointerEvents,willChange'
                }
            );
        };
    });
}());
