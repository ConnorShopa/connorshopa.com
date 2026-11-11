// The content of each in-page project view. Everything here is carried over from that project's page
// on the old site (main branch); nothing is new copy. A view is a list of pages; js/views.js turns
// this into the card, and js/project.js pages through it.
//
// Page layouts:  two   = text on the left, media on the right
//                flip  = media on the left, text on the right
//                one   = a single centred column
//                media = media only
(function () {
  var A = "assets/projectAssets/";
  // picture sizes for the justified Sketchbook grid (js/justified.js)
  var SK = {"sketch15": [2400, 2342], "sketch16": [2400, 1244], "sketch17": [2400, 1835], "sketch01": [1601, 1096], "sketch04": [3000, 3000], "sketch03": [1494, 1458], "sketch02": [1200, 631], "sketch12": [1600, 1329], "sketch05": [1600, 780], "sketch07": [1600, 1163], "sketch06": [1600, 1600], "sketch08": [6116, 3836], "sketch09": [1600, 1601], "sketch10": [1600, 992], "sketch11": [1600, 583], "sketch14": [1600, 1600], "sketch13": [1601, 1600]};
  var H = "assets/homeAssets/";

  function pg(layout, html) { return { layout: layout, html: html }; }
  function lab(name) { return '<p class="eyebrow ttLabel">' + name + "</p>"; } // a page's entry in the step-view tab list (hidden on the page itself)
  function text(html) { return '<div class="pgText">' + html + "</div>"; }
  function media() { return '<div class="pgMedia">' + Array.prototype.join.call(arguments, "") + "</div>"; }
  function fig(src, caption) {
    return "<figure><img src=\"" + src + "\" alt=\"\" loading=\"lazy\" decoding=\"async\">" +
      (caption ? "<figcaption>" + caption + "</figcaption>" : "") + "</figure>";
  }
  // a screenshot inside an iPhone frame
  function phone(src, cls, extra) {
    // an .mp4 is a screen recording: it loops silently and only plays while its page is showing (js/project.js startMedia);
    // "poster" is the still it shows before it plays
    var screen = /\.mp4$/.test(src)
      ? '<video src="' + src.replace(/^(.*)$/, "$1") + '" muted loop playsinline preload="metadata" disablepictureinpicture' + (extra && extra.poster ? ' poster="' + extra.poster + '"' : "") + "></video>"
      : '<img src="' + src + '" alt="" loading="lazy" decoding="async">';
    return '<div class="phone' + (cls ? " " + cls : "") + '">' + screen + (typeof extra === "string" ? extra : "") + '<i class="phoneGlare"></i><i class="phoneIsland"></i><i class="phoneBtn l"></i><i class="phoneBtn r"></i></div>';
  }
  function pfig(src) { return "<figure>" + phone(src) + "</figure>"; }
  function fact(label, value) { return '<div class="fact"><p class="eyebrow">' + label + '</p><p class="sub">' + value + "</p></div>"; }
  function stat(value, label) { return '<div class="stat"><p class="big">' + value + '</p><p class="eyebrow">' + label + "</p></div>"; }
  function p(cls, html) { return '<p class="' + cls + '">' + html + "</p>"; }

  window.PANELS = {
    // ---------------------------------------------------------------- About
    about: {
      title: "About",
      logoOnly: true,
      pages: [pg("one", text(
        p("lead", "Currently designing the mobile jukebox app at <a href=\"https://apps.apple.com/us/app/id378351144\" target=\"_blank\" rel=\"noopener\"><img class=\"ttPin\" src=\"assets/homeAssets/touchtunes_icon.png\" alt=\"\">TouchTunes</a> &amp; making homemade jam.") +
        p("body", "Over 3 million people interact with my work each month.") +
        p("eyebrow", "Professional history") +
        '<ul class="jobs aboutJobs"><li><span class="company">TouchTunes</span><span class="role">Product Designer</span><span class="dates">04/2025 &ndash; current</span></li><li><span class="company">AltQ</span><span class="role">Product &amp; Design Lead</span><span class="dates">04/2024 &ndash; 04/2025</span></li><li><span class="company">Ubenwa Health</span><span class="role">Product Designer</span><span class="dates">Consultant</span></li><li><span class="company">Plunk&reg;</span><span class="role">Product Designer</span><span class="dates">05/2020 &ndash; 12/2023</span></li><li><span class="company">Albedo Informatics</span><span class="role">AR/VR Designer</span><span class="dates">02/2020 &ndash; 05/2020</span></li><li><span class="company">OCAD University</span><span class="role">Industrial Design &middot; Human Computer Interaction</span></li></ul>'
      ))]
    },
    // ---------------------------------------------------------------- Contact
    contact: {
      title: "Contact",
      logoOnly: true,
      pages: [pg("one", text(
        '<ul class="contactCol2">' +
        '<li><a class="withLabel" href="mailto:connorshopa@gmail.com"><span class="tinyLabel">EMAIL ME</span>connorshopa@gmail.com</a></li>' +
        '<li><a class="withLabel" href="tel:+13432095337"><span class="tinyLabel">CALL ME</span>343.209.5337</a></li>' +
        '<li><a class="withLabel" href="https://www.linkedin.com/in/connorshopa/" target="_blank" rel="noopener"><span class="tinyLabel">LINKEDIN</span>LinkedIn &nearr;</a></li>' +
        '</ul>'
      ))]
    }
  };

  window.PROJECTS = {
    // ---------------------------------------------------------------- TouchTunes
    touchtunes: {
      title: "TouchTunes",
      logo: H + "touchtunes_icon.svg",
      wordmark: H + "touchtunes_wordmark.svg",
      appLinks: { apple: "https://apps.apple.com/us/app/id378351144", android: "https://play.google.com/store/apps/details?id=com.touchtunes.android" },
      locked: true, // the pages live encrypted in js/locked/touchtunes.json (see tools/lock.mjs)
      dark: true,
      keepLogo: true, // the app icon keeps its own colours in the header (dark cards turn logos white)
      stepText: true, // pages step on scroll: the words animate, the phone stays
      cardBg: "#03070F", // the near-black card
      pages: [],
    },

    // ---------------------------------------------------------------- Nanni
    nanni: {
      title: "Nanni",
      bg: "#CBDCF1", // a pale wash of its logo blue, so the original blue logo and wordmark read on it
      cardBg: "#EDF1F5", // the project view itself is a cool pale grey
      stepText: true, // pages step on scroll with a tab list, like TouchTunes
      stepNav: "none", // no tab list: the pages still step on scroll ("side" brings back the list fixed at the left)
      logo: H + "nanni_app_icon.svg",
      wordmark: H + "nanni_wordmark.svg",
      // the rest of the copy, pictures and layout are in git (commit 26c2461)
      pages: [
        pg("one", '<div class="nnDoc">' +
          '<section class="nnRow nnAbout"><div><span class="nnLab">&middot; About</span>' +
            '<p class="nnLead">Ubenwa health puts science based tools in pockets of caregivers enabling them to care better.</p>' +
            '<p class="nnLead">Nanni translates baby cries into actionable insights for more than 500,000 parents and guardians.</p></div>' +
            '<div class="nnShots"><img src="' + A + 'nanniAssets/nanni_screen_02.png" alt="" decoding="async"><img class="mid" src="' + A + 'nanniAssets/nanni_screen_01.png" alt="" decoding="async"><img src="' + A + 'nanniAssets/nanni_screen_03.png" alt="" decoding="async"></div></section>' +
          '<section class="nnGoal"><span class="nnLab">&middot; Goal</span>' +
            '<p class="nnLead">Nanni is 98% accurate, trained on millions of cries, backed by industry standard medical research, yet perceived as a novelty toy.</p>' +
            '<p class="nnLead">I defined a new product language that positioned Nanni as a healthcare tool.</p></section>' +
          '<div class="nnFrame"><div class="nnMount"></div><span class="nnCap">Navigation</span></div>' + // the hand-built navigation menu animation (js/nanniNav.js)
          '<section class="nnCols">' +
            '<div><span class="nnLab">&middot; Navigation</span><p class="nnLead nnHead">A clarified, focused, simple navigation structure</p>' +
              '<span class="nnLab nnQLab">&middot; Quotes</span>' +
              '<blockquote class="nnQuote">&ldquo;Users are not submitting feedback from the feedback screen, 90% of the time it&rsquo;s from the results screen.&rdquo;<cite>&ndash; Ubenwa support team</cite></blockquote>' +
              '<blockquote class="nnQuote">&ldquo;I often miss a babies cry because it takes multiple taps to get to the recording screen.&rdquo;<cite>&ndash; Nanni AI user</cite></blockquote>' +
              '<blockquote class="nnQuote">&ldquo;Routines is a confusing name. I forget where to go to see all my recordings.&rdquo;<cite>&ndash; Nanni AI user</cite></blockquote></div>' +
            '<div class="nnColR">' +
              '<p class="nnPt"><b>Feedback</b> became a prompt linked with insights and translation. Simpler for the caregiver, more relevant for Ubenwa to sharper their tool.</p>' +
              '<p class="nnPt"><b>Translating</b> a cry is now one a one tap away for a faster &amp; easier process during moments where caregivers found translation stressful.</p>' +
              '<p class="nnPt"><b>Journal</b> is the new home for insights, past translations, &amp; notes.</p>' +
              '<p class="nnPt"><b>Routines</b> remains focused on Nanni&rsquo;s new LOREM IPSUM.</p>' +
              '<p class="nnPt"><b>Fun zone</b> is remains unchanged, keeping the fun that Ubenwa had envisioned for parts of the tool.</p></div>' +
          '</section>' +
          // the new-translation animation (js/nanniTranslate.js) in a soft frame on the left, its words on the right
          '<section class="ntRow"><div class="ntFrame"><div class="ntMount"></div></div>' +
            '<div class="ntText"><span class="nnLab">&middot; Translation</span><p class="nnLead nnHead">Speedier, hands free, to the point translation</p>' +
              '<p class="nnPt">No longer 4 buttons, Nanni&rsquo;s translation becomes a single tap that translates automatically leaving caregivers hands free to care.</p>' +
              '<p class="nnPt">Translating becomes a branded and seamless animation that represents the products science based technology.</p></div></section>' +
          // the Journal: its words on the left, the two screens on a warm yellow gradient on the right
          '<section class="jrRow"><div class="jrText"><span class="nnLab">&middot; History &amp; Insights</span><p class="nnLead nnHead">Journal</p>' +
            '<p class="nnPt">A dedicated home for past cries, notes, communication between shared caregivers and solutions that worked</p>' +
            '<p class="nnPt">Insights that are useful, yet simple. Based on the unique characteristics of the child, instead of an average.</p></div>' +
            '<div class="jrFrame"><img class="jrA" src="' + A + 'nanniAssets/nanni_journal_history.png" alt="Nanni Journal: History" decoding="async"><img class="jrB" src="' + A + 'nanniAssets/nanni_journal_insights.png" alt="Nanni Journal: Insights" decoding="async"></div></section>' +
          // the four insights: each image sits on a white card inside rounded, tinted layers (built in CSS)
          '<section class="ixGrid">' +
            '<div class="ixItem ixBlue"><h3 class="ixT">Recommendations</h3><div class="ixPic"><div class="ixS"><div class="ixM"><div class="ixI"><div class="ixCard"><img src="' + A + 'nanniAssets/nanni_insight_recommendations.png" alt="Recommendations" decoding="async"></div></div></div></div></div><p class="ixCap">See which recommendations and step by step processes work best for your unique childcare needs</p></div>' +
            '<div class="ixItem ixYellow"><h3 class="ixT">Average</h3><div class="ixPic"><div class="ixS"><div class="ixM"><div class="ixI"><div class="ixCard"><img src="' + A + 'nanniAssets/nanni_insight_average.png" alt="Average" decoding="async"></div></div></div></div></div><p class="ixCap">Understand key trends pertaining to your babies crying schedule and how it compares to other times</p></div>' +
            '<div class="ixItem ixGreen"><h3 class="ixT">Past translations</h3><div class="ixPic"><div class="ixS"><div class="ixM"><div class="ixI"><div class="ixCard"><img src="' + A + 'nanniAssets/nanni_insight_past.png" alt="Past translations" decoding="async"></div></div></div></div></div><p class="ixCap">Keep a historical log of causes, fixes and timelines</p></div>' +
            '<div class="ixItem ixPink"><h3 class="ixT">Timeline</h3><div class="ixPic"><div class="ixS"><div class="ixM"><div class="ixI"><div class="ixCard"><img src="' + A + 'nanniAssets/nanni_insight_timeline.png" alt="Timeline" decoding="async"></div></div></div></div></div><p class="ixCap">Automatically get notified of likely causes of crying, based on your child&rsquo;s individual habits</p></div>' +
          '</section>' +
          // the close: Nanni's website, centred and cut off by the bottom edge of the view
          '<div class="wsCrop"><img src="' + A + 'nanniAssets/nanni_website.png" alt="The Nanni website" decoding="async"></div></div>'),
      ],
    },

    // ---------------------------------------------------------------- Seeds
    seeds: {
      title: "Seeds",
      bg: "#3BAA78",
      logo: H + "seeds_projectImage.svg",
      pages: [
        pg("two",
          text(
            p("lead", "A Living Growing Style &amp; Design System") +
            '<div class="facts">' + fact("Built for", "A small team of engineers, designers, marketers &amp; good folk") + fact("Methodology", "Atomic Design System") + "</div>"
          ) + media(fig(A + "seedsAssets/seeds_image00.png"))),
        pg("one", text(
            p("eyebrow", "The goal") +
            p("lead", "To design and build an internal design system that would ameliorate developer hand offs and product iteration."))),
        pg("media", media(
          fig(A + "seedsAssets/seeds_image01.png"), fig(A + "seedsAssets/seeds_image02.png"),
          fig(A + "seedsAssets/seeds_image03.png"), fig(A + "seedsAssets/seeds_image04.png"))),
      ],
    },

    // ---------------------------------------------------------------- Plunk
    plunk: {
      title: "Plunk®",
      logo: H + "plunk_logo_horizontal.svg",
      logoOnly: true,
      legacy: "plunk.html?v=4", // the original page, unchanged, in the card (the pages below are the redesign's own version, kept for later)
      pages: [
        pg("two",
          text(
            p("lead", "Plunk&reg; &amp; PlunkPro&trade;") +
            '<div class="facts">' + fact("Audience", "Homeowners + Modern Real Estate agents") + fact("Team", "Startup : seed") + "</div>" +
            p("eyebrow", "About") +
            p("body", "Plunk aimed to revolutionize real estate data access.") +
            p("body", "&ndash; As one of two designers, I was responsible for designing product, interfaces, and motion to help Plunk meet it&rsquo;s goal.") +
            p("body soft", '*All work shown was in collaboration with the outstanding <a href="https://www.aldredge.io/" rel="noopener" target="_blank">Vaughn Aldredge</a>')
          ) + media(fig(A + "plunkAssets/plunk_image_01.png"))),
        pg("two",
          text(
            p("eyebrow", "Deliverables") +
            '<ul class="list"><li>High fidelity prototyping of new products &amp; interfaces</li><li>Product handoff to the engineering team</li><li>Motion &amp; Visual design for data visualisation</li><li>Video and static site building for marketing design</li><li>Responsive web design from mobile to desktop</li></ul>' +
            p("body", "While cutting edge, Plunk&rsquo;s AI powered insights all were designed to follow the brand mantra: Empowering, Trustworthy, Approachable, &amp; Fun.")
          ) + media(fig(A + "plunkAssets/plunk_image_02.png"))),
        pg("two",
          text(
            p("lead", "Plunk Pro Mobile") +
            p("body", "With an audience of modern homeowners, we wanted to ensure that Plunk was accessible wherever they may be. We designed and built a mobile application with a focus of usability and interaction.")
          ) + media(fig(A + "plunkAssets/plunk_gif_03.gif", "Mobile welcome experience"), fig(A + "plunkAssets/plunk_image_06.png"))),
        pg("media", media(fig(A + "plunkAssets/plunk_gif_04.gif", "Market insights expanded view on mobile"))),
        pg("two",
          text(
            p("lead", "The explore tab") +
            p("body", "A highly interactive way to find and explore real estate data")
          ) + media(fig(A + "plunkAssets/plunk_gif_05.gif"), fig(A + "plunkAssets/plunk_gif_06.gif"))),
        pg("flip",
          media(fig(A + "plunkAssets/plunk_gif_02.gif")) +
          text(
            p("sub", "Plunk&rsquo;s cost calculator") +
            p("eyebrow", "prototype built in figma") +
            p("body", "Each new product or feature was designed with the purpose of removing the barrier of entry to quality real estate data.") +
            p("body", "The cost caluclator is an example of letting our audience customize data based on their unique homes.")
          )),
        pg("two",
          text(
            p("sub", "Home Condition") +
            p("body", "Home Condition allows homeowners or real estate agents to instantly understand how the home&rsquo;s condition impacted a home&rsquo;s value through machine vision.")
          ) + media(fig(A + "plunkAssets/plunk_image_03.png"))),
        pg("flip",
          media(fig(A + "plunkAssets/plunk_image_04.png")) +
          text(
            p("eyebrow", "Desktop, tablet, mobile, homescreen widgets") +
            p("body", "PlunkPro is the responsive home for everything Plunk offered and planned to offer our audience.")
          )),
        pg("two",
          text(p("lead", "Marketing, Motion &amp; Brand")) +
          '<div class="pgMedia"><iframe data-src="https://www.youtube.com/embed/hwCA_yP868w?si=NBZ1iEbyyaPBFyq6" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>'),
        pg("media",
          media(
            fig(A + "plunkAssets/plunk_image_05.png"),
            '<figure><video src="' + A + 'plunkAssets/ThingsChangeVideo.mp4" controls preload="none"></video></figure>',
            '<figure><video src="' + A + 'plunkAssets/appStoreVideo.mp4" controls preload="none"></video></figure>'
          )),
      ],
    },

    // ---------------------------------------------------------------- Habbot
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

    // ---------------------------------------------------------------- Spotify dreams
    spotify: {
      title: "Spotify dreams",
      logoOnly: true, // the corner shows just the Thoughtify lockup; the title stays for screen readers
      bg: "#CDEFD1", // a pale wash of Spotify green, so the green icon and name read on it
      legacy: "spotifyDreams.html?v=6", // the original page, unchanged, in the card
      legacyBg: "#E8F8EA", // the light green of the card (the pale Spotify green lifted toward white), behind the framed page
      logo: H + "spotifyDreams_projectImage.svg",
      headHtml: '<span class="viewSpot"><span class="spotIcon" aria-hidden="true"></span><span class="spot">Thoughtify</span></span>', // the same lockup as the gallery link
      pages: [
        pg("two",
          text(
            p("lead", "Fixing problems I have with Spotify") +
            p("body", "I spent 112,000 minutes with spotify during 2024. 5.1 hours a day. For all it&rsquo;s wonder, spending that much time with a product, you notice some problems.") +
            p("body", "&ndash; Oxymoronically, I also collect vinyl records, and it was this hobby that made me set out to design a solution that would solve two problems.")
          ) + media(fig(A + "spotifyAssets/spotify_img01.png"))),
        pg("one", text(p("lead", "Problem 1: Organization and exploration of Spotify content is unweildy, as well as lacking in wonder."))),
        pg("flip",
          media(fig(A + "spotifyAssets/spotify_gif01.gif")) +
          text(
            p("lead", "Making digital more physical") +
            p("body", "I started with a skeleton ideation of how I would represent thumbing through physical records.")
          )),
        pg("two",
          text(
            p("lead", "Making the view scalable") +
            p("body", "Spotify hosts a variety of different content as well as a variety of methods to organize this content.") +
            p("body", "I created a set of components and layouts that would adapt to this variety.")
          ) + media(fig(A + "spotifyAssets/spotify_img02.png"), fig(A + "spotifyAssets/spotify_img03.png"))),
        pg("flip",
          media(fig(A + "spotifyAssets/spotify_gif02.gif")) +
          text(
            p("eyebrow", "the final idea") +
            p("lead", "Record Shelf")
          )),
        pg("one",
          text(
            p("lead", "Discovered use cases") +
            p("body", "Through my exploration, I found new ways to display content I hadn&rsquo;t thought about before")
          )),
        pg("two",
          text(
            p("lead", "Friend Activity") +
            p("body", "Record shelf allows for a dynamic and social view of the content friends are listening to.") +
            p("body", "Understand similarities in taste, explore tags your friends are into")
          ) + media(fig(A + "spotifyAssets/spotify_gif03.gif"))),
        pg("flip",
          media(fig(A + "spotifyAssets/spotify_gif04.gif")) +
          text(
            p("lead", "Curated Collections") +
            p("body", "Thumb through grammy nominees, podcast collections, top charts or other curated digital crates") +
            p("body", "See what&rsquo;s top of mind for the world")
          )),
        pg("two",
          text(
            p("lead", "A Visual Library") +
            p("body", "Display your perfectly created playlists, find deep cuts from your favorites, get suggestions based on your unique taste") +
            p("body", "Your library, in a new light")
          ) + media(fig(A + "spotifyAssets/spotify_gif05.gif"))),
        pg("two",
          text(
            p("lead", "Problem 2: Spotify&rsquo;s fullscreen design is behind the times.") +
            p("body", "When Spotify went through a redesign in 2022, the fullscreen view was left behind:") +
            p("body", "While receiving new icons, fonts and ui elements, I believe there is a lot to be desired in terms of functionality and new features")
          ) + media(fig(A + "spotifyAssets/spotify_img_05.png"))),
        pg("one",
          text(
            p("body", "I often see Spotify open on a television at parties, dinners or gatherings, fullscreen should be:") +
            '<div class="stats">' +
              '<div class="stat"><p class="sub">1. Beautiful</p><p class="body">The fullscreen view should be a center piece that reflects what&rsquo;s being played</p></div>' +
              '<div class="stat"><p class="sub">2. Useful</p><p class="body">The fullscreen view shouldn&rsquo;t limit functionality</p></div>' +
              '<div class="stat"><p class="sub">3. Understandable</p><p class="body">The fullscreen view shouldn&rsquo;t feel cluttered or overvearing</p></div>' +
            "</div>"
          )),
        pg("two",
          text(
            p("lead", "Sketching") +
            p("body", "Staying in ine with Spotify&rsquo;s brand and identity I explored different ways to make the fullscreen view more in line with my goals")
          ) + media(fig(A + "spotifyAssets/spotify_gif06.gif"))),
        pg("media", media(fig(A + "spotifyAssets/spotify_img06.png"))),
        pg("two",
          text(
            p("eyebrow", "Neutral View") +
            p("lead", "I landed on a view that would blend into the background of a gathering, added key functionality, and interesting information about the content being played")
          ) + media(fig(A + "spotifyAssets/spotify_img07.png"))),
        pg("two",
          text(
            p("eyebrow", "Modular View") +
            p("lead", "Borrowing from the main desktop applications use of modular cards that take up the left or right hand side of the screen, all necessary functinality is a click away, or a click to hide")
          ) + media(fig(A + "spotifyAssets/spotify_img08.png"), fig(A + "spotifyAssets/spotify_img09.png"))),
        pg("flip",
          media(fig(A + "spotifyAssets/spotify_img10.png")) +
          text(
            p("lead", "When there&rsquo;s nothing being played") +
            p("body", "To maintain functionality, teh fullscreen view allows for listeners to quickly browse their library, friend activity, or recommendations")
          )),
        pg("flip",
          media(fig(A + "spotifyAssets/spotify_gif07.gif")) +
          text(p("lead", "In Context"))),
      ],
    },

    // ---------------------------------------------------------------- Rubin (no content yet)
    rubin: {
      title: "Rubin",
      logoOnly: true, // the title stays for screen readers only
      bg: "#C9B5F0", // Rubin's light purple behind the card
      // no corner logo: the card is the logo (the mark from rubin_logo.svg, its wordmark below, then "Coming soon")
      pages: [
        pg("one", '<div class="rbPage"><img class="rbMark" src="' + H + 'rubin_mark.svg" alt=""><img class="rbWord" src="' + H + 'rubin_wordmark.svg" alt="Rubin"><p class="rbSoon">Coming soon</p></div>'),
      ],
    },

    // ---------------------------------------------------------------- Overhand (no content yet)
    overhand: {
      title: "Overhand",
      logo: H + "overhand_logo.svg",
      logoOnly: true,
      bg: "#FFDD55",
      accent: "#1B2430",
      pages: [
        pg("one", text(

          '<div class="ohHero">' + p("lead ohTitle", "Trade") + "</div>" +
          '<div class="ohPit" role="img" aria-label="Trade renders, business plans, subscriptions and ux flows for product, money, mentorship and ideas"></div>' +
          '<form class="earlyForm" novalidate><input class="earlyInput" type="email" pattern="[^@\\s]+@[^@\\s]+\\.[^@\\s]+" placeholder="Email address" autocomplete="email" aria-label="Email address">' +
          '<button type="submit" class="lockBtn earlyBtn" disabled>Get early access</button></form>'
        )),
      ],
    },

    // ---------------------------------------------------------------- Sketchbook
    sketchbook: {
      title: "Sketchbook",
      pages: [
        pg("gallery", '<div class="pgGallery justified">' + ["assets/sketches/sketch01.png", "assets/sketches/sketch04.png", "assets/sketches/sketch03.png", "assets/sketches/sketch02.png", "assets/sketches/sketch12.png", "assets/sketches/sketch05.png", "assets/sketches/sketch07.png", "assets/sketches/sketch06.png", "assets/sketches/sketch08.png", "assets/sketches/sketch09.png", "assets/sketches/sketch10.png", "assets/sketches/sketch11.png", "assets/sketches/sketch14.png", "assets/sketches/sketch13.png", "assets/sketches/sketch15.png", "assets/sketches/sketch16.jpg", "assets/sketches/sketch17.png"].map(function (src) { var d = SK[src.match(/sketch\d+/)[0]]; return "<img src=\"" + src + "\" width=\"" + d[0] + "\" height=\"" + d[1] + "\" alt=\"\" loading=\"lazy\" decoding=\"async\">"; }).join("") + "</div>"),
      ],
    },

    // ---------------------------------------------------------------- Micro + Motion
    micro: {
      title: "Micro + Motion",
      bg: "#DAEAFD",
      pages: [
        pg("gallery", '<div class="pgGallery"><div class="lottieBox" data-lottie="assets/micros/automationScan.json"></div><div class="lottieBox" data-lottie="assets/micros/emotionalStates.json"></div>' + ["assets/micros/heroAnim01.webp", "assets/micros/heroAnim02.webp", "assets/micros/heroAnim03.webp", "assets/micros/micro_gif01.webp", "assets/micros/micro_gif02.webp"].map(function (src) { return "<img src=\"" + src + "\" alt=\"\" loading=\"lazy\" decoding=\"async\">"; }).join("") + "</div>"),
      ],
    },
  };
})();
