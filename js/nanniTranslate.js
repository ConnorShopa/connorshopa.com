/* Nanni's "new translation" flow, a whole phone screen, animated with GSAP. It reuses the navigation menu's pieces (js/nanniNav.js:
   the icons, the floating pill, the mic button), and follows the storyboard:
     1  Journal, the floating pill and the mic button
     2  the mic button is tapped; the "New translation" screen opens out of it and recording starts on its own
     3  once the five seconds are in, "Ready to translate" and the Translate button slides up
     4  Translate is tapped: the bars collapse into dots that gather into a spinning orb, and the cry is translated ("Translating")
   NanniTranslate.mount(el) fills `el` and returns { tl, goto(n), play(), pause(), destroy() }. Everything is sized in cqw (a percent of the phone's width). */
(function () {
  var INK = "#001428";
  var ARROW = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 10h12M11 4.8 16.2 10 11 15.2"/></svg>';
  var CHEV = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12 4.5 6.5 10l5.5 5.5"/></svg>';
  var R = 44, C = 2 * Math.PI * R;
  var uid = 0;

  function homeMarkup(P) {
    var u = ++uid;
    var tabs = [["routines", "Routines"], ["logs", "Journal"], ["fun", "Fun zone"]].map(function (t) {
      return '<div class="nnTab" data-id="' + t[0] + '"><span class="nnIco">' + P.ICONS[t[0]].split("__U__").join("t" + u) + '</span>' +
        '<span class="nnLbl"><span class="a">' + t[1] + "</span></span></div>";
    }).join("");
    return '<div class="ntHome"><div class="nnPill ntPill"></div><div class="nnTabs ntTabs"><i class="nnSp"></i>' + tabs + '<i class="nnSp"></i></div>' +
      '<div class="nnFab ntFab">' + P.MIC + "</div></div>";
  }

  var BARS = 11;

  function recMarkup() {
    return '<div class="ntRec">' +
      '<div class="ntBack">' + CHEV + '</div><div class="ntTitle">New translation</div>' +
      '<div class="ntRing"><div class="ntBars">' + new Array(BARS + 1).join('<i class="ntBar"></i>') + '</div>' +
        '<span class="ntTime">0:00</span></div>' +
      '<div class="ntOrb"></div>' +
      '<div class="ntLabel"><span class="a">Capturing Gerald&rsquo;s cry</span><span class="b">Ready to translate</span><span class="c">Translating<i class="ntDots"><b>.</b><b>.</b><b>.</b></i></span></div>' +
      '<p class="ntHint">Nanni needs 5 seconds for accurate translations</p>' +
      '<div class="ntBtn"><span>Translate</span>' + ARROW + "</div>" +
      "</div>";
  }

  function mount(root, opts) {
    opts = opts || {};
    var gsap = window.gsap, P = window.NanniNav && window.NanniNav.parts;
    root.classList.add("ntRoot");
    root.setAttribute("role", "img");
    root.setAttribute("aria-label", "Nanni: tap the mic button, the cry is recorded for five seconds, tap Translate, and it is translated");
    var api = { tl: null, goto: function () {}, play: function () {}, pause: function () {}, destroy: function () {} };
    if (!P) return api;
    root.innerHTML = '<div class="ntPhone">' + homeMarkup(P) + recMarkup() + '<i class="ntTouch"></i></div>';
    if (!gsap) return api;

    var q = function (s) { return root.querySelector(s); };
    var phone = q(".ntPhone"), home = q(".ntHome"), rec = q(".ntRec"), fab = q(".ntFab"), pill = q(".ntPill"), tabs = q(".ntTabs");
    var touch = q(".ntTouch"), back = q(".ntBack"), title = q(".ntTitle"), ring = q(".ntRing"), bars = root.querySelectorAll(".ntBar"), time = q(".ntTime");
    var orbEl = q(".ntOrb"), label = q(".ntLabel"), la = q(".ntLabel .a"), lb = q(".ntLabel .b"), lc = q(".ntLabel .c"), hint = q(".ntHint"), btn = q(".ntBtn");
    var journal = q('.nnTab[data-id="logs"]');
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Journal is the active tab on the first screen
    journal.style.color = INK;
    journal.querySelector(".nnLbl").style.fontWeight = 700;
    var pen = journal.querySelector(".pen"); if (pen) pen.style.fill = INK;

    // the noise level: p is 0..1 across the five seconds. Bars rise and fall like a live sound meter, and take
    // Nanni's blue, green, yellow and red as they get louder. calm (0..1) settles them once five seconds are in.
    var calm = { v: 0 }, BRAND = ["#80BAFD", "#99CA9C", "#FBC157", "#F28C8C"];
    // every bar is one solid brand colour, picked at random (never the same as its neighbour)
    var prev = -1;
    for (var bi = 0; bi < BARS; bi++) {
      var ci; do { ci = Math.floor(Math.random() * BRAND.length); } while (ci === prev);
      prev = ci; bars[bi].style.background = BRAND[ci];
    }
    // each bar is a spring, so it overshoots and bounces: it chases a target that follows a baby's cry,
    // which comes in wails (swells) with quick gasps and a flicker between the bars
    var lv = [], vel = [], lastT = -1;
    for (var si = 0; si < BARS; si++) { lv[si] = 0.04; vel[si] = 0; }
    // the work phase (4): the bars collapse into dots (c), the dots gravitate to the centre (g) and fade (f)
    // as a spinning orb of dots (orb) takes over as the loader
    var wk = { c: 0, g: 0, f: 0 }, PITCH = 5.6, DOT = 3.2;
    function paint() {
      for (var i = 0; i < BARS; i++) {
        var h = (2.4 + lv[i] * 15) * (1 - wk.c) + DOT * wk.c;
        bars[i].style.height = h + "cqw";
        var tr = "";
        if (wk.g) {
          // each dot swoops in on its own curve: the outer ones set off first, and they arc up (left) or down (right) on the way
          var k = i - (BARS - 1) / 2, far = Math.abs(k) / ((BARS - 1) / 2), local = Math.max(0, Math.min(1, (wk.g * 1.55 - 0.55 * (1 - far)) )), e = local < 0.5 ? 4 * local * local * local : 1 - Math.pow(-2 * local + 2, 3) / 2;
          tr = "translate(" + (-k * PITCH * e) + "cqw," + (-(k < 0 ? 1 : -1) * Math.sin(Math.PI * e) * (2.5 + 5.5 * far)) + "cqw) scale(" + (1 - 0.35 * wk.f) + ")";
        }
        bars[i].style.transform = tr;
        bars[i].style.opacity = wk.f ? 1 - wk.f : "";
      }
    }
    var ORB_N = 64, ORB_R = 7.6, orb = { a: 0, r: 0, o: 0 }, orbDots = [], orbPts = [];
    for (var oi = 0; oi < ORB_N; oi++) {
      var oy = 1 - 2 * (oi + 0.5) / ORB_N, orr = Math.sqrt(1 - oy * oy), th = oi * 2.399963; // an even spread of points over a sphere
      orbPts.push([Math.cos(th) * orr, oy, Math.sin(th) * orr]);
      var od = document.createElement("i"); od.className = "ntOrbDot"; od.style.background = BRAND[Math.floor(Math.random() * BRAND.length)];
      orbEl.appendChild(od); orbDots.push(od);
    }
    function renderOrb() {
      var ca = Math.cos(orb.a), sa = Math.sin(orb.a), ct = Math.cos(0.42), st = Math.sin(0.42);
      for (var i = 0; i < ORB_N; i++) {
        var P = orbPts[i], x = P[0] * ca + P[2] * sa, z = -P[0] * sa + P[2] * ca, y = P[1] * ct - z * st, z2 = P[1] * st + z * ct;
        var depth = (z2 + 1) / 2, sc = (0.45 + 0.75 * depth) * orb.r;
        orbDots[i].style.transform = "translate(" + (x * ORB_R * orb.r) + "cqw," + (y * ORB_R * orb.r) + "cqw) scale(" + sc + ")";
        orbDots[i].style.opacity = orb.o * (0.3 + 0.7 * depth);
      }
    }
    renderOrb();

    function draw(p, tOv) {
      var t = tOv != null ? tOv : p * 3.4, amp = Math.min(1, p / 0.05);
      var dt = t - lastT; lastT = t;
      if (dt <= 0 || dt > 0.25) dt = 1 / 60; // a rewind, a seek or a loop: start the springs fresh
      var wail = Math.pow(0.5 + 0.5 * Math.sin(t * 3.7 - 1.3), 1.5);               // the long swells of the cry
      var gasp = Math.pow(Math.max(0, Math.sin(t * 11.5 + 0.4)), 4) * 0.35;        // quick sharp breaths
      var drive = (0.22 + 0.78 * wail + gasp) * amp;
      var steps = Math.max(1, Math.ceil(dt / 0.008)), h = dt / steps;
      for (var i = 0; i < BARS; i++) {
        var u = (i - (BARS - 1) / 2) / 4.4, bell = 0.38 + 0.62 * Math.exp(-u * u);
        var n = 0.5 + 0.5 * Math.sin(t * (9 + (i * 7 % 5) * 2.6) + i * 2.1) * Math.sin(t * 5.3 + i * 0.9);
        var target = Math.max(0.04, Math.min(1, bell * drive * (0.3 + 0.9 * n) + (Math.random() - 0.5) * 0.14 * amp));
        for (var k = 0; k < steps; k++) {
          vel[i] += (300 * (target - lv[i]) - 10 * vel[i]) * h;
          lv[i] += vel[i] * h;
        }
        lv[i] = Math.max(0.03, Math.min(1.05, lv[i]));
      }
      paint();
      time.textContent = "0:0" + Math.min(5, Math.floor(p * 5 + 0.001));
    }

    // places the touch marker over an element's centre (percent of the phone)
    var pr = function () { return phone.getBoundingClientRect(); };
    function touchAt(el) {
      var a = pr(), b = el.getBoundingClientRect();
      gsap.set(touch, { left: ((b.left + b.width / 2 - a.left) / a.width * 100) + "%", top: ((b.top + b.height / 2 - a.top) / a.height * 100) + "%" });
    }

    // starting values
    gsap.set(rec, { clipPath: "circle(0% at 81.5% 79.6%)" });
    gsap.set([back, title, ring, label, hint], { autoAlpha: 0 });
    gsap.set(ring, { scale: 0.92 }); gsap.set([back, title], { y: -6 });
    gsap.set(hint, { y: 8 });
    gsap.set(btn, { autoAlpha: 0, scale: 0.6, transformOrigin: "50% 50%" });
    gsap.set([lb, lc], { yPercent: 100, autoAlpha: 0 });
    gsap.set(touch, { autoAlpha: 0, scale: 0.4 });
    draw(0);

    var tl = gsap.timeline({ paused: true, repeat: opts.loop === false || opts.manual ? 0 : -1, defaults: { ease: "power3.inOut" } });
    var T = {}, prog = { p: 0 };
    function at(n, t) { T[n] = t; tl.addLabel(n, t); return t; }

    tl.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power1.out" }, 0);
    tl.add(function () { draw(0); }, 0);

    // 1 -> 2: the mic button is tapped, the new screen opens out of it
    at("tap1", 1.2);
    tl.add(function () { touchAt(fab); }, "tap1-=0.05")
      .to(touch, { autoAlpha: 0.32, scale: 1, duration: 0.22, ease: "power2.out" }, "tap1")
      .to(fab, { scale: 0.9, duration: 0.14, ease: "power2.out" }, "tap1+=0.04")
      .to(fab, { scale: 1, duration: 0.45, ease: "back.out(2.4)" }, "tap1+=0.18")
      .to(touch, { autoAlpha: 0, scale: 1.5, duration: 0.4, ease: "power1.out" }, "tap1+=0.2");

    at("open", 1.75);
    tl.to(rec, { clipPath: "circle(150% at 81.5% 79.6%)", duration: 0.95, ease: "power3.inOut" }, "open")
      .to(pill, { yPercent: 40, autoAlpha: 0, duration: 0.5, ease: "power2.in" }, "open")
      .to(tabs, { yPercent: 40, autoAlpha: 0, duration: 0.5, ease: "power2.in" }, "open")
      .to(fab, { scale: 1.15, autoAlpha: 0, duration: 0.5, ease: "power2.in" }, "open+=0.05");

    // 2: recording starts by itself
    at("rec", 2.45);
    tl.to([back, title], { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out", stagger: 0.06 }, "rec")
      .to(ring, { autoAlpha: 1, scale: 1, duration: 0.6, ease: "power3.out" }, "rec+=0.1")
      .to(label, { autoAlpha: 1, duration: 0.45, ease: "power2.out" }, "rec+=0.25")
      .to(hint, { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out" }, "rec+=0.35");
    at("count", 3.1);
    // the meter keeps showing noise after the five seconds (p goes past 1) until Translate is tapped and the screen changes
    tl.to(prog, { p: 5.75 / 3.4, duration: 5.75, ease: "none", onUpdate: function () { draw(prog.p); } }, "count");
    tl.set(prog, { p: 0 }, 0);
    tl.set(calm, { v: 0 }, 0);

    // 3: five seconds are in: the ring closes, the label rolls to "Ready to translate", the Translate button slides up
    at("ready", 6.5);
    tl.to(ring, { scale: 1.05, duration: 0.22, ease: "power2.out" }, "ready")
      .to(ring, { scale: 1, duration: 0.5, ease: "back.out(2.2)" }, "ready+=0.22")
      .to(la, { yPercent: -100, autoAlpha: 0, duration: 0.4, ease: "power2.in" }, "ready")
      .to(lb, { yPercent: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out" }, "ready+=0.14")
      .to(hint, { autoAlpha: 0, y: 10, duration: 0.4, ease: "power2.in" }, "ready")
      .to(btn, { autoAlpha: 1, duration: 0.2, ease: "power1.out" }, "ready+=0.08")
      .to(btn, { scale: 1, duration: 0.5, ease: "back.out(1.6)" }, "ready+=0.08"); // pops in from its centre with a subtle spring

    // 3 -> 4: Translate is tapped
    at("tap2", 8.3);
    tl.add(function () { touchAt(btn); }, "tap2-=0.05")
      .to(touch, { autoAlpha: 0.28, scale: 1, duration: 0.22, ease: "power2.out" }, "tap2")
      .to(btn, { scale: 0.96, duration: 0.14, ease: "power2.out" }, "tap2+=0.04")
      .to(btn, { scale: 1, duration: 0.4, ease: "back.out(2.2)" }, "tap2+=0.18")
      .to(touch, { autoAlpha: 0, scale: 1.5, duration: 0.4, ease: "power1.out" }, "tap2+=0.2");

    at("work", 8.85);
    tl.to(btn, { scale: 0.8, autoAlpha: 0, duration: 0.35, ease: "power2.in" }, "work")
      .to(time, { autoAlpha: 0, duration: 0.3, ease: "power2.in" }, "work")
      .to(lb, { yPercent: -100, autoAlpha: 0, duration: 0.4, ease: "power2.in" }, "work")
      .to(lc, { yPercent: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out" }, "work+=0.14");
    tl.to(wk, { c: 1, duration: 0.55, ease: "power3.inOut", onUpdate: paint }, "work")                 // bars collapse into dots
      .to(wk, { g: 1, duration: 1.15, ease: "none", onUpdate: paint }, "work+=0.4")           // the dots gravitate to the centre
      .to(wk, { f: 1, duration: 0.3, ease: "power2.in", onUpdate: paint }, "work+=1.4")                 // and give way to the orb
      .to(orb, { r: 1, o: 1, duration: 1.1, ease: "power3.out", onUpdate: renderOrb }, "work+=1.4")      // the orb of dots opens out from the centre
      .to(orb, { a: Math.PI * 2 * 8.15 / 3.6, duration: 8.15, ease: "none", onUpdate: renderOrb }, "work+=1.4"); // and keeps turning

    // the three dots after "Translating" fill in one by one, then clear, until the cry is done
    var dots = root.querySelectorAll(".ntDots b");
    gsap.set(dots, { opacity: 0 });
    var cycles = 7;
    for (var c = 0; c < cycles; c++) {
      var t0 = "work+=" + (0.9 + c * 1.2);
      tl.to(dots, { opacity: 1, duration: 0.25, stagger: 0.25, ease: "power1.out" }, t0)
        .to(dots, { opacity: 0, duration: 0.2, ease: "power1.in" }, t0 + "+=0.95");
    }

    at("final", 18.4);
    tl.to({}, { duration: 0.5 }, "final");
    tl.to(root, { opacity: 0, duration: 0.45, ease: "power1.in" }, "final+=0.5");
    tl.eventCallback("onRepeat", function () { wk.c = wk.g = wk.f = 0; orb.r = orb.o = orb.a = 0; draw(0); renderOrb(); });

    // step-through mode (opts.manual): the flow stops on each screen and waits for a button, so every transition can be tested.
    // STOP[n] is the time where screen n is showing; the bars and the orb keep moving while it waits.
    var ctl = null;
    if (opts.manual) {
      api._manual = true;
      var STOP = { 1: 1.0, 2: 6.4, 3: 7.6, 4: 11.85 }, at_ = 0, idleT = 0, ctlBtns = [];
      var P_FIX = { 2: 0.97, 3: 1 };
      var stopped = function (n) { return function () { tl.pause(); at_ = n; idleT = 0; mark(); }; };
      [1, 2, 3, 4].forEach(function (n) { tl.call(stopped(n), null, STOP[n]); });
      var mark = function () { ctlBtns.forEach(function (b, i) { b.classList.toggle("on", at_ === i + 1); }); };
      var go = function (n) { // play the transition that leaves screen n
        if (n === 0) { at_ = 0; mark(); tl.restart(); return; }
        at_ = 0; mark(); tl.time(STOP[n] + 0.001, true); tl.play();
      };
      gsap.ticker.add(function (time, dt) {
        if (!at_ || tl.isActive()) return;
        idleT += dt / 1000;
        if (at_ === 2 || at_ === 3) draw(P_FIX[at_], 3.4 * P_FIX[at_] + idleT);
        else if (at_ === 4) { orb.a += dt / 1000 * Math.PI * 2 / 3.6; renderOrb(); }
      });
      ctl = document.createElement("div");
      ctl.className = "ntCtl";
      ctl.innerHTML = '<button type="button">1 &nbsp;Tap mic</button><button type="button">2 &nbsp;Finish capture</button><button type="button">3 &nbsp;Tap Translate</button><button type="button" class="re">Restart</button>';
      var cb = ctl.querySelectorAll("button");
      ctlBtns = [cb[0], cb[1], cb[2]];
      cb[0].onclick = function () { go(1); }; cb[1].onclick = function () { go(2); }; cb[2].onclick = function () { go(3); }; cb[3].onclick = function () { go(0); };
      root.parentNode.appendChild(ctl);
    }

    tl.timeScale(1.1);

    var inView = true, io = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(function (es) {
        inView = es[0].isIntersecting;
        if (reduce || api._manual) return;
        inView ? tl.play() : tl.pause();
      });
      io.observe(root);
    }
    if (reduce) { tl.seek("work+=3").pause(); } else tl.play(0);

    api.tl = tl;
    var STEP_END = [1.0, 5.0, 7.4, 11.0]; // where each of the four screens is showing
    api.goto = function (n) { api._manual = true; tl.pause(STEP_END[Math.max(1, Math.min(4, n)) - 1]); };
    api.play = function () { api._manual = false; tl.play(); };
    api.pause = function () { api._manual = true; tl.pause(); };
    api.destroy = function () { if (io) io.disconnect(); tl.kill(); if (ctl && ctl.parentNode) ctl.parentNode.removeChild(ctl); root.innerHTML = ""; };
    return api;
  }

  window.NanniTranslate = { mount: mount };
})();
