// "Micro + Motion": the whole string hops the way the dot in the old shopa logo does (animations/shopaAnimation.json),
// rebuilt with GSAP. Hover plays it forward, leaving plays it back, like the Lottie did.
(function () {
  var link = document.querySelector('#projectList a[data-view="micro"]');
  var plus = link && link.querySelector(".hop");
  if (!plus || !window.gsap) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var F = function (frames) { return frames / 60; }; // the Lottie runs at 60 fps
  var HOP = 24;                                       // px the text rises at the top of the hop

  gsap.set(plus, { transformOrigin: "50% 100%" });

  var tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });

  // squash and stretch (frames from the Lottie: 0 / 6 / 12 / 24 / 37 / 56 / 61 / 69)
  tl.to(plus, { scaleX: 1.1, scaleY: 0.9, duration: F(6) }, 0)
    .to(plus, { scaleX: 0.9, scaleY: 1.1, duration: F(6) }, F(6))
    .to(plus, { scaleX: 1.1, scaleY: 0.9, duration: F(12) }, F(12))
    .to(plus, { scaleX: 1,   scaleY: 0.9, duration: F(13) }, F(24))
    .to(plus, { scaleX: 0.9, scaleY: 1.1, duration: F(19) }, F(37))
    .to(plus, { scaleX: 1.2, scaleY: 0.9, duration: F(5) },  F(56))
    .to(plus, { scaleX: 1,   scaleY: 1,   duration: F(8) },  F(61));

  // the hop itself: up from frame 12 to 37, back down by frame 56
  tl.to(plus, { y: -HOP, duration: F(25), ease: "power2.out" }, F(12))
    .to(plus, { y: 0, duration: F(19), ease: "power2.in" }, F(37));

  link.addEventListener("mouseenter", function () { tl.play(); });
  link.addEventListener("mouseleave", function () { tl.reverse(); });
})();
