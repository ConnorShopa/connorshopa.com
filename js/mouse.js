// The cursor dot is the hover effect.
//  - It trails the cursor with a smooth lag.
//  - Hovering (or tabbing to) a link morphs the dot into a soft rounded box around that link.
//    The box is "magnetised": it sits on the link but leans toward the cursor.
//  - Moving to another link glides it across; leaving a link shrinks it back to a dot.
//  - The hovered link shrinks a touch.
(function () {
  if (typeof gsap === "undefined") return;

  var dot = document.getElementById("mouse-circle");
  var isTouch = "ontouchstart" in window || navigator.maxTouchPoints;
  if (isTouch || !dot) {
    if (dot) dot.style.display = "none";
    return;
  }

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var t = function (seconds) { return reduce ? 0 : seconds; };
  var clamp = function (v, min, max) { return Math.max(min, Math.min(max, v)); };

  // ---- tuning ----
  var PAD_X = 22;        // box padding around the link text
  var PAD_Y = 10;
  var MAGNET = 0.5;      // how far the box leans toward the cursor (0 = locked to the link, 1 = fully follows)
  var MAX_PULL_X = 32;   // the most the box can drift away from the link, in px
  var MAX_PULL_Y = 16;
  var LINK_SCALE = 0.9;  // hovered links shrink to this fraction of their size...
  var MIN_PX = 14;       // ...but never below this font size
  var FOLLOW_TIME = 0.4; // how smoothly the dot / box trails its target
  var MORPH_TIME = 0.4;  // how long the dot takes to become a box (and back)

  var DOT_SIZE = 32;
  // Corner radius follows the box's shape: a tall, squarish box is fully round (radius = half its height),
  // and as the box gets wider relative to its height the corners tighten, down to ROUND_WIDE of that.
  var ROUND_WIDE = 0.75; // how round the widest boxes are (1 = full pill, lower = squarer)
  var WIDE_AT = 6;       // width / height at which a box counts as "widest"
  var DOT_FILL = "rgba(47, 39, 37, 0.10)";
  var DOT_BORDER = "rgba(47, 39, 37, 0)";
  var BOX_FILL = "#F4F4F4";
  var BOX_BORDER = "rgba(47, 39, 37, 0)"; // no stroke: the bubble is the same soft grey as the project card it grows into
  // the bubble's drop shadow: the project card's shadow, scaled down to the bubble's size
  var BOX_SHADOW = "0px 8px 20px -8px rgba(47, 39, 37, 0.14), 0px 2px 6px 0px rgba(47, 39, 37, 0.05)";
  var DOT_SHADOW = "0px 0px 0px 0px rgba(47, 39, 37, 0), 0px 0px 0px 0px rgba(47, 39, 37, 0)";

  var mouse = { x: 0, y: 0 };
  var seenMouse = false;
  var boxShown = false;
  var currentLink = null;
  var base = null;       // the link's rect while the dot is a box
  var hideCall = null;
  var locked = false;    // true while the project card is using the dot (see window.bubble below)
  var ctl = null;        // the tween that is growing / shrinking the dot
  var SEL = "a, .viewClose, .viewNav, .pill, .lockBtn";

  // The dot is centred on its x / y; quickTo makes it trail whatever target we give it.
  gsap.set(dot, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
  var moveX = gsap.quickTo(dot, "x", { duration: t(FOLLOW_TIME), ease: "power3.out" });
  var moveY = gsap.quickTo(dot, "y", { duration: t(FOLLOW_TIME), ease: "power3.out" });

  // Where the dot's centre should be: on the cursor, or magnetised onto the link.
  function followTarget() {
    if (locked) return;
    var x = mouse.x;
    var y = mouse.y;
    if (boxShown && base) {
      var cx = base.left + base.width / 2;
      var cy = base.top + base.height / 2;
      x = cx + clamp((mouse.x - cx) * MAGNET, -MAX_PULL_X, MAX_PULL_X);
      y = cy + clamp((mouse.y - cy) * MAGNET, -MAX_PULL_Y, MAX_PULL_Y);
    }
    moveX(x);
    moveY(y);
  }

  function morphToBox() {
    if (locked) return;
    var w = base.width + PAD_X * 2;
    var h = base.height + PAD_Y * 2;
    var shape = Math.min(1, Math.max(0, (w / h - 1) / (WIDE_AT - 1))); // 0 = squarish, 1 = very wide
    var radius = (h / 2) * (1 - shape * (1 - ROUND_WIDE));
    // icon-only buttons (the view's close button and page chevrons) get a true circle around the icon instead of a pill
    if (currentLink && (currentLink.classList.contains("viewClose") || currentLink.classList.contains("viewNav"))) {
      w = h = Math.max(base.width, base.height) + 8;
      radius = w / 2;
    }
    // filter chips: the bubble is exactly the chip (what the active button would wrap), no extra padding
    if (currentLink && currentLink.classList.contains("pill")) {
      w = base.width;
      h = base.height;
      radius = h / 2;
    }
    gsap.to(dot, {
      width: w,
      height: h,
      borderRadius: radius,
      backgroundColor: BOX_FILL,
      borderColor: BOX_BORDER,
      boxShadow: BOX_SHADOW,
      duration: t(MORPH_TIME),
      ease: "power3.out",
      overwrite: "auto",
    });
    followTarget();
  }

  function morphToDot() {
    if (locked) return;
    gsap.to(dot, {
      width: DOT_SIZE,
      height: DOT_SIZE,
      borderRadius: DOT_SIZE / 2,
      backgroundColor: DOT_FILL,
      borderColor: DOT_BORDER,
      boxShadow: DOT_SHADOW,
      duration: t(MORPH_TIME * 0.9),
      ease: "power3.out",
      overwrite: "auto",
    });
    followTarget();
  }

  // ---- link helpers ----
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

  function showFor(link) {
    if (locked) return;
    if (hideCall) { hideCall.kill(); hideCall = null; }
    currentLink = link;
    var r = linkRect(link);
    base = { left: r.left, top: r.top, width: r.width, height: r.height };
    shrink(link);
    boxShown = true;
    morphToBox();
  }

  function hideBox() {
    if (locked) return;
    hideCall = null;
    currentLink = null;
    base = null;
    boxShown = false;
    morphToDot();
  }

  function leave() {
    // short grace period so moving between links glides instead of turning back into a dot
    if (hideCall) hideCall.kill();
    hideCall = gsap.delayedCall(0.06, hideBox);
  }

  document.querySelectorAll(SEL).forEach(function (link) {
    link.addEventListener("mouseenter", function () { showFor(link); });
    link.addEventListener("mouseleave", function () { unshrink(link); leave(); });
    // only react to keyboard focus: the view moves focus to its close button (and back) in code, which
    // would otherwise yank the dot onto it before the pointer is anywhere near
    link.addEventListener("focus", function () { if (link.matches(":focus-visible")) showFor(link); });
    link.addEventListener("blur", function () { unshrink(link); leave(); });
  });

  window.addEventListener("mousemove", function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (!seenMouse) {
      seenMouse = true;
      gsap.set(dot, { x: mouse.x, y: mouse.y });
      gsap.to(dot, { autoAlpha: 1, duration: t(0.2) });
    }
    followTarget();
  });

  // keep the box on its link if the page scrolls or resizes while it is open
  function reposition() {
    if (locked) return;
    if (!currentLink || !boxShown) return;
    var r = fullSizeRect(currentLink, linkRect(currentLink));
    base = { left: r.left, top: r.top, width: r.width, height: r.height };
    followTarget();
  }
  window.addEventListener("scroll", reposition, { passive: true });
  window.addEventListener("resize", reposition);

  // ---- the bubble IS the project card while a project opens or closes ----
  // The card's grey box is this same dot: it grows from the hover bubble to the card's size and shape, and on
  // close it shrinks back into the bubble. Geometry objects are { cx, cy, w, h, r, shadow } in viewport px.
  var CARD_SHADOW = "0px 24px 60px -24px rgba(47, 39, 37, 0.14), 0px 4px 14px 0px rgba(47, 39, 37, 0.05)";

  function lock() {
    locked = true;
    if (hideCall) { hideCall.kill(); hideCall = null; }
    if (ctl) { ctl.kill(); ctl = null; }
    gsap.set(dot, { zIndex: 0, mixBlendMode: "normal" }); // under the page, like the hover bubble
  }

  function snapTo(g) {
    gsap.set(dot, {
      x: g.cx, y: g.cy, width: g.w, height: g.h, borderRadius: g.r,
      boxShadow: g.shadow || BOX_SHADOW, backgroundColor: BOX_FILL, borderColor: BOX_BORDER, autoAlpha: 1,
    });
  }

  function unlock() {
    locked = false;
    gsap.set(dot, { clearProps: "zIndex,mixBlendMode" });
    var el = seenMouse ? document.elementFromPoint(mouse.x, mouse.y) : null;
    var link = el && el.closest ? el.closest(SEL) : null;
    if (link) showFor(link); else hideBox();
  }

  window.bubble = {
    CARD_SHADOW: CARD_SHADOW,
    // the bubble grows from `from` (where it is) to `to` (the card)
    grow: function (to, from, dur, done) {
      lock();
      snapTo(from);
      ctl = gsap.to(dot, {
        x: to.cx, y: to.cy, width: to.w, height: to.h, borderRadius: to.r, boxShadow: to.shadow || CARD_SHADOW,
        duration: t(dur), ease: "power4.out", onComplete: done,
      });
    },
    // the card is showing on top of the (now identical) grey box: the dot turns back into the pointer dot, unseen
    handoff: function () {
      gsap.set(dot, {
        x: mouse.x, y: mouse.y, width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2,
        boxShadow: DOT_SHADOW, backgroundColor: DOT_FILL, borderColor: DOT_BORDER, opacity: 0,
      });
      locked = false;
      gsap.set(dot, { clearProps: "zIndex,mixBlendMode" });
      boxShown = false; currentLink = null; base = null;
      gsap.to(dot, { opacity: 1, duration: t(0.2), delay: t(0.15) });
    },
    // the card's grey box shrinks from `from` (the card) back into the bubble `to`
    shrink: function (from, to, dur, done) {
      lock();
      snapTo(from);
      ctl = gsap.to(dot, {
        x: to.cx, y: to.cy, width: to.w, height: to.h, borderRadius: to.r, boxShadow: BOX_SHADOW,
        duration: t(dur), ease: "power3.inOut",
        onComplete: function () { unlock(); if (done) done(); },
      });
    },
  };
})();
