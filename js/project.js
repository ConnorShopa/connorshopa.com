// In-page project views. Clicking a gallery link marked data-view="name" opens #view-name:
// a card centred on the screen (where the gallery was) that zooms out of the middle of the screen,
// while the gallery shrinks and slides underneath it. The visitor never leaves the homepage.
(function () {
  if (typeof gsap === "undefined") return;

  var nav = document.querySelector(".hero > nav");
  var list = document.getElementById("projectList");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var t = function (s) { return reduce ? 0 : s; };

  var MINI = 0.4;  // how small the gallery gets while a view is open
  var GAP = 28;    // space between the card and the minimised gallery

  var open = null; // { view, trigger }

  // the gallery items currently on screen
  function items() { return document.querySelectorAll("#projectList li:not(.is-hidden):not(.is-current)"); }

  // no slash after the last item that is actually showing
  function fixSlashes() {
    var last = null;
    list.querySelectorAll("li").forEach(function (li) {
      li.classList.remove("no-slash");
      if (!li.classList.contains("is-hidden") && !li.classList.contains("is-current")) last = li;
    });
    if (last) last.classList.add("no-slash");
  }

  // Same pop out / pop in as the filter pills: items pop away, the gallery jumps to its new size
  // and place while they are invisible, then they pop back in.
  var popTl = null;
  var popIn = null;
  function popGallery(applyLayout) {
    if (popTl) popTl.kill();
    if (popIn) popIn.kill();
    var current = items();
    gsap.killTweensOf(current);
    popTl = gsap.timeline();
    popTl.to(current, { scale: 0, opacity: 0, duration: t(0.18), ease: "back.in(1.2)", stagger: t(0.02), transformOrigin: "50% 50%" });
    popTl.add(function () {
      applyLayout();
      var next = items();
      gsap.set(next, { scale: 0, opacity: 0 });
      popIn = gsap.to(next, { scale: 1, opacity: 1, duration: t(0.3), ease: "back.out(1.2)", stagger: t(0.03) });
    });
  }

  function show(trigger, view) {
    if (open) return;
    open = { view: view, trigger: trigger };

    view.hidden = false;
    document.documentElement.style.overflow = "hidden";
    gsap.set(view, { xPercent: -50, yPercent: -50 });

    var cardBottom = view.getBoundingClientRect().bottom; // measured while the card is centred at full size
    var currentLi = trigger.closest("li");

    gsap.killTweensOf(view);
    gsap.fromTo(
      view,
      { autoAlpha: 0, scale: 0.12, x: 0, y: 0 }, // zooms out of the dead centre of the screen
      { autoAlpha: 1, scale: 1, x: 0, y: 0, duration: t(0.6), ease: "power3.out" }
    );
    popGallery(function () {
      // the open project isn't repeated in the gallery, and the rest run in a single row
      if (currentLi) currentLi.classList.add("is-current");
      list.classList.add("compact");
      fixSlashes();
      // slide the (shrunken) row so it sits just under the card
      var n = nav.getBoundingClientRect();
      var rowH = list.getBoundingClientRect().height;
      var drop = cardBottom + GAP + (rowH * MINI) / 2 - (n.top + n.height / 2);
      gsap.set(nav, { scale: MINI, y: drop, transformOrigin: "50% 50%" });
    });

    var close = view.querySelector(".viewClose");
    if (close) gsap.delayedCall(t(0.3), function () { close.focus({ preventScroll: true }); });
  }

  function hide() {
    if (!open) return;
    var view = open.view;
    var trigger = open.trigger;
    open = null;

    gsap.killTweensOf(view);
    gsap.to(view, {
      autoAlpha: 0,
      scale: 0.12,
      x: 0,
      y: 0, // ...and back into the dead centre
      duration: t(0.4),
      ease: "power3.in",
      onComplete: function () {
        view.hidden = true;
        document.documentElement.style.overflow = "";
      },
    });
    popGallery(function () {
      list.classList.remove("compact");
      list.querySelectorAll("li.is-current").forEach(function (li) { li.classList.remove("is-current"); });
      fixSlashes();
      gsap.set(nav, { clearProps: "transform" });
    });
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
