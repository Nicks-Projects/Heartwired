const monitorWrapper = document.getElementById('monitor-wrapper');
const monitor = monitorWrapper.querySelector('.monitor');
const screen = document.getElementById('screen');
const whiteFade = document.getElementById('white-fade');
const playerFloor = document.getElementById('player-floor');
const playerUp = document.getElementById('player-up');
const typewriterContainer = document.getElementById('typewriter-container');

// Girl's name left blank
const GIRL_NAME = "";
const LINES = [
  `Once upon a time, a young girl named ${GIRL_NAME} was just listening to some music in her room, and doing nothing but enjoying life.`,
  "",
  "When out of nowhere she blinked and was gone from her room, instead just a pitch black room. No lights, no vision, or anything from her room!",
  "",
  "Where could she have gone, what could have happened...?"
];

let currentLine = 0;
let isTyping = false;
let skip = false;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function monitorSequence() {
  monitorWrapper.style.opacity = 1; // always starting visible
  await sleep(800);
  screen.style.opacity = 1;
  for (let i = 0; i < 3; i++) {
    screen.style.opacity = (i % 2 === 0) ? 0.3 : 1;
    await sleep(200);
  }
  monitor.style.transform = 'scale(1.15)';
  await sleep(800);
  screen.style.background = '#e33636';
  await sleep(480);
  screen.style.opacity = 0;
  await sleep(250);
  monitorWrapper.style.opacity = 0;
  await sleep(800);
}

async function typewriter(text) {
  isTyping = true;
  skip = false;
  typewriterContainer.style.opacity = 1;
  typewriterContainer.innerHTML = "";

  let span = document.createElement('span');
  typewriterContainer.appendChild(span);

  for (let i = 0; i < text.length; i++) {
    if (skip) break;
    span.textContent += text[i];
    await sleep(18);
  }
  if (skip) span.textContent = text;
  isTyping = false;
}

function setupDialogueControls() {
  document.addEventListener('keydown', async (e) => {
    if (e.key === "Enter" && isTyping) skip = true;
    if ((e.key === " " || e.code === "Space") && !isTyping) {
      currentLine++;
      if (currentLine < LINES.length) {
        await typewriter(LINES[currentLine]);
      } else {
        typewriterContainer.style.opacity = 0;
        startWhiteFadeCut();
      }
    }
  });
}

async function startWhiteFadeCut() {
  whiteFade.style.opacity = 1;
  await sleep(2000); // slow 2s fade in
  whiteFade.style.opacity = 1; // (hold at max white)
  await sleep(150);  // hold briefly for full white
  // Instantly cut to the girl (floor)
  playerFloor.style.opacity = 1;
  whiteFade.style.opacity = 0;
  await sleep(600); // fade out white
  startGirlSequence();
}

async function startGirlSequence() {
  // Girl lies there for about 4s
  await sleep(4000);

  await shake(playerFloor, 2, 20, 60);
  playerFloor.style.opacity = 0;
  await sleep(300);
  playerUp.style.opacity = 1;
  await sleep(2000);
  window.location.href = "container.html";
}

async function shake(element, times, distance, delay) {
  for (let i = 0; i < times; i++) {
    element.style.transform = `translate(-50%, -50%) translateX(-${distance}px)`;
    await sleep(delay);
    element.style.transform = `translate(-50%, -50%) translateX(${distance}px)`;
    await sleep(delay);
  }
  element.style.transform = `translate(-50%, -50%)`;
}

(async function start() {
  // Ensure all states are correct at load
  monitorWrapper.style.opacity = 1;
  screen.style.opacity = 0;
  whiteFade.style.opacity = 0;
  playerFloor.style.opacity = 0;
  playerUp.style.opacity = 0;
  typewriterContainer.style.opacity = 0;

  await monitorSequence();
  setupDialogueControls();
  await typewriter(LINES[currentLine]);
})();
