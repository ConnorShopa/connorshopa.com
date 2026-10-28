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
      panel.hidden = false;
      gsap.fromTo(panel.children, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: t(0.3), ease: "back.out(1.2)", stagger: t(0.05) });
    };
    var showLinks = function () {
      if (current) return;
      panel.hidden = true;
      list.style.visibility = "";
      gsap.fromTo(links(), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: t(0.3), ease: "back.out(1.2)", stagger: t(0.03), clearProps: "transform,opacity" });
    };
    var hidePanel = function (done) {
      if (panel.hidden) { done(); return; }
      gsap.to(panel.children, { scale: 0.8, opacity: 0, duration: t(0.2), ease: "power2.in", onComplete: function () { panel.hidden = true; done(); } });
    };
    if (!from) { // gallery -> panel
      gsap.to(links(), { scale: 0, opacity: 0, duration: t(0.2), ease: "power2.in", stagger: t(0.015), onComplete: function () { list.style.visibility = "hidden"; showPanel(); } });
    } else {
      hidePanel(name ? showPanel : showLinks);
    }
  }

  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      go(c.hasAttribute("data-work") ? null : c.getAttribute("data-panel"));
    });
  });
})();
