let PV = document.getElementById("PrimaryVideo");
let SV = document.getElementById("SecondaryVideo");
let isPrimary = true;
let crossfade = 5; // Seconds until next video starts
async function GetVideoId() {
  let req = await fetch("/randomvideo");
  let id = await req.json();
  return id.index;
}
PV.addEventListener("loadedmetadata",()=>{
    setTransition(PV);
})
SV.addEventListener("loadedmetadata",()=>{
    setTransition(SV);
})
async function getVideo() {
  let target = isPrimary ? PV : SV;
  isPrimary = !isPrimary;
  let id = await GetVideoId(); // Return ID of video to be played
  target.src = "/playvideo/" + id;
//   target.addEventListener("loadedmetadata", () => {
//     if (!isTransitioning) {
//       isTransitioning = true;
//       target.play();
//       setTimeout(() => {
//         console.log("Starting Transition");
//         startTransition();
//       }, (target.duration - crossfade) * 1000);
//     }
//   });
}
function setTransition(target) {
    target.play();
    setTimeout(()=>{
        console.log("Starting Transition");
        startTransition();
    }, (target.duration - crossfade) * 1000);
}
function startTransition() {
  getVideo();
  setTimeout(() => {
    // Change Opacities
    PV.classList.toggle("active");
    SV.classList.toggle("active");
    isTransitioning = false;
  }, (crossfade - 3) * 1000);
}

function START() {
  getVideo();
}

document.addEventListener("DOMContentLoaded", START());
