/* Nanni's navigation menu, built from components and animated with GSAP.
   The progression (the same story as the old gif):
     s1  a full-width bar: Translate · Routines · Feedback · Logs · Fun zone
     s2  Feedback is moved out of the menu
     s3  Logs is renamed Journal
     s4  Translate leaves the bar and becomes a floating button
     s5  ...which settles at the top right
     s6  the bar becomes a floating pill
     s7  Journal is the active tab
   NanniNav.mount(el, { loop: true }) fills `el` (give it class "nnNav") and returns { tl, goto(n), play(), pause(), destroy() }.
   With prefers-reduced-motion it shows the last state and doesn't move. It pauses while it is off screen. */
(function () {
  var ICONS = {
    translate: "<svg class=\"nnIcon\" style=\"width:7.40cqw;height:7.40cqw\" aria-hidden=\"true\" viewBox=\"0 0 27 27\" fill=\"none\"><use href=\"#t0__U__\" style=\"fill:var(--nn-purple)\"/><mask id=\"t1__U__\" fill=\"white\"><use href=\"#t0__U__\"/></mask><path d=\"M25.7105 13.026L24.1508 21.3845C23.6854 23.8784 21.5088 25.6864 18.9719 25.6864H7.81105C5.34502 25.6864 3.20895 23.9758 2.67009 21.5693L0.781251 13.1341C0.309596 11.0278 1.1705 8.84685 2.95371 7.63061L10.2022 2.68678C11.9928 1.46551 14.3486 1.46551 16.1392 2.68678L23.5001 7.70731C25.2266 8.88488 26.0939 10.9716 25.7105 13.026Z\" stroke-width=\"2.63414\" style=\"stroke:var(--nn-purple)\" mask=\"url(#t1__U__)\"/><mask id=\"t2__U__\" fill=\"white\"><path d=\"M12.418 20.8261V21.7739C12.418 22.1896 12.755 22.5266 13.1706 22.5266C13.5863 22.5266 13.9232 22.1896 13.9232 21.7739V20.8261C15.2278 20.6349 16.3065 19.9997 17.1595 18.9207C17.8601 18.0344 18.273 17.0282 18.3981 15.9022C18.444 15.4891 18.1019 15.151 17.6863 15.151C17.2706 15.151 16.9414 15.4902 16.8764 15.9007C16.7472 16.7168 16.3994 17.4332 15.833 18.05C15.0992 18.849 14.2117 19.2485 13.1706 19.2485C12.1295 19.2485 11.2421 18.849 10.5083 18.05C9.94186 17.4332 9.59406 16.7168 9.46485 15.9007C9.39985 15.4902 9.07061 15.151 8.65495 15.151C8.2393 15.151 7.89723 15.4891 7.94313 15.9022C8.06823 17.0282 8.48112 18.0344 9.18178 18.9207C10.0347 19.9997 11.1135 20.6349 12.418 20.8261Z\" fill-rule=\"evenodd\" clip-rule=\"evenodd\"/><path d=\"M13.1706 17.6095C12.5434 17.6095 12.0103 17.3705 11.5713 16.8924C11.1323 16.4144 10.9128 15.8339 10.9128 15.151V10.2339C10.9128 9.55099 11.1323 8.97051 11.5713 8.49246C12.0103 8.01441 12.5434 7.77539 13.1706 7.77539C13.7978 7.77539 14.3309 8.01441 14.7699 8.49246C15.2089 8.97051 15.4285 9.55099 15.4285 10.2339V15.151C15.4285 15.8339 15.2089 16.4144 14.7699 16.8924C14.3309 17.3705 13.7978 17.6095 13.1706 17.6095Z\"/></mask><path d=\"M13.1706 17.6095C12.5434 17.6095 12.0103 17.3705 11.5713 16.8924C11.1323 16.4144 10.9128 15.8339 10.9128 15.151V10.2339C10.9128 9.55099 11.1323 8.97051 11.5713 8.49246C12.0103 8.01441 12.5434 7.77539 13.1706 7.77539C13.7978 7.77539 14.3309 8.01441 14.7699 8.49246C15.2089 8.97051 15.4285 9.55099 15.4285 10.2339V15.151C15.4285 15.8339 15.2089 16.4144 14.7699 16.8924C14.3309 17.3705 13.7978 17.6095 13.1706 17.6095ZM12.418 20.8261V21.774C12.418 22.1896 12.755 22.5266 13.1706 22.5266C13.5863 22.5266 13.9232 22.1896 13.9232 21.7739V20.8261C15.2278 20.6349 16.3065 19.9997 17.1595 18.9207C17.8601 18.0344 18.273 17.0282 18.3981 15.9022C18.444 15.4891 18.1019 15.151 17.6863 15.151C17.2706 15.151 16.9414 15.4902 16.8764 15.9007C16.7472 16.7168 16.3994 17.4332 15.833 18.05C15.0992 18.849 14.2117 19.2485 13.1706 19.2485C12.1295 19.2485 11.2421 18.849 10.5083 18.05C9.94186 17.4332 9.59406 16.7168 9.46485 15.9007C9.39985 15.4902 9.07061 15.151 8.65495 15.151C8.2393 15.151 7.89723 15.4891 7.94313 15.9022C8.06823 17.0282 8.48112 18.0344 9.18178 18.9207C10.0347 19.9997 11.1135 20.6349 12.418 20.8261Z\" stroke-width=\"3.3717\" style=\"stroke:var(--nn-band)\" mask=\"url(#t2__U__)\"/><defs><path id=\"t0__U__\" d=\"M24.1508 21.3845L25.7105 13.026C26.0939 10.9716 25.2266 8.88488 23.5001 7.70731L16.1392 2.68678C14.3486 1.46551 11.9928 1.46551 10.2022 2.68678L2.95371 7.63061C1.1705 8.84685 0.309596 11.0278 0.781251 13.1341L2.67009 21.5693C3.20895 23.9758 5.34502 25.6864 7.81105 25.6864H18.9719C21.5088 25.6864 23.6854 23.8784 24.1508 21.3845Z\"/></defs></svg>",
    routines: "<svg class=\"nnIcon\" style=\"width:6.30cqw;height:7.67cqw\" aria-hidden=\"true\" viewBox=\"0 0 23 28\" fill=\"none\"><path d=\"M9.40763 1.88153C9.40763 0.842389 10.25 0 11.2892 0C12.3283 0 13.1707 0.842388 13.1707 1.88153V24.4598C13.1707 25.499 12.3283 26.3414 11.2892 26.3414C10.25 26.3414 9.40763 25.499 9.40763 24.4598V1.88153Z\" fill=\"currentColor\"/><path d=\"M0 14.1115C0 13.0723 0.842388 12.2299 1.88153 12.2299C2.92066 12.2299 3.76305 13.0723 3.76305 14.1115V17.8745C3.76305 18.9136 2.92066 19.756 1.88153 19.756C0.842388 19.756 0 18.9136 0 17.8745V14.1115Z\" fill=\"currentColor\"/><path d=\"M18.8153 8.46687C18.8153 7.42773 19.6577 6.58534 20.6968 6.58534C21.7359 6.58534 22.5783 7.42773 22.5783 8.46687V12.2299C22.5783 13.2691 21.7359 14.1115 20.6968 14.1115C19.6577 14.1115 18.8153 13.2691 18.8153 12.2299V8.46687Z\" fill=\"currentColor\"/></svg>",
    feedback: "<svg class=\"nnIcon\" style=\"width:7.40cqw;height:7.40cqw\" aria-hidden=\"true\" viewBox=\"0 0 27 27\" fill=\"none\"><path d=\"M20.2393 1.18535C20.0418 1.04267 19.7783 1.0756 19.6357 1.27316C19.054 2.0634 18.4064 2.94145 17.7918 3.77559L17.0893 4.71949C16.9466 4.91705 16.9905 5.19144 17.1771 5.33412L18.0552 5.99265C18.2527 6.13534 18.5271 6.09143 18.6698 5.90485L19.3722 4.96095C19.9869 4.12681 20.6454 3.24876 21.2271 2.45852C21.3698 2.26096 21.3259 1.99755 21.1283 1.85486L20.2393 1.2073V1.18535Z\" fill=\"currentColor\"/><path d=\"M25.3529 8.76837L21.2519 9.99483C21.0196 10.0643 20.8876 10.3089 20.957 10.5412L21.2715 11.5928C21.341 11.8251 21.5856 11.9571 21.8179 11.8876L25.9189 10.6611C26.1512 10.5917 26.2832 10.347 26.2137 10.1147L25.8993 9.06319C25.8298 8.83089 25.5852 8.6989 25.3529 8.76837Z\" fill=\"currentColor\"/><path d=\"M21.3588 17.0012L20.9747 18.0329C20.8869 18.2633 20.9966 18.5048 21.2271 18.5926C22.16 18.9438 23.1917 19.317 24.1795 19.6792L25.2661 20.0743C25.4966 20.1621 25.7381 20.0414 25.8259 19.8109L26.21 18.7792C26.2978 18.5487 26.1771 18.3072 25.9466 18.2194L24.86 17.8243C23.8832 17.4621 22.8515 17.089 21.9186 16.7377C21.6881 16.6499 21.4466 16.7707 21.3698 17.0012H21.3588Z\" fill=\"currentColor\"/><path d=\"M14.4113 4.69754C14.2686 4.21461 13.8515 3.87437 13.3576 3.81949C13.3137 3.81949 13.2698 3.81949 13.2259 3.81949C12.7759 3.81949 12.3589 4.06095 12.1503 4.46705L11.0198 6.56338C9.96618 8.51704 8.61618 9.95484 6.66253 10.8109L5.96009 11.0195L5.76253 11.0743L1.78938 12.2597C1.78938 12.2597 0.966207 12.5121 0.768647 12.6658C0.0881614 13.2256 -0.186228 14.2573 0.132064 15.3329L1.2406 19.0426C1.55889 20.1072 2.16254 20.9194 3.2162 20.9194H3.22718C3.60034 20.8975 5.65278 20.3158 6.00399 20.195L7.51862 25.2438C7.6174 25.5841 7.9357 25.8145 8.27594 25.8145C8.35277 25.8145 8.4296 25.8145 8.50643 25.7816L10.0211 25.3316C10.4381 25.2109 10.6686 24.7719 10.5479 24.3548L9.03325 19.295C9.52715 19.2182 10.0101 19.1853 10.504 19.1853C12.1064 19.1853 13.6869 19.5694 15.1247 20.3487L17.232 21.5121C17.4186 21.6109 17.6161 21.6658 17.8137 21.6658C18.0881 21.6658 18.3625 21.567 18.593 21.3914C18.9771 21.0731 19.1418 20.5572 18.9991 20.0743L14.4113 4.69754ZM16.1784 18.406C14.4552 17.4731 12.4906 16.9792 10.515 16.9792C9.92227 16.9792 9.32959 16.9573 8.72594 17.1109L6.30034 17.7694L5.27961 18.1207C5.03815 18.2085 4.03937 18.4829 3.42474 18.6365C3.40278 18.5707 3.36986 18.5048 3.34791 18.406L2.23937 14.6963C2.20645 14.5865 2.19547 14.4987 2.19547 14.4219C2.2723 14.3999 2.34913 14.367 2.41498 14.356L6.38814 13.1707L6.5857 13.1158L7.28814 12.9073L7.41984 12.8634L7.54058 12.8085C9.82349 11.8097 11.5906 10.0975 12.9406 7.59509L12.9735 7.54021L16.2332 18.428L16.1784 18.3951V18.406Z\" fill=\"currentColor\"/><path d=\"M16.7162 8.93411L18.604 15.256C19.2405 14.2243 19.4491 12.9292 19.0759 11.678C18.7027 10.4268 17.8137 9.44996 16.7052 8.93411H16.7162Z\" fill=\"currentColor\"/></svg>",
    logs: "<svg class=\"nnIcon\" style=\"width:7.40cqw;height:7.40cqw\" aria-hidden=\"true\" viewBox=\"0 0 27 27\" fill=\"none\"><path class=\"pen\" d=\"M18.6587 3.29304C18.9469 3.00477 19.2892 2.7761 19.6658 2.62009C20.0424 2.46409 20.4461 2.38379 20.8538 2.38379C21.2615 2.38379 21.6651 2.46409 22.0418 2.62009C22.4184 2.7761 22.7606 3.00477 23.0489 3.29304C23.3372 3.5813 23.5658 3.92352 23.7218 4.30016C23.8779 4.6768 23.9581 5.08048 23.9581 5.48815C23.9581 5.89582 23.8779 6.2995 23.7218 6.67614C23.5658 7.05278 23.3372 7.395 23.0489 7.68326L8.23188 22.5003L2.19531 24.1466L3.84165 18.1101L18.6587 3.29304Z\" stroke-width=\"2.19511\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke=\"currentColor\"/></svg>",
    fun: "<svg class=\"nnIcon\" style=\"width:7.67cqw;height:5.75cqw\" aria-hidden=\"true\" viewBox=\"0 0 28 21\" fill=\"none\"><mask id=\"h__U__\" maskUnits=\"userSpaceOnUse\" x=\"-1\" y=\"0\" width=\"30\" height=\"21\" fill=\"black\"><rect fill=\"white\" x=\"-1\" width=\"30\" height=\"21\"/><path d=\"M8.28577 2.41224C7.72696 2.97105 7.69603 3.57509 8.19371 4.20773C8.48866 4.58278 8.71623 4.67859 9.31097 4.67752C9.98848 4.67645 12.4602 4.16572 13.2307 3.86773C13.5176 3.75671 13.5435 3.91867 13.5435 5.8216V5.93011C13.5435 6.22629 13.7836 6.46639 14.0798 6.46639C14.376 6.46639 14.6161 6.22629 14.6161 5.93011V5.82875C14.6161 3.94102 14.6435 3.76941 14.9289 3.85915C16.1497 4.24277 18.1822 4.67877 18.7493 4.67877C19.5896 4.67877 20.1577 4.13694 20.1577 3.33555C20.1577 2.58439 19.5231 1.99644 18.7162 2.00002C18.1535 2.00252 16.2117 2.43423 14.6263 2.9092C14.0848 3.07152 13.7271 3.02772 12.3775 2.63427C11.4949 2.37685 10.3172 2.11746 9.76056 2.05794C8.83653 1.95908 8.708 1.99001 8.28577 2.41224Z\" fill-rule=\"evenodd\" clip-rule=\"evenodd\"/><path d=\"M9.07567 16.9735C8.91035 17.8303 9.57448 18.5998 10.4471 18.5998H17.5645C18.4407 18.5998 19.1057 17.8244 18.9344 16.9652C18.2961 13.7645 16.6301 6.98021 13.9745 6.98021C11.3165 6.98021 9.69259 13.7764 9.07567 16.9735Z\" fill-rule=\"evenodd\" clip-rule=\"evenodd\"/><path d=\"M17.3239 7.44001C20.5346 8.2802 23.4581 10.6245 24.7935 13.4296C25.4944 14.9017 25.7711 15.8565 25.9946 17.5721C26.0537 18.121 25.6235 18.6 25.0714 18.6H23.2529C22.5483 18.6 21.9487 18.0868 21.8399 17.3906L21.7985 17.1252C21.0759 13.0639 19.1313 9.61108 16.6199 7.92964C15.3453 7.07641 15.5064 6.96433 17.3239 7.44001Z\" fill-rule=\"evenodd\" clip-rule=\"evenodd\"/><path d=\"M10.6761 7.44001C7.46538 8.2802 4.5419 10.6245 3.20654 13.4296C2.50561 14.9017 2.22889 15.8565 2.00544 17.5721C1.94634 18.121 2.37648 18.6 2.92861 18.6H4.7471C5.45168 18.6 6.05129 18.0868 6.16005 17.3906L6.20153 17.1252C6.92409 13.0639 8.86866 9.61108 11.3801 7.92964C12.6547 7.07641 12.4936 6.96433 10.6761 7.44001Z\" fill-rule=\"evenodd\" clip-rule=\"evenodd\"/></mask><path d=\"M8.28577 2.41224C7.72696 2.97105 7.69603 3.57509 8.19371 4.20773C8.48866 4.58278 8.71623 4.67859 9.31097 4.67752C9.98848 4.67645 12.4602 4.16572 13.2307 3.86773C13.5176 3.75671 13.5435 3.91867 13.5435 5.8216V5.93011C13.5435 6.22629 13.7836 6.46639 14.0798 6.46639C14.376 6.46639 14.6161 6.22629 14.6161 5.93011V5.82875C14.6161 3.94102 14.6435 3.76941 14.9289 3.85915C16.1497 4.24277 18.1822 4.67877 18.7493 4.67877C19.5896 4.67877 20.1577 4.13694 20.1577 3.33555C20.1577 2.58439 19.5231 1.99644 18.7162 2.00002C18.1535 2.00252 16.2117 2.43423 14.6263 2.9092C14.0848 3.07152 13.7271 3.02772 12.3775 2.63427C11.4949 2.37685 10.3172 2.11746 9.76056 2.05794C8.83653 1.95908 8.708 1.99001 8.28577 2.41224ZM13.9745 6.98021C16.6301 6.98021 18.2961 13.7645 18.9344 16.9652C19.1057 17.8244 18.4407 18.5998 17.5645 18.5998H10.4471C9.57448 18.5998 8.91035 17.8303 9.07567 16.9735C9.69259 13.7764 11.3165 6.98021 13.9745 6.98021ZM17.3239 7.44001C20.5346 8.2802 23.4581 10.6245 24.7935 13.4296C25.4944 14.9017 25.7711 15.8565 25.9946 17.5721C26.0537 18.121 25.6235 18.6 25.0714 18.6H23.2529C22.5483 18.6 21.9487 18.0868 21.8399 17.3906L21.7985 17.1252C21.0759 13.0639 19.1313 9.61108 16.6199 7.92964C15.3453 7.07641 15.5064 6.96433 17.3239 7.44001ZM10.6761 7.44001C7.46538 8.2802 4.5419 10.6245 3.20654 13.4296C2.50561 14.9017 2.22889 15.8565 2.00544 17.5721C1.94634 18.121 2.37648 18.6 2.92861 18.6H4.7471C5.45168 18.6 6.05129 18.0868 6.16005 17.3906L6.20153 17.1252C6.92409 13.0639 8.86866 9.61108 11.3801 7.92964C12.6547 7.07641 12.4936 6.96433 10.6761 7.44001Z\" stroke-width=\"4\" stroke=\"currentColor\" mask=\"url(#h__U__)\"/></svg>"
  };
  var MIC = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9.2" y="3" width="5.6" height="10" rx="2.8"/><path d="M6.4 11.2a5.6 5.6 0 0 0 11.2 0M12 16.8V20"/></svg>';
  var TABS = [
    { id: "translate", label: "Translate" },
    { id: "routines", label: "Routines" },
    { id: "feedback", label: "Feedback" },
    { id: "logs", label: "Logs", then: "Journal" },
    { id: "fun", label: "Fun zone" }
  ];

  var uid = 0;
  function markup() {
    var u = ++uid;
    var tabs = TABS.map(function (t) {
      return '<div class="nnTab" data-id="' + t.id + '"><span class="nnIco">' + ICONS[t.id].split('__U__').join(u) + '</span>' +
        '<span class="nnLbl"><span class="a">' + t.label + "</span>" + (t.then ? '<span class="b">' + t.then + "</span>" : "") + "</span></div>";
    }).join("");
    // the button is first, so it sits behind the bar and rises out from under it
    return '<div class="nnPhone"><div class="nnFab">' + MIC + '</div><div class="nnBand"></div><div class="nnPill"></div>' +
      '<div class="nnTabs"><i class="nnSp l"></i>' + tabs + '<i class="nnSp r"></i></div></div>';
  }

  function mount(root, opts) {
    opts = opts || {};
    var gsap = window.gsap;
    root.classList.add("nnNav");
    root.innerHTML = markup();
    root.setAttribute("role", "img");
    root.setAttribute("aria-label", "Nanni's navigation menu, from five tabs to a floating bar with a translate button");
    var q = function (s) { return root.querySelector(s); };
    var tab = {}; TABS.forEach(function (t) { tab[t.id] = q('.nnTab[data-id="' + t.id + '"]'); });
    var band = q(".nnBand"), pill = q(".nnPill"), fab = q(".nnFab"), spL = q(".nnSp.l"), spR = q(".nnSp.r");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var api = { tl: null, goto: function () {}, play: function () {}, pause: function () {}, destroy: function () {} };
    if (!gsap) return api;

    // the button starts tucked behind the bar, straight under where it ends up, and pops straight up out of it
    gsap.set(fab, { autoAlpha: 0, scale: 0.6, xPercent: 0, yPercent: 230 });
    gsap.set(pill, { autoAlpha: 0, scaleX: 0.92, scaleY: 0.5, transformOrigin: "50% 100%" });
    gsap.set(root.querySelectorAll(".nnLbl .b"), { yPercent: 100 });

    var tl = gsap.timeline({ paused: true, repeat: opts.loop === false ? 0 : -1, defaults: { ease: "power3.inOut" } });
    var T = {};
    function at(name, time) { T[name] = time; tl.addLabel(name, time); return time; }

    tl.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power1.out" }, 0);

    // s2: Feedback goes; the other four share the width
    at("s2", 1.5);
    tl.to(tab.feedback, { flexGrow: 0, opacity: 0, scale: 0.7, duration: 0.7 }, "s2");

    // s3: Logs rolls over into Journal
    at("s3", 2.8);
    var logs = tab.logs.querySelectorAll(".nnLbl span");
    tl.to(logs[0], { yPercent: -100, opacity: 0, duration: 0.42, ease: "power2.in" }, "s3")
      .to(logs[1], { yPercent: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, "s3+=0.14");

    // s4: Translate leaves the bar; the floating button pops straight up from behind the bar; the three tabs left sit together in the middle
    at("s4", 4.1);
    tl.to(tab.translate, { flexGrow: 0, opacity: 0, scale: 0.6, duration: 0.6 }, "s4")
      .to([spL, spR], { flexGrow: 1, duration: 0.6 }, "s4")
      .to(fab, { autoAlpha: 1, duration: 0.18, ease: "none" }, "s4+=0.18")
      .to(fab, { yPercent: 0, scale: 1, duration: 0.85, ease: "back.out(1.4)" }, "s4+=0.18");

    // s6: the band becomes a floating pill, and the tabs spread out across it
    at("s6", 6.0);
    tl.to(band, { opacity: 0, yPercent: 30, duration: 0.6 }, "s6")
      .to(pill, { autoAlpha: 1, scaleX: 1, scaleY: 1, duration: 0.75, ease: "power3.out" }, "s6+=0.1")
      .to([spL, spR], { flexGrow: 0.25, duration: 0.75 }, "s6+=0.05");

    // s7: Journal is the active tab: darker, heavier, and its pencil fills in
    at("s7", 7.4);
    var journal = tab.logs;
    tl.to(journal, { color: "#001224", duration: 0.45, ease: "power2.out" }, "s7")
      .to(journal.querySelector(".nnLbl"), { fontWeight: 700, duration: 0.45, ease: "power2.out" }, "s7")
      .to(journal.querySelector(".pen"), { fill: "rgba(0,18,36,1)", duration: 0.45, ease: "power2.out" }, "s7")
      .fromTo(journal.querySelector(".nnIcon"), { scale: 0.8 }, { scale: 1, duration: 0.55, ease: "back.out(2.2)" }, "s7");

    at("final", 8.1);
    tl.to({}, { duration: 1.6 }, "final");               // hold the finished bar
    tl.to(root, { opacity: 0, duration: 0.4, ease: "power1.in" }, "final+=1.6"); // then fade out and begin again

    tl.addLabel("s1", 0.45);

    var inView = true, io = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(function (es) {
        inView = es[0].isIntersecting;
        if (reduce || api._manual) return;
        inView ? tl.play() : tl.pause();
      });
      io.observe(root);
    }

    if (reduce) tl.seek("final").pause();
    else tl.play(0);

    api.tl = tl;
    // where each of the seven steps has finished moving (seconds on the timeline), for goto(1..7)
    var STEP_END = [1.2, 2.6, 3.9, 4.6, 5.7, 7.2, 8.2];
    api.goto = function (n) { api._manual = true; tl.pause(STEP_END[Math.max(1, Math.min(7, n)) - 1]); };
    api.play = function () { api._manual = false; tl.play(); };
    api.pause = function () { api._manual = true; tl.pause(); };
    api.destroy = function () { if (io) io.disconnect(); tl.kill(); root.innerHTML = ""; };
    return api;
  }

  window.NanniNav = { mount: mount };
})();
