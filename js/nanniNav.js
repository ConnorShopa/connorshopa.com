/* Nanni's navigation menu, built from components and animated with GSAP.
   The progression (the same story as the old gif):
     s1  a full-width bar: Translate · Routines · Feedback · Logs · Fun zone
     s2  Feedback is moved out of the menu
     s3  Logs is renamed Journal
     s4  Translate leaves the bar and becomes a floating button
     s5  ...which settles at the top right
     s6  the bar becomes a floating pill
     s7  Journal is the active tab
   NanniNav.mount(el, { loop: true }) fills `el` (give it class "nnNav") and returns { tl, goto(n), play(), pause(), destroy() }.
   With prefers-reduced-motion it shows the last state and doesn't move. It pauses while it is off screen. */
(function () {
  var ICONS = {
    translate: '<svg class="nnIcon" viewBox="0 0 24 24" aria-hidden="true"><path class="hex" d="M12 3.6 19.6 9.1 16.7 18H7.3L4.4 9.1Z"/><rect class="mic" x="10.3" y="6.9" width="3.4" height="6" rx="1.7"/><path class="mic" d="M8.6 11.8a3.4 3.4 0 0 0 6.8 0M12 15.2v1.7"/></svg>',
    routines: '<svg class="nnIcon" viewBox="0 0 24 24" aria-hidden="true"><rect class="solid" x="3.6" y="10.8" width="2.5" height="5.2" rx="1.25"/><rect class="solid" x="10.75" y="1.8" width="2.5" height="20.4" rx="1.25"/><rect class="solid" x="17.9" y="6.6" width="2.5" height="6" rx="1.25"/></svg>',
    feedback: '<svg class="nnIcon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.2 13.4 12.6 8.2v9.6L3.2 14.6Z"/><path d="M5.6 15.6l1.5 4.3h2.4"/><path d="M15.4 5.2l1.4-2M16.2 9.6h3.4M15.9 13.4l2.9 1.5"/></svg>',
    logs: '<svg class="nnIcon" viewBox="0 0 24 24" aria-hidden="true"><path class="pen" d="M4.3 19.7 5.4 15.6 16.9 4.1a2.1 2.1 0 0 1 3 3L8.4 18.6Z"/></svg>',
    fun: '<svg class="nnIcon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.2 19c0-6.4 3.6-10.8 8.8-10.8s8.8 4.4 8.8 10.8"/><path d="M8.4 19c.3-5.6 1.7-9.8 3.6-10.8 1.9 1 3.3 5.2 3.6 10.8"/><path d="M2.4 19.3h4.4M17.2 19.3h4.4"/><path d="M12 8.2V5.4"/><path d="M6.6 4.3c1.7-1.5 3.6-1 5.4 1.1 1.8-2.1 3.7-2.6 5.4-1.1"/></svg>'
  };
  var MIC = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9.2" y="3" width="5.6" height="10" rx="2.8"/><path d="M6.4 11.2a5.6 5.6 0 0 0 11.2 0M12 16.8V20"/></svg>';
  var TABS = [
    { id: "translate", label: "Translate" },
    { id: "routines", label: "Routines" },
    { id: "feedback", label: "Feedback" },
    { id: "logs", label: "Logs", then: "Journal" },
    { id: "fun", label: "Fun zone" }
  ];

  function markup() {
    var tabs = TABS.map(function (t) {
      return '<div class="nnTab" data-id="' + t.id + '">' + ICONS[t.id] +
        '<span class="nnLbl"><span class="a">' + t.label + "</span>" + (t.then ? '<span class="b">' + t.then + "</span>" : "") + "</span></div>";
    }).join("");
    return '<div class="nnPhone"><div class="nnBand"></div><div class="nnPill"></div>' +
      '<div class="nnTabs"><i class="nnSp l"></i>' + tabs + '<i class="nnSp r"></i></div>' +
      '<div class="nnFab">' + MIC + "</div></div>";
  }

  function mount(root, opts) {
    opts = opts || {};
    var gsap = window.gsap;
    root.classList.add("nnNav");
    root.innerHTML = markup();
    root.setAttribute("role", "img");
    root.setAttribute("aria-label", "Nanni's navigation menu, from five tabs to a floating bar with a translate button");
    var q = function (s) { return root.querySelector(s); };
    var tab = {}; TABS.forEach(function (t) { tab[t.id] = q('.nnTab[data-id="' + t.id + '"]'); });
    var band = q(".nnBand"), pill = q(".nnPill"), fab = q(".nnFab"), spL = q(".nnSp.l"), spR = q(".nnSp.r");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var api = { tl: null, goto: function () {}, play: function () {}, pause: function () {}, destroy: function () {} };
    if (!gsap) return api;

    // the button starts where the Translate tab is (the tab's centre, relative to the button's own size) and flies to the corner
    var FAB_FROM = { xPercent: -500, yPercent: 180 };
    gsap.set(fab, { autoAlpha: 0, scale: 0.5, xPercent: FAB_FROM.xPercent, yPercent: FAB_FROM.yPercent });
    gsap.set(pill, { autoAlpha: 0, scaleX: 0.92, scaleY: 0.5, transformOrigin: "50% 100%" });
    gsap.set(root.querySelectorAll(".nnLbl .b"), { yPercent: 100 });

    var tl = gsap.timeline({ paused: true, repeat: opts.loop === false ? 0 : -1, defaults: { ease: "power3.inOut" } });
    var T = {};
    function at(name, time) { T[name] = time; tl.addLabel(name, time); return time; }

    tl.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power1.out" }, 0);

    // s2: Feedback goes; the other four share the width
    at("s2", 1.5);
    tl.to(tab.feedback, { flexGrow: 0, opacity: 0, scale: 0.7, duration: 0.7 }, "s2");

    // s3: Logs rolls over into Journal
    at("s3", 2.8);
    var logs = tab.logs.querySelectorAll(".nnLbl span");
    tl.to(logs[0], { yPercent: -100, opacity: 0, duration: 0.42, ease: "power2.in" }, "s3")
      .to(logs[1], { yPercent: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, "s3+=0.14");

    // s4: Translate leaves the bar and flies to the corner as a floating button; the three left sit together in the middle
    at("s4", 4.1);
    tl.to(tab.translate, { flexGrow: 0, opacity: 0, scale: 0.6, duration: 0.6 }, "s4")
      .to([spL, spR], { flexGrow: 1, duration: 0.6 }, "s4")
      .to(fab, { autoAlpha: 1, duration: 0.18, ease: "none" }, "s4+=0.18")
      .to(fab, { xPercent: 0, yPercent: 0, scale: 1, duration: 0.95, ease: "back.out(1.15)" }, "s4+=0.18");

    // s6: the band becomes a floating pill, and the tabs spread out across it
    at("s6", 6.0);
    tl.to(band, { opacity: 0, yPercent: 30, duration: 0.6 }, "s6")
      .to(pill, { autoAlpha: 1, scaleX: 1, scaleY: 1, duration: 0.75, ease: "power3.out" }, "s6+=0.1")
      .to([spL, spR], { flexGrow: 0.25, duration: 0.75 }, "s6+=0.05");

    // s7: Journal is the active tab: darker, heavier, and its pencil fills in
    at("s7", 7.4);
    var journal = tab.logs;
    tl.to(journal, { color: "#001224", duration: 0.45, ease: "power2.out" }, "s7")
      .to(journal.querySelector(".nnLbl"), { fontWeight: 700, duration: 0.45, ease: "power2.out" }, "s7")
      .to(journal.querySelector(".pen"), { fill: "rgba(0,18,36,1)", duration: 0.45, ease: "power2.out" }, "s7")
      .fromTo(journal.querySelector(".nnIcon"), { scale: 0.8 }, { scale: 1, duration: 0.55, ease: "back.out(2.2)" }, "s7");

    at("final", 8.1);
    tl.to({}, { duration: 1.6 }, "final");               // hold the finished bar
    tl.to(root, { opacity: 0, duration: 0.4, ease: "power1.in" }, "final+=1.6"); // then fade out and begin again

    tl.addLabel("s1", 0.45);

    var inView = true, io = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(function (es) {
        inView = es[0].isIntersecting;
        if (reduce || api._manual) return;
        inView ? tl.play() : tl.pause();
      });
      io.observe(root);
    }

    if (reduce) tl.seek("final").pause();
    else tl.play(0);

    api.tl = tl;
    // where each of the seven steps has finished moving (seconds on the timeline), for goto(1..7)
    var STEP_END = [1.2, 2.6, 3.9, 4.6, 5.7, 7.2, 8.2];
    api.goto = function (n) { api._manual = true; tl.pause(STEP_END[Math.max(1, Math.min(7, n)) - 1]); };
    api.play = function () { api._manual = false; tl.play(); };
    api.pause = function () { api._manual = true; tl.pause(); };
    api.destroy = function () { if (io) io.disconnect(); tl.kill(); root.innerHTML = ""; };
    return api;
  }

  window.NanniNav = { mount: mount };
})();
