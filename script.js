const PASSCODE = "3004";

// Add or remove gallery images here when you place files inside images/gallery/.
const GALLERY_IMAGES = [
  "images/gallery/gallery-1.jpg",
  "images/gallery/gallery-2.jpg",
  "images/gallery/gallery-3.jpg"
];

const pages = {
  passcode: document.getElementById("pagePasscode"),
  birthday: document.getElementById("pageBirthday"),
  met: document.getElementById("pageMet"),
  gifts: document.getElementById("pageGifts")
};

const loadingScreen = document.getElementById("loadingScreen");
const keypadCard = document.getElementById("keypadCard");
const passMessage = document.getElementById("passMessage");
const passDots = document.querySelectorAll(".pass-dots span");
const birthdayType = document.getElementById("birthdayType");
const heartsLayer = document.querySelector(".fx-hearts");
const musicToggle = document.getElementById("musicToggle");
const birthdayMusic = document.getElementById("birthdayMusic");
const giftsHome = document.getElementById("giftsHome");
const galleryPanel = document.getElementById("galleryPanel");
const videoPanel = document.getElementById("videoPanel");
const finalPanel = document.getElementById("finalPanel");
const galleryImage = document.getElementById("galleryImage");
const galleryDots = document.getElementById("galleryDots");
const memoryVideo = document.getElementById("memoryVideo");
const fireworksCanvas = document.getElementById("fireworksCanvas");
const ctx = fireworksCanvas.getContext("2d");

let enteredCode = "";
let currentSlide = 0;
let heartTimer;
let confettiTimer;
let fireworkTimer;
let animationFrame;
let particles = [];
let audioCtx;
let fallbackTimer;
let touchStartX = 0;
let touchEndX = 0;

window.addEventListener("load", () => {
  setTimeout(() => loadingScreen.classList.add("hide"), 2400);
  startAmbientHearts();
  buildGallery();
});

function showPage(name) {
  Object.entries(pages).forEach(([pageName, page]) => {
    page.classList.toggle("active", pageName === name);
  });

  closeGiftPanels();
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (name === "birthday") {
    typeText(birthdayType, birthdayType.dataset.text, 65);
    launchConfetti(80);
  }
}

function updatePassDots() {
  passDots.forEach((dot, index) => dot.classList.toggle("filled", index < enteredCode.length));
}

function resetPasscode(message = "Only the right date opens this heart.") {
  enteredCode = "";
  updatePassDots();
  passMessage.textContent = message;
}

function checkPasscode() {
  if (enteredCode === PASSCODE) {
    passMessage.textContent = "Unlocked with love ❤️";
    keypadCard.classList.add("unlock");
    launchConfetti(70);
    setTimeout(() => {
      keypadCard.classList.remove("unlock");
      showPage("birthday");
      resetPasscode();
    }, 720);
    return;
  }

  keypadCard.classList.remove("shake");
  void keypadCard.offsetWidth;
  keypadCard.classList.add("shake");
  if (navigator.vibrate) navigator.vibrate([70, 40, 70]);
  resetPasscode("Oops... Try Again 🥺");
}

document.querySelectorAll("[data-key]").forEach((button) => {
  button.addEventListener("click", () => {
    if (enteredCode.length >= 4) return;
    enteredCode += button.dataset.key;
    updatePassDots();
    if (enteredCode.length === 4) checkPasscode();
  });
});

document.querySelector("[data-clear]").addEventListener("click", () => resetPasscode());
document.querySelector("[data-back]").addEventListener("click", () => {
  enteredCode = enteredCode.slice(0, -1);
  updatePassDots();
});

document.getElementById("nextToMemories").addEventListener("click", () => showPage("met"));
document.getElementById("openGifts").addEventListener("click", () => showPage("gifts"));

function typeText(element, text, speed = 55, done) {
  element.textContent = "";
  let index = 0;
  const tick = () => {
    element.textContent = text.slice(0, index);
    index += 1;
    if (index <= text.length) {
      setTimeout(tick, speed);
    } else if (done) {
      done();
    }
  };
  tick();
}

function startAmbientHearts() {
  clearInterval(heartTimer);
  heartTimer = setInterval(() => {
    const heart = document.createElement("span");
    const size = 10 + Math.random() * 18;
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.width = `${size}px`;
    heart.style.height = `${size}px`;
    heart.style.background = Math.random() > 0.5 ? "#ff82b3" : "#ffd1e2";
    heart.style.animationDuration = `${5 + Math.random() * 5}s`;
    heartsLayer.appendChild(heart);
    setTimeout(() => heart.remove(), 10500);
  }, 520);
}

function launchConfetti(amount = 100) {
  const colors = ["#ff82b3", "#ffd66e", "#d7f7ee", "#eadcff", "#ffffff"];
  for (let i = 0; i < amount; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = `${2.8 + Math.random() * 2.7}s`;
    piece.style.animationDelay = `${Math.random() * 0.6}s`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 6200);
  }
}

