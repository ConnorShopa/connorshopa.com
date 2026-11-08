// Hover a link in the centre console: the link opens out into a card (project logo, a line of text, an expand icon in the
// top right corner, the colour of the project's own view) and the other links are shoved out of its way.
// Desktop with a mouse only; nothing happens on touch screens or while a project is open.
(function () {
  "use strict";
  var list = document.getElementById("projectList");
  if (!list || !window.gsap) return;
  var mq = window.matchMedia("(min-width: 701px) and (hover: hover) and (pointer: fine)");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var t = function (s) { return reduce ? 0 : s; };
  var LOREM = "Lorem ipsum dolor sit amet";
  var CARD_W = 340, INTENT = 90, EDGE = 14;
  var PUSH_X = 64, PUSH_Y = 48, RIPPLE = 70; // how far clear of the card the links in its way are shoved, and how far the rest lean away
  var ICON = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var cur = null;      // { li, card }
  var timer = null;
  var pushed = [];     // the links shoved aside by the open card

  function zoomOf() { return parseFloat(getComputedStyle(list).zoom) || 1; }
  function usable() { return mq.matches && !document.documentElement.classList.contains("view-open"); }

  // the colour of the project's own view (the card it opens into), else the link's hover-bubble colour
  function colourOf(link) {
    var v = link.getAttribute("data-view") && document.getElementById("view-" + link.getAttribute("data-view"));
    var c = v ? getComputedStyle(v).backgroundColor : "";
    if (!c || /rgba\(0, 0, 0, 0\)|transparent/.test(c)) c = link.getAttribute("data-bubble") || "#E9E9E9";
    return c;
  }
  function isDark(c) {
    var m = c.match(/[\d.]+/g);
    if (!m) { var h = c.replace("#", ""); if (h.length === 3) h = h.replace(/(.)/g, "$1$1"); m = [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
    return (0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2]) / 255 < 0.55;
  }

  function visibleLis() { return Array.prototype.slice.call(list.querySelectorAll("li:not(.row-break):not(.is-hidden):not(.is-current)")); }
  function restOf(li, z) {
    var r = li.getBoundingClientRect();
    return { x: r.left + r.width / 2 - (+gsap.getProperty(li, "x") || 0) * z, y: r.top + r.height / 2 - (+gsap.getProperty(li, "y") || 0) * z, w: r.width, h: r.height };
  }

  function build(li, link) {
    var bg = colourOf(link), dark = isDark(bg);
    var card = document.createElement("div");
    card.className = "hoverCard" + (dark ? " dark" : "");
    card.style.background = bg;
    card.innerHTML = '<div class="hcTop"><div class="hcLogo"></div><span class="hcExpand" role="button" aria-label="Open project">' + ICON + '</span></div><p class="hcText">' + LOREM + "</p>";
    var logo = card.querySelector(".hcLogo");
    Array.prototype.forEach.call(link.childNodes, function (n) { logo.appendChild(n.cloneNode(true)); });
    // a click anywhere on the card (the expand icon included) opens the project, like clicking the link itself
    card.addEventListener("click", function (e) {
      e.preventDefault(); e.stopPropagation();
      reset(true);
      link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, view: window }));
    });
    li.appendChild(card);
    return card;
  }

  function openFor(li) {
    if (!usable()) return;
    var link = li.querySelector("a");
    if (!link) return;
    if (cur && cur.li === li) return;
    if (cur) reset(false);
    var z = zoomOf();
    var card = build(li, link);
    cur = { li: li, card: card };
    li.classList.add("hovering");
    document.documentElement.classList.add("hovCard");
    // where the card sits: centred on the link, nudged back inside the window if it would run off an edge
    var lr = link.getBoundingClientRect(), cxv = lr.left + lr.width / 2, cyv = lr.top + lr.height / 2;
    card.style.zoom = 1 / z;                               // the list may be zoomed down: the card is drawn at true size
    card.style.left = (link.offsetLeft + link.offsetWidth / 2) + "px";
    card.style.top = (link.offsetTop + link.offsetHeight / 2) + "px";
    card.style.width = CARD_W + "px";
    var natH = card.offsetHeight, W = CARD_W, H = natH;     // (true pixels: the card undoes the list's zoom)
    var shiftX = 0, shiftY = 0, vw = window.innerWidth, vh = window.innerHeight;
    if (cxv - W / 2 < EDGE) shiftX = EDGE - (cxv - W / 2); else if (cxv + W / 2 > vw - EDGE) shiftX = vw - EDGE - (cxv + W / 2);
    if (cyv - H / 2 < EDGE) shiftY = EDGE - (cyv - H / 2); else if (cyv + H / 2 > vh - EDGE) shiftY = vh - EDGE - (cyv + H / 2);
    var ccx = cxv + shiftX, ccy = cyv + shiftY;
    // the card grows out of the link's own box
    var startW = (lr.width + 30), startH = (lr.height + 14);
    gsap.set(card, { xPercent: -50, yPercent: -50, x: shiftX, y: shiftY, transformOrigin: "50% 50%" });
    gsap.fromTo(card, { width: startW, height: startH, opacity: 0 }, { width: W, height: H, opacity: 1, duration: t(0.34), ease: "back.out(1.5)", clearProps: "height" });
    gsap.fromTo(card.querySelectorAll(".hcTop, .hcText"), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: t(0.22), delay: t(0.1), stagger: t(0.05), ease: "power2.out" });
    // the others are shoved: first a gentle lean away from the card, then a relaxation: links in the card's way (with air
    // around it) are moved clear, and any two links that touch push each other apart, until nothing overlaps
    pushed = [];
    var others = visibleLis().filter(function (o) { return o !== li; }).map(function (o) { var r = restOf(o, z); return { el: o, rx: r.x, ry: r.y, w: r.w, h: r.h, x: r.x, y: r.y }; });
    others.forEach(function (o) {
      var dx = o.x - ccx, dy = o.y - ccy, len = Math.hypot(dx, dy) || 1, k = RIPPLE * (1 - Math.min(len / 900, 1));
      o.x += (dx / len) * k; o.y += (dy / len) * k;
    });
    var halfW = W / 2 + PUSH_X, halfH = H / 2 + PUSH_Y, GX = 16, GY = 10, M = 8;
    for (var it = 0; it < 60; it++) {
      var moved = false;
      others.forEach(function (o) { // out of the card's box, by the shorter way
        var dx = o.x - ccx, dy = o.y - ccy, ox = halfW + o.w / 2 - Math.abs(dx), oy = halfH + o.h / 2 - Math.abs(dy);
        if (ox > 0 && oy > 0) { moved = true; if (ox < oy * 1.4) o.x += (dx < 0 ? -1 : 1) * ox; else o.y += (dy < 0 ? -1 : 1) * oy; }
      });
      for (var i = 0; i < others.length; i++) {
        for (var j = i + 1; j < others.length; j++) { // two links that touch push each other apart
          var a1 = others[i], b1 = others[j], dx2 = b1.x - a1.x, dy2 = b1.y - a1.y;
          var ox2 = (a1.w + b1.w) / 2 + GX - Math.abs(dx2), oy2 = (a1.h + b1.h) / 2 + GY - Math.abs(dy2);
          if (ox2 > 0 && oy2 > 0) {
            moved = true;
            if (ox2 < oy2 * 1.4) { var sx = (dx2 < 0 ? -1 : 1) * ox2 / 2; a1.x -= sx; b1.x += sx; } else { var sy = (dy2 < 0 ? -1 : 1) * oy2 / 2; a1.y -= sy; b1.y += sy; }
          }
        }
      }
      others.forEach(function (o) { o.x = Math.max(M + o.w / 2, Math.min(vw - M - o.w / 2, o.x)); o.y = Math.max(M + o.h / 2, Math.min(vh - M - o.h / 2, o.y)); }); // stay on screen
      if (!moved) break;
    }
    others.forEach(function (o) {
      var d = Math.min(Math.hypot(o.rx - ccx, o.ry - ccy) / 700, 1);
      gsap.to(o.el, { x: (o.x - o.rx) / z, y: (o.y - o.ry) / z, duration: t(0.4), delay: t(0.12 * d), ease: "back.out(1.1)", overwrite: "auto" });
      pushed.push(o.el);
    });
  }

  // put everything back (animated unless quick)
  function reset(quick) {
    clearTimeout(timer); timer = null;
    var c = cur; cur = null;
    document.documentElement.classList.remove("hovCard");
    var others = pushed; pushed = [];
    if (quick) {
      gsap.killTweensOf(others);
      gsap.set(list.querySelectorAll("li"), { clearProps: "x,y" });
    } else {
      others.forEach(function (o) { gsap.to(o, { x: 0, y: 0, duration: t(0.32), ease: "power3.out", overwrite: "auto", clearProps: "x,y" }); });
    }
    if (c) {
      var done = function () { if (c.card.parentNode) c.card.parentNode.removeChild(c.card); c.li.classList.remove("hovering"); };
      if (quick) { gsap.killTweensOf(c.card); done(); }
      else gsap.to(c.card, { opacity: 0, scale: 0.9, duration: t(0.16), ease: "power2.in", onComplete: done });
    }
  }

  list.addEventListener("mouseover", function (e) {
    if (!usable()) return;
    var li = e.target.closest && e.target.closest("li:not(.row-break)");
    if (!li || !list.contains(li) || li.classList.contains("is-current")) return;
    if (cur && cur.li === li) return;
    clearTimeout(timer);
    timer = setTimeout(function () { openFor(li); }, cur ? 0 : INTENT);
  });
  list.addEventListener("mouseleave", function () { clearTimeout(timer); reset(false); });
  // moving from one link's card to empty space between links
  list.addEventListener("mouseout", function (e) {
    var to = e.relatedTarget, li = e.target.closest && e.target.closest("li");
    if (!cur || !li || li !== cur.li) return;
    if (to && li.contains(to)) return;
    clearTimeout(timer);
    reset(false);
  });
  // opening a project by any route: put the console back at once
  list.addEventListener("click", function () { reset(true); }, true);
  window.addEventListener("resize", function () { reset(true); });
  document.addEventListener("scroll", function () { if (cur) reset(true); }, { passive: true });
})();
