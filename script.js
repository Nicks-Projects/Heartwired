const monitorWrapper = document.getElementById('monitor-wrapper');
const monitor = monitorWrapper.querySelector('.monitor');
const screen = document.getElementById('screen');
const whiteFade = document.getElementById('white-fade');
const playerFloor = document.getElementById('player-floor');
const playerUp = document.getElementById('player-up');
const typewriterContainer = document.getElementById('typewriter-container');

const DIALOGUE = [
  "Once upon a time, a young girl named Kaylee was just listening to some music in her room, and doing nothing but enjoying life.",
  "",
  "When out of nowhere she blinked and was gone from her room, instead just a pitch black room. No lights, no vision, or anything from her room!",
  "",
  "Where could she have gone, what could have happened...?"
];

let currentLine = 0;
let isTyping = false;
let typingDone = false;
let skipTypeFlag = false;
let prompt;

function sleep(ms) { return new Promise(r=>setTimeout(r,ms)); }

function renderPrompt(msg) {
  if (!prompt) {
    prompt = document.createElement("div");
    prompt.setAttribute('id', 'prompt');
    typewriterContainer.appendChild(prompt);
  }
  prompt.innerText = msg;
}
function clearPrompt() { if (prompt) prompt.innerText = ''; }

async function playMonitorIntro() {
  monitorWrapper.style.opacity = "1";
  await sleep(900);
  screen.style.opacity = "1";
  await sleep(500);
  for (let j = 0; j < 5; ++j) {
    screen.style.opacity = Math.random() < 0.6 ? "0.32" : "1";
    await sleep(70 + Math.random()*120);
  }
  screen.style.opacity = "1";
  await sleep(190);
  monitor.style.transform = "scale(1.15)";
  await sleep(1000);
  screen.style.background = "#b13a39";
  await sleep(380);
  screen.style.opacity = "0";
  await sleep(210);
  monitorWrapper.style.opacity = "0";
  await sleep(900);
}

async function typeWriterLine(line) {
  isTyping = true; typingDone = false; skipTypeFlag = false;
  typewriterContainer.innerHTML = '<span id="main-line"></span>';
  clearPrompt();
  if (line.trim() !== "") renderPrompt("[SPACE] Continue  |  [ENTER] Skip");
  const mainLine = typewriterContainer.querySelector('#main-line');
  let idx = 0;

  function handleSkip(e) { if (isTyping && e.key === "Enter") skipTypeFlag = true; }
  document.addEventListener("keydown", handleSkip);
  return new Promise(resolve => {
    function typeNext() {
      if (skipTypeFlag) {
        mainLine.textContent = line;
        isTyping = false;
        typingDone = true;
        document.removeEventListener("keydown", handleSkip);
        renderPrompt("[SPACE] Continue");
        resolve();
        return;
      }
      if (idx < line.length) {
        mainLine.textContent = line.slice(0, ++idx);
        setTimeout(typeNext, 16 + Math.random() * 12);
      } else {
        isTyping = false;
        typingDone = true;
        document.removeEventListener("keydown", handleSkip);
        renderPrompt("[SPACE] Continue");
        resolve();
      }
    }
    typeNext();
  });
}
function showNextLine() {
  if (currentLine < DIALOGUE.length) {
    return typeWriterLine(DIALOGUE[currentLine++]);
  }
  return Promise.resolve(false);
}
async function doDialogue() {
  currentLine = 0;
  typewriterContainer.innerHTML = "";
  typewriterContainer.style.opacity = 1;
  while (currentLine < DIALOGUE.length) {
    await showNextLine();
    await new Promise(res=>{
      function onSpace(e) {
        if ((e.key === ' ' || e.code === 'Space') && !isTyping && typingDone) {
          document.removeEventListener("keydown", onSpace);
          clearPrompt();
          res();
        }
      }
      document.addEventListener('keydown', onSpace);
    });
    if (DIALOGUE[currentLine-1].trim() !== '')
      typewriterContainer.innerHTML = "";
  }
}

async function playGirlFloorSequence() {
  // Make sure floor is shown, standing is hidden
  playerFloor.style.opacity = 1;
  playerUp.style.opacity = 0;
  await sleep(400);
  await shake(playerFloor, 1, 22, 30);
  await sleep(90);
  await shake(playerFloor, 1, 16, 22);
  await sleep(200);
  playerFloor.style.opacity = 0;
  await sleep(120);
  playerUp.style.opacity = 1;
  await sleep(2000); // wait 2 seconds after standing up
  window.location.href = "container.html";
}

async function shake(el, times, dist, speed) {
  const orig = el.style.transform || "translate(-50%, -50%)";
  for (let i = 0; i < times; ++i) {
    el.style.transform = "translate(-50%, -50%) translateX("+(-dist)+"px)";
    await sleep(speed);
    el.style.transform = "translate(-50%, -50%) translateX("+(dist)+"px)";
    await sleep(speed);
  }
  el.style.transform = orig;
}

async function main() {
  // Start: everything hidden except monitor for intro
  monitorWrapper.style.opacity = 0;
  screen.style.opacity = 0;
  whiteFade.style.opacity = 0;
  playerFloor.style.opacity = 0;
  playerUp.style.opacity = 0;
  typewriterContainer.style.opacity = 0;

  // MONITOR
  await playMonitorIntro();

  // DIALOGUE
  await doDialogue();
  typewriterContainer.style.opacity = 0;

  // WHITE FADE
  whiteFade.style.transition = 'opacity 1.1s linear';
  whiteFade.style.opacity = 1;
  await sleep(1000);
  whiteFade.style.transition = 'opacity 1.1s linear';
  whiteFade.style.opacity = 0;
  await sleep(600);

  // Girl floor (shake, then standing, then redirect)
  await playGirlFloorSequence();
}
main();
