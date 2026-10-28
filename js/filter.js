// Filter pills for the centre list.
// On every filter change all items pop out, the list updates while nothing is showing,
// then every item that belongs pops back in. Nothing slides around.
(function () {
  if (typeof gsap === "undefined") return;

  var list = document.getElementById("projectList");
  var status = document.getElementById("filterStatus");
  var pills = document.querySelectorAll(".pill[data-filter]");
  if (!list || !pills.length) return;

  var items = Array.prototype.slice.call(list.children);

  // Reserve the full list's space: an invisible copy of the unfiltered list sits in the same
  // spot, so the block keeps its height (at any screen width) and nothing around it shifts.
  var nav = list.parentElement;
  var ghost = list.cloneNode(true);
  ghost.removeAttribute("id");
  ghost.classList.add("ghost");
  ghost.setAttribute("aria-hidden", "true");
  ghost.setAttribute("inert", "");
  ghost.querySelectorAll("a").forEach(function (a) { a.setAttribute("tabindex", "-1"); });
  nav.insertBefore(ghost, list);
  nav.classList.add("stack");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var t = function (seconds) { return reduce ? 0 : seconds; };

  // ---- tuning ----
  var POP_OUT_TIME = 0.18;
  var POP_OUT_STAGGER = 0.02;
  var POP_OUT_EASE = "back.in(1.2)";   // number = size of the bounce (1 = none, higher = bouncier)
  var POP_IN_TIME = 0.3;
  var POP_IN_STAGGER = 0.03;
  var POP_IN_EASE = "back.out(1.2)";

  var current = "all";

  // items scale from their own centre
  gsap.set(items, { transformOrigin: "50% 50%" });

  function matches(li, filter) {
    if (filter === "all") return true;
    return (li.getAttribute("data-category") || "").split(" ").indexOf(filter) !== -1;
  }

  function isHidden(li) { return li.classList.contains("is-hidden"); }

  // the last visible item shouldn't have a trailing slash
  function updateSlashes() {
    var last = null;
    items.forEach(function (li) {
      li.classList.remove("no-slash");
      if (!isHidden(li)) last = li;
    });
    if (last) last.classList.add("no-slash");
  }

  function updateStatus() {
    if (!status) return;
    var n = items.filter(function (li) { return !isHidden(li); }).length;
    status.textContent = "Showing " + n + " of " + items.length;
  }

  function setPressed(filter) {
    pills.forEach(function (p) {
      p.setAttribute("aria-pressed", p.getAttribute("data-filter") === filter ? "true" : "false");
    });
  }

  function apply(filter) {
    if (filter === current) return;
    current = filter;
    setPressed(filter);

    // settle anything still moving from a previous click
    gsap.killTweensOf(items);
    gsap.set(items, { clearProps: "transform,opacity" });

    var visible = items.filter(function (li) { return !isHidden(li); });
    var next = items.filter(function (li) { return matches(li, filter); });

    // same items before and after: nothing to animate
    var same = visible.length === next.length && visible.every(function (li) { return next.indexOf(li) !== -1; });
    if (same) { updateStatus(); return; }

    var tl = gsap.timeline();

    // 1. every visible item pops out
    tl.to(visible, { scale: 0, opacity: 0, duration: t(POP_OUT_TIME), ease: POP_OUT_EASE, stagger: t(POP_OUT_STAGGER) });

    // 2. with nothing showing, swap which items are in the list
    tl.add(function () {
      items.forEach(function (li) { li.classList.toggle("is-hidden", !matches(li, filter)); });
      updateSlashes();
      updateStatus();
      gsap.set(next, { scale: 0, opacity: 0 });
    });

    // 3. every item that belongs pops in
    tl.to(next, { scale: 1, opacity: 1, duration: t(POP_IN_TIME), ease: POP_IN_EASE, stagger: t(POP_IN_STAGGER) });
  }

  pills.forEach(function (pill) {
    pill.addEventListener("click", function () { apply(pill.getAttribute("data-filter")); });
  });

  updateSlashes();
  updateStatus();
})();
