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
  var H = "assets/homeAssets/";

  function pg(layout, html) { return { layout: layout, html: html }; }
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
        p("lead", "Currently building social music experiences at <a href=\"https://apps.apple.com/us/app/id378351144\" target=\"_blank\" rel=\"noopener\"><img class=\"ttPin\" src=\"assets/homeAssets/touchtunes_icon.png\" alt=\"\">TouchTunes</a> and making homemade jam.") +
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
      pages: [],
    },

    // ---------------------------------------------------------------- Nanni
    nanni: {
      title: "Nanni",
      bg: "#CBDCF1", // a pale wash of its logo blue, so the original blue logo and wordmark read on it
      logo: H + "nanni_app_icon.svg",
      wordmark: H + "nanni_wordmark.svg",
      pages: [
        pg("two",
          text(
            '<div class="facts">' + fact("Audience", "Over 25k monthly caregivers") + fact("Team", "Startup : pre-seed stage") + "</div>" +
            p("eyebrow", "About") +
            p("body", "Nanni is a mobile app that predicts why a newborn is crying, using a hyper-accurate algorithm, while also offering caregivers the abilty to create &amp; follow a healthy sleep schedule.") +
            p("body", "While the application was performing well, Nanni found through user metrics and interviews, that users were having issues performing tasks inside the application. It was also brought to Nanni&rsquo;s attention that they were being seen as an entertainment application, rather than the science backed healthcare application they originally positioned themselves as.") +
            p("body", "&ndash; I worked with Ubenwa to redesign the application with a focus on product clarity &amp; brand maturity.")
          ) + media(fig(A + "nanniAssets/nanni_image_01.png"))),
        pg("flip",
          media(fig(A + "nanniAssets/nanni_image_03.png")) +
          text(
            p("eyebrow", "Goals") +
            p("sub", "A. Organization") +
            p("body", "With the launch of new key features, and a growing base of users, the application had become cluttered and difficult to navigate. I would focus on organizing existing elements into a clearly defined hierarchy, while leaving room for new features coming down the road.") +
            p("sub", "B. Maturity") +
            p("body", "Nanni is backed by scientific research, and uses pediatric science to provide tools for caregivers. We wanted to make sure the application relfected this.") +
            p("sub", "C. Maintain the fun") +
            p("body", "While a redesign was inevitable, there was no need to remove the &quot;fun&quot; from the product. A balance needed to be struck between keeping the product fun for caregivers, while also clearly defining itself as a useful and usable tool.")
          )),
        pg("two",
          text(
            p("lead", "Navigation Menu") +
            p("body", "Listening to both the audience and the internal help team explain their confusion and problems with navigating the application, we found three repeated issues.") +
            p("quote", "&quot;I often miss a babies cry because it takes multiple taps to get to the recording screen.&quot;") +
            p("quote", "&quot;Routines is confusing. I forget where to go to see all my recordings.&quot;") +
            p("quote", "&quot;Users are not submitting feedback from the feedback screen, 90% of the time it&rsquo;s from the results screen.&quot;")
          ) + media(fig(A + "nanniAssets/nanni_image_10.png"))),
        pg("two",
          text(
            p("eyebrow", "The navigation menu went through several iterations, with intention to minimize actions, and prioritize recording a newborns cry.") +
            p("body", "&ndash; Feedback was moved to more pertinent locations across the experience, garnering more direct feedback from caregivers.") +
            p("body", "&ndash;Logs were renamed as Journal, found to be more of a human representation of the feature.") +
            p("body", "&ndash; Translation became a floating action button, allowing caregivers to have instant access across the application, and never miss a cry or journal entry.") +
            p("body", "&ndash; The navigation menu itself became a floating bar, that got out of the way when the user was interacting with content across the experience.")
          ) + media(fig(A + "nanniAssets/nanni_image_02.png"), fig(A + "nanniAssets/nanniGif_01.gif"))),
        pg("flip",
          media(fig(A + "nanniAssets/nanniGif_02.gif")) +
          text(
            p("lead", "An easy access translation flow") +
            p("body", "&ndash; With one tap, from anywhere in the application, Nanni&rsquo;s audience was able to record a cry.")
          )),
        pg("two",
          text(
            p("eyebrow", "Other feature changes") +
            p("sub", "Routines went through a transformation and became Journal, a home for all recorded cries.") +
            p("sub", "Split into two tabs, Journal matured into a space where caregivers could glean insights, and view their history.")
          ) + media(fig(A + "nanniAssets/nanni_image_04.png"))),
        pg("flip",
          media(fig(A + "nanniAssets/nanni_image_11.png")) +
          text(
            p("lead", "Journal : Insights") +
            p("body", "Caregiver&rsquo;s recorded cries generate insights, allowing them to further understand causes, trends and averages across their newborns data.")
          )),
        pg("two",
          text(
            p("lead", "Journal : History") +
            p("body", "A filterable history of all recorded cries or events. Visible by other caregivers for posterity and support.")
          ) + media(fig(A + "nanniAssets/nanni_image_06.png"), fig(A + "nanniAssets/nanni_image_07.png"), fig(A + "nanniAssets/nanni_image_08.png"))),
        pg("media", media(fig(A + "nanniAssets/nanni_image_09.png"))),
        pg("one",
          text(
            p("lead", "Results") +
            '<div class="stats">' + stat("12 million", "Downloads") + stat("4.7/5", "Stars rating") + stat("#62", "Health app worldwide") + "</div>"
          )),
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
          ) + media('<figure><div class="seedSprout" role="img" aria-label="A seed sprouting">' + "<svg class=\"sproutSvg\" viewBox=\"-2 -2 130 130\" aria-hidden=\"true\"><path class=\"sSeed\" d=\"M0.0 97.5 L0.0 101.2 L0.8 102.0 L2.6 105.4 L5.1 108.2 L8.4 111.4 L13.0 115.1 L19.2 118.9 L21.6 120.1 L25.5 121.7 L30.7 123.4 L39.1 125.2 L39.8 125.5 L40.1 125.9 L52.0 125.9 L52.3 125.5 L53.4 125.1 L59.3 123.9 L64.9 122.3 L68.7 120.8 L73.1 118.7 L76.9 116.5 L80.6 113.9 L84.9 110.3 L87.0 108.2 L89.3 105.5 L90.1 104.3 L91.1 101.9 L91.4 100.0 L91.3 98.0 L90.7 95.8 L89.7 94.0 L88.7 92.7 L84.6 88.5 L82.3 86.4 L78.9 83.8 L75.5 81.5 L70.5 78.9 L66.4 77.2 L62.5 75.9 L59.1 75.0 L55.0 74.2 L48.1 73.6 L41.7 73.7 L37.8 74.1 L34.4 74.7 L28.8 76.1 L22.4 78.5 L18.6 80.4 L15.2 82.4 L13.1 83.8 L9.0 87.0 L3.2 92.8 L1.6 95.1 L0.7 97.0 L0.2 97.5Z\"/><path class=\"sStem\" d=\"M73.3 36.0 L72.4 36.2 L71.6 36.8 L71.3 37.5 L71.2 38.4 L71.2 75.5 L71.4 76.8 L72.1 77.8 L74.7 79.3 L76.4 80.6 L77.1 80.9 L77.9 81.0 L78.6 80.5 L78.9 79.5 L78.9 57.6 L79.2 56.4 L80.7 53.9 L80.9 52.8 L80.9 37.9 L80.5 36.7 L79.6 36.1Z\"/><path class=\"sLeaf\" d=\"M122.9 2.8 L121.6 2.0 L119.5 1.2 L118.1 0.9 L115.4 0.8 L114.6 0.5 L114.3 0.2 L114.3 0.0 L109.6 0.0 L109.6 0.2 L109.3 0.5 L108.5 0.8 L106.6 0.8 L104.8 1.0 L102.6 1.8 L100.1 2.2 L96.5 3.4 L92.6 5.2 L88.9 7.2 L84.5 10.2 L81.9 12.6 L78.0 16.6 L77.2 17.1 L76.5 17.0 L76.1 16.5 L75.4 15.0 L74.6 14.5 L73.0 14.5 L72.3 14.8 L71.6 15.5 L71.3 16.3 L71.2 17.3 L71.3 37.4 L71.6 38.1 L72.0 38.5 L72.7 38.8 L79.0 38.9 L79.6 39.0 L80.6 39.7 L81.0 40.9 L81.0 51.9 L81.1 52.5 L81.7 53.4 L82.1 53.6 L83.5 53.6 L86.0 52.9 L88.2 52.5 L94.2 50.5 L100.0 47.7 L102.4 46.1 L103.4 45.6 L107.2 43.0 L109.1 41.3 L110.7 40.2 L112.1 39.0 L114.9 36.0 L117.4 32.6 L117.8 31.8 L119.3 29.7 L121.5 25.4 L122.1 23.5 L123.5 20.2 L123.9 18.0 L124.7 15.4 L125.1 12.2 L125.0 6.3 L124.3 4.4Z\"/></svg>" + "</div></figure>")),
        pg("flip",
          media(fig(A + "seedsAssets/seeds_image01_cut.png")) +
          text(
            p("eyebrow", "The goal") +
            p("lead", "To design and build an internal design system that would ameliorate developer hand offs and product iteration.")
          )),
        pg("media", media(fig(A + "seedsAssets/seeds_image02_cut.png"), fig(A + "seedsAssets/seeds_image03_cut.png"))),
        pg("media", media(fig(A + "seedsAssets/seeds_image04_cut.png"))),
      ],
    },

    // ---------------------------------------------------------------- Plunk
    plunk: {
      title: "Plunk®",
      logo: H + "plunk_logo_horizontal.svg",
      logoOnly: true,
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
      logo: H + "rubin_logo.svg",
      logoOnly: true,
      pages: [],
    },

    // ---------------------------------------------------------------- Happlycations (an empty skeleton on the old site)
    happlycations: {
      title: "Happlycations",
      bg: "#CFE6FA",
      pages: [],
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
          p("lead", "Trade anything for anything") +
          '<div class="ohTrade"><div class="ohStack"><span class="ohChip">renders</span><span class="ohChip">business plans</span><span class="ohChip">subscriptions</span><span class="ohChip">ux flows</span></div><span class="ohFor">for</span><div class="ohStack"><span class="ohChip">product</span><span class="ohChip">money</span><span class="ohChip">mentorship</span><span class="ohChip">ideas</span></div></div>' +
          '<form class="earlyForm" novalidate><input class="earlyInput" type="email" placeholder="Email address" autocomplete="email" aria-label="Email address">' +
          '<button type="submit" class="lockBtn earlyBtn">Get early access</button></form>'
        )),
      ],
    },

    // ---------------------------------------------------------------- Sketchbook
    sketchbook: {
      title: "Sketchbook",
      pages: [
        pg("gallery", '<div class="pgGallery">' + ["assets/sketches/sketch01.png", "assets/sketches/sketch04.png", "assets/sketches/sketch03.png", "assets/sketches/sketch02.png", "assets/sketches/sketch12.png", "assets/sketches/sketch05.png", "assets/sketches/sketch07.png", "assets/sketches/sketch06.png", "assets/sketches/sketch08.png", "assets/sketches/sketch09.png", "assets/sketches/sketch10.png", "assets/sketches/sketch11.png", "assets/sketches/sketch14.png", "assets/sketches/sketch13.png"].map(function (src) { return "<img src=\"" + src + "\" alt=\"\" loading=\"lazy\" decoding=\"async\">"; }).join("") + "</div>"),
      ],
    },

    // ---------------------------------------------------------------- Micro + Motion
    micro: {
      title: "Micro + Motion",
      bg: "#DAEAFD",
      pages: [
        pg("gallery", '<div class="pgGallery">' + ["assets/micros/heroAnim01.gif", "assets/micros/heroAnim02.gif", "assets/micros/heroAnim03.gif", "assets/micros/micro_gif01.gif", "assets/micros/micro_gif02.gif"].map(function (src) { return "<img src=\"" + src + "\" alt=\"\" loading=\"lazy\" decoding=\"async\">"; }).join("") + "</div>"),
      ],
    },
  };
})();
