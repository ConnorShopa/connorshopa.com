// In-page project views. Clicking a gallery link marked data-view="name" opens #view-name:
// a card centred on the screen (where the gallery was) that zooms out of the link you tapped,
// while the gallery shrinks and slides underneath it. The visitor never leaves the homepage.
(function () {
  if (typeof gsap === "undefined") return;

  var nav = document.querySelector(".hero > nav");
  var intro = document.querySelector(".hero > header");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var t = function (s) { return reduce ? 0 : s; };

  var MINI = 0.4;  // how small the gallery gets while a view is open
  var GAP = 28;    // space between the card and the minimised gallery

  var open = null; // { view, trigger }

  // vector from the middle of the screen to the middle of the tapped link
  function offsetFrom(trigger) {
    var r = trigger.getBoundingClientRect();
    return {
      x: r.left + r.width / 2 - window.innerWidth / 2,
      y: r.top + r.height / 2 - window.innerHeight / 2,
    };
  }

  // how far the gallery must move down so its (shrunken) middle sits just under the card
  function galleryDrop(view) {
    var card = view.getBoundingClientRect(); // measured while visible and centred
    var n = nav.getBoundingClientRect();
    var currentMid = n.top + n.height / 2;
    var targetMid = card.bottom + GAP + (n.height * MINI) / 2;
    return targetMid - currentMid;
  }

  function show(trigger, view) {
    if (open) return;
    open = { view: view, trigger: trigger };

    var from = offsetFrom(trigger); // measured before the gallery moves

    view.hidden = false;
    document.documentElement.style.overflow = "hidden";
    gsap.set(view, { xPercent: -50, yPercent: -50 });

    var drop = galleryDrop(view);
    if (intro) intro.setAttribute("inert", "");

    gsap.killTweensOf([view, nav, intro]);
    gsap.fromTo(
      view,
      { autoAlpha: 0, scale: 0.12, x: from.x, y: from.y },
      { autoAlpha: 1, scale: 1, x: 0, y: 0, duration: t(0.6), ease: "power3.out" }
    );
    gsap.to(nav, { scale: MINI, y: drop, transformOrigin: "50% 50%", duration: t(0.6), ease: "power3.out" });
    if (intro) gsap.to(intro, { autoAlpha: 0, duration: t(0.3), ease: "power2.out" });

    var close = view.querySelector(".viewClose");
    if (close) gsap.delayedCall(t(0.3), function () { close.focus({ preventScroll: true }); });
  }

  function hide() {
    if (!open) return;
    var view = open.view;
    var trigger = open.trigger;
    open = null;

    var to = offsetFrom(trigger); // the link's current (minimised) spot
    gsap.killTweensOf([view, nav, intro]);
    gsap.to(view, {
      autoAlpha: 0,
      scale: 0.12,
      x: to.x,
      y: to.y,
      duration: t(0.4),
      ease: "power3.in",
      onComplete: function () {
        view.hidden = true;
        document.documentElement.style.overflow = "";
      },
    });
    gsap.to(nav, { scale: 1, y: 0, duration: t(0.5), ease: "power3.out", onComplete: function () { gsap.set(nav, { clearProps: "transform" }); } });
    if (intro) {
      intro.removeAttribute("inert");
      gsap.to(intro, { autoAlpha: 1, duration: t(0.4), delay: t(0.1), ease: "power2.out" });
    }
    trigger.focus({ preventScroll: true });
  }

  document.querySelectorAll("a[data-view]").forEach(function (link) {
    var view = document.getElementById("view-" + link.getAttribute("data-view"));
    if (!view) return;
    link.addEventListener("click", function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // let modified clicks behave normally
      e.preventDefault();
      if (open && open.view === view) return; // already open
      show(link, view);
    });
  });

  document.querySelectorAll(".viewClose").forEach(function (b) { b.addEventListener("click", hide); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") hide(); });
})();
