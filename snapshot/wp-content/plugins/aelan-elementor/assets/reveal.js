(function () {
    'use strict';

    var elements = Array.prototype.slice.call(document.querySelectorAll('[data-aelan-reveal]'));
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (
        !elements.length ||
        reducedMotion ||
        !('IntersectionObserver' in window) ||
        !('animate' in Element.prototype)
    ) {
        return;
    }

    var mobile = window.matchMedia('(max-width: 782px)').matches;
    var easing = 'cubic-bezier(0.22, 1, 0.36, 1)';
    var presets = {
        manifesto: {
            desktop: { opacity: 0.84, transform: 'translate3d(0,22px,0)', duration: 540 },
            mobile: { opacity: 0.88, transform: 'translate3d(0,14px,0)', duration: 460 }
        },
        measurement: {
            desktop: { opacity: 0.86, transform: 'translate3d(0,24px,0)', duration: 520 },
            mobile: { opacity: 0.88, transform: 'translate3d(0,14px,0)', duration: 450 }
        },
        method: {
            desktop: { opacity: 0.86, transform: 'translate3d(0,18px,0) scale(0.985)', duration: 560 },
            mobile: { opacity: 0.88, transform: 'translate3d(0,14px,0)', duration: 460 }
        },
        team: {
            desktop: { opacity: 0.84, transform: 'translate3d(0,22px,0)', duration: 540 },
            mobile: { opacity: 0.88, transform: 'translate3d(0,14px,0)', duration: 460 }
        },
        'final-cta': {
            desktop: { opacity: 0.84, transform: 'translate3d(-22px,0,0)', duration: 500 },
            mobile: { opacity: 0.88, transform: 'translate3d(0,14px,0)', duration: 440 }
        }
    };

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) {
                return;
            }

            observer.unobserve(entry.target);
            var name = entry.target.getAttribute('data-aelan-reveal');
            var preset = presets[name];
            if (!preset) {
                return;
            }

            var settings = mobile ? preset.mobile : preset.desktop;
            var animation = entry.target.animate(
                [
                    { opacity: settings.opacity, transform: settings.transform },
                    { opacity: 1, transform: 'translate3d(0,0,0) scale(1)' }
                ],
                {
                    duration: settings.duration,
                    easing: easing,
                    fill: 'none'
                }
            );

            animation.finished.then(function () {
                entry.target.setAttribute('data-aelan-reveal-state', 'complete');
            }).catch(function () {
                entry.target.setAttribute('data-aelan-reveal-state', 'complete');
            });
        });
    }, {
        root: null,
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.01
    });

    elements.forEach(function (element) {
        observer.observe(element);
    });
}());
