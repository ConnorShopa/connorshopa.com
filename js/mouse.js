// Cursor circle + link hover box, both driven by GSAP.
//  - The circle follows the cursor with a smooth lag.
//  - Hovering (or tabbing to) a link grows a soft box from the link's centre,
//    snapped to the link's bounds. Moving to another link glides the box over.
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

  var PAD_X = 12;
  var PAD_Y = 4;

  // ---- cursor circle (fixed positioning, so no scroll maths) ----
  var moveX, moveY, seenMouse = false;
  if (circle) {
    gsap.set(circle, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
    moveX = gsap.quickTo(circle, "x", { duration: t(0.45), ease: "power3.out" });
    moveY = gsap.quickTo(circle, "y", { duration: t(0.45), ease: "power3.out" });
  }

  window.addEventListener("mousemove", function (e) {
    if (!circle) return;
    if (!seenMouse) {
      seenMouse = true;
      gsap.set(circle, { x: e.clientX, y: e.clientY });
      if (!boxShown) gsap.to(circle, { autoAlpha: 1, duration: t(0.2) });
    }
    moveX(e.clientX);
    moveY(e.clientY);
  });

  // ---- link hover box ----
  var box = document.createElement("div");
  box.id = "hover-box";
  box.setAttribute("aria-hidden", "true");
  document.body.appendChild(box);
  gsap.set(box, { autoAlpha: 0, scale: 0, transformOrigin: "50% 50%" });

  var boxShown = false;
  var currentLink = null;
  var hideCall = null;

  // For a link that wraps across lines, use the line the pointer is on.
  function linkRect(link, e) {
    var rects = link.getClientRects();
    if (e && typeof e.clientX === "number" && rects.length > 1) {
      for (var i = 0; i < rects.length; i++) {
        var r = rects[i];
        if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) return r;
      }
    }
    return rects[0] || link.getBoundingClientRect();
  }

  function boxProps(r) {
    return { x: r.left - PAD_X, y: r.top - PAD_Y, width: r.width + PAD_X * 2, height: r.height + PAD_Y * 2 };
  }

  function showFor(link, e) {
    if (hideCall) { hideCall.kill(); hideCall = null; }
    currentLink = link;
    var props = boxProps(linkRect(link, e));

    if (!boxShown) {
      // first link: appear in place and grow out from the centre
      gsap.killTweensOf(box);
      gsap.set(box, props);
      gsap.fromTo(box, { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: t(0.4), ease: "power3.out" });
      if (circle) gsap.to(circle, { autoAlpha: 0, scale: 0.4, duration: t(0.2), overwrite: "auto" });
      boxShown = true;
    } else {
      // already open: glide to the new link
      gsap.to(box, Object.assign({ duration: t(0.35), ease: "power3.out", overwrite: "auto" }, props));
    }
  }

  function hideBox() {
    hideCall = null;
    currentLink = null;
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
    link.addEventListener("mouseenter", function (e) { showFor(link, e); });
    link.addEventListener("mouseleave", leave);
    link.addEventListener("focus", function () { showFor(link, null); });
    link.addEventListener("blur", leave);
  });

  // keep the box on its link if the page scrolls or resizes while it is open
  function reposition() {
    if (currentLink && boxShown) gsap.set(box, boxProps(linkRect(currentLink, null)));
  }
  window.addEventListener("scroll", reposition, { passive: true });
  window.addEventListener("resize", reposition);
})();
