// ARCHIVED: Habbot's in-page project view (7 pages), exactly as it was before the view was cleared.
// Not loaded by the site. To bring it back: paste the `habbot: { ... }` entry below over the habbot entry
// in js/projects.js (the helpers it uses, pg / text / media / fig / fact / p, are already defined there).
// Page images live in assets/projectAssets/habbotAssets/.
//
// Helpers it relies on, for reference:
//   var A = "assets/projectAssets/";
//   var H = "assets/homeAssets/";
//
//   function pg(layout, html) { return { layout: layout, html: html }; }
//   function text(html) { return '<div class="pgText">' + html + "</div>"; }
//   function media() { return '<div class="pgMedia">' + Array.prototype.join.call(arguments, "") + "</div>"; }
//   function fig(src, caption) {
//     return "<figure><img src=\"" + src + "\" alt=\"\" loading=\"lazy\" decoding=\"async\">" +
//       (caption ? "<figcaption>" + caption + "</figcaption>" : "") + "</figure>";
//   }
//   function fact(label, value) { return '<div class="fact"><p class="eyebrow">' + label + '</p><p class="sub">' + value + "</p></div>"; }
//   function stat(value, label) { return '<div class="stat"><p class="big">' + value + '</p><p class="eyebrow">' + label + "</p></div>"; }
//   function p(cls, html) { return '<p class="' + cls + '">' + html + "</p>"; }

    habbot: {
      title: "Habbot",
      logo: H + "habbot_projectImage.svg",
      icon: H + "habbot_icon.svg",
      logoOnly: true,
      accent: "#FA983A", // the orange of its underline: dots, eyebrow markers, the active page dot
      pages: [
        pg("two",
          text(
            '<div class="facts">' + fact("Built in", "a Remote Cabin in Wyoming") + fact("Built using", "Paper &amp; Pen + Figma + SwiftUI") + "</div>"
          ) + media(fig(A + "habbotAssets/habbot_img01.png"))),
        pg("two",
          text(
            p("eyebrow", "Introduction") +
            p("body", "Throughout a roadtrip from Seattle to Mexico to New York I would keep track of my meditation with two dots drawn in my journal.") +
            p("body", "The distance between the dots represented the length of the meditation, with quick notes before and after each meditation.") +
            p("body", "While living in a remote Wyoming cabin, I digitized this process into an iOS application.")
          ) + media(fig(A + "habbotAssets/habbot_gif02.gif"))),
        pg("flip",
          media(fig(A + "habbotAssets/habbot_img02.png")) +
          text(p("lead", "How to habbot"))),
        pg("two",
          text(
            p("lead", "Simple + Visual components") +
            p("body", "Habbot uses abstract and visual elements to keep as much parity with my journaling as possible")
          ) + media(fig(A + "habbotAssets/habbot_img05.png"))),
        pg("flip",
          media(fig(A + "habbotAssets/habbot_gif01.gif")) +
          text(p("lead", "Maintaining a physical feeling through weighty animations"))),
        pg("two",
          text(p("lead", "Habbots are customizable + searchable")) +
          media(fig(A + "habbotAssets/habbot_img04.png"))),
        pg("flip",
          media(fig(A + "habbotAssets/habbot_img03.png")) +
          text(
            p("lead", "Colours + Identity") +
            p("body", "Off-white and off-black were used as the main colours, maintaining the feel of writing with ink on paper.") +
            p("body", "Orange is used sparingly as a highlighter would be used in a journal, denoting important things.") +
            p("body", "The habbots themselves were contrained to three colours, intending to make each habbot feel purposeful.")
          )),
      ],
    },
