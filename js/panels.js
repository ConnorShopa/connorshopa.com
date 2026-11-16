// About and Contact: no card, the text takes the gallery's place in the page. The links pop out, the text pops in;
// Work brings the links back.
(function () {
  if (typeof gsap === "undefined" || !window.PANELS) return;
  var list = document.getElementById("projectList");
  var nav = list && list.parentElement;
  if (!nav) return;
  var chips = document.querySelectorAll(".filters .pill");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var t = function (s) { return reduce ? 0 : s; };

  var panel = document.createElement("div");
  panel.className = "panelText";
  panel.hidden = true;
  nav.appendChild(panel);

  var current = null; // "about", "contact" or null (Work)
  function links() { return Array.prototype.filter.call(list.children, function (li) { return !li.classList.contains("row-break"); }); }
  function press(name) {
    chips.forEach(function (c) {
      var on = name ? c.getAttribute("data-panel") === name : c.hasAttribute("data-work");
      c.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function go(name) {
    if (name === current) return;
    var from = current;
    current = name;
    press(name);
    gsap.killTweensOf(panel);
    gsap.killTweensOf(links());
    var showPanel = function () {
      if (current !== name || !name) return;
      panel.innerHTML = window.PANELS[name].pages[0].html;
      panel.classList.toggle("sketch", name === "sketchbook");
      panel.hidden = false;
      if (name === "sketchbook") { if (window.initJustified) window.initJustified(panel); if (window.initLotties) window.initLotties(panel); }
      if (window.bindHover) window.bindHover(panel);
      // line by line from the top: a small rise and a fade, no bounce
      var lines = panel.querySelectorAll(".pgText > p, .aboutJobs li, .contactCol2 li");
      gsap.fromTo(lines, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: t(0.45), ease: "power2.out", stagger: t(0.09), clearProps: "transform,opacity" });
    };
    var showLinks = function () {
      if (current) return;
      panel.hidden = true;
      list.style.visibility = "";
      gsap.fromTo(links(), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: t(0.3), ease: "power2.out", stagger: t(0.03), clearProps: "transform,opacity" });
    };
    var hidePanel = function (done) {
      if (panel.hidden) { done(); return; }
      gsap.to(panel.children, { opacity: 0, y: -6, duration: t(0.2), ease: "power2.in", onComplete: function () { panel.hidden = true; gsap.set(panel.children, { clearProps: "transform,opacity" }); done(); } });
    };
    if (!from) { // gallery -> panel
      gsap.to(links(), { scale: 0, opacity: 0, duration: t(0.2), ease: "power2.in", stagger: t(0.015), onComplete: function () { list.style.visibility = "hidden"; showPanel(); } });
    } else {
      hidePanel(name ? showPanel : showLinks);
    }
  }

  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      var target = c.hasAttribute("data-work") ? null : c.getAttribute("data-panel");
      var openView = document.documentElement.classList.contains("view-open") && document.querySelector(".viewClose.floating:not([hidden]), .view:not([hidden]) .viewClose");
      if (!openView || !target) { go(target); return; }
      // a project is open: close it first, then move to the new tab once it has finished closing
      openView.click();
      var tries = 0;
      (function wait() {
        if (!document.documentElement.classList.contains("view-open") || ++tries > 150) go(target);
        else requestAnimationFrame(wait);
      })();
    });
  });
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

// Scrolling the main view loops through the tabs: Work, About, Contact, and round again (a project being open
// takes the wheel for itself; phones keep their normal page scroll)
(function () {
  var order = [null, "about", "contact"];
  var busy = false;
  window.addEventListener("wheel", function (e) {
    if (document.documentElement.classList.contains("view-open")) return;
    if (window.innerWidth <= 700 || Math.abs(e.deltaY) < 12 || busy) return;
    if (document.querySelector(".filters .pill[data-panel='sketchbook'][aria-pressed='true']")) return; // the sketchbook is a long page: the wheel scrolls it
    if (e.target.closest && e.target.closest(".panelText a")) { /* still counts */ }
    var chip = document.querySelector(".filters .pill[aria-pressed='true']");
    var now = chip && chip.hasAttribute("data-panel") ? chip.getAttribute("data-panel") : null;
    var i = order.indexOf(now);
    var next = order[(i + (e.deltaY > 0 ? 1 : -1) + order.length) % order.length];
    busy = true;
    var target = next ? document.querySelector('.filters .pill[data-panel="' + next + '"]') : document.querySelector(".filters .pill[data-work]");
    if (target) target.click();
    setTimeout(function () { busy = false; }, 1100); // one step per flick: trackpad momentum keeps sending events
  }, { passive: true });
})();

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
    var to = { x: on.offsetLeft, y: on.offsetTop, width: on.offsetWidth, height: on.offsetHeight };
    if (!animate || first || reduce) { gsap.set(bg, to); first = false; gsap.set(bg, { autoAlpha: 1 }); }
    else { // no sliding: the highlight appears on the new tab with a small, soft pop
      // the old tab's highlight pops out as the new one pops in
      if (parseFloat(gsap.getProperty(bg, "opacity")) > 0.05) {
        var ghost = bg.cloneNode(true);
        group.insertBefore(ghost, bg);
        gsap.set(ghost, { x: gsap.getProperty(bg, "x"), y: gsap.getProperty(bg, "y"), width: gsap.getProperty(bg, "width"), height: gsap.getProperty(bg, "height"), scale: gsap.getProperty(bg, "scale"), autoAlpha: gsap.getProperty(bg, "opacity"), transformOrigin: "50% 50%" });
        gsap.to(ghost, { scale: 0.6, autoAlpha: 0, duration: 0.25, ease: "power2.in", onComplete: function () { ghost.remove(); } });
      }
      gsap.killTweensOf(bg);
      gsap.set(bg, to);
      gsap.fromTo(bg, { scale: 0.6, autoAlpha: 0, transformOrigin: "50% 50%" }, { scale: 1, autoAlpha: 1, duration: 0.4, ease: "back.out(1.7)" });
    }
  }
  new MutationObserver(function () { place(true); }).observe(group, { attributes: true, attributeFilter: ["aria-pressed"], subtree: true });
  window.addEventListener("resize", function () { place(false); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { first = true; place(false); }); else place(false);
})();
