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
let promptElement = null; // Renamed for clarity

// Utility function for delays
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to render the prompt message
function renderPrompt(msg) {
  if (!promptElement) {
    promptElement = document.createElement("div");
    promptElement.setAttribute('id', 'prompt');
    typewriterContainer.appendChild(promptElement);
  }
  promptElement.innerText = msg;
}

// Function to clear the prompt message
function clearPrompt() {
  if (promptElement) {
    promptElement.innerText = '';
  }
}

// Animation sequence for the monitor intro
async function playMonitorIntro() {
  monitorWrapper.style.opacity = "1";
  await sleep(900);
  screen.style.opacity = "1";
  await sleep(500);
  for (let j = 0; j < 5; ++j) {
    screen.style.opacity = Math.random() < 0.6 ? "0.32" : "1";
    await sleep(70 + Math.random() * 120);
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

// Types out a single line of dialogue with skip functionality
async function typeWriterLine(line) {
  isTyping = true;
  typingDone = false;
  skipTypeFlag = false;
  typewriterContainer.innerHTML = '<span id="main-line"></span>';
  clearPrompt();
  if (line.trim() !== "") {
    renderPrompt("[SPACE] Continue  |  [ENTER] Skip");
  }
  const mainLine = typewriterContainer.querySelector('#main-line');
  let idx = 0;

  const handleSkip = (e) => {
    if (isTyping && e.key === "Enter") {
      skipTypeFlag = true;
    }
  };
  document.addEventListener("keydown", handleSkip);

  return new Promise(resolve => {
    const typeNext = () => {
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
    };
    typeNext();
  });
}

// Displays the next line of dialogue
async function showNextLine() {
  if (currentLine < DIALOGUE.length) {
    await typeWriterLine(DIALOGUE[currentLine++]);
    return true;
  }
  return false;
}

// Handles the entire dialogue sequence
async function doDialogue() {
  currentLine = 0;
  typewriterContainer.innerHTML = "";
  typewriterContainer.style.opacity = 1;
  let hasMoreLines = true;
  while (hasMoreLines) {
    await showNextLine();
    await new Promise(resolve => {
      const onSpace = (e) => {
        if ((e.key === ' ' || e.code === 'Space') && !isTyping && typingDone) {
          document.removeEventListener("keydown", onSpace);
          clearPrompt();
          resolve();
        }
      };
      document.addEventListener('keydown', onSpace);
    });
    if (currentLine > 0 && DIALOGUE[currentLine - 1].trim() !== '') {
      typewriterContainer.innerHTML = "";
    }
    hasMoreLines = currentLine < DIALOGUE.length;
  }
}

// Animation sequence for the girl waking up
async function playGirlFloorSequence() {
  // Ensure floor is shown, standing is hidden
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
  await sleep(2000); // Wait 2 seconds after standing up
  window.location.href = "container.html";
}

// Utility function to shake an element
async function shake(el, times, dist, speed) {
  const orig = el.style.transform || "translate(-50%, -50%)";
  for (let i = 0; i < times; ++i) {
    el.style.transform = `${orig} translateX(${-dist}px)`;
    await sleep(speed);
    el.style.transform = `${orig} translateX(${dist}px)`;
    await sleep(speed);
  }
  el.style.transform = orig;
}

// Main function to orchestrate the entire sequence
async function main() {
  // Initial setup: hide elements except for monitor intro
  monitorWrapper.style.opacity = 0;
  screen.style.opacity = 0;
  whiteFade.style.opacity = 0;
  playerFloor.style.opacity = 0;
  playerUp.style.opacity = 0;
  typewriterContainer.style.opacity = 0;

  // Play monitor intro
  await playMonitorIntro();

  // Play dialogue
  await doDialogue();
  typewriterContainer.style.opacity = 0;

  // White fade transition
  whiteFade.style.transition = 'opacity 1.1s linear';
  whiteFade.style.opacity = 1;
  await sleep(1000);
  whiteFade.style.transition = 'opacity 1.1s linear';
  whiteFade.style.opacity = 0;
  await sleep(600);

  // Play girl floor sequence and redirect
  await playGirlFloorSequence();
}

main();
