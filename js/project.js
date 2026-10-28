// In-page project views. Clicking a gallery link marked data-view="name" opens #view-name:
// a card centred on the screen (where the gallery was) that zooms out of the middle of the screen,
// while the gallery shrinks and slides underneath it. The visitor never leaves the homepage.
(function () {
  if (typeof gsap === "undefined") return;

  var nav = document.querySelector(".hero > nav");
  var list = document.getElementById("projectList");
  var intro = document.querySelector(".hero > header");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var t = function (s) { return reduce ? 0 : s; };

  var MINI = 0.4;  // how small the gallery gets while a view is open
  var GAP = 28;    // space between the card and the minimised gallery
  var BOTTOM_ROOM = 160; // space kept under the card for the gallery row

  var open = null; // { view, trigger }

  // the gallery items currently on screen
  function items() { return document.querySelectorAll("#projectList li:not(.is-hidden):not(.is-current):not(.row-break)"); }

  // no slash after the last item that is actually showing
  function fixSlashes() {
    if (!list.classList.contains("compact") && window.layoutGalleryRows) { window.layoutGalleryRows(); return; }
    var last = null;
    list.querySelectorAll("li:not(.row-break)").forEach(function (li) {
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
    popTl.to(current, { scale: 0, opacity: 0, duration: t(0.12), ease: "back.in(1.2)", stagger: t(0.012), transformOrigin: "50% 50%" });
    popTl.add(function () {
      applyLayout();
      var next = items();
      gsap.set(next, { scale: 0, opacity: 0 });
      popIn = gsap.to(next, { scale: 1, opacity: 1, duration: t(0.2), ease: "back.out(1.2)", stagger: t(0.018) });
    });
  }

  // ---- pages inside a view ----------------------------------------------------------------
  function pagesOf(view) { return view.querySelectorAll(".pg"); }

  // stop anything playing on a page that is being left (video, embedded player)
  function stopMedia(scope) {
    scope.querySelectorAll("video").forEach(function (v) { v.pause(); });
    scope.querySelectorAll("iframe").forEach(function (f) { f.removeAttribute("src"); });
  }

  // embedded players only load once their page is shown
  function startMedia(scope) {
    scope.querySelectorAll("iframe[data-src]").forEach(function (f) { f.setAttribute("src", f.getAttribute("data-src")); });
  }

  // go to page n (dir: 1 = forward, -1 = back) with a short slide + fade; animate=false just swaps
  function setPage(view, n, animate, dir) {
    var pages = pagesOf(view);
    if (!pages.length) return;
    n = Math.max(0, Math.min(pages.length - 1, n));
    var from = view._page || 0;
    var old = pages[from];
    var next = pages[n];
    gsap.killTweensOf(pages);
    pages.forEach(function (p) { if (p !== next && p !== old) p.classList.remove("is-on"); gsap.set(p, { clearProps: "opacity,transform" }); });

    if (old !== next) stopMedia(old);
    next.classList.add("is-on");
    startMedia(next);
    view._page = n;

    if (animate && old !== next && !reduce) {
      gsap.fromTo(next, { autoAlpha: 0, x: 48 * dir }, { autoAlpha: 1, x: 0, duration: 0.28, ease: "power3.out" });
      gsap.to(old, { autoAlpha: 0, x: -48 * dir, duration: 0.14, ease: "power2.in", onComplete: function () { old.classList.remove("is-on"); gsap.set(old, { clearProps: "opacity,visibility,transform" }); } });
    } else if (old !== next) {
      old.classList.remove("is-on");
    }

    // chevrons and dots
    var prev = view.querySelector(".viewNav.prev");
    var nextBtn = view.querySelector(".viewNav.next");
    if (prev) prev.disabled = n === 0;
    if (nextBtn) nextBtn.disabled = n === pages.length - 1;
    view.querySelectorAll(".viewDot").forEach(function (d, i) {
      if (i === n) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current");
    });
  }

  function step(delta) {
    if (!open) return;
    var view = open.view;
    var n = (view._page || 0) + delta;
    if (n < 0 || n >= pagesOf(view).length) return;
    setPage(view, n, true, delta);
  }

  function show(trigger, view) {
    if (open) return;
    open = { view: view, trigger: trigger };
    setPage(view, 0, false);

    view.hidden = false;
    document.documentElement.style.overflow = "hidden";
    document.documentElement.classList.add("view-open");
    gsap.set(view, { xPercent: -50, yPercent: -50 });

    // The card starts just under the intro (name, tagline, stat, chips) and runs down the screen,
    // leaving room at the bottom for the gallery row, which gets pushed down beneath it.
    var top = intro ? intro.getBoundingClientRect().bottom + 24 : 80;
    var height = Math.max(300, window.innerHeight - top - BOTTOM_ROOM);
    view.style.height = height + "px";
    view.style.top = top + height / 2 + "px"; // GSAP's yPercent -50 centres the card on this line
    var cardBottom = top + height; // measured from layout, not the rect: the card is left shrunk after a close
    // zoom out of / back into the dead centre of the screen, wherever the card ends up
    open.offY = window.innerHeight / 2 - (top + height / 2);
    var currentLi = trigger.closest("li");

    gsap.killTweensOf(view);
    gsap.fromTo(
      view,
      { autoAlpha: 0, scale: 0.12, x: 0, y: open.offY }, // zooms out of the dead centre of the screen
      { autoAlpha: 1, scale: 1, x: 0, y: 0, duration: t(0.36), ease: "power4.out" }
    );
    popGallery(function () {
      // start from a clean slate: if an earlier open/close was interrupted halfway, the gallery may
      // still be shrunk or have a stale item hidden, which would throw the measurements below off
      gsap.set(nav, { clearProps: "transform" });
      list.querySelectorAll("li.is-current").forEach(function (li) { li.classList.remove("is-current"); });
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
    if (close) gsap.delayedCall(t(0.2), function () { close.focus({ preventScroll: true }); });
  }

  // opening another project from the gallery row while one is open: the old card shrinks away (the
  // gallery isn't touched; show() below re-lays it out for the new project)
  function switchFrom(current) {
    var old = current.view;
    open = null;
    gsap.killTweensOf(old);
    gsap.to(old, {
      autoAlpha: 0,
      scale: 0.12,
      x: 0,
      y: current.offY,
      duration: t(0.2),
      ease: "power3.in",
      onComplete: function () { old.hidden = true; stopMedia(old); },
    });
  }

  function hide() {
    if (!open) return;
    var view = open.view;
    var trigger = open.trigger;
    var offY = open.offY;
    open = null;

    gsap.killTweensOf(view);
    gsap.to(view, {
      autoAlpha: 0,
      scale: 0.12,
      x: 0,
      y: offY, // ...and back into the dead centre
      duration: t(0.24),
      ease: "power3.in",
      onComplete: function () {
        view.hidden = true;
        document.documentElement.style.overflow = "";
        document.documentElement.classList.remove("view-open");
        stopMedia(view);
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
      if (open) switchFrom(open);             // another project is open: swap it out, then open this one
      show(link, view);
    });
  });

  document.querySelectorAll(".viewClose").forEach(function (b) { b.addEventListener("click", hide); });
  document.querySelectorAll(".viewNav.prev").forEach(function (b) { b.addEventListener("click", function () { step(-1); }); });
  document.querySelectorAll(".viewNav.next").forEach(function (b) { b.addEventListener("click", function () { step(1); }); });
  // dots are added after load for locked projects, so they are handled by delegation
  document.addEventListener("click", function (e) {
    var d = e.target.closest && e.target.closest(".viewDot");
    if (!d) return;
    var view = d.closest(".view");
    var n = parseInt(d.getAttribute("data-page"), 10);
    setPage(view, n, true, n > (view._page || 0) ? 1 : -1);
  });
  // a click anywhere outside the card closes it (links and chips keep doing their own thing; the click that
  // opened the card is a link click, so it is ignored here too)
  document.addEventListener("click", function (e) {
    if (!open) return;
    if (e.target.closest(".view, a, .pill")) return;
    hide();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") hide();
    else if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
  });
})();
