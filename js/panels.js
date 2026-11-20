// About and Contact are sections under Work on the main page. The tabs stay on screen (they stick to the top once the
// page has scrolled past them), jump to their section on click, and light up for whichever section is in view.
(function () {
  if (!window.PANELS) return;
  var below = document.querySelector(".below");
  var nav = document.querySelector(".hero > nav");
  // phones keep the fixed header and the tile grid in a scrolling area of its own: the sections go inside that
  var phone = function () { return window.innerWidth <= 700; };
  var scroller = function () { return phone() ? nav : null; };
  var chips = Array.prototype.slice.call(document.querySelectorAll(".filters .pill"));
  var filters = document.querySelector(".filters");
  if (!below || !filters || !chips.length) return;
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var secs = {};
  ["about", "contact"].forEach(function (name) {
    var sec = document.createElement("section");
    sec.className = "homeSec";
    sec.id = name;
    sec.setAttribute("aria-label", window.PANELS[name].title);
    sec.innerHTML = window.PANELS[name].pages[0].html;
    (phone() && nav ? nav : below).appendChild(sec);
    if (window.bindHover) window.bindHover(sec);
    secs[name] = sec;
    // line by line as the section scrolls into view: a small rise and a fade, once
    if (!reduce && window.IntersectionObserver && typeof gsap !== "undefined") {
      var lines = sec.querySelectorAll(".pgText > p, .aboutJobs li, .contactCol2 li");
      gsap.set(lines, { y: 12, opacity: 0 });
      var io = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return;
        io.disconnect();
        gsap.to(lines, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out", stagger: 0.07, clearProps: "transform,opacity" });
      }, { threshold: 0.2 });
      io.observe(sec);
    }
  });

  // The grey behind About is drawn on its own layer UNDER the hover bubble (the bubble sits under the page, so a grey painted
  // by the section itself would hide it). It follows the section's box; phones (no hover bubble) keep the grey on the section.
  var back = document.createElement("div");
  back.className = "aboutBack";
  back.setAttribute("aria-hidden", "true");
  document.body.appendChild(back);
  function syncBack() {
    var sec = secs.about;
    if (!sec || phone()) { back.style.display = "none"; return; }
    var r = sec.getBoundingClientRect();
    back.style.display = "block";
    back.style.left = (r.left + window.pageXOffset) + "px";
    back.style.top = (r.top + window.pageYOffset) + "px";
    back.style.width = r.width + "px";
    back.style.height = r.height + "px";
  }
  if (window.ResizeObserver) { var bro = new ResizeObserver(syncBack); bro.observe(secs.about); bro.observe(document.body); }
  window.addEventListener("resize", syncBack);
  window.addEventListener("load", syncBack);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncBack);
  syncBack();

  // The hover bubble (#mouse-circle) sits under the page, so the white pill would hide it. While a pinned tab is hovered
  // the bubble itself moves into the pinned bar: above the pill's white, under the labels. It goes back to the body after.
  var dot = document.getElementById("mouse-circle");
  function bubbleHome() { if (dot && dot.parentNode !== document.body) document.body.insertBefore(dot, document.body.firstChild); }
  function pinned() { return filters.classList.contains("stuck") || filters.classList.contains("pinned"); }
  if (dot) {
    chips.concat(Array.prototype.slice.call(document.querySelectorAll(".filtersLogo"))).forEach(function (c) { c.addEventListener("pointerenter", function (e) { if (e.pointerType === "touch") return; if (pinned() && dot.parentNode !== filters) filters.insertBefore(dot, filters.firstChild); }); });
    filters.addEventListener("pointerleave", function () { bubbleHome(); });
  }
  function press(name) {
    chips.forEach(function (c) {
      var on = name ? c.getAttribute("data-panel") === name : c.hasAttribute("data-work");
      c.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }
  function current() { var c = chips.filter(function (c) { return c.getAttribute("aria-pressed") === "true"; })[0]; return c && c.hasAttribute("data-panel") ? c.getAttribute("data-panel") : null; }

  // ---- the tabs stay on screen: once the page has scrolled past them they pin to the top ----
  var spacer = null, naturalTop = 0;
  function measure() { naturalTop = (spacer || filters).getBoundingClientRect().top + window.pageYOffset; }
  function stick() {
    if (phone()) { if (spacer) { filters.classList.remove("stuck"); spacer.remove(); spacer = null; } return; }
    var should = window.pageYOffset > 0 && !root.classList.contains("view-open");
    if (should && !spacer) {
      measure();
      var cs = getComputedStyle(filters), r = filters.getBoundingClientRect();
      spacer = document.createElement("div");
      spacer.className = "filtersSpacer";
      spacer.style.height = r.height + "px";
      spacer.style.marginTop = cs.marginTop; spacer.style.marginBottom = cs.marginBottom; // keep the gap under the tabs, so the name below never jumps
      filters.parentNode.insertBefore(spacer, filters);
      filters.style.top = naturalTop + "px"; // pinned exactly where it sits, so it never jumps
      filters.classList.add("stuck");
    } else if (!should && spacer && window.pageYOffset <= 0) {
      filters.classList.remove("stuck"); filters.style.top = "";
      spacer.remove(); spacer = null;
      bubbleHome();
    }
  }
  measure();
  window.addEventListener("resize", function () {
    var home = phone() && nav ? nav : below;
    Object.keys(secs).forEach(function (n) { if (secs[n].parentNode !== home) home.appendChild(secs[n]); });
    if (!spacer) measure(); else { var s = spacer; filters.classList.remove("stuck"); s.remove(); spacer = null; measure(); stick(); } });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!spacer) measure(); });

  // ---- which section is in view lights up its tab (not while a tab click is still scrolling) ----
  var steering = false, steerTimer = 0, lastY = -1;
  // ---- phones: the name and tagline scroll up and away with the page, the tabs stay pinned at the top ----
  var hdr = document.querySelector(".hero > header"), introTop = document.querySelector(".introTop");
  var STUCK_TOP = 12; // where the tabs rest at the top of a phone screen
  // Layout numbers are worked out once (and again when the layout changes), not on every scroll event: reading them mid-scroll
  // forces a layout each frame, which is what makes scrolling stutter in Safari.
  var tops = { about: 0, contact: 0 }, travelC = 1;
  function cacheLayout() {
    var sc = scroller();
    ["about", "contact"].forEach(function (n) {
      var r = secs[n].getBoundingClientRect();
      tops[n] = sc ? sc.scrollTop + r.top - sc.getBoundingClientRect().top : r.top + window.pageYOffset;
    });
    travelC = Math.max(1, filters.offsetTop - (parseFloat(filters.style.top) || 0) - STUCK_TOP); // (offsetTop includes the shift already applied)
  }
  window.addEventListener("resize", function () { cacheLayout(); });
  window.addEventListener("load", cacheLayout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(cacheLayout);
  if (window.ResizeObserver) { var cro = new ResizeObserver(cacheLayout); cro.observe(document.body); cro.observe(secs.about); cro.observe(secs.contact); }
  function slideHeader() {
    if (!hdr || !introTop) return;
    if (!phone() || !nav) { introTop.style.transform = introTop.style.opacity = filters.style.top = ""; root.classList.remove("navScrolled"); filters.classList.remove("pinned"); return; }
    var travel = travelC;
    var d = Math.min(Math.max(nav.scrollTop, 0), travel);
    introTop.style.transform = "translateY(" + (-d) + "px)";
    introTop.style.opacity = String(Math.max(0, 1 - d / (travel * 0.7)));
    filters.style.top = (-d) + "px";
    root.classList.toggle("navScrolled", nav.scrollTop > 4);
    filters.classList.toggle("pinned", d >= travel - 0.5);
    if (d < travel - 0.5) bubbleHome();
  }
  var slideTick = false;
  if (nav) nav.addEventListener("scroll", function () { if (slideTick) return; slideTick = true; requestAnimationFrame(function () { slideTick = false; slideHeader(); }); }, { passive: true });
  window.addEventListener("resize", slideHeader);
  cacheLayout();
  slideHeader();

  function spy() {
    stick();
    if (steering || root.classList.contains("view-open")) return;
    var sc = scroller(), pos = sc ? sc.scrollTop : window.pageYOffset;
    var probe = pos + (sc ? sc.clientHeight : window.innerHeight) * 0.45, name = null;
    ["about", "contact"].forEach(function (n) { if (tops[n] <= probe) name = n; });
    // at the very bottom the last section is the one in view, even when it is too short to reach the probe line
    if (!sc && window.pageYOffset > 0 && window.pageYOffset + window.innerHeight >= document.documentElement.scrollHeight - 2) name = "contact";
    if (sc && sc.scrollTop > 0 && sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 2) name = "contact";
    if (name !== current()) press(name);
  }
  var tick = false;
  var onScroll = function () {
    if (steering) { clearTimeout(steerTimer); steerTimer = setTimeout(function () { steering = false; spy(); }, 140); }
    if (!tick) { tick = true; requestAnimationFrame(function () { tick = false; spy(); }); }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  if (nav) nav.addEventListener("scroll", onScroll, { passive: true });
  // the wheel or a touch takes the steering back from a scroll the tabs started
  ["wheel", "touchstart"].forEach(function (ev) { window.addEventListener(ev, function () { steering = false; }, { passive: true }); });

  function go(name) {
    press(name);
    var sc = scroller();
    var clear = sc ? 64 : 100; // room above the section for the pinned tabs
    var y = !name ? 0 : sc ? sc.scrollTop + secs[name].getBoundingClientRect().top - sc.getBoundingClientRect().top : secs[name].getBoundingClientRect().top + window.pageYOffset;
    if (name) y = Math.max(0, y - clear);
    steering = true;
    clearTimeout(steerTimer);
    steerTimer = setTimeout(function () { steering = false; spy(); }, 900); // in case the page is already there and no scroll event follows
    (sc || window).scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
  }

  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      var target = c.hasAttribute("data-work") ? null : c.getAttribute("data-panel");
      var openView = root.classList.contains("view-open") && document.querySelector(".viewClose.floating:not([hidden]), .view:not([hidden]) .viewClose");
      if (!openView) { go(target); return; }
      // a project is open: close it first, then move to the new tab once it has finished closing
      openView.click();
      var tries = 0;
      (function wait() {
        if (!root.classList.contains("view-open") || ++tries > 150) go(target);
        else requestAnimationFrame(wait);
      })();
    });
  });
  spy();
})();

