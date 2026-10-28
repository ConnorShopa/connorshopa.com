// "Micro + Motion": every letter hops in turn, left to right, the way the dot in the old shopa logo does
// (animations/shopaAnimation.json), rebuilt with GSAP. Hover plays it forward, leaving plays it back, like
// the Lottie did.
(function () {
  var link = document.querySelector('#projectList a[data-view="micro"]');
  var hop = link && link.querySelector(".hop");
  if (!hop || !window.gsap) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // one span per letter (spaces stay plain text); screen readers get the whole phrase once
  var text = hop.textContent;
  hop.setAttribute("aria-label", text);
  hop.textContent = "";
  var letters = [];
  text.split("").forEach(function (ch) {
    if (ch === " ") { hop.appendChild(document.createTextNode(" ")); return; }
    var s = document.createElement("span");
    s.className = "hopLetter";
    s.setAttribute("aria-hidden", "true");
    s.textContent = ch;
    hop.appendChild(s);
    letters.push(s);
  });

  var F = function (frames) { return frames / 60; }; // the Lottie runs at 60 fps
  var HOP = 7;          // px a letter rises at the top of its hop
  var WAVE = 0.5;       // seconds from the first letter starting to the last one starting
  var wave = gsap.parseEase("power2.out"); // gaps between letters start wide and shrink, so the wave builds momentum

  gsap.set(letters, { transformOrigin: "50% 100%" });

  var tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
  tl.timeScale(1.8); // faster overall than the Lottie's own 1.15s (applies to the stagger too, and to playing back)

  letters.forEach(function (el, i) {
    var t0 = WAVE * wave(letters.length > 1 ? i / (letters.length - 1) : 0);
    // squash and stretch (frames from the Lottie: 0 / 6 / 12 / 24 / 37 / 56 / 61 / 69)
    tl.to(el, { scaleX: 1.02, scaleY: 0.98, duration: F(6) }, t0)
      .to(el, { scaleX: 0.98, scaleY: 1.02, duration: F(6) }, t0 + F(6))
      .to(el, { scaleX: 1.02, scaleY: 0.98, duration: F(12) }, t0 + F(12))
      .to(el, { scaleX: 1,    scaleY: 0.98, duration: F(13) }, t0 + F(24))
      .to(el, { scaleX: 0.98, scaleY: 1.02, duration: F(19) }, t0 + F(37))
      .to(el, { scaleX: 1.04, scaleY: 0.98, duration: F(5) },  t0 + F(56))
      .to(el, { scaleX: 1,    scaleY: 1,    duration: F(8) },  t0 + F(61))
      // the hop itself: up from frame 12 to 37, back down by frame 56
      .to(el, { y: -HOP, duration: F(25), ease: "power2.out" }, t0 + F(12))
      .to(el, { y: 0, duration: F(19), ease: "power2.in" }, t0 + F(37));
  });

  link.addEventListener("mouseenter", function () { tl.play(); });
  link.addEventListener("mouseleave", function () { tl.reverse(); });
})();
