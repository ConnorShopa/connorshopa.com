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

  // Nanni's propeller-hat logo, cut from the app icon (assets/homeAssets/nanni_app_icon.svg): the propeller is its own piece so it can spin
  var HAT = "<svg class=\"ntHatSvg\" viewBox=\"18 30 84 60\" aria-hidden=\"true\"><path class=\"ntProp\" fill=\"#99CA9C\" fill-rule=\"evenodd\" d=\"M40.9526 33.7262C39.0899 35.5876 38.9868 37.5996 40.6457 39.7069C41.6289 40.9562 42.3874 41.2754 44.3699 41.2718C46.6283 41.2682 54.8674 39.567 57.4356 38.5744C58.392 38.2046 58.4784 38.7441 58.4784 45.0827V45.4441C58.4784 46.4307 59.2788 47.2305 60.2661 47.2305C61.2533 47.2305 62.0537 46.4307 62.0537 45.4441V45.1065C62.0537 38.8185 62.1448 38.2469 63.0965 38.5458C67.1657 39.8236 73.9408 41.276 75.8309 41.276C78.6321 41.276 80.5258 39.4711 80.5258 36.8017C80.5258 34.2996 78.4104 32.3412 75.7207 32.3531C73.8448 32.3614 67.3725 33.7994 62.0876 35.3816C60.2827 35.9222 59.0904 35.7763 54.5915 34.4658C51.6497 33.6083 47.7241 32.7443 45.8685 32.546C42.7885 32.2167 42.36 32.3197 40.9526 33.7262Z\"/><path fill=\"#FBC157\" fill-rule=\"evenodd\" d=\"M43.5856 82.2296C43.0345 85.0835 45.2483 87.6465 48.1569 87.6465H71.8818C74.8022 87.6465 77.019 85.0637 76.4479 82.2016C74.3205 71.5403 68.767 48.942 59.915 48.942C51.0552 48.942 45.642 71.5799 43.5856 82.2296Z\"/><path fill=\"#F28C8C\" fill-rule=\"evenodd\" d=\"M71.0796 50.4736C81.7821 53.2722 91.527 61.081 95.9782 70.4249C98.3146 75.3284 99.237 78.5087 99.9819 84.2233C100.179 86.0519 98.7451 87.6471 96.9047 87.6471H90.843C88.4944 87.6471 86.4957 85.9377 86.1332 83.6189L85.9949 82.7347C83.5864 69.2066 77.1045 57.7054 68.733 52.1045C64.4844 49.2624 65.0213 48.8891 71.0796 50.4736Z\"/><path fill=\"#80BAFD\" fill-rule=\"evenodd\" d=\"M48.9204 50.4736C38.2179 53.2722 28.473 61.081 24.0218 70.4249C21.6854 75.3284 20.763 78.5087 20.0181 84.2233C19.8211 86.0519 21.2549 87.6471 23.0954 87.6471H29.157C31.5056 87.6471 33.5043 85.9377 33.8668 83.6189L34.0051 82.7347C36.4136 69.2066 42.8955 57.7054 51.267 52.1045C55.5156 49.2624 54.9787 48.8891 48.9204 50.4736Z\"/></svg>";

  function recMarkup(variant) {
    return '<div class="ntRec">' +
      '<div class="ntBack">' + CHEV + '</div><div class="ntTitle">New translation</div>' +
      '<div class="ntRing"><svg viewBox="0 0 100 100" aria-hidden="true"><circle class="ntArc" cx="50" cy="50" r="' + R + '" /><circle class="ntHead" r="1.6" cx="50" cy="' + (50 - R) + '" /></svg>' +
        '<span class="ntTime">0:00</span></div>' +
      (variant === "hat" ? '<div class="ntBlob ntHat">' + HAT + '</div>' : '<div class="ntBlob"></div>') +
      '<div class="ntLabel"><span class="a">Capturing cry</span><span class="b">Ready to translate</span><span class="c">Translating<i class="ntDots"><b>.</b><b>.</b><b>.</b></i></span></div>' +
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
    root.innerHTML = '<div class="ntPhone">' + homeMarkup(P) + recMarkup(opts.variant) + '<i class="ntTouch"></i></div>';
    if (!gsap) return api;

    var q = function (s) { return root.querySelector(s); };
    var phone = q(".ntPhone"), home = q(".ntHome"), rec = q(".ntRec"), fab = q(".ntFab"), pill = q(".ntPill"), tabs = q(".ntTabs");
    var touch = q(".ntTouch"), back = q(".ntBack"), title = q(".ntTitle"), ring = q(".ntRing"), arc = q(".ntArc"), head = q(".ntHead"), time = q(".ntTime");
    var blob = q(".ntBlob"), label = q(".ntLabel"), la = q(".ntLabel .a"), lb = q(".ntLabel .b"), lc = q(".ntLabel .c"), hint = q(".ntHint"), btn = q(".ntBtn");
    var journal = q('.nnTab[data-id="logs"]');
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Journal is the active tab on the first screen
    journal.style.color = INK;
    journal.querySelector(".nnLbl").style.fontWeight = 700;
    var pen = journal.querySelector(".pen"); if (pen) pen.style.fill = INK;
    arc.style.strokeDasharray = C; 

    // the ring: p is 0..1 across the five seconds. It thickens as it fills; the dot rides the end of it
    function draw(p) {
      var w = 1.5 + 5.2 * p * p;
      arc.style.strokeDashoffset = C * (1 - p);
      arc.style.strokeWidth = w;
      var a = p * 2 * Math.PI;
      head.setAttribute("cx", 50 + R * Math.sin(a));
      head.setAttribute("cy", 50 - R * Math.cos(a));
      head.setAttribute("r", Math.max(1.7, w * 0.82));
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

    // 3: five seconds are in: the ring closes, the label rolls to "Ready to translate", the Translate button slides up
    at("ready", 6.5);
    tl.to(ring, { scale: 1.05, duration: 0.22, ease: "power2.out" }, "ready")
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
    if (opts.variant === "hat") {
      // the propeller spins one full turn, comes to a stop, then spins again
      var prop = q(".ntProp"), spin = { p: 0 };
      gsap.set(prop, { svgOrigin: "60.2 40" });
      var turn = function () { gsap.set(prop, { scaleX: Math.cos(spin.p * Math.PI * 2) }); };
      for (var h = 0; h < 3; h++) {
        tl.fromTo(spin, { p: 0 }, { p: 1, duration: 1.5, ease: "power2.inOut", onUpdate: turn, immediateRender: false }, "work+=" + (0.9 + h * 3.0));
      }
    }
    // the shape keeps changing while the cry is translated
    var shapes = opts.variant === "hat" ? [] : [
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
    var cycles = opts.variant === "hat" ? 7 : 11;
    for (var c = 0; c < cycles; c++) {
      var t0 = "work+=" + (0.9 + c * 1.2);
      tl.to(dots, { opacity: 1, duration: 0.25, stagger: 0.25, ease: "power1.out" }, t0)
        .to(dots, { opacity: 0, duration: 0.2, ease: "power1.in" }, t0 + "+=0.95");
    }

    at("final", opts.variant === "hat" ? 18.4 : 21.8);
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
