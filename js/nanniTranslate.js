/* Nanni's "new translation" flow, a whole phone screen, animated with GSAP. It reuses the navigation menu's pieces (js/nanniNav.js:
   the icons, the floating pill, the mic button), and follows the storyboard:
     1  Journal, the floating pill and the mic button
     2  the mic button is tapped; the "New translation" screen opens out of it and recording starts on its own
     3  once the five seconds are in, "Ready to translate" and the Translate button slides up
     4  Translate is tapped: the ring gives way to a breathing shape, and the cry is translated ("Translating")
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
      '<div class="ntBlob"></div>' +
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
    var blob = q(".ntBlob"), label = q(".ntLabel"), la = q(".ntLabel .a"), lb = q(".ntLabel .b"), lc = q(".ntLabel .c"), hint = q(".ntHint"), btn = q(".ntBtn");
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
    function draw(p) {
      var t = p * 3.4, amp = Math.min(1, p / 0.06);
      var swell = 0.62 + 0.38 * Math.sin(t * 2.1 + 0.6) * Math.sin(t * 0.9 + 1.2); // the cry gets louder and softer
      for (var i = 0; i < BARS; i++) {
        var u = (i - (BARS - 1) / 2) / 4.2, bell = 0.28 + 0.72 * Math.exp(-u * u);
        var n = 0.5 + 0.5 * Math.sin(t * (4.2 + (i * 7 % 5) * 0.9) + i * 1.7) * Math.sin(t * 2.3 + i * 0.55 + 1.1);
        var l = Math.max(0.04, Math.min(1, bell * swell * (0.25 + 0.95 * n) * amp));
        l = l * (1 - calm.v) + 0.06 * calm.v;
        bars[i].style.height = (2.4 + l * 15) + "cqw";
      }
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
    gsap.set(btn, { autoAlpha: 0, yPercent: 140 });
    gsap.set([lb, lc], { yPercent: 100, autoAlpha: 0 });
    gsap.set(blob, { autoAlpha: 0, scale: 0.4 });
    gsap.set(touch, { autoAlpha: 0, scale: 0.4 });
    draw(0);

    var tl = gsap.timeline({ paused: true, repeat: opts.loop === false ? 0 : -1, defaults: { ease: "power3.inOut" } });
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
    tl.to(prog, { p: 1, duration: 3.4, ease: "none", onUpdate: function () { draw(prog.p); } }, "count");
    tl.set(prog, { p: 0 }, 0);
    tl.set(calm, { v: 0 }, 0);

    // 3: five seconds are in: the ring closes, the label rolls to "Ready to translate", the Translate button slides up
    at("ready", 6.5);
    tl.to(calm, { v: 1, duration: 0.7, ease: "power2.out", onUpdate: function () { draw(1); } }, "ready")
      .to(ring, { scale: 1.05, duration: 0.22, ease: "power2.out" }, "ready")
      .to(ring, { scale: 1, duration: 0.5, ease: "back.out(2.2)" }, "ready+=0.22")
      .to(la, { yPercent: -100, autoAlpha: 0, duration: 0.4, ease: "power2.in" }, "ready")
      .to(lb, { yPercent: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out" }, "ready+=0.14")
      .to(hint, { autoAlpha: 0, y: 10, duration: 0.4, ease: "power2.in" }, "ready")
      .to(btn, { autoAlpha: 1, yPercent: 0, duration: 0.34, ease: "back.out(2.6)" }, "ready+=0.06") // it snaps in, with urgency
      .fromTo(btn, { scale: 0.86 }, { scale: 1, duration: 0.3, ease: "back.out(3)", immediateRender: false }, "ready+=0.06");

    // 3 -> 4: Translate is tapped
    at("tap2", 8.3);
    tl.add(function () { touchAt(btn); }, "tap2-=0.05")
      .to(touch, { autoAlpha: 0.28, scale: 1, duration: 0.22, ease: "power2.out" }, "tap2")
      .to(btn, { scale: 0.96, duration: 0.14, ease: "power2.out" }, "tap2+=0.04")
      .to(btn, { scale: 1, duration: 0.4, ease: "back.out(2.2)" }, "tap2+=0.18")
      .to(touch, { autoAlpha: 0, scale: 1.5, duration: 0.4, ease: "power1.out" }, "tap2+=0.2");

    at("work", 8.85);
    tl.to(btn, { yPercent: 150, autoAlpha: 0, duration: 0.55, ease: "power2.in" }, "work")
      .to(ring, { scale: 0.7, autoAlpha: 0, duration: 0.5, ease: "power2.in" }, "work")
      .to(lb, { yPercent: -100, autoAlpha: 0, duration: 0.4, ease: "power2.in" }, "work")
      .to(lc, { yPercent: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out" }, "work+=0.14")
      .to(blob, { autoAlpha: 1, scale: 1, duration: 0.8, ease: "back.out(1.5)" }, "work+=0.3");
    var shapes = [
      { r: "56% 44% 52% 48% / 48% 55% 45% 52%", x: 1.05, y: 0.96, k: -3, rot: -5 },
      { r: "47% 53% 46% 54% / 55% 47% 53% 45%", x: 0.96, y: 1.05, k: 3, rot: 5 },
      { r: "53% 47% 57% 43% / 46% 54% 46% 54%", x: 1.05, y: 0.96, k: -2, rot: -4 },
      { r: "48% 52% 47% 53% / 53% 46% 54% 47%", x: 0.97, y: 1.04, k: 3, rot: 6 }
    ];
    shapes.forEach(function (sh, i) {
      var at0 = "work+=" + (0.3 + i * 3.0);
      tl.to(blob, { borderRadius: sh.r, rotation: sh.rot, duration: 3.2, ease: "sine.inOut" }, at0);
      if (i) tl.to(blob, { scaleX: sh.x, scaleY: sh.y, skewX: sh.k, duration: 3.2, ease: "sine.inOut" }, at0);
    });

    // the three dots after "Translating" fill in one by one, then clear, until the cry is done
    var dots = root.querySelectorAll(".ntDots b");
    gsap.set(dots, { opacity: 0 });
    var cycles = 11;
    for (var c = 0; c < cycles; c++) {
      var t0 = "work+=" + (0.9 + c * 1.2);
      tl.to(dots, { opacity: 1, duration: 0.25, stagger: 0.25, ease: "power1.out" }, t0)
        .to(dots, { opacity: 0, duration: 0.2, ease: "power1.in" }, t0 + "+=0.95");
    }

    at("final", 21.8);
    tl.to({}, { duration: 0.5 }, "final");
    tl.to(root, { opacity: 0, duration: 0.45, ease: "power1.in" }, "final+=0.5");
    tl.eventCallback("onRepeat", function () { draw(0); });

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
    if (reduce) { tl.seek("work+=1").pause(); } else tl.play(0);

    api.tl = tl;
    var STEP_END = [1.0, 5.0, 7.4, 11.0]; // where each of the four screens is showing
    api.goto = function (n) { api._manual = true; tl.pause(STEP_END[Math.max(1, Math.min(4, n)) - 1]); };
    api.play = function () { api._manual = false; tl.play(); };
    api.pause = function () { api._manual = true; tl.pause(); };
    api.destroy = function () { if (io) io.disconnect(); tl.kill(); root.innerHTML = ""; };
    return api;
  }

  window.NanniTranslate = { mount: mount };
})();