function buildGallery() {
  galleryDots.innerHTML = "";
  GALLERY_IMAGES.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Open gallery image ${index + 1}`);
    dot.addEventListener("click", () => showSlide(index));
    galleryDots.appendChild(dot);
  });
  showSlide(0);
}

function showSlide(index) {
  currentSlide = (index + GALLERY_IMAGES.length) % GALLERY_IMAGES.length;
  galleryImage.src = GALLERY_IMAGES[currentSlide];
  galleryDots.querySelectorAll("button").forEach((dot, dotIndex) => {
    dot.classList.toggle("active", dotIndex === currentSlide);
  });
}

document.getElementById("prevSlide").addEventListener("click", () => showSlide(currentSlide - 1));
document.getElementById("nextSlide").addEventListener("click", () => showSlide(currentSlide + 1));

document.querySelector(".gallery-frame").addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0].screenX;
}, { passive: true });

document.querySelector(".gallery-frame").addEventListener("touchend", (event) => {
  touchEndX = event.changedTouches[0].screenX;
  const delta = touchEndX - touchStartX;
  if (Math.abs(delta) > 44) showSlide(currentSlide + (delta < 0 ? 1 : -1));
}, { passive: true });

document.querySelectorAll("[data-gift]").forEach((button) => {
  button.addEventListener("click", () => openGift(button.dataset.gift));
});

document.querySelectorAll("[data-back-gifts]").forEach((button) => {
  button.addEventListener("click", () => {
    memoryVideo.pause();
    closeGiftPanels();
  });
});

function openGift(gift) {
  closeGiftPanels();
  giftsHome.style.display = "none";

  if (gift === "gallery") {
    galleryPanel.classList.add("active");
    showSlide(0);
    launchConfetti(35);
  }

  if (gift === "video") {
    videoPanel.classList.add("active");
    launchConfetti(35);
  }

  if (gift === "final") {
    finalPanel.classList.add("active");
    launchConfetti(130);
    startFireworks();
  }
}

function closeGiftPanels() {
  giftsHome.style.display = "";
  galleryPanel.classList.remove("active");
  videoPanel.classList.remove("active");
  finalPanel.classList.remove("active");
}

musicToggle.addEventListener("click", async () => {
  if (musicToggle.classList.contains("on")) {
    birthdayMusic.pause();
    stopFallbackMusic();
    musicToggle.classList.remove("on");
    musicToggle.textContent = "♫";
    return;
  }

  try {
    birthdayMusic.volume = 0.55;
    await birthdayMusic.play();
  } catch {
    startFallbackMusic();
  }
  musicToggle.classList.add("on");
  musicToggle.textContent = "♪";
});

function startFallbackMusic() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const notes = [392, 440, 523, 659, 523, 440];
  let index = 0;
  stopFallbackMusic();
  fallbackTimer = setInterval(() => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = notes[index % notes.length];
    gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.09, audioCtx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.55);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);
    index += 1;
  }, 720);
}

function stopFallbackMusic() {
  clearInterval(fallbackTimer);
}

function resizeFireworks() {
  fireworksCanvas.width = window.innerWidth * window.devicePixelRatio;
  fireworksCanvas.height = window.innerHeight * window.devicePixelRatio;
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
}

window.addEventListener("resize", resizeFireworks);

function startFireworks() {
  resizeFireworks();
  fireworksCanvas.classList.add("show");
  clearInterval(fireworkTimer);
  cancelAnimationFrame(animationFrame);
  particles = [];
  fireworkTimer = setInterval(createFirework, 580);
  animateFireworks();
  setTimeout(() => clearInterval(fireworkTimer), 16000);
}

function createFirework() {
  const x = 40 + Math.random() * (window.innerWidth - 80);
  const y = 70 + Math.random() * (window.innerHeight * 0.45);
  const colors = ["#ff82b3", "#ffd66e", "#d7f7ee", "#ffffff", "#eadcff"];

  for (let i = 0; i < 46; i += 1) {
    const angle = (Math.PI * 2 * i) / 46;
    const speed = 1.2 + Math.random() * 4.2;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 68 + Math.random() * 22,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }
}

function animateFireworks() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  particles = particles.filter((particle) => particle.life > 0);
  particles.forEach((particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.025;
    particle.life -= 1;
    ctx.globalAlpha = Math.max(particle.life / 90, 0);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, 2.2, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  animationFrame = requestAnimationFrame(animateFireworks);
}

document.getElementById("thankYouBtn").addEventListener("click", () => {
  const thankYouBtn = document.getElementById("thankYouBtn");
  const theEnd = document.getElementById("theEnd");
  const bonusType = document.getElementById("bonusType");
  const madeBy = document.getElementById("madeBy");
  const replayBtn = document.getElementById("replayBtn");
  const finalCard = document.querySelector(".final-card");

  thankYouBtn.style.display = "none";
  theEnd.classList.add("show");
  launchConfetti(160);
  startFireworks();

  setTimeout(() => {
    bonusType.classList.add("show");
    typeText(bonusType, bonusType.dataset.text, 54, () => {
      setTimeout(() => {
        finalCard.classList.add("blackout");
        setTimeout(() => {
          madeBy.classList.add("show");
          setTimeout(() => replayBtn.classList.add("show"), 3000);
        }, 2100);
      }, 700);
    });
  }, 1000);
});

document.getElementById("replayBtn").addEventListener("click", () => {
  document.querySelector(".final-card").classList.remove("blackout");
  document.getElementById("thankYouBtn").style.display = "";
  document.getElementById("theEnd").classList.remove("show");
  document.getElementById("bonusType").classList.remove("show");
  document.getElementById("madeBy").classList.remove("show");
  document.getElementById("replayBtn").classList.remove("show");
  document.getElementById("bonusType").textContent = "";
  clearInterval(fireworkTimer);
  fireworksCanvas.classList.remove("show");
  showPage("passcode");
});
