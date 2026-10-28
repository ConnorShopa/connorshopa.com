// Builds one card (.view) per project in window.PROJECTS (js/projects.js): the logo + title, a close
// button, the pages, chevrons to go between them and a row of dots. js/project.js opens and pages them.
(function () {
  var P = window.PROJECTS || {};
  var CHEVRON = function (dir) {
    return '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="' +
      (dir === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7") +
      '" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  };

  Object.keys(P).forEach(function (slug) {
    var proj = P[slug];
    var id = "view-" + slug;
    var many = proj.pages.length > 1;

    var sec = document.createElement("section");
    sec.className = "view";
    sec.id = id;
    sec.setAttribute("role", "dialog");
    sec.setAttribute("aria-modal", "true");
    sec.setAttribute("aria-labelledby", id + "-title");
    sec.hidden = true;

    var html = '<div class="viewHead' + (proj.wordmark ? " stacked" : "") + '">';
    if (proj.logo) html += '<img class="viewLogo" src="' + proj.logo + '" alt="">';
    // a wordmark replaces the written title (which stays for screen readers) and sits under the icon
    if (proj.wordmark) html += '<img class="viewWordmark" src="' + proj.wordmark + '" alt="">';
    html += '<h2 id="' + id + '-title" class="viewTitle' + (proj.logoOnly || proj.wordmark ? " sr-only" : "") + '"></h2></div>';
    html += '<button type="button" class="viewClose" aria-label="Close">&times;</button>';
    html += '<div class="viewBody">';
    proj.pages.forEach(function (page, i) {
      html += '<div class="pg ' + page.layout + (i === 0 ? " is-on" : "") + '">' + page.html + "</div>";
    });
    html += "</div>";
    if (many) {
      html += '<button type="button" class="viewNav prev" aria-label="Previous page" disabled>' + CHEVRON("prev") + "</button>";
      html += '<button type="button" class="viewNav next" aria-label="Next page">' + CHEVRON("next") + "</button>";
      html += '<div class="viewDots">';
      proj.pages.forEach(function (_, i) {
        html += '<button type="button" class="viewDot" data-page="' + i + '" aria-label="Page ' + (i + 1) + " of " + proj.pages.length + '"' + (i === 0 ? ' aria-current="true"' : "") + "></button>";
      });
      html += "</div>";
    }
    sec.innerHTML = html;
    sec.querySelector(".viewTitle").textContent = proj.title;
    document.body.appendChild(sec);
  });
})();
