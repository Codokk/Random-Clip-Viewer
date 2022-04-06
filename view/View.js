let PV = document.getElementById("PrimaryVideo");
      let SV = document.getElementById("SecondaryVideo");
      let isPrimary = true;
      let isTransitioning = false;
      let crossfade = 5; // Seconds until next video starts
      async function getVideo() {
        let req = await fetch("/randomvideo");
        let target = isPrimary ? PV : SV;
        if (req.ok) {
          let r = await req.json();
          console.log(r);
          target.src = "/playvideo/" + r.index;
          target.addEventListener("loadedmetadata", () => {
            if (!isTransitioning) {
                isTransitioning = true;
              isPrimary = !isPrimary;
              target.play();
              setTimeout(() => {
                console.log("Starting Transition");
                startTransition();
              }, (target.duration - crossfade) * 1000);
            }
          });
        } else {
          console.error(req);
        }
      }
      function startTransition() {
        getVideo();
        setTimeout(() => {
          // Change Opacities
          PV.classList.toggle("active");
          SV.classList.toggle("active");
          isTransitioning = false;
        }, crossfade - 3);
      }
      function START() {
        getVideo();
      }
      document.addEventListener('DOMContentLoaded', START());