$(document).ready(function () {
  if (!("ontouchstart" in window || navigator.maxTouchPoints)) {
    console.log("This is not a touch device");

    // CIRCLE FOLLOWS CURSOR FUNCTION//
    let mousePosX = 0,
      mousePosY = 0,
      mouseCircle = document.getElementById("mouse-circle");

    document.onmousemove = (e) => {
      mousePosX = e.clientX + 2;
      mousePosY = e.clientY + 8;
    };

    let delay = 6,
      revisedMousePosX = 0,
      revisedMousePosY = 0;

    function startMouseFollow() {
      requestAnimationFrame(startMouseFollow);

      // Include scroll offset
      let scrollOffsetY =
        window.pageYOffset || document.documentElement.scrollTop;

      revisedMousePosX += (mousePosX - revisedMousePosX) / delay;
      revisedMousePosY += (mousePosY - revisedMousePosY) / delay;

      mouseCircle.style.top = revisedMousePosY + scrollOffsetY + "px";
      mouseCircle.style.left = revisedMousePosX + "px";
    }

    // ON LOAD FUNC CALLS
    startMouseFollow();

    // GSAP ANIMATIONS
    // SNAPPING MOUSE CIRCLE TO LINK ELEMENTS
    $("a").hover(
      function () {
        // Get the position and width of the hovered link
        let linkPos = $(this).offset();
        let linkWidth = $(this).innerWidth() * 0.8;

        // Set revisedMousePosX and revisedMousePosY to the link's position
        revisedCirclePosX = linkPos.left + 20;
        revisedCirclePosY = linkPos.top;

        // Update the mouse circle position without considering link height
        updateMouseCirclePosition(true, linkWidth); // Pass true to indicate hover

        // Apply hover animations
        gsap.to("#mouse-circle", { duration: 0.32, scale: 2 });
        $(this).css("color", "blue");
        $(this).css("text-decoration", "underline");

        // Add a black border to the mouse circle
        mouseCircle.style.border = "0.5px solid #0A3D62";
      },
      function () {
        // Update the mouse circle position without considering link height
        updateMouseCirclePosition(false); // Pass false to indicate un-hover

        // Apply hover out animations
        gsap.to("#mouse-circle", { duration: 0.1, scale: 1 });
        $(this).css("color", "#0A3D62");
        $(this).css("text-decoration", "none");

        // Remove the black border on un-hover
        mouseCircle.style.border = "none";
      }
    );

    function updateMouseCirclePosition(isHover, linkWidth) {
      console.log(isHover);
      console.log(revisedCirclePosX);
      console.log(linkWidth);
      // Update the position of the mouse circle
      mouseCircle.style.top = revisedCirclePosY - 40; // Adjusted for better vertical alignment
      mouseCircle.style.left = revisedCirclePosX - linkWidth / 2; // Center the rectangle over the link

      // Set the width of the rectangle to the link's text width
      mouseCircle.style.width = isHover ? linkWidth + "px" : "";

      // Check if you should transition to a rectangle
      if (isHover) {
        // Adjust the height of the rectangle
        mouseCircle.style.height = "20px"; // Set the desired height
        mouseCircle.style.borderRadius = "10px"; // Set the desired border radius
      } else {
        // Reset to circle
        mouseCircle.style.height = ""; // Reset the height
        mouseCircle.style.borderRadius = "50%";
      }
    }
    // Rest of the code for non-touch devices
  } else {
    // Hide the mouse-circle if it's a touch device
    $("#mouse-circle").hide();
  }

  // Loop logo on hover
  let iconMenu = document.querySelector(".logoBox");
  let animationMenu = bodymovin.loadAnimation({
    container: iconMenu,
    renderer: "svg",
    loop: false,
    autoplay: false,
    path: "resources/lottiefiles/shopaAnimLight.json",
  });

  var directionMenu = 1;
  iconMenu.addEventListener("mouseenter", (e) => {
    animationMenu.setDirection(directionMenu);
    animationMenu.play();
  });

  iconMenu.addEventListener("mouseleave", (e) => {
    animationMenu.setDirection(-directionMenu);
    animationMenu.play();
  });

  $("#extraneousLinks a").hover(
    function () {
      gsap.to("#mouse-circle", { duration: 0.32, scale: 2 });
      $(this).css("color", "blue");
      $(this).css("text-decoration", "underline");
    },
    function () {
      gsap.to("#mouse-circle", { duration: 0.32, scale: 1 });
      $(this).css("color", "#0A3D62");
      $(this).css("text-decoration", "none");
    }
  );

  $("#logoBox").hover(
    function () {
      gsap.to("#mouse-circle", { duration: 0.32, scale: 2 });
    },
    function () {
      gsap.to("#mouse-circle", { duration: 0.32, scale: 1 });
    }
  );

  $(".previewButtonDark").hover(
    function () {
      gsap.to(this, { duration: 0.32, backgroundColor: "#041426" });
      gsap.to(this, { duration: 0.32, scale: 0.95 });
      gsap.to("#mouse-circle", { duration: 0.32, scale: 2 });
    },
    function () {
      gsap.to(this, { duration: 0.32, scale: 1 });
      gsap.to(this, { duration: 0.32, backgroundColor: "#003960" });
      gsap.to("#mouse-circle", { duration: 0.32, scale: 1 });
    }
  );

  $(".previewButtonLight").hover(
    function () {
      gsap.to(this, { duration: 0.32, backgroundColor: "#E2EBF1" });
      gsap.to(this, { duration: 0.32, scale: 0.95 });
      gsap.to("#mouse-circle", { duration: 0.32, scale: 2 });
    },
    function () {
      gsap.to(this, { duration: 0.32, scale: 1 });
      gsap.to(this, { duration: 0.32, backgroundColor: "#FFFFFF" });
      gsap.to("#mouse-circle", { duration: 0.32, scale: 1 });
    }
  );

  //MOBILE MENU ANIM AND LOGIC
  let mobileMenuExpanded = false; // Track the menu state

  let menuButtonAnim = bodymovin.loadAnimation({
    // Adjust these options based on your animation requirements
    container: document.getElementById("menuButtonAnim"),
    renderer: "svg",
    loop: false,
    autoplay: false,
    path: "animations/menuButtonAnim.json",
  });

  // Select the liveButton element
  var liveButton = $("#liveButton");

  // Create a GSAP timeline for the pulsating animation
  var pulseTimeline = gsap.timeline({ repeat: -1, yoyo: true });

  // Add a pulsating animation to the timeline
  pulseTimeline.to(liveButton, {
    scale: 0.2,
    duration: 0.5,
    ease: "power1.inOut",
  });

  $("#mobileMenuButton").click(function () {
    if (!mobileMenuExpanded) {
      menuButtonAnim.setDirection(1);
      menuButtonAnim.play();
      // Expand the menu
      gsap.to("#mobileMenuScreen", {
        duration: 0.62,

        display: "flex",
        bottom: 0,
        width: "460vw",
        height: "300vh",
        borderRadius: "100%",
      });
      gsap.to("#mobileMenuButton", {
        background: "#EBF1F5",
      });
      gsap.to("#mobileLinks", {
        duration: 0.3,
        ease: "elastic.out(2, 1.6)",
        gap: "24px",
        display: "flex",
      });
    } else {
      menuButtonAnim.setDirection(-1);
      menuButtonAnim.play();
      gsap.to("#mobileMenuScreen", {
        duration: 0.32,
        width: "1px",
        height: "1px",
        borderRadius: "100%",
        display: "none",
      });
      gsap.to("#mobileLinks", {
        duration: 0.24,
        ease: "elastic.in(0.5, 0.5)",
        gap: "-24px",
        display: "none",
      });
      gsap.to("#mobileMenuButton", {
        background: "white",
      });
    }

    mobileMenuExpanded = !mobileMenuExpanded;
  });
});

// Refresh page on logo click

function etRefresh() {
  window.location.reload();
}

//JUMP FUNCTIONS
function etGoHome() {
  window.location.href = "./index.html";
}

function etGoPollin() {
  window.location.href = "https://pollin-client-5gdey.kinsta.app/";
}

function etGoAcotil() {
  window.location.href = "shopa.acotil.images.html";
}

function openAcotilTab() {
  window.open("https://acollectionofthingsilike.com", "_blank");
}

function etGoPlunk() {
  window.location.href = "plunk.html";
}

function etGoPollinDoc() {
  window.location.href = "pollinDoc.html";
}

function etGoSpotify() {
  window.location.href = "spotifyFullscreen.html";
}

function etGoHabbotDoc() {
  window.location.href = "habbot.html";
}

function etGoHabbotBeta() {
  window.location.href = "https://testflight.apple.com/join/pagCNvNc";
}

function etGoWork() {
  window.location.href = "work.html";
}