// AltQ opens in a background tab: the page keeps focus. Browsers decide this themselves, so it is done the way a
// Cmd/Ctrl-click does it (which they treat as "open in the background").
(function () {
  document.querySelectorAll('a[href="https://altq.ai"], a[href="https://poll.in"]').forEach(function (a) { a.addEventListener("click", function (e) {
    if (e.isTrusted === false || e.ctrlKey || e.metaKey) return;
    e.preventDefault();
    var mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    a.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window, ctrlKey: !mac, metaKey: mac }));
  }); });
})();

// Overhand's "Get early access" form is a placeholder for now: it doesn't send anywhere
// once an address is submitted the form swaps to a confirmation: a thank-you line with the address underneath
document.addEventListener("submit", function (e) {
  var f = e.target.closest && e.target.closest(".earlyForm"); if (!f) return;
  e.preventDefault();
  var inp = f.querySelector(".earlyInput"); if (!inp || !inp.value.trim() || !inp.validity.valid || f.classList.contains("done")) return;
  var line = document.createElement("p"); line.className = "earlyThanks"; line.textContent = "Thanks, you\u2019re on the list.";
  var addr = document.createElement("p"); addr.className = "earlyAddr"; addr.textContent = inp.value.trim();
  f.classList.add("done"); f.setAttribute("role", "status");
  f.replaceChildren(line, addr);
});
// the early-access button stays disabled until the field holds a valid email address
document.addEventListener("input", function (e) {
  var inp = e.target; if (!inp.classList || !inp.classList.contains("earlyInput")) return;
  var btn = inp.form && inp.form.querySelector(".earlyBtn");
  if (btn) btn.disabled = !(inp.value.trim() && inp.validity.valid);
});

