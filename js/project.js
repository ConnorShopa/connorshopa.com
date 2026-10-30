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
  var BOTTOM_ROOM = 104; // space kept under the card for the gallery row: 48px to the screen edge + the row + the gap above it

  var open = null; // { view, trigger, link }
  var holdRow = false; // while a project is open the gallery row stays hidden (it pops back in on close)
  var TABS_TOP = 48;   // the tabs sit this far from the top of the screen while a project is open
  var SIDE = 88;       // room left and right of the card for the previous / next project chevrons

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
      popTl.to(current, { scale: 0, opacity: 0, duration: t(0.12), ease: "power2.in", stagger: t(0.012), transformOrigin: "50% 50%" });
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
        if (holdRow) return; // a project is open: the row stays away
        popIn = gsap.to(next, { scale: 1, opacity: 1, duration: t(0.2), ease: "power2.out", stagger: t(0.018) });
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
    // looping screen recordings (Habbot's phones) play from the start while their page is showing; videos with their own
    // controls (Plunk's) never start by themselves
    scope.querySelectorAll("video[loop]").forEach(function (v) { try { v.currentTime = 0; } catch (e) {} var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); });
  }

  // go to page n (dir: 1 = forward, -1 = back) with a short slide + fade; animate=false just swaps
  // Habbot: one phone stays put while the text scrolls past; each page only changes the recording playing on it (the phone keeps one angle, from the CSS).
  // The first time the view is paged, every page's phone is lifted out into one shared stage over the pages.
  function ensureShared(view) {
    if (view._shared !== undefined) return view._shared;
    view._shared = null;
    var vb = view.querySelector(".viewBody");
    var pgs = Array.prototype.slice.call(pagesOf(view));
    var clips = pgs.map(function (p) { var v = p.querySelector(".phone video"); return v ? v.getAttribute("src") : null; });
    if (!vb || !clips[0] || !view.classList.contains("vertical")) return null;
    var stage = document.createElement("div");
    stage.className = "sharedStage";
    var phone = pgs[0].querySelector(".phone");
    pgs.forEach(function (p, i) { var ph = p.querySelector(".phone"); if (ph && ph !== phone) ph.remove(); });
    stage.appendChild(phone);
    vb.appendChild(stage);
    view._shared = { phone: phone, video: phone.querySelector("video"), clips: clips, cur: -1 };
    return view._shared;
  }
  function syncShared(view, n) {
    var sh = ensureShared(view);
    if (!sh || !sh.clips[n]) return;
    var v = sh.video;
    var play = function () { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); };
    if (sh.cur === n) { play(); return; }
    var first = sh.cur === -1;
    sh.cur = n;
    if (first) { v.currentTime = 0; play(); return; }
    // the old recording fades out, the next one starts from its beginning
    gsap.killTweensOf(v);
    gsap.to(v, { opacity: 0, duration: reduce ? 0 : 0.2, ease: "power1.in", onComplete: function () {
      v.src = sh.clips[n];
      v.load();
      play();
      gsap.to(v, { opacity: 1, duration: reduce ? 0 : 0.3, ease: "power1.out" });
    } });
  }

  function setPage(view, n, animate, dir) {
    var pages = pagesOf(view);
    if (!pages.length) return;
    if (view.classList.contains("scrollView")) { // every page is on, one under the other: the card scrolls
      view._page = 0;
      pages.forEach(function (p) { p.classList.add("is-on"); startMedia(p); });
      return;
    }
    n = Math.max(0, Math.min(pages.length - 1, n));
    var from = view._page || 0;
    var old = pages[from];
    var next = pages[n];
    gsap.killTweensOf(pages);
    pages.forEach(function (p) { if (p !== next && p !== old) p.classList.remove("is-on"); gsap.set(p, { clearProps: "opacity,transform" }); });

    if (old !== next) stopMedia(old);
    next.classList.add("is-on");
    startMedia(next);
    syncShared(view, n);
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
    if (open.view.classList.contains("scrollView")) return;
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

  // where every gallery link sits while the list is at rest, noted each time a project is opened from the gallery:
  // a project reached by the chevrons collapses back to its link's resting place (the open row has moved by then)
  var restSpots = {};
  function noteRestSpots() {
    if (list.classList.contains("compact")) return;
    Array.prototype.forEach.call(document.querySelectorAll("#projectList [data-view]"), function (l) {
      var r = l.getBoundingClientRect();
      restSpots[l.getAttribute("data-view")] = { w: r.width + 44, h: r.height + 20, cx: r.left + r.width / 2, cy: r.top + r.height / 2, r: (r.height + 20) / 2 };
    });
  }
  function show(trigger, view, link) {
    if (open) return;
    noteRestSpots();
    open = { view: view, trigger: trigger, link: link || trigger };
    setPage(view, 0, false);
    var vbody = view.querySelector(".viewBody");
    if (vbody) vbody.scrollTop = 0;
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
    var narrow = window.innerWidth <= 700;
    // the project colour takes over the whole page
    // ...a lighter tint of it, so the card stands out against it
    // the page behind takes the project's own colour; the card (and the hover bubble that grows into it) is the lighter tint
    var pageBg = view.style.getPropertyValue("--page-bg") || "#E4E4E4";
    var tintBg = getComputedStyle(view).backgroundColor;
    if (!introState && introFilters) { // first open: the tabs rise to the top of the screen, the name and tagline fade
      introState = { restTop: introFilters.getBoundingClientRect().top, bg: getComputedStyle(document.body).backgroundColor };
    }
    var chipsH = introFilters ? introFilters.offsetHeight : 32;
    if (introFilters && introState) {
      gsap.killTweensOf(introFilters);
      gsap.to(introFilters, { y: TABS_TOP - introState.restTop, duration: t(0.38), ease: "power3.out" });
    }
    if (introTop) gsap.to(introTop, { autoAlpha: 0, duration: t(0.25), ease: "power2.out" });
    gsap.to([document.documentElement, document.body], { backgroundColor: pageBg, duration: t(0.38), ease: "power2.out", overwrite: "auto" });
    // the close icon is white or black, whichever reads on this project's colour
    var cm = getComputedStyle(view).backgroundColor.match(/[\d.]+/g) || [255, 255, 255];
    var lum = (0.299 * cm[0] + 0.587 * cm[1] + 0.114 * cm[2]) / 255;
    view.style.setProperty("--closeInk", lum < 0.55 ? "#FFFFFF" : "#1A1A1A");
    view.style.setProperty("--tint", tintBg);
    var darkCard = lum < 0.55;
    // the card takes the rest of the screen: 24px under the tabs, with room either side for the chevrons
    var top = TABS_TOP + chipsH + 24;
    var side = narrow ? 12 : SIDE;
    var bottomGap = narrow ? 12 : BOTTOM_ROOM; // desktop: the gallery row stays beneath the card, 48px above the bottom edge
    var height = Math.max(300, window.innerHeight - top - bottomGap);
    view.style.width = (window.innerWidth - side * 2) + "px";
    view.style.height = height + "px";
    view.style.top = top + height / 2 + "px"; // GSAP's yPercent -50 centres the card on this line
    var cardBottom = top + height;
    showProjNav(view, top, height, side, narrow, tintBg);
    showChrome(view, top, side, tintBg, narrow, darkCard);
    // the card IS the hover bubble: the bubble (js/mouse.js) grows to the card's size and shape, then the card
    // takes over and its contents fade in
    var b = bubbleOf(trigger);
    open.bubble = b;
    var currentLi = (open.link || trigger).closest("li");

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
      // the row sits 48px above the bottom edge of the screen (phones keep it just under the card)
      var rowCentre = window.innerWidth > 700 ? window.innerHeight - 48 - (rowH * MINI) / 2 : cardBottom + GAP + (rowH * MINI) / 2;
      var drop = rowCentre - (n.top + n.height / 2);
      gsap.set(nav, { scale: MINI, y: drop, transformOrigin: "50% 50%" });
    }, { x: b.cx, y: b.cy });

    var close = view._close || view.querySelector(".viewClose");
    if (close) gsap.delayedCall(t(0.2), function () { close.focus({ preventScroll: true }); });
  }

  // opening another project from the gallery row while one is open: the old card shrinks away (the
  // gallery isn't touched; show() below re-lays it out for the new project)
  function switchFrom(current) {
    var old = current.view;
    hideChrome(old);
    open = null;
    gsap.killTweensOf(old);
    gsap.to(old, {
      autoAlpha: 0,
      scale: 0.9,
      duration: t(0.22),
      ease: "power2.in",
      onComplete: function () { old.hidden = true; gsap.set(old, { scale: 1 }); stopMedia(old); gsap.set(old.children, { clearProps: "opacity" }); },
    });
  }

  // the about-me text (the tagline; the name stays put)
  function introEls() { return intro ? intro.querySelectorAll(".introTop .tagline .tl") : []; }

  // closing: the tabs drop back, the name and tagline return and the page goes back to its own colour
  function restoreIntro() {
    var introFilters = intro && intro.querySelector(".filters");
    var introTop = intro && intro.querySelector(".introTop");
    if (!introState) return;
    var bg = introState.bg;
    introState = null;
    if (introFilters) { gsap.killTweensOf(introFilters); gsap.to(introFilters, { y: 0, duration: t(0.4), ease: "power2.inOut", onComplete: function () { gsap.set(introFilters, { clearProps: "y" }); } }); }
    if (introTop) { gsap.killTweensOf(introTop); gsap.to(introTop, { autoAlpha: 1, duration: t(0.3), delay: t(0.1), ease: "power2.out", onComplete: function () { gsap.set(introTop, { clearProps: "opacity,visibility" }); } }); }
    gsap.to([document.documentElement, document.body], { backgroundColor: bg, duration: t(0.4), ease: "power2.inOut", overwrite: "auto", onComplete: function () { gsap.set([document.documentElement, document.body], { clearProps: "backgroundColor" }); } });
  }

  function hide() {
    if (typeof syncChips === "function") syncChips(null);
    if (!open) return;
    var view = open.view;
    holdRow = false;
    hideProjNav();
    hideChrome(view);
    restoreIntro();
    var trigger = open.trigger;
    var open_link = open.link;
    var b = open.bubble;
    // opened from a chevron: the card collapses back toward its own link in the gallery, not toward the chevron
    if (open_link && open_link !== trigger) {
      var rs = restSpots[open_link.getAttribute("data-view")];
      if (rs) b = { w: rs.w, h: rs.h, cx: rs.cx, cy: rs.cy, r: rs.r, fill: open_link.getAttribute("data-bubble") || null };
    }
    // wherever the list has moved to while the card was open, the card collapses into the link's real resting place:
    // measure it with the row laid out as at rest, and take off any shove the gallery animation has put on it
    if (open_link && list.classList.contains("compact")) {
      list.classList.remove("compact");
      var li = open_link.closest("li"), rr = open_link.getBoundingClientRect(), dxs = 0, dys = 0;
      [open_link, li, nav].forEach(function (el) { if (!el) return; dxs += +gsap.getProperty(el, "x") || 0; dys += +gsap.getProperty(el, "y") || 0; });
      list.classList.add("compact");
      var rest = { w: rr.width + 44, h: rr.height + 20, cx: rr.left + rr.width / 2 - dxs, cy: rr.top + rr.height / 2 - dys, r: (rr.height + 20) / 2, fill: b.fill };
      if (rr.width > 0 && Math.abs(rest.cx - b.cx) + Math.abs(rest.cy - b.cy) > 6) b = rest;
    }
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
    }, { x: b.cx, y: b.cy }, true, (open_link || trigger).closest("li"));
    trigger.focus({ preventScroll: true });
  }

  // ---- previous / next project: chevrons outside the card, left and right ----
  var projNav = ["prev", "next"].map(function (dir) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "projNav " + dir;
    b.setAttribute("aria-label", dir === "prev" ? "Previous project" : "Next project");
    b.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="' + (dir === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7") + '" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    b.hidden = true;
    document.body.appendChild(b);
    b.addEventListener("click", function () { goProject(dir === "prev" ? -1 : 1); });
    return b;
  });
  if (window.bindHover) window.bindHover(document); // the chevrons join the site-wide hover bubble
  function showProjNav(view, top, height, side, narrow, tint) {
    if (narrow) return;
    // each chevron's hover bubble takes the colour of the project it leads to
    var links = Array.prototype.filter.call(document.querySelectorAll("#projectList [data-view]"), function (l) { return document.getElementById("view-" + l.getAttribute("data-view")); });
    var cur = links.findIndex(function (l) { return document.getElementById("view-" + l.getAttribute("data-view")) === view; });
    projNav.forEach(function (b, i) {
      b.hidden = false;
      var nb = cur < 0 ? null : links[(cur + (i === 0 ? -1 : 1) + links.length) % links.length].getAttribute("data-bubble");
      if (nb) b.setAttribute("data-bubble", nb); else b.removeAttribute("data-bubble");
      b.style.top = top + height / 2 + "px";
      b.style[i === 0 ? "left" : "right"] = (side - 40) / 2 + "px";
      gsap.fromTo(b, { autoAlpha: 0 }, { autoAlpha: 1, duration: t(0.3), delay: t(0.15), overwrite: "auto" });
    });
  }
  // the logo and close button of a scrolling project float above everything (they live on the page, above the
  // cursor bubble), so the one site-wide bubble can sit behind them and change only colour and shape
  function showChrome(view, top, side, tint, narrow, dark) {
    if (!view.classList.contains("scrollView")) return;
    var head = view._head || (view._head = view.querySelector(".viewHead"));
    var close = view._close || (view._close = view.querySelector(".viewClose"));
    if (!head || !close) return;
    [head, close].forEach(function (el) {
      if (el.parentNode !== document.body) document.body.appendChild(el);
      el.classList.add("floating");
      el.classList.toggle("dark", dark);
      el.setAttribute("data-bubble", tint);
      el.hidden = false;
    });
    if (!head.__toTop) {
      head.__toTop = true;
      head.setAttribute("role", "button");
      head.setAttribute("tabindex", "0");
      head.setAttribute("aria-label", "Back to the top");
      var toTop = function () { var vb = view.querySelector(".viewBody"); if (vb) vb.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); };
      head.addEventListener("click", toTop);
      head.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toTop(); } });
    }
    var inset = narrow ? 20 : 52, drop = narrow ? 20 : 44;
    head.style.left = side + inset + "px";
    head.style.top = top + drop + "px";
    close.style.right = side + inset + "px";
    close.style.top = top + drop + "px";
    close.style.color = dark ? "#FFFFFF" : "#1A1A1A";
    gsap.fromTo([head, close], { autoAlpha: 0 }, { autoAlpha: 1, duration: t(0.3), delay: t(0.25), overwrite: "auto" });
  }
  function hideChrome(view) {
    [view._head, view._close].forEach(function (el) {
      if (el) gsap.to(el, { autoAlpha: 0, duration: t(0.15), overwrite: "auto", onComplete: function () { el.hidden = true; } });
    });
  }
  function hideProjNav() {
    projNav.forEach(function (b) { gsap.to(b, { autoAlpha: 0, duration: t(0.15), overwrite: "auto", onComplete: function () { b.hidden = true; } }); });
  }
  // the card collapses, the next (or previous) project's card grows out of the chevron
  function goProject(delta) {
    if (!open) return;
    var links = Array.prototype.filter.call(document.querySelectorAll("#projectList [data-view]"), function (l) { return document.getElementById("view-" + l.getAttribute("data-view")); });
    var i = links.findIndex(function (l) { return document.getElementById("view-" + l.getAttribute("data-view")) === open.view; });
    var link = links[(i + delta + links.length) % links.length];
    var view = document.getElementById("view-" + link.getAttribute("data-view"));
    var btn = projNav[delta < 0 ? 0 : 1];
    switchFrom(open);
    gsap.delayedCall(t(0.2), function () { show(btn, view, link); });
  }

  function bindViewLink(link) {
    var view = document.getElementById("view-" + link.getAttribute("data-view"));
    if (!view) return;
    link.addEventListener("click", function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return; // let modified clicks behave normally
      e.preventDefault();
      if (open && open.view === view) return; // already open
      if (open) switchFrom(open);             // another project is open: swap it out, then open this one
      show(link, view);
    });
  }
  // also called for links added later (the mobile card deck)
  window.bindProjectLinks = function (root) { (root || document).querySelectorAll("[data-view]").forEach(function (l) { if (!l.__viewBound) { l.__viewBound = true; bindViewLink(l); } }); };
  window.bindProjectLinks();

  // Work is the gallery itself: it is the lit chip whenever nothing is open, and clicking it closes whatever is
  var workChip = document.querySelector("[data-work]");
  var chips = document.querySelectorAll(".filters .pill");
  function syncChips(name) {
    chips.forEach(function (c) {
      var on = name ? c.getAttribute("data-panel") === name : c.hasAttribute("data-work");
      c.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }
  document.querySelectorAll("[data-view]").forEach(function (l) {
    l.addEventListener("click", function () { syncChips(l.classList.contains("pill") ? l.getAttribute("data-view") : null); });
  });
  document.addEventListener("click", function (e) { if (e.target.closest(".viewClose, .view .viewBack")) syncChips(null); }, true);
  if (workChip) workChip.addEventListener("click", function () { if (open) hide(); syncChips(null); });

  document.querySelectorAll(".viewClose").forEach(function (b) { b.addEventListener("click", hide); });
  // vertical views (Habbot): scroll or click the chevron under the first page's button to move between pages
  var wheelLock = 0;
  // while a view is open nothing outside it may scroll: wheel, touch and the scrolling keys are all stopped (except
  // inside a text block that genuinely needs to scroll)
  function insideScroller(e) { return e.target && e.target.closest && e.target.closest(".pgText, .pgGallery, .pg, .viewBody"); }
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
  // touch screens: swipe sideways to go between pages (up / down in the vertical Habbot view)
  var swipe = null;
  document.addEventListener("touchstart", function (e) {
    if (!open || !e.touches[0] || !e.target.closest(".view")) { swipe = null; return; }
    swipe = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });
  document.addEventListener("touchend", function (e) {
    if (!swipe || !open || !e.changedTouches[0]) return;
    var dx = e.changedTouches[0].clientX - swipe.x, dy = e.changedTouches[0].clientY - swipe.y;
    swipe = null;
    var vertical = open.view.classList.contains("vertical");
    var d = vertical ? dy : dx, o = vertical ? dx : dy;
    if (Math.abs(d) > 60 && Math.abs(d) > Math.abs(o) * 1.5) step(d < 0 ? 1 : -1);
  }, { passive: true });

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
