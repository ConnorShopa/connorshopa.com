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
  var CARD_RATIO = 3 / 2; // the expanded card's width : height
  var INTRO_GAP = 16;  // the gap left above the filter chips once the about-me lines are gone
  var lockY = null; // the scroll position the page is pinned at while a project is open
  var introState = null; // the intro's full size while a project is open (restored on close)
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
  // origin (optional, viewport px): the spot the card grows from. The other links are pushed away from it
  // as if the growing card shoved them aside, instead of just shrinking in place.
  // pullIn: on close the links start out where the push would have left them and are drawn back to their places
  function popGallery(applyLayout, origin, pullIn, focusEl) {
    if (popTl) popTl.kill();
    if (popIn) popIn.kill();
    var current = items();
    gsap.killTweensOf(current);
    popTl = gsap.timeline();
    if (origin && !pullIn) {
      popTl.to(current, {
        x: function (i, el) { return push(el, origin).x; },
        y: function (i, el) { return push(el, origin).y; },
        scale: 0.55,
        opacity: 0,
        duration: t(0.3),
        ease: "power2.out",
        transformOrigin: "50% 50%",
      });
    } else if (pullIn) {
      // closing: the row under the card is out of the way at once, so the links can start falling back while
      // the bubble is still shrinking instead of after it
      popTl.to(current, { scale: 0, opacity: 0, duration: t(0.015), ease: "none", transformOrigin: "50% 50%" });
    } else {
      popTl.to(current, { scale: 0, opacity: 0, duration: t(0.12), ease: "back.in(1.2)", stagger: t(0.012), transformOrigin: "50% 50%" });
    }
    popTl.add(function () {
      applyLayout();
      var next = items();
      gsap.set(list.querySelectorAll("li"), { clearProps: "x,y" });
      if (origin && pullIn) {
        // the reverse of the push: start displaced away from the origin, small and faint...
        gsap.set(next, {
          x: function (i, el) { return push(el, origin, true).x; },
          y: function (i, el) { return push(el, origin, true).y; },
          scale: 0.8,
          opacity: 0,
          transformOrigin: "50% 50%",
        });
        // ...and get sucked back to their own spot
        var others = Array.prototype.filter.call(next, function (el) { return el !== focusEl; });
        // like gravity: the nearer a link is to the bubble the harder it is pulled, so it lands first;
        // the further away, the later and the slower it falls into place
        var tweens = [];
        others.forEach(function (el) {
          var r = el.getBoundingClientRect();
          var len = Math.hypot(r.left + r.width / 2 - origin.x - gsap.getProperty(el, "x"), r.top + r.height / 2 - origin.y - gsap.getProperty(el, "y"));
          var far = Math.min(len / 700, 1);
          var delay = t(0.14 * far);
          tweens.push(gsap.to(el, { scale: 1, opacity: 1, duration: t(0.16), delay: delay, ease: "power2.out" }));
          tweens.push(gsap.to(el, { x: 0, y: 0, duration: t(0.22 + 0.14 * far), delay: delay, ease: "power2.inOut" }));
        });
        popIn = gsap.timeline();
        tweens.forEach(function (tw) { popIn.add(tw, 0); });
        // the link that was open grows no sideways: it scales down from the centre of the bubble, in its own spot
        if (focusEl) {
          gsap.set(focusEl, { x: 0, y: 0, scale: 3, opacity: 0, transformOrigin: "50% 50%" });
          gsap.to(focusEl, { scale: 1, opacity: 1, duration: t(0.3), delay: t(0.05), ease: "power3.out" });
        }
      } else {
        gsap.set(next, { scale: 0, opacity: 0 });
        popIn = gsap.to(next, { scale: 1, opacity: 1, duration: t(0.2), ease: "back.out(1.2)", stagger: t(0.018) });
      }
    });
  }

  // how far, and which way, a link is shoved: straight away from the origin, the closer the harder
  function push(el, origin, soft) {
    var r = el.getBoundingClientRect();
    var dx = r.left + r.width / 2 - origin.x;
    var dy = r.top + r.height / 2 - origin.y;
    var len = Math.hypot(dx, dy) || 1;
    var dist = soft ? 16 + 40 * (1 - Math.min(len / 700, 1)) : 36 + 90 * (1 - Math.min(len / 700, 1));
    return { x: (dx / len) * dist, y: (dy / len) * dist };
  }

  // the hover bubble around a link, as a box on screen: the card starts as this and grows from it
  var dotEl = document.getElementById("mouse-circle");
  function bubbleOf(link) {
    var d = dotEl && dotEl.getBoundingClientRect();
    var r = link.getBoundingClientRect();
    var useDot = d && d.width > 40 && Math.abs(d.left + d.width / 2 - (r.left + r.width / 2)) < r.width && Math.abs(d.top + d.height / 2 - (r.top + r.height / 2)) < r.height;
    var b = useDot
      ? { w: d.width, h: d.height, cx: d.left + d.width / 2, cy: d.top + d.height / 2 }
      : { w: r.width + 44, h: r.height + 20, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
    b.fill = link.getAttribute("data-bubble") || null; // a project's own bubble / card colour
    b.r = useDot ? parseFloat(getComputedStyle(dotEl).borderTopLeftRadius) || b.h / 2 : b.h / 2;
    return b;
  }

  // centre of a link on screen
  function centreOf(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
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
    // a project's first page can carry a background image (proj.bgImage); in a vertical view it stays behind every page
    // (the pages scroll over it)
    var keepImg = view.classList.contains("vertical");
    // moving down the pages also moves down the "field": the grass behind scrolls slower than the pages (a parallax)
    if (keepImg) gsap.to(view, { "--gy": Math.min(100, n * 100 / Math.max(1, pages.length - 1)), duration: animate && !reduce ? 0.85 : 0, ease: "power3.inOut", overwrite: "auto" });
    view.classList.toggle("onFirst", keepImg || n === 0);
    view.classList.toggle("imgIn", keepImg || n === 0); // ...its own switch, so it can fade in slowly when the card opens

    if (animate && old !== next && !reduce) {
      var ax = view.classList.contains("vertical") ? "y" : "x"; // vertical views slide up and down
      var inFrom = { autoAlpha: 0 }, inTo = { autoAlpha: 1, duration: 0.28, ease: "power3.out" }, outTo = { autoAlpha: 0, duration: 0.14, ease: "power2.in", onComplete: null };
      inFrom[ax] = 48 * dir; inTo[ax] = 0; outTo[ax] = -48 * dir;
      if (ax === "y") { // a real scroll: the whole page travels the card's height, the next one rising in behind it (the card clips them)
        var H = view.getBoundingClientRect().height;
        inFrom[ax] = dir * H * 0.9; inFrom.autoAlpha = 1; inTo.duration = 0.85; inTo.ease = "power3.inOut";
        outTo[ax] = -dir * H * 0.9; outTo.autoAlpha = 1; outTo.duration = 0.85; outTo.ease = "power3.inOut";
      }
      gsap.fromTo(next, inFrom, inTo);
      outTo.onComplete = function () { old.classList.remove("is-on"); gsap.set(old, { clearProps: "opacity,visibility,transform" }); };
      gsap.to(old, outTo);
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

  // A view whose first page is a "scene" (Habbot: .coverReveal): before moving to the next page, scrolling or tapping the
  // chevron moves the logo and CTA up (the column is centred, so the text growing below pushes them), brings the text
  // in from below and updates the phone to another screen. Going back reverses it.
  function sceneTo(view, k, animate) {
    var wrap = view.querySelector(".coverReveal");
    if (!wrap) return;
    var txt = wrap.querySelector(".coverText"), alt = view.querySelector(".phoneAlt");
    view._step = k;
    gsap.killTweensOf([wrap, txt, alt]);
    var on = k === 1, d = animate && !reduce ? 0.8 : 0;
    gsap.to(wrap, { height: on ? "auto" : 0, marginTop: on ? 0 : -22, duration: d, ease: "power3.inOut" });
    gsap.to(txt, { opacity: on ? 1 : 0, y: on ? 0 : 40, duration: d, ease: "power3.out", delay: on ? d * 0.15 : 0 });
    if (alt) gsap.to(alt, { opacity: on ? 1 : 0, duration: d, ease: "power2.inOut" });
  }

  function step(delta) {
    if (!open) return;
    var view = open.view;
    if (view.querySelector(".coverReveal") && (view._page || 0) === 0) {
      var k = view._step || 0;
      if (delta > 0 && k === 0) { sceneTo(view, 1, true); return; }
      if (delta < 0 && k === 1) { sceneTo(view, 0, true); return; }
    }
    var count = pagesOf(view).length;
    var n = (view._page || 0) + delta;
    if (view.classList.contains("vertical")) n = (n + count) % count; // vertical views loop: past the last page is the first
    else if (n < 0 || n >= count) return;
    if (count < 2) return;
    setPage(view, n, true, delta);
  }

  function show(trigger, view) {
    if (open) return;
    open = { view: view, trigger: trigger };
    setPage(view, 0, false);
    view.classList.remove("imgIn"); // the background image fades in after the bubble hands over (see reveal)
    sceneTo(view, 0, false);

    view.hidden = false;
    document.documentElement.style.overflow = "hidden";
    document.documentElement.classList.add("view-open");
    // pin the page where it is: a fixed body can't be scrolled by anything (wheel, touch, keys, drags, momentum)
    if (lockY === null) {
      lockY = window.pageYOffset || document.documentElement.scrollTop || 0;
      var bs = document.body.style;
      bs.position = "fixed"; bs.top = -lockY + "px"; bs.left = "0"; bs.right = "0"; bs.width = "100%";
    }
    gsap.set(view, { xPercent: -50, yPercent: -50 });

    // The card starts just under the intro (name, tagline, stat, chips) and runs down the screen,
    // leaving room at the bottom for the gallery row, which gets pushed down beneath it.
    // The "about me" part of the intro (name + tagline) is pushed away from the card like the gallery links, and the
    // filter chips rise into the room it leaves, so the card gets that room too: the card's top is worked out for
    // the risen chips.
    var introTop = intro && intro.querySelector(".introTop");
    var introFilters = intro && intro.querySelector(".filters");
    var collapseBy = 0;
    var freshIntro = false;
    if (introTop && introFilters && !introState) { // first open: remember how far the chips rise so closing can undo it
      var mt = parseFloat(getComputedStyle(introFilters).marginTop) || 0;
      introState = { rise: Math.max(0, introTop.offsetHeight + mt - INTRO_GAP) };
      collapseBy = introState.rise;
      freshIntro = true;
    }
    var top = intro ? intro.getBoundingClientRect().bottom - collapseBy + 24 : 80;
    // the card keeps a familiar shape (3:2): it takes the room available, but never gets taller than that shape
    // allows, and when the room is short it gets narrower instead of squatter
    var fullW = Math.min(window.innerWidth * 0.86, 1100);
    var height = Math.min(Math.max(300, window.innerHeight - top - BOTTOM_ROOM), fullW / CARD_RATIO);
    view.style.width = Math.min(fullW, height * CARD_RATIO) + "px";
    view.style.height = height + "px";
    // and it sits dead centre in the window, as long as that leaves it clear of the chips above and the gallery row
    // under it (otherwise it sits as close to the middle as those allow)
    var minTop = top;
    var maxTop = Math.max(minTop, window.innerHeight - BOTTOM_ROOM - height);
    top = Math.min(maxTop, Math.max(minTop, (window.innerHeight - height) / 2));
    view.style.top = top + height / 2 + "px"; // GSAP's yPercent -50 centres the card on this line
    var cardBottom = top + height; // measured from layout, not the rect: the card is left shrunk after a close
    // the card IS the hover bubble: the bubble (js/mouse.js) grows to the card's size and shape, then the card
    // takes over and its contents fade in
    var b = bubbleOf(trigger);
    open.bubble = b;
    var currentLi = trigger.closest("li");

    if (freshIntro) {
      var aboutEls = introEls();
      gsap.killTweensOf(aboutEls);
      gsap.to(aboutEls, {
        x: function (i, el) { return push(el, { x: b.cx, y: b.cy }).x; },
        y: function (i, el) { return push(el, { x: b.cx, y: b.cy }).y; },
        scale: 0.55,
        opacity: 0,
        duration: t(0.3),
        ease: "power2.out",
        transformOrigin: "50% 50%",
      });
      gsap.killTweensOf(introFilters);
      gsap.to(introFilters, { y: -introState.rise, duration: t(0.5), ease: "power3.inOut" });
    }

    gsap.killTweensOf(view);
    gsap.killTweensOf(view.children);
    gsap.set(view, { autoAlpha: 0, scale: 1, x: 0, y: 0, xPercent: -50, yPercent: -50 });
    gsap.set(view.children, { opacity: 0 });
    var cr = view.getBoundingClientRect();
    var to = { cx: cr.left + cr.width / 2, cy: cr.top + cr.height / 2, w: cr.width, h: cr.height, r: 64, fill: b.fill };
    var reveal = function () {
      if (!open || open.view !== view) return;
      gsap.set(view, { autoAlpha: 1 });
      if (window.bubble) window.bubble.handoff();
      var soft = view.classList.contains("hasBgImage");
      gsap.to(view.children, { opacity: 1, duration: t(soft ? 0.55 : 0.15), ease: soft ? "power1.out" : "none", clearProps: "opacity" });
      // the image layers fade in from the peach (a frame later, so the CSS transition has something to run from)
      requestAnimationFrame(function () { requestAnimationFrame(function () { if (open && open.view === view && (view._page === 0 || view.classList.contains("vertical"))) view.classList.add("imgIn"); }); });
    };
    if (window.bubble) window.bubble.grow(to, b, 0.38, reveal); else reveal();
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
    }, { x: b.cx, y: b.cy });

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
      duration: t(0.15),
      ease: "power2.in",
      onComplete: function () { old.hidden = true; stopMedia(old); gsap.set(old.children, { clearProps: "opacity" }); },
    });
  }

  // the about-me lines (name, tagline)
  function introEls() { return intro ? intro.querySelectorAll(".introTop .name, .introTop .tagline") : []; }

  // the reverse of the push: they start shoved away, small and faint, and are drawn back to their places, the
  // nearer ones first, like the gallery links
  function restoreIntro(origin) {
    var introFilters = intro && intro.querySelector(".filters");
    if (!introState || !introFilters) return;
    introState = null;
    var els = introEls();
    gsap.killTweensOf(els);
    gsap.killTweensOf(introFilters);
    gsap.set(els, { clearProps: "x,y,scale,opacity" }); // measure from their own places
    els.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var len = Math.hypot(r.left + r.width / 2 - origin.x, r.top + r.height / 2 - origin.y);
      var far = Math.min(len / 700, 1);
      var from = push(el, origin, true);
      var delay = t(0.14 * far);
      gsap.set(el, { x: from.x, y: from.y, scale: 0.8, opacity: 0, transformOrigin: "50% 50%" });
      gsap.to(el, { scale: 1, opacity: 1, duration: t(0.16), delay: delay, ease: "power2.out" });
      gsap.to(el, { x: 0, y: 0, duration: t(0.22 + 0.14 * far), delay: delay, ease: "power2.inOut", onComplete: function () { gsap.set(el, { clearProps: "x,y,scale,opacity,transformOrigin" }); } });
    });
    gsap.to(introFilters, { y: 0, duration: t(0.4), ease: "power2.inOut", onComplete: function () { gsap.set(introFilters, { clearProps: "y" }); } });
  }

  function hide() {
    if (!open) return;
    var view = open.view;
    restoreIntro({ x: open.bubble.cx, y: open.bubble.cy });
    var trigger = open.trigger;
    var b = open.bubble;
    open = null;

    gsap.killTweensOf(view);
    var cr = view.getBoundingClientRect();
    var fromCard = { cx: cr.left + cr.width / 2, cy: cr.top + cr.height / 2, w: cr.width, h: cr.height, r: 64, fill: b.fill, shadow: window.bubble && window.bubble.CARD_SHADOW };
    var finish = function () {
      view.hidden = true;
      document.documentElement.style.overflow = "";
      if (lockY !== null) { // let the page scroll again, exactly where it was
        var y = lockY; lockY = null;
        var bs = document.body.style;
        bs.position = ""; bs.top = ""; bs.left = ""; bs.right = ""; bs.width = "";
        window.scrollTo(0, y);
      }
      document.documentElement.classList.remove("view-open");
      stopMedia(view);
      gsap.set(view.children, { clearProps: "opacity" });
    };
    // contents fade, then the card is swapped for the identical grey box, which shrinks into the bubble
    gsap.to(view.children, {
      opacity: 0,
      duration: t(0.05),
      onComplete: function () {
        gsap.set(view, { autoAlpha: 0 });
        if (window.bubble) window.bubble.shrink(fromCard, b, 0.2, finish); else finish();
      },
    });
    popGallery(function () {
      list.classList.remove("compact");
      list.querySelectorAll("li.is-current").forEach(function (li) { li.classList.remove("is-current"); });
      fixSlashes();
      gsap.set(nav, { clearProps: "transform" });
    }, { x: b.cx, y: b.cy }, true, trigger.closest("li"));
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
  // vertical views (Habbot): scroll or click the chevron under the first page's button to move between pages
  var wheelLock = 0;
  // while a view is open nothing outside it may scroll: wheel, touch and the scrolling keys are all stopped (except
  // inside a text block that genuinely needs to scroll)
  function insideScroller(e) { return e.target && e.target.closest && e.target.closest(".pgText"); }
  function onWheel(e) {
    if (!open) return;
    if (!insideScroller(e)) e.preventDefault(); // stops page scrolling and the elastic bounce
    if (e.__habbotSeen) return; // registered on two targets below; act once per event
    e.__habbotSeen = true;
    if (!open.view.classList.contains("vertical")) return;
    var now = Date.now();
    if (Math.abs(e.deltaY) < 12 || now - wheelLock < 750) return; // one page per scroll gesture
    wheelLock = now;
    step(e.deltaY > 0 ? 1 : -1);
  }
  // in the capture phase, on both the document and the window, so nothing can get in ahead of it
  document.addEventListener("wheel", onWheel, { passive: false, capture: true });
  window.addEventListener("wheel", onWheel, { passive: false, capture: true });
  window.addEventListener("touchmove", function (e) { if (open && !insideScroller(e)) e.preventDefault(); }, { passive: false });
  document.addEventListener("keydown", function (e) {
    if (!open || /^(input|textarea|select)$/i.test(e.target.tagName)) return;
    var down = e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ";
    var up = e.key === "ArrowUp" || e.key === "PageUp";
    if (!down && !up && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault(); // no page scrolling behind the view
    if (open.view.classList.contains("vertical")) step(down ? 1 : up ? -1 : 0);
  });
  document.addEventListener("click", function (e) {
    var cue = e.target.closest && e.target.closest(".aboutBtn");
    if (cue && open) step(1);
  });


  // ?debug=1 on the page address shows a small readout (bottom left) of what moves when you scroll: send a screenshot of it
  if (/[?&]debug=1/.test(location.search)) {
    var hud = document.createElement("pre");
    hud.style.cssText = "position:fixed;left:8px;bottom:8px;z-index:99999;margin:0;padding:8px 10px;font:11px/1.4 monospace;background:rgba(0,0,0,.8);color:#9f9;border-radius:6px;pointer-events:none;white-space:pre";
    document.body.appendChild(hud);
    var chip = document.querySelector(".filters");
    var tick = function () {
      var vv = window.visualViewport;
      var v = open && open.view ? open.view.getBoundingClientRect() : null;
      hud.textContent =
        "open: " + !!open + "  lockY: " + lockY + "\n" +
        "scrollY: " + window.pageYOffset + "  html.scrollTop: " + document.documentElement.scrollTop + "  body.scrollTop: " + document.body.scrollTop + "\n" +
        "visualViewport top/left: " + (vv ? vv.offsetTop.toFixed(1) + " / " + vv.offsetLeft.toFixed(1) + "  scale " + vv.scale : "n/a") + "\n" +
        "body position/top: " + getComputedStyle(document.body).position + " / " + getComputedStyle(document.body).top + "\n" +
        "chips top: " + (chip ? chip.getBoundingClientRect().top.toFixed(1) : "-") + "\n" +
        "card top: " + (v ? v.top.toFixed(1) : "-") + "  page: " + (open ? open.view._page : "-");
      requestAnimationFrame(tick);
    };
    tick();
  }

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
