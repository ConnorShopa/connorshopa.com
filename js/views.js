// Builds one card (.view) per project in window.PROJECTS (js/projects.js): the logo + title, a close
// button, the pages, chevrons to go between them and a row of dots. js/project.js opens and pages them.
(function () {
  var P = window.PROJECTS || {};
  var CHEVRON = function (dir) {
    return '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="' +
      (dir === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7") +
      '" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  };

  // ---- password-protected projects ----
  var lockPage = function (proj) {
    return (
    '<div class="pg one is-on"><div class="pgText lockBox">' +
    '<p class="body soft">Under NDA. <a href="mailto:connorshopa@gmail.com">Email</a> or <a href="sms:+13432095337">text</a> me for the password</p>' +
    '<form class="lockForm"><input class="lockInput" type="password" placeholder="Password" autocomplete="current-password" aria-label="Password">' +
    '<button type="submit" class="lockBtn" disabled>Unlock</button></form>' +
    '<p class="lockMsg" role="alert"></p>' +
    (proj.appLinks ? '<p class="lockApp">Download the app: <a href="' + proj.appLinks.apple + '" target="_blank" rel="noopener">Apple</a> &middot; <a href="' + proj.appLinks.android + '" target="_blank" rel="noopener">Android</a></p>' : "") +
    '</div></div>'
    );
  };

  var unb64 = function (s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); };

  // fetch js/locked/<slug>.json and decrypt it in the browser; throws on a wrong password
  function decryptBundle(slug, password) {
    return fetch("js/locked/" + slug + ".json", { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error("missing");
      return r.json();
    }).then(function (b) {
      return crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]).then(function (m) {
        return crypto.subtle.deriveKey({ name: "PBKDF2", salt: unb64(b.salt), iterations: b.iter, hash: "SHA-256" }, m, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
      }).then(function (key) {
        var open = function (o) { return crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(o.iv) }, key, unb64(o.data)); };
        return open(b.main).then(function (buf) {
          var pages = JSON.parse(new TextDecoder().decode(buf));
          var names = Object.keys(b.files || {});
          return Promise.all(names.map(function (n) {
            return open(b.files[n]).then(function (f) { return URL.createObjectURL(new Blob([f], { type: b.files[n].type })); });
          })).then(function (urls) {
            names.forEach(function (n, i) {
              pages.forEach(function (p) { p.html = p.html.split("private:" + n).join(urls[i]); });
            });
            return pages;
          });
        });
      });
    });
  }

  // "step" views (TouchTunes): the pages sit on top of each other and scroll / swipe / arrow keys / the tabs step between them.
  // Only the words animate (the next ones rise in); the phone and the tabs stay where they are. The coloured pills bounce in.
  // The tabs are made from each page's label (.ttLabel), so a new page gets its tab by being added to the project.
  function wireSteps(sec) {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var d = reduce ? 0 : 1;
    var pgs = Array.prototype.slice.call(sec.querySelectorAll(".viewBody .pg"));
    var cur = 0, busy = false;
    sec.style.setProperty("--tt-n", pgs.length); // the nav list is this many rows tall; every page's text block is as tall, so the sentence sits level with the middle of the list

    // the plain words of each line get their own span, so they can move while the pills do something else
    pgs.forEach(function (pg) {
      pg.querySelectorAll(".ttLine").forEach(function (line) {
        Array.prototype.slice.call(line.childNodes).forEach(function (n) {
          if (n.nodeType === 3 && n.textContent.trim()) {
            var s = document.createElement("span"); s.className = "ttTxt"; s.textContent = n.textContent;
            line.replaceChild(s, n);
          }
        });
      });
    });
    var parts = function (pg) {
      var txt = Array.prototype.slice.call(pg.querySelectorAll(".ttTxt"));
      // a page that isn't a TouchTunes sentence (Nanni): its blocks of text and its pictures are what move
      if (!txt.length) {
        Array.prototype.forEach.call(pg.children, function (c) {
          if (c.classList.contains("ttLabel")) return;
          if (c.classList.contains("pgText")) Array.prototype.forEach.call(c.children, function (k) { txt.push(k); });
          else txt.push(c);
        });
      }
      return { txt: txt, pills: Array.prototype.slice.call(pg.querySelectorAll(".ttPill")) };
    };

    // tabs, in the first page's text column, over the (invisible) labels that keep every page's sentence at the same height
    var labels = pgs.map(function (pg) { var l = pg.querySelector(".ttLabel"); return l ? l.textContent.trim() : ""; });
    var tabs = null, btns = [];
    if (!sec.classList.contains("noTabs") && labels.some(Boolean) && pgs[0].querySelector(".pgText")) {
      tabs = document.createElement("div"); tabs.className = "ttTabs"; tabs.setAttribute("role", "tablist");
      labels.forEach(function (name, i) {
        var b = document.createElement("button"); b.type = "button"; b.className = "ttTab"; b.textContent = name || "Page " + (i + 1);
        b.setAttribute("role", "tab"); b.addEventListener("click", function () { goTo(i); });
        btns.push(b); tabs.appendChild(b);
      });
      var col = pgs[0].querySelector(".pgText");
      if (sec.classList.contains("navSide")) { // the tab list sits on its own at the left of the card, whatever the page
        col = document.createElement("div"); col.className = "ttNavWrap";
        sec.querySelector(".viewBody").appendChild(col);
      }
      col.appendChild(tabs);
      var rule = document.createElement("span"); rule.className = "ttRule"; col.appendChild(rule); // the thin line between the tabs and the sentence
    }
    // the nav column is as wide as its longest label (so a long label never runs into the line beside it), and at least its share of the card
    function sizeNav() {
      var w = 0;
      btns.forEach(function (b) { w = Math.max(w, b.offsetWidth); });
      if (w) sec.style.setProperty("--tt-nav-px", Math.ceil(w) + "px");
    }
    function markTab(animate) {
      btns.forEach(function (b, i) { b.classList.toggle("on", i === cur); b.setAttribute("aria-selected", i === cur ? "true" : "false"); });
    }

    // the scroll cue at the bottom centre: a mouse with a wheel that rolls; it goes away on the last page
    var cue = document.createElement("button");
    cue.type = "button"; cue.className = "ttScroll"; cue.setAttribute("aria-label", "Next page");
    cue.innerHTML = '<span class="ttMouse"><span class="ttWheel"></span></span><span class="ttScrollText">Scroll to see more</span>';
    cue.addEventListener("click", function () { go(1); });
    sec.appendChild(cue);
    var cueState = function () { cue.classList.toggle("gone", cur >= pgs.length - 1); };
    cueState();

    pgs.forEach(function (pg, i) {
      pg.style.pointerEvents = "none"; // the tabs set their own pointer-events
      if (i) { var p = parts(pg); gsap.set(p.txt, { autoAlpha: 0, y: 36 }); gsap.set(p.pills, { scale: 0.8, autoAlpha: 0 }); }
    });
    sizeNav(); markTab(false);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { sizeNav(); markTab(false); });
    window.addEventListener("resize", function () { sizeNav(); markTab(false); });
    if (window.ResizeObserver) new ResizeObserver(function () { sizeNav(); }).observe(sec); // a view built while hidden has no label widths until it opens

    function goTo(n) {
      if (busy || n === cur || n < 0 || n >= pgs.length) return;
      busy = true;
      var dir = n > cur ? 1 : -1, out = parts(pgs[cur]), inn = parts(pgs[n]);
      gsap.to(out.txt, { autoAlpha: 0, y: -36 * dir, duration: 0.35 * d, ease: "power2.in", stagger: 0.04 * d });
      gsap.to(out.pills, { scale: 0.8, autoAlpha: 0, duration: 0.25 * d, ease: "power2.in", stagger: 0.03 * d });
      gsap.fromTo(inn.txt, { autoAlpha: 0, y: 36 * dir }, { autoAlpha: 1, y: 0, duration: 0.6 * d, ease: "power3.out", stagger: 0.07 * d, delay: 0.3 * d });
      // the pills bounce in, one after the other, once their words are arriving
      gsap.fromTo(inn.pills, { scale: 0.8, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.5 * d, ease: "back.out(0.6)", stagger: 0.12 * d, delay: 0.5 * d,
        onComplete: function () { busy = false; } });
      cur = n;
      markTab(true);
      cueState();
    }
    var go = function (delta) { goTo(cur + delta); };

    var gone = function () { return sec.hidden || sec.style.visibility === "hidden"; };
    sec.addEventListener("wheel", function (e) {
      e.preventDefault();
      if (Math.abs(e.deltaY) < 12) return;
      go(e.deltaY > 0 ? 1 : -1);
    }, { passive: false });
    var y0 = null;
    sec.addEventListener("touchstart", function (e) { y0 = e.touches[0] ? e.touches[0].clientY : null; }, { passive: true });
    sec.addEventListener("touchend", function (e) {
      if (y0 === null || !e.changedTouches[0]) return;
      var dy = e.changedTouches[0].clientY - y0; y0 = null;
      if (Math.abs(dy) > 50) go(dy < 0 ? 1 : -1);
    }, { passive: true });
    document.addEventListener("keydown", function (e) {
      if (gone()) return;
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") go(1);
      else if (e.key === "ArrowUp" || e.key === "PageUp") go(-1);
    });
  }

  // put the decrypted pages into the view
  function showPages(sec, pages) {
        var body = sec.querySelector(".viewBody");
      body.innerHTML = pages.map(function (page, i) {
        return '<div class="pg ' + page.layout + (i === 0 ? " is-on" : "") + '">' + page.html + "</div>";
      }).join("");
      var many = pages.length > 1;
      sec.querySelectorAll(".viewNav").forEach(function (b) { b.hidden = !many; });
      var prev = sec.querySelector(".viewNav.prev");
      if (prev) prev.disabled = true;
      var next = sec.querySelector(".viewNav.next");
      if (next) next.disabled = !many;
      var dots = sec.querySelector(".viewDots");
      if (dots) {
        dots.hidden = !many;
        dots.innerHTML = pages.map(function (_, i) {
          return '<button type="button" class="viewDot" data-page="' + i + '" aria-label="Page ' + (i + 1) + " of " + pages.length + '"' + (i === 0 ? ' aria-current="true"' : "") + "></button>";
        }).join("");
      }
      sec._page = 0;
    if (sec.classList.contains("stepView") && pages.length > 1 && !sec._stepWired) { sec._stepWired = true; wireSteps(sec); }
  }

  // TEMPORARY (localhost only): the plain pages from private/<slug>/pages.json, so changes show without re-encrypting
  var isLocal = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  function loadPlain(slug) {
    return fetch("private/" + slug + "/pages.json", { cache: "no-cache" }).then(function (r) { return r.json(); }).then(function (pages) {
      pages.forEach(function (p) { p.html = p.html.split("private:").join("private/" + slug + "/media/"); });
      return pages;
    });
  }

  function wireLock(slug, sec) {
    var form = sec.querySelector(".lockForm");
    var input = sec.querySelector(".lockInput");
    var msg = sec.querySelector(".lockMsg");
    var btn = sec.querySelector(".lockBtn");
    // Unlock stays disabled until at least one character has been typed
    input.addEventListener("input", function () {
      form.classList.remove("has-error");
      msg.textContent = "";
      btn.disabled = !input.value;
    });
    // TEMPORARY test button: only on localhost, skips the password by reading the plain pages in private/<slug>/ (git-ignored). Delete when done.
    if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
      var dev = document.createElement("button");
      dev.type = "button"; dev.className = "lockDev"; dev.textContent = "Skip (dev)";
      form.appendChild(dev);
      dev.addEventListener("click", function () {
        loadPlain(slug).then(function (pages) { showPages(sec, pages); }).catch(function () { msg.textContent = "No private/" + slug + "/pages.json found."; });
      });
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!input.value) return;
      msg.textContent = "";
      form.classList.remove("has-error");
      decryptBundle(slug, input.value).then(function (pages) {
        // on localhost the right password opens the plain, unencrypted pages if they exist (so edits show before re-encrypting)
        return isLocal ? loadPlain(slug).catch(function () { return pages; }) : pages;
      }).then(function (pages) {
        showPages(sec, pages);
      }).catch(function (err) {
        msg.textContent = err && err.message === "missing" ? "Nothing has been added here yet." : "That password didn\u2019t work.";
        form.classList.remove("has-error");
        void form.offsetWidth; // restart the shake if it was already showing
        form.classList.add("has-error");
        input.select();
      });
    });
  }

  Object.keys(P).forEach(function (slug) {
    var proj = P[slug];
    var id = "view-" + slug;
    var locked = !!proj.locked; // the pages are encrypted (tools/lock.mjs) and open with a password
    // "legacy": the project keeps its original page (plunk.html, spotifyDreams.html) and shows it, unchanged, inside the card
    var pages = proj.legacy ? [{ layout: "legacy", html: '<iframe class="legacyFrame" src="' + proj.legacy + '" title="' + proj.title.replace(/"/g, "") + '" loading="lazy"></iframe>' }] : proj.pages;
    var many = locked || pages.length > 1;

    var sec = document.createElement("section");
    sec.className = "view";
    sec.id = id;
    sec.setAttribute("role", "dialog");
    sec.setAttribute("aria-modal", "true");
    sec.setAttribute("aria-labelledby", id + "-title");
    sec.hidden = true;

    var html = '<div class="viewHead' + (proj.wordmark ? " stacked" : "") + (proj.keepLogo ? " keepLogo" : "") + '">';
    // an underline under the logo (Habbot) goes in a small column
    if (proj.headHtml) html += proj.headHtml;
    else if (proj.icon) html += '<span class="viewStack"><img class="viewLogo" src="' + proj.logo + '" alt=""><img class="viewIcon" src="' + proj.icon + '" alt=""></span>';
    else if (proj.logo) html += '<img class="viewLogo" src="' + proj.logo + '" alt="">';
    // a wordmark replaces the written title (which stays for screen readers) and sits under the icon
    if (proj.wordmark) html += '<img class="viewWordmark" src="' + proj.wordmark + '" alt="">';
    html += '<h2 id="' + id + '-title" class="viewTitle' + (proj.logoOnly || proj.wordmark ? " sr-only" : "") + '"></h2></div>';
    html += '<button type="button" class="viewClose" aria-label="Close"' + (proj.bgImage ? ' data-bubble="rgba(255,255,255,0.3)"' : "") + '>&times;</button>';
    html += '<div class="viewBody">';
    if (locked) html += lockPage(proj);
    else pages.forEach(function (page, i) {
      html += '<div class="pg ' + page.layout + (i === 0 ? " is-on" : "") + '">' + page.html + "</div>";
    });
    html += "</div>";
    if (proj.download) { html += '<button type="button" class="lockBtn viewDownload">Download the app</button>'; }
    if (many) {
      if (!proj.noNav) html += '<button type="button" class="viewNav prev" aria-label="Previous page" disabled' + (locked ? " hidden" : "") + ">" + CHEVRON("prev") + "</button>";
      if (!proj.noNav) html += '<button type="button" class="viewNav next" aria-label="Next page"' + (locked ? " hidden" : "") + ">" + CHEVRON("next") + "</button>";
      html += '<div class="viewDots"' + (locked ? " hidden" : "") + ">";
      (locked ? [] : pages).forEach(function (_, i) {
        html += '<button type="button" class="viewDot" data-page="' + i + '" aria-label="Page ' + (i + 1) + " of " + pages.length + '"' + (i === 0 ? ' aria-current="true"' : "") + "></button>";
      });
      html += "</div>";
    }
    sec.innerHTML = html;
    if (proj.download) sec.classList.add("hasDownload");
    sec.querySelector(".viewTitle").textContent = proj.title;
    if (proj.stepNav === "side") sec.classList.add("navSide");
    if (proj.stepNav === "none") sec.classList.add("noTabs");
    if (proj.stepText) sec.classList.add("stepView"); // pages step on scroll instead of scrolling as one long page
    if (!proj.noNav) sec.classList.add("scrollView"); // every project but Habbot: all the pages in one vertical scroll
    if (proj.noNav) sec.classList.add("vertical"); // pages move up and down (scroll or the chevron under the first page's button)
    if (proj.legacy) sec.classList.add("legacyView");
    if (proj.dark) sec.classList.add("dark");
    if (proj.accent) sec.style.setProperty("--accent", proj.accent);
    // the project's colour is the page behind the card; the card itself is a lighter tint of it
    if (proj.bg) {
      var rgb = proj.bg.replace("#", "").match(/../g).map(function (h) { return parseInt(h, 16); });
      var lifted = "#" + rgb.map(function (v) { return ("0" + Math.round(v + (255 - v) * 0.55).toString(16)).slice(-2); }).join("");
      sec.style.setProperty("--view-bg", lifted);
      sec.style.setProperty("--page-bg", proj.bg);
    } else sec.style.setProperty("--page-bg", "#E4E4E4");
    if (proj.cardBg) sec.style.setProperty("--view-bg", proj.cardBg); // an exact card colour (TouchTunes' near-black), instead of the lifted tint
    // url() inside a custom property resolves against the stylesheet, so it gets the full address
    if (proj.bgImage) { sec.style.setProperty("--view-img", 'url("' + new URL(proj.bgImage, document.baseURI).href + '")'); sec.classList.add("hasBgImage"); }
    if (proj.bgImageBlur) sec.style.setProperty("--view-img-blur", 'url("' + new URL(proj.bgImageBlur, document.baseURI).href + '")');
    document.body.appendChild(sec);
    if (locked) wireLock(slug, sec);
    // the hand-built navigation menu animation (Nanni) mounts into its box
    if (window.NanniNav) sec.querySelectorAll(".nnMount").forEach(function (m) { window.NanniNav.mount(m); });
    // the original page inside its frame: its own header, footer and cursor are hidden (the card has its own close button), then it fades in
    sec.querySelectorAll(".legacyFrame").forEach(function (f) {
      f.addEventListener("load", function () {
        try {
          var d = f.contentDocument, st = d.createElement("style");
          st.textContent = ".headerBox, .mobileMenuScreen, .mobileMenuButton, #mouse-circle, .footerBox { display: none !important; } body { cursor: auto !important; }";
          d.head.appendChild(st);
          // the mouse dot lives in this page, and a frame swallows the pointer, so the frame hands its movement up
          d.addEventListener("mousemove", function (e) {
            var r = f.getBoundingClientRect();
            window.dispatchEvent(new MouseEvent("mousemove", { clientX: e.clientX + r.left, clientY: e.clientY + r.top }));
          }, { passive: true });
        } catch (e) {}
        f.classList.add("ready");
      });
    });
    // an open (not locked) step view is wired straight away, on screens wide enough for it; narrower ones keep the one long scrolling page
    if (!locked && proj.stepText && pages.length > 1 && window.matchMedia("(min-width: 901px)").matches && window.gsap) { sec._stepWired = true; wireSteps(sec); }
  });
})();
