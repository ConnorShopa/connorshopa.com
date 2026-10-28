// The cursor dot is the hover effect.
//  - It trails the cursor with a smooth lag.
//  - Hovering (or tabbing to) a link morphs the dot into a soft rounded box around that link.
//    The box is "magnetised": it sits on the link but leans toward the cursor.
//  - Moving to another link glides it across; leaving a link shrinks it back to a dot.
//  - The hovered link grows, and the items around it are pushed out of its way.
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
  var PAD_X = 12;        // box padding around the link text
  var PAD_Y = 4;
  var MAGNET = 0.3;      // how far the box leans toward the cursor (0 = locked to the link, 1 = fully follows)
  var MAX_PULL_X = 16;   // the most the box can drift away from the link, in px
  var MAX_PULL_Y = 8;
  var GROW = 1.25;       // hovered links in the centre list grow to this multiple of their size
  var FOLLOW_TIME = 0.4; // how smoothly the dot / box trails its target
  var MORPH_TIME = 0.4;  // how long the dot takes to become a box (and back)

  var DOT_SIZE = 32;
  var BOX_RADIUS = 24;
  var DOT_FILL = "rgba(0, 0, 0, 0.10)";
  var DOT_BORDER = "rgba(0, 0, 0, 0)";
  var BOX_FILL = "#F4F4F4";
  var BOX_BORDER = "rgba(0, 0, 0, 0.45)";

  var mouse = { x: 0, y: 0 };
  var seenMouse = false;
  var boxShown = false;
  var currentLink = null;
  var base = null;       // the link's rect while the dot is a box
  var hideCall = null;

  // The dot is centred on its x / y; quickTo makes it trail whatever target we give it.
  gsap.set(dot, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
  var moveX = gsap.quickTo(dot, "x", { duration: t(FOLLOW_TIME), ease: "power3.out" });
  var moveY = gsap.quickTo(dot, "y", { duration: t(FOLLOW_TIME), ease: "power3.out" });

  // Where the dot's centre should be: on the cursor, or magnetised onto the link.
  function followTarget() {
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
    var w = base.width + PAD_X * 2;
    var h = base.height + PAD_Y * 2;
    gsap.to(dot, {
      width: w,
      height: h,
      borderRadius: Math.min(BOX_RADIUS, h / 2),
      backgroundColor: BOX_FILL,
      borderColor: BOX_BORDER,
      duration: t(MORPH_TIME),
      ease: "power3.out",
      overwrite: "auto",
    });
    followTarget();
  }

  function morphToDot() {
    gsap.to(dot, {
      width: DOT_SIZE,
      height: DOT_SIZE,
      borderRadius: DOT_SIZE / 2,
      backgroundColor: DOT_FILL,
      borderColor: DOT_BORDER,
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

  // Growing is real layout (font size + logo size follow the --grow variable in redesign.css),
  // so neighbours are pushed away. While it animates, the box re-measures the link every frame.
  function grow(link) {
    gsap.to(link, {
      "--grow": GROW,
      duration: t(0.45),
      ease: "power3.out",
      overwrite: "auto",
      onUpdate: function () { if (currentLink === link) reposition(); },
    });
  }

  function ungrow(link) {
    gsap.to(link, {
      "--grow": 1,
      duration: t(0.4),
      ease: "power3.out",
      overwrite: "auto",
      onUpdate: function () { if (currentLink === link) reposition(); },
    });
  }

  function showFor(link) {
    if (hideCall) { hideCall.kill(); hideCall = null; }
    currentLink = link;
    var r = linkRect(link);
    base = { left: r.left, top: r.top, width: r.width, height: r.height };
    grow(link);
    boxShown = true;
    morphToBox();
  }

  function hideBox() {
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

  document.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("mouseenter", function () { showFor(link); });
    link.addEventListener("mouseleave", function () { ungrow(link); leave(); });
    link.addEventListener("focus", function () { showFor(link); });
    link.addEventListener("blur", function () { ungrow(link); leave(); });
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
    if (!currentLink || !boxShown) return;
    var r = linkRect(currentLink);
    base = { left: r.left, top: r.top, width: r.width, height: r.height };
    followTarget();
  }
  window.addEventListener("scroll", reposition, { passive: true });
  window.addEventListener("resize", reposition);
})();