// The dark highlight behind the active tab pops in softly on whichever tab becomes active (click, scroll or
// closing a project)
(function () {
  var group = document.querySelector(".filters");
  if (!group || typeof gsap === "undefined") return;
  var chips = Array.prototype.slice.call(group.querySelectorAll(".pill"));
  var bg = document.createElement("span");
  bg.className = "tabBg";
  bg.setAttribute("aria-hidden", "true");
  group.insertBefore(bg, group.firstChild);
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var first = true;
  function place(animate) {
    var on = chips.filter(function (c) { return c.getAttribute("aria-pressed") === "true"; })[0];
    if (!on) return;
    bg.style.background = on.getAttribute("data-active") || "";
    group.style.setProperty("--tabC", on.getAttribute("data-active") || "#2f2725");
    var to = { x: on.offsetLeft, y: on.offsetTop, width: on.offsetWidth, height: on.offsetHeight };
    if (group.classList.contains("atTop")) { gsap.killTweensOf(bg); gsap.set(bg, to); gsap.set(bg, { autoAlpha: 0 }); first = false; return; } // at the very top the face is the active tab, not Work
    if (!animate || first || reduce) { gsap.set(bg, to); first = false; gsap.set(bg, { autoAlpha: 1 }); }
    else { // no sliding: the highlight appears on the new tab with a small, soft pop
      // the old tab's highlight pops out as the new one pops in
      if (parseFloat(gsap.getProperty(bg, "opacity")) > 0.05) {
        var ghost = bg.cloneNode(true); ghost.style.background = bg.style.background;
        group.insertBefore(ghost, bg);
        gsap.set(ghost, { x: gsap.getProperty(bg, "x"), y: gsap.getProperty(bg, "y"), width: gsap.getProperty(bg, "width"), height: gsap.getProperty(bg, "height"), scale: gsap.getProperty(bg, "scale"), autoAlpha: gsap.getProperty(bg, "opacity"), transformOrigin: "50% 50%" });
        gsap.to(ghost, { scale: 0.6, autoAlpha: 0, duration: 0.18, ease: "power2.in", onComplete: function () { ghost.remove(); } });
      }
      gsap.killTweensOf(bg);
      gsap.set(bg, to);
      gsap.fromTo(bg, { scale: 0.6, autoAlpha: 0, transformOrigin: "50% 50%" }, { scale: 1, autoAlpha: 1, duration: 0.28, ease: "back.out(1.7)" });
    }
  }
  new MutationObserver(function () { place(true); }).observe(group, { attributes: true, attributeFilter: ["aria-pressed"], subtree: true });
  var wasTop = null;
  function topCheck() {
    var t = (window.pageYOffset || 0) <= 20;
    if (t === wasTop) return;
    wasTop = t;
    group.classList.toggle("atTop", t);
    if (t) { gsap.killTweensOf(bg); gsap.to(bg, { scale: 0.6, autoAlpha: 0, duration: 0.2, ease: "power2.in", transformOrigin: "50% 50%" }); }
    else place(true);
  }
  window.addEventListener("scroll", topCheck, { passive: true });
  topCheck();
  window.addEventListener("resize", function () { place(false); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { first = true; place(false); }); else place(false);
})();

// the face in the tab menu is the "active" tab while the page is at the very top: it keeps its light blue bubble there
(function () {
  var logo = document.querySelector(".filtersLogo");
  if (!logo) return;
  function mark() { logo.classList.toggle("atTop", (window.pageYOffset || 0) <= 20); }
  window.addEventListener("scroll", mark, { passive: true });
  window.addEventListener("resize", mark);
  mark();
})();
