// In-page project views. Clicking a gallery link marked data-view="name" opens #view-name:
// a centred card that zooms out of the link you tapped. The visitor never leaves the homepage.
(function () {
  if (typeof gsap === "undefined") return;

  var backdrop = document.getElementById("viewBackdrop");
  var page = document.querySelector(".page");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var t = function (s) { return reduce ? 0 : s; };

  var open = null; // { view, trigger }

  function offsetFrom(trigger, view) {
    // vector from the middle of the screen to the middle of the tapped link
    var r = trigger.getBoundingClientRect();
    return {
      x: r.left + r.width / 2 - window.innerWidth / 2,
      y: r.top + r.height / 2 - window.innerHeight / 2,
    };
  }

  function show(trigger, view) {
    if (open) return;
    open = { view: view, trigger: trigger };

    backdrop.hidden = false;
    view.hidden = false;
    document.documentElement.style.overflow = "hidden";
    if (page) page.setAttribute("inert", "");

    var from = offsetFrom(trigger, view);
    gsap.killTweensOf([backdrop, view]);
    gsap.fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: t(0.35), ease: "power2.out" });
    gsap.fromTo(
      view,
      { autoAlpha: 0, scale: 0.12, x: from.x, y: from.y },
      { autoAlpha: 1, scale: 1, x: 0, y: 0, duration: t(0.6), ease: "power3.out" }
    );
    var close = view.querySelector(".viewClose");
    if (close) gsap.delayedCall(t(0.3), function () { close.focus({ preventScroll: true }); });
  }

  function hide() {
    if (!open) return;
    var view = open.view;
    var trigger = open.trigger;
    open = null;

    var from = offsetFrom(trigger, view);
    gsap.killTweensOf([backdrop, view]);
    gsap.to(backdrop, { autoAlpha: 0, duration: t(0.3), ease: "power2.in" });
    gsap.to(view, {
      autoAlpha: 0,
      scale: 0.12,
      x: from.x,
      y: from.y,
      duration: t(0.4),
      ease: "power3.in",
      onComplete: function () {
        view.hidden = true;
        backdrop.hidden = true;
        document.documentElement.style.overflow = "";
        if (page) page.removeAttribute("inert");
        trigger.focus({ preventScroll: true });
      },
    });
  }

  document.querySelectorAll("a[data-view]").forEach(function (link) {
    var view = document.getElementById("view-" + link.getAttribute("data-view"));
    if (!view) return;
    link.addEventListener("click", function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // let modified clicks behave normally
      e.preventDefault();
      show(link, view);
    });
  });

  document.querySelectorAll(".viewClose").forEach(function (b) { b.addEventListener("click", hide); });
  backdrop.addEventListener("click", hide);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") hide(); });
})();
