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
  var LOREM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.";
  var CARD_W = 340, INTENT = 90, EDGE = 14;
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
    gsap.fromTo(card, { width: startW, height: startH, borderRadius: 999, opacity: 0 }, { width: W, height: H, borderRadius: 30, opacity: 1, duration: t(0.34), ease: "back.out(1.5)", clearProps: "height" });
    gsap.fromTo(card.querySelectorAll(".hcTop, .hcText"), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: t(0.22), delay: t(0.1), stagger: t(0.05), ease: "power2.out" });
    // the others are shoved: out of the card's box if they sit in it, else a gentle push away from it
    pushed = [];
    visibleLis().forEach(function (o) {
      if (o === li) return;
      var r = restOf(o, z);
      var dx = r.x - ccx, dy = r.y - ccy;
      var ox = W / 2 + r.w / 2 + 18 - Math.abs(dx), oy = H / 2 + r.h / 2 + 14 - Math.abs(dy);
      var mx = 0, my = 0;
      if (ox > 0 && oy > 0) { // inside the card's box: shove along the way out that is shorter
        if (ox < oy * 1.4) mx = (dx < 0 ? -1 : 1) * ox; else my = (dy < 0 ? -1 : 1) * oy;
      } else { // a ripple: nearer links lean away a little
        var len = Math.hypot(dx, dy) || 1, k = 18 * (1 - Math.min(len / 600, 1));
        mx = (dx / len) * k; my = (dy / len) * k;
      }
      var d = Math.min(Math.hypot(dx, dy) / 700, 1);
      gsap.to(o, { x: mx / z, y: my / z, duration: t(0.4), delay: t(0.03 * d * 4), ease: "back.out(1.2)", overwrite: "auto" });
      pushed.push(o);
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
