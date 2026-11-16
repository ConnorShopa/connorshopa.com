// Habbot's project view, archived (removed from js/projects.js; the home link will go to the app instead).
// To bring it back: paste this entry inside window.PROJECTS in js/projects.js (it needs the pg/phone/text helpers and the
// A / H path variables defined at the top of that file), add data-view="habbot" and href="./habbot.html" to its link in
// index.html, and its css lives in css/redesign.css (.coverWrap, .trioPill, ...).
//
    habbot: {
      title: "Habbot",
      logoOnly: true,
      noNav: true, // no side chevrons (the pages will be moved through another way)
      bgImage: A + "habbotAssets/grass.jpg", // behind the first page only: sharp on the right...
      accent: "#FA983A", // the orange of its underline: dots, eyebrow markers, the active page dot
      bg: "#FFFAF6",     // the paper from the app: the card's background (its link in index.html carries the same colour in data-bubble)
      // a fresh start (the previous 7 pages are saved in archive/habbot-view.js): a cover in the manner of the
      // illustration-book reference (a square of green, the name set big beneath it), then the app screens
      pages: [
        pg("cover",
          '<div class="coverWrap"><div class="coverHead"><img class="coverMark" src="' + H + 'habbot_projectImage.svg" alt="Habbot">' +
          '<span class="stickyDots" data-d="16" data-fit></span><p class="coverTag">Collect yourself</p></div>' +
          '<div class="coverActions"><button type="button" class="lockBtn dlBtn">Download the app</button><button type="button" class="lockBtn dlBtn aboutBtn" aria-label="More">More<svg width="18" height="18" viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 9.5l8 8 8-8"/></svg></button></div>' +
          '</div>' +
          phone(A + "habbotAssets/habbot_clip_welcome.mp4", "coverShot", { poster: A + "habbotAssets/app_screen01.png" })),
        // the pages "More" scrolls down to: a pill and some text where the CTA section was, one phone on the right
        pg("cover",
          '<div class="coverWrap"><span class="trioPill">About</span><p class="coverText">Throughout a two month roadtrip I would keep track of my meditation with two dots drawn in my journal.</p><p class="coverText">The distance between the dots represented the length of the meditation.</p><p class="coverText">While living in a remote Wyoming cabin, I digitized this process into an iOS application.</p></div>' +
          phone(A + "habbotAssets/habbot_clip_about.mp4", "coverShot", { poster: A + "habbotAssets/app_screen04.png" })),
        pg("cover",
          '<div class="coverWrap"><span class="trioPill">Creating a habbot</span><p class="coverLead">Set a time goal, or not</p><p class="coverLead">Organize your habbots with tags</p></div>' +
          phone(A + "habbotAssets/habbot_clip_create.mp4", "coverShot", { poster: A + "habbotAssets/app_screen05.png" })),
        pg("cover",
          '<div class="coverWrap"><span class="trioPill">List</span><p class="coverLead">Keep track of your habbots visually</p></div>' +
          phone(A + "habbotAssets/habbot_clip_list.mp4", "coverShot", { poster: A + "habbotAssets/app_screen01.png" })),
        pg("cover",
          '<div class="coverWrap"><span class="trioPill">Compile</span><p class="coverLead">See your progress stack up</p><p class="coverLead">Find which habbots are most frequent</p></div>' +
          phone(A + "habbotAssets/habbot_clip_compile.mp4", "coverShot", { poster: A + "habbotAssets/app_screen03.png" })),
      ],
    },
