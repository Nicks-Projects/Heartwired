// === Assets ===
const SPRITES = {
  right: "https://piskel-imgstore-b.appspot.com/img/2f52d168-6137-11f0-9e04-8745c3739ca1.gif",
  left: "https://piskel-imgstore-b.appspot.com/img/2f52d168-6137-11f0-9e04-8745c3739ca1.gif", // use CSS transform in draw to flip
  up:   "https://piskel-imgstore-b.appspot.com/img/66129338-614a-11f0-b814-8745c3739ca1.gif",
  down: "https://piskel-imgstore-b.appspot.com/img/543aaec2-614d-11f0-92ae-8745c3739ca1.gif"
};
const IDLE_SPRITE = SPRITES.down;

// === State ===
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
let bgForest = document.getElementById("bg-forest");
let lever = document.getElementById("lever");
let dialogueBox = document.getElementById("dialogue-box");
let clickSound = document.getElementById("click-sound");
let consoleDiv = document.getElementById("console");
let consoleIn = document.getElementById("console-input");
let consoleOut = document.getElementById("console-output");

// Player
let px = 400, py = 310;
let speed = 2.2;
let dir = "down";
let isMoving = false;
let disableMove = false;
let lastMoveTime = performance.now();
let stoppedTime = null;
let idleTextStage = 0;
let leverActive = false;
let forestRevealed = false;
let currentSprite = new Image();
currentSprite.src = IDLE_SPRITE;

function setSpriteDirection(d) {
  dir = d;
  currentSprite.src = SPRITES[d];
}
function drawSprite() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.save();
  if (dir === "left") {
    ctx.translate(px + 48, py);
    ctx.scale(-1, 1);
    ctx.drawImage(currentSprite, 0, -48, 96, 96);
  } else {
    ctx.drawImage(currentSprite, px-48, py-48, 96, 96);
  }
  ctx.restore();
}

// === Movement and Idle Wait Logic ===
const keys = {};
function handleKeydown(e) {
  if (e.repeat) return;
  if (e.key === "/") {
    showConsole();
    return;
  }
  if (consoleDiv.style.display === "block") return;
  keys[e.key.toLowerCase()] = true;
}
function handleKeyup(e) {
  keys[e.key.toLowerCase()] = false;
}

function updatePosition(dt) {
  if (disableMove) return;
  let move = false, lastDir = dir;
  if (keys["arrowright"] || keys["d"]) { px = Math.min(px+speed, 752); setSpriteDirection("right"); move = true; }
  if (keys["arrowleft"]  || keys["a"]) { px = Math.max(px-speed, 48); setSpriteDirection("left"); move = true; }
  if (keys["arrowup"]    || keys["w"]) { py = Math.max(py-speed, 48); setSpriteDirection("up"); move = true; }
  if (keys["arrowdown"]  || keys["s"]) { py = Math.min(py+speed, 568); setSpriteDirection("down"); move = true; }

  isMoving = move;
  if (move) {
    stoppedTime = null;
    idleTextStage = 0;
    lastMoveTime = performance.now();
  }
}

function checkIdleTriggers() {
  if (isMoving) return;
  let now = performance.now();
  if (!stoppedTime) stoppedTime = now;

  let elapsed = (now - stoppedTime) / 1000;
  if (idleTextStage < 1 && elapsed > 10) {
    showDialogue("You waiting for something?");
    idleTextStage = 1;
  } else if (idleTextStage < 2 && elapsed > 15) {
    showDialogue("But still.. nothing!");
    idleTextStage = 2;
  } else if (idleTextStage < 3 && elapsed > 18) {
    showDialogue("OKAY, okay... Fine! We'll have it your way!");
    // After this, spawn lever nearby in facing direction
    idleTextStage = 3;
    setTimeout(() => {
      dialogueBox.style.display = "none";
      lever.style.display = "";
      lever.style.left = `${px-24}px`;
      lever.style.top  = `${py+48}px`;
      leverActive = true;
    }, 1500);
  }
}

// === Walking for 3 seconds in one direction auto-stops ===
let walkStartTime = null, lastWalkDir = null;
function checkWalkTimeAutoStop() {
  if (!isMoving || disableMove) {
    walkStartTime = null; lastWalkDir = null;
    return;
  }
  if (dir !== lastWalkDir) {
    lastWalkDir = dir;
    walkStartTime = performance.now();
  }
  if (walkStartTime && (performance.now()-walkStartTime) > 3000) {
    disableMove = true;
    setTimeout(()=>{ disableMove = false; walkStartTime = null; }, 700);
  }
}

// === Dialogue UI ===
function showDialogue(text) {
  dialogueBox.innerText = text;
  dialogueBox.style.display = "block";
}
function showConsole() {
  consoleDiv.classList.remove("hidden");
  consoleDiv.style.display = "block";
  consoleIn.value = "";
  consoleIn.focus();
}
function hideConsole() {
  consoleDiv.classList.add("hidden");
  consoleDiv.style.display = "none";
  consoleOut.innerText = "";
}
consoleIn && consoleIn.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    hideConsole();
    return;
  }
  if (e.key === "Enter") {
    let val = consoleIn.value.trim().toLowerCase();
    if (val === "help") {
      consoleOut.innerText = "Allowed: help, whoami, lever, exit";
    } else if (val === "whoami") {
      consoleOut.innerText = "You are... still you!";
    } else if (val === "lever") {
      consoleOut.innerText = leverActive ? "It's right there!" : "Nothing here... yet.";
    } else if (val === "exit") {
      hideConsole();
    } else {
      consoleOut.innerText = "Unknown command";
    }
    consoleIn.value = "";
  }
});

document.addEventListener("keydown", handleKeydown);
document.addEventListener("keyup", handleKeyup);

// === Main Game Loop ===
function gameLoop(ts) {
  updatePosition();
  checkIdleTriggers();
  checkWalkTimeAutoStop();
  drawSprite();

  // Lever interaction
  if (leverActive && lever.style.display !== "none" && Math.abs(px-parseInt(lever.style.left)+24)<40 && Math.abs(py-parseInt(lever.style.top)-48)<40) {
    // Player is "pressed against" lever
    document.onkeydown = function(e) {
      if (e.key === " ") {
        clickSound.volume = 0.5;
        clickSound.play();
        lever.style.display = "none";
        bgForest.style.opacity = 1;
        leverActive = false;
        setTimeout(()=>showDialogue("You are in a forest now."), 1000);
      }
    };
  }
  requestAnimationFrame(gameLoop);
}

// === Init ===
window.onload = function() {
  // Set up
  bgForest.style.opacity = 0; // hide forest at start
  lever.style.display = "none";
  playerFloor.style.opacity = 0;
  playerUp.style.opacity = 0;
  currentSprite.src = IDLE_SPRITE;
  dialogueBox.style.display = "none";
  gameLoop();
};
