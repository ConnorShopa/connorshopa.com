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
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!input.value) return;
      msg.textContent = "";
      form.classList.remove("has-error");
      decryptBundle(slug, input.value).then(function (pages) {
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
    var many = locked || proj.pages.length > 1;

    var sec = document.createElement("section");
    sec.className = "view";
    sec.id = id;
    sec.setAttribute("role", "dialog");
    sec.setAttribute("aria-modal", "true");
    sec.setAttribute("aria-labelledby", id + "-title");
    sec.hidden = true;

    var html = '<div class="viewHead' + (proj.wordmark ? " stacked" : "") + '">';
    // an underline under the logo (Habbot) goes in a small column
    if (proj.icon) html += '<span class="viewStack"><img class="viewLogo" src="' + proj.logo + '" alt=""><img class="viewIcon" src="' + proj.icon + '" alt=""></span>';
    else if (proj.logo) html += '<img class="viewLogo" src="' + proj.logo + '" alt="">';
    // a wordmark replaces the written title (which stays for screen readers) and sits under the icon
    if (proj.wordmark) html += '<img class="viewWordmark" src="' + proj.wordmark + '" alt="">';
    html += '<h2 id="' + id + '-title" class="viewTitle' + (proj.logoOnly || proj.wordmark ? " sr-only" : "") + '"></h2></div>';
    html += '<button type="button" class="viewClose" aria-label="Close">&times;</button>';
    html += '<div class="viewBody">';
    if (locked) html += lockPage(proj);
    else proj.pages.forEach(function (page, i) {
      html += '<div class="pg ' + page.layout + (i === 0 ? " is-on" : "") + '">' + page.html + "</div>";
    });
    html += "</div>";
    if (proj.download) { html += '<button type="button" class="lockBtn viewDownload">Download the app</button>'; }
    if (many) {
      html += '<button type="button" class="viewNav prev" aria-label="Previous page" disabled' + (locked ? " hidden" : "") + ">" + CHEVRON("prev") + "</button>";
      html += '<button type="button" class="viewNav next" aria-label="Next page"' + (locked ? " hidden" : "") + ">" + CHEVRON("next") + "</button>";
      html += '<div class="viewDots"' + (locked ? " hidden" : "") + ">";
      (locked ? [] : proj.pages).forEach(function (_, i) {
        html += '<button type="button" class="viewDot" data-page="' + i + '" aria-label="Page ' + (i + 1) + " of " + proj.pages.length + '"' + (i === 0 ? ' aria-current="true"' : "") + "></button>";
      });
      html += "</div>";
    }
    sec.innerHTML = html;
    if (proj.download) sec.classList.add("hasDownload");
    sec.querySelector(".viewTitle").textContent = proj.title;
    if (proj.accent) sec.style.setProperty("--accent", proj.accent);
    if (proj.bg) sec.style.setProperty("--view-bg", proj.bg);
    // url() inside a custom property resolves against the stylesheet, so it gets the full address
    if (proj.bgImage) { sec.style.setProperty("--view-img", 'url("' + new URL(proj.bgImage, document.baseURI).href + '")'); sec.classList.add("hasBgImage"); }
    if (proj.bgImageBlur) sec.style.setProperty("--view-img-blur", 'url("' + new URL(proj.bgImageBlur, document.baseURI).href + '")');
    document.body.appendChild(sec);
    if (locked) wireLock(slug, sec);
  });
})();
