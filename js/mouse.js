// Cursor circle + link hover box, both driven by GSAP.
//  - The circle follows the cursor with a smooth lag.
//  - Hovering (or tabbing to) a link grows a hollow, rounded box from the link's
//    centre, snapped to the link's bounds. It is "magnetised": it stays on the
//    link but leans toward the cursor, so it still follows the mouse a little.
//    Moving to another link glides the box over. The hovered link shrinks a touch.
(function () {
  if (typeof gsap === "undefined") return;

  var circle = document.getElementById("mouse-circle");
  var isTouch = "ontouchstart" in window || navigator.maxTouchPoints;
  if (isTouch) {
    if (circle) circle.style.display = "none";
    return;
  }

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var t = function (seconds) { return reduce ? 0 : seconds; };
  var clamp = function (v, min, max) { return Math.max(min, Math.min(max, v)); };

  // ---- tuning ----
  var PAD_X = 12;       // box padding around the link text
  var PAD_Y = 4;
  var MAGNET = 0.3;     // how far the box leans toward the cursor (0 = locked to the link, 1 = fully follows)
  var MAX_PULL_X = 16;  // the most the box can drift away from the link, in px
  var MAX_PULL_Y = 8;
  var LINK_SCALE = 0.9; // hovered links shrink to this fraction of their size...
  var MIN_PX = 14;      // ...but never below this font size

  var mouse = { x: 0, y: 0 };
  var seenMouse = false;

  // ---- cursor circle (fixed positioning, so no scroll maths) ----
  var moveX, moveY;
  if (circle) {
    gsap.set(circle, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
    moveX = gsap.quickTo(circle, "x", { duration: t(0.45), ease: "power3.out" });
    moveY = gsap.quickTo(circle, "y", { duration: t(0.45), ease: "power3.out" });
  }

  // ---- link hover box ----
  var box = document.createElement("div");
  box.id = "hover-box";
  box.setAttribute("aria-hidden", "true");
  document.body.appendChild(box);
  gsap.set(box, { autoAlpha: 0, scale: 0, transformOrigin: "50% 50%" });

  var boxShown = false;
  var currentLink = null;
  var base = null;      // the link's rect while the box is open
  var hideCall = null;

  // For a link that wraps across lines, use the line the pointer is on.
  function linkRect(link) {
    var rects = link.getClientRects();
    if (rects.length > 1) {
      for (var i = 0; i < rects.length; i++) {
        var r = rects[i];
        if (mouse.x >= r.left && mouse.x <= r.right && mouse.y >= r.top && mouse.y <= r.bottom) return r;
      }
    }
    return rects[0] || link.getBoundingClientRect();
  }

  // The scale a hovered link shrinks to, keeping its text at or above MIN_PX.
  function shrinkScale(link) {
    var fontSize = parseFloat(getComputedStyle(link).fontSize) || MIN_PX;
    return Math.min(1, Math.max(LINK_SCALE, MIN_PX / fontSize));
  }

  function shrink(link) {
    gsap.to(link, { scale: shrinkScale(link), duration: t(0.4), ease: "power3.out", overwrite: "auto" });
  }

  function unshrink(link) {
    gsap.to(link, { scale: 1, duration: t(0.35), ease: "power3.out", overwrite: "auto" });
  }

  // A link's rect measured while it is shrunk, converted back to its full size
  function fullSizeRect(link, r) {
    var s = gsap.getProperty(link, "scale") || 1;
    if (s === 1) return r;
    var w = r.width / s;
    var h = r.height / s;
    return { left: r.left - (w - r.width) / 2, top: r.top - (h - r.height) / 2, width: w, height: h };
  }

  // Where the box should sit: on the link, leaning toward the cursor.
  function target() {
    var cx = base.left + base.width / 2;
    var cy = base.top + base.height / 2;
    var pullX = clamp((mouse.x - cx) * MAGNET, -MAX_PULL_X, MAX_PULL_X);
    var pullY = clamp((mouse.y - cy) * MAGNET, -MAX_PULL_Y, MAX_PULL_Y);
    return {
      x: base.left - PAD_X + pullX,
      y: base.top - PAD_Y + pullY,
      width: base.width + PAD_X * 2,
      height: base.height + PAD_Y * 2,
    };
  }

  function showFor(link) {
    if (hideCall) { hideCall.kill(); hideCall = null; }
    currentLink = link;
    var r = linkRect(link);
    base = { left: r.left, top: r.top, width: r.width, height: r.height };
    shrink(link);

    if (!boxShown) {
      // first link: appear in place and grow out from the centre
      gsap.killTweensOf(box);
      gsap.set(box, target());
      gsap.fromTo(box, { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: t(0.4), ease: "power3.out" });
      if (circle) gsap.to(circle, { autoAlpha: 0, scale: 0.4, duration: t(0.2), overwrite: "auto" });
      boxShown = true;
    } else {
      // already open: glide to the new link
      gsap.to(box, Object.assign({ duration: t(0.35), ease: "power3.out", overwrite: "auto" }, target()));
    }
  }

  function hideBox() {
    hideCall = null;
    currentLink = null;
    base = null;
    boxShown = false;
    gsap.to(box, { autoAlpha: 0, scale: 0.85, duration: t(0.22), ease: "power2.in", overwrite: "auto" });
    if (circle && seenMouse) gsap.to(circle, { autoAlpha: 1, scale: 1, duration: t(0.25), overwrite: "auto" });
  }

  function leave() {
    // short grace period so moving between links glides instead of closing
    if (hideCall) hideCall.kill();
    hideCall = gsap.delayedCall(0.06, hideBox);
  }

  document.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("mouseenter", function () { showFor(link); });
    link.addEventListener("mouseleave", function () { unshrink(link); leave(); });
    link.addEventListener("focus", function () { showFor(link); });
    link.addEventListener("blur", function () { unshrink(link); leave(); });
  });

  window.addEventListener("mousemove", function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    if (circle) {
      if (!seenMouse) {
        gsap.set(circle, { x: mouse.x, y: mouse.y });
        if (!boxShown) gsap.to(circle, { autoAlpha: 1, duration: t(0.2) });
      }
      moveX(mouse.x);
      moveY(mouse.y);
    }
    seenMouse = true;

    // magnet: ease the box toward the cursor, staying anchored to its link
    if (boxShown && base) {
      var p = target();
      gsap.to(box, { x: p.x, y: p.y, duration: t(0.35), ease: "power3.out", overwrite: "auto" });
    }
  });

  // keep the box on its link if the page scrolls or resizes while it is open
  function reposition() {
    if (!currentLink || !boxShown) return;
    var r = fullSizeRect(currentLink, linkRect(currentLink));
    base = { left: r.left, top: r.top, width: r.width, height: r.height };
    gsap.set(box, target());
  }
  window.addEventListener("scroll", reposition, { passive: true });
  window.addEventListener("resize", reposition);
})();
