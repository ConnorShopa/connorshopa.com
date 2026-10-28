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
  function fact(label, value) { return '<div class="fact"><p class="eyebrow">' + label + '</p><p class="sub">' + value + "</p></div>"; }
  function stat(value, label) { return '<div class="stat"><p class="big">' + value + '</p><p class="eyebrow">' + label + "</p></div>"; }
  function p(cls, html) { return '<p class="' + cls + '">' + html + "</p>"; }

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
      logo: H + "seeds_projectImage.svg",
      pages: [
        pg("two",
          text(
            p("lead", ": a Style &amp; Design System for Plunk") +
            '<div class="facts">' + fact("Built for", "A small team of engineers, designers, marketers &amp; good folk") + fact("Methodology", "Atomic Design System") + "</div>"
          ) + media(fig(A + "seedsAssets/seeds_image00.png"))),
        pg("flip",
          media(fig(A + "seedsAssets/seeds_image01.png")) +
          text(
            p("eyebrow", "The goal") +
            p("lead", "To design and build an internal design system that would ameliorate developer hand offs and product iteration.")
          )),
        pg("media", media(fig(A + "seedsAssets/seeds_image02.png"), fig(A + "seedsAssets/seeds_image03.png"))),
        pg("media", media(fig(A + "seedsAssets/seeds_image04.png"))),
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
      logo: H + "habbot_projectImage.svg",
      icon: H + "habbot_icon.svg",
      logoOnly: true,
      accent: "#FA983A", // the orange of its underline: dots, eyebrow markers, the active page dot
      bg: "#FFFAF6",     // the paper from the app: the card's background (its link in index.html carries the same colour in data-bubble)
      // a fresh start (the previous 7 pages are saved in archive/habbot-view.js): a cover in the manner of the
      // illustration-book reference (a square of green, the name set big beneath it), then the app screens
      pages: [
        pg("cover",
          '<div class="coverWrap"><div class="coverSquare" style="background:#3E8C69"></div><p class="coverTitle">HABBOT</p></div>'),
        pg("media",
          media(fig(A + "habbotAssets/app_screen01.png") + fig(A + "habbotAssets/app_screen02.png") + fig(A + "habbotAssets/app_screen03.png"))),
        pg("media",
          media(fig(A + "habbotAssets/app_screen04.png") + fig(A + "habbotAssets/app_screen05.png") + fig(A + "habbotAssets/app_screen06.png"))),
      ],
    },

    // ---------------------------------------------------------------- Spotify dreams
    spotify: {
      title: "Spotify dreams",
      logo: H + "spotifyDreams_projectImage.svg",
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
      pages: [],
    },

    // ---------------------------------------------------------------- Overhand (no content yet)
    overhand: {
      title: "Overhand",
      logo: H + "overhand_logo.svg",
      logoOnly: true,
      pages: [],
    },

    // ---------------------------------------------------------------- Sketchbook
    sketchbook: {
      title: "Sketchbook",
      pages: [
        pg("two",
          text(p("lead", "A collection of sketches, ideas and other musings")) +
          media(fig("assets/sketches/sketch01.png"), fig("assets/sketches/sketch04.png"))),
        pg("media", media(fig("assets/sketches/sketch03.png"), fig("assets/sketches/sketch02.png"), fig("assets/sketches/sketch12.png"))),
        pg("media", media(fig("assets/sketches/sketch05.png"), fig("assets/sketches/sketch07.png"), fig("assets/sketches/sketch06.png"))),
        pg("media", media(fig("assets/sketches/sketch08.png"), fig("assets/sketches/sketch09.png"), fig("assets/sketches/sketch10.png"))),
        pg("media", media(fig("assets/sketches/sketch11.png"), fig("assets/sketches/sketch14.png"), fig("assets/sketches/sketch13.png"))),
      ],
    },

    // ---------------------------------------------------------------- Micro + Motion
    micro: {
      title: "Micro + Motion",
      pages: [
        pg("two",
          text(p("lead", "Micro Interactions + Motion Design")) +
          media(fig("assets/micros/heroAnim01.gif"), fig("assets/micros/heroAnim02.gif"), fig("assets/micros/heroAnim03.gif", "Hero animation set for AltQ"))),
        pg("media", media(fig("assets/micros/micro_gif01.gif", "Lead generation interaction for Realty Candy + Plunk"))),
        pg("media", media(fig("assets/micros/micro_gif02.gif", "Wizard flow intearction handoff to Plunk developers"))),
      ],
    },
  };
})();
