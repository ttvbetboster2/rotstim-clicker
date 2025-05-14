// Game State
const Game = {
  points: 0,
  pointsPerClick: 1,
  maxDVDs: 400,
  sps: 0,
  upgrades: {
    click: {
      owned: 0,
      baseCost: 10,
      increment: 10,
      cost: 10,
    },
    dvd: {
      owned: 0,
      baseCost: 100,
      increment: 50,
      cost: 100,
      spsPerUnit: 0.2,
    },
    gooner: {
      owned: 0,
      baseCost: 500,
      increment: 500,
      cost: 500,
      sps: 1,
    },
  },
};

// DOM Elements
const phoneStim = document.getElementById("phoneStim");
const pointsDisplay = document.getElementById("points");
const stimButton = document.getElementById("stimBtn");

const clickUpgradeBtn = document.getElementById("clickItem");
const clickUpgradeCostSpan = document.getElementById("clickUpgradeCost");
const dvdUpgradeBtn = document.getElementById("dvdItem");
const dvdUpgradeCostSpan = document.getElementById("dvdUpgradeCost");

const goonerItem = document.getElementById("goonerItem");
const goonerCostSpan = document.getElementById("goonerUpgradeCost");
const goonerOwnedSpan = document.getElementById("goonerOwned");

// Calculate linear upgrade cost
function calculateLinearCost(baseCost, increment, owned) {
  return baseCost + increment * owned;
}

// SPS Calculation
function calculateSps() {
  const dvdSps = Game.upgrades.dvd.owned * Game.upgrades.dvd.spsPerUnit;
  const goonerSps = Game.upgrades.gooner.owned * Game.upgrades.gooner.sps;
  Game.sps = dvdSps + goonerSps;
  document.getElementById("sps").textContent = `SPS: ${Game.sps.toFixed(1)}`;
}

// UI Update
function updatePointsDisplay() {
  pointsDisplay.textContent = Math.floor(Game.points);
  document.getElementById("clickOwned").textContent = Game.upgrades.click.owned;
  document.getElementById("dvdOwned").textContent = Game.upgrades.dvd.owned;
  goonerOwnedSpan.textContent = Game.upgrades.gooner.owned;
  calculateSps();
}

// Floating popup
function spawnFloatingPopup(x, y, text, color = "#00ffcc") {
  const popup = document.createElement("div");
  popup.classList.add("floating-text");
  popup.textContent = text;
  popup.style.left = `${x}px`;
  popup.style.top = `${y}px`;
  popup.style.color = color;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 1000);
}

// Stim click
phoneStim.addEventListener("click", (event) => {
  Game.points += Game.pointsPerClick;
  updatePointsDisplay();
  spawnFloatingPopup(event.clientX, event.clientY, `+${Game.pointsPerClick}`, "#bb00ff");
});

// Click Upgrade
clickUpgradeBtn.addEventListener("click", () => {
  const upgrade = Game.upgrades.click;
  if (Game.points >= upgrade.cost) {
    Game.points -= upgrade.cost;
    Game.pointsPerClick += 1;
    upgrade.owned++;
    upgrade.cost = calculateLinearCost(upgrade.baseCost, upgrade.increment, upgrade.owned);
    clickUpgradeCostSpan.textContent = upgrade.cost;
    updatePointsDisplay();
  }
});

// DVD Upgrade
dvdUpgradeBtn.addEventListener("click", () => {
  const upgrade = Game.upgrades.dvd;
  if (Game.points >= upgrade.cost && upgrade.owned < Game.maxDVDs) {
    Game.points -= upgrade.cost;
    upgrade.owned++;
    upgrade.cost = calculateLinearCost(upgrade.baseCost, upgrade.increment, upgrade.owned);
    dvdUpgradeCostSpan.textContent = upgrade.cost;
    createDVD();
    updatePointsDisplay();
  }
});

// Gooner Upgrade
goonerItem.addEventListener("click", () => {
  const upgrade = Game.upgrades.gooner;
  if (Game.points >= upgrade.cost) {
    Game.points -= upgrade.cost;
    upgrade.owned++;
    upgrade.cost = calculateLinearCost(upgrade.baseCost, upgrade.increment, upgrade.owned);
    goonerCostSpan.textContent = upgrade.cost;
    addGoonerToCave();
    updatePointsDisplay();
  }
});

// Gooner Display
function addGoonerToCave() {
  const gooner = document.createElement("div");
  gooner.classList.add("gooner");
  document.getElementById("goonCave").appendChild(gooner);
}

// DVD Bounce Logic
function createDVD() {
  const DVD_WIDTH = 100;
  const DVD_HEIGHT = 60;
  const dvd = document.createElement("img");
  dvd.src = "assets/img/dvdlogo.png";
  dvd.classList.add("dvdlogo");

  let x = Math.random() * (window.innerWidth - DVD_WIDTH);
  let y = Math.random() * (window.innerHeight - DVD_HEIGHT);
  let dx = (Math.random() < 0.5 ? 1 : -1) * 2;
  let dy = (Math.random() < 0.5 ? 1 : -1) * 2;

  dvd.style.position = "absolute";
  dvd.style.width = `${DVD_WIDTH}px`;
  dvd.style.height = `${DVD_HEIGHT}px`;
  dvd.style.left = `${x}px`;
  dvd.style.top = `${y}px`;
  dvd.style.zIndex = 5;
  dvd.style.filter = `hue-rotate(${Math.floor(Math.random() * 360)}deg) brightness(1.5)`;
  document.body.appendChild(dvd);

  function move() {
    x += dx;
    y += dy;

    let hitX = false;
    let hitY = false;

    if (x <= 0 || x + DVD_WIDTH >= window.innerWidth) {
      dx *= -1;
      hitX = true;
    }
    if (y <= 0 || y + DVD_HEIGHT >= window.innerHeight) {
      dy *= -1;
      hitY = true;
    }

    if (hitX && hitY) {
      Game.points += 2;
      const rect = dvd.getBoundingClientRect();
      spawnFloatingPopup(rect.left + DVD_WIDTH / 2, rect.top, "+2");
    } else if (hitX || hitY) {
      Game.points += 1;
      const rect = dvd.getBoundingClientRect();
      spawnFloatingPopup(rect.left + DVD_WIDTH / 2, rect.top, "+1", "#ff66ff");
    }

    dvd.style.left = `${x}px`;
    dvd.style.top = `${y}px`;
    updatePointsDisplay();
    requestAnimationFrame(move);
  }

  move();
}

// Save and Load
function saveGame() {
  const data = {
    points: Game.points,
    pointsPerClick: Game.pointsPerClick,
    upgrades: {
      click: Game.upgrades.click.owned,
      dvd: Game.upgrades.dvd.owned,
      gooner: Game.upgrades.gooner.owned,
    },
  };
  localStorage.setItem("rotstimSave", JSON.stringify(data));
}

function loadGame() {
  const save = JSON.parse(localStorage.getItem("rotstimSave"));
  if (!save) return;

  Game.points = save.points || 0;
  Game.pointsPerClick = save.pointsPerClick || 1;
  Game.upgrades.click.owned = save.upgrades.click || 0;
  Game.upgrades.dvd.owned = save.upgrades.dvd || 0;
  Game.upgrades.gooner.owned = save.upgrades.gooner || 0;

  Game.upgrades.click.cost = calculateLinearCost(Game.upgrades.click.baseCost, Game.upgrades.click.increment, Game.upgrades.click.owned);
  Game.upgrades.dvd.cost = calculateLinearCost(Game.upgrades.dvd.baseCost, Game.upgrades.dvd.increment, Game.upgrades.dvd.owned);
  Game.upgrades.gooner.cost = calculateLinearCost(Game.upgrades.gooner.baseCost, Game.upgrades.gooner.increment, Game.upgrades.gooner.owned);

  clickUpgradeCostSpan.textContent = Game.upgrades.click.cost;
  dvdUpgradeCostSpan.textContent = Game.upgrades.dvd.cost;
  goonerCostSpan.textContent = Game.upgrades.gooner.cost;

  for (let i = 0; i < Game.upgrades.dvd.owned; i++) createDVD();
  for (let i = 0; i < Game.upgrades.gooner.owned; i++) addGoonerToCave();

  calculateSps(); // IMPORTANT
  updatePointsDisplay();
}

// Dev Console Reset (you can call this in console too)
function fullReset() {
  localStorage.removeItem("rotstimSave");
  location.reload();
}

// Loops
setInterval(saveGame, 10000);
setInterval(() => {
  Game.points += Game.sps;
  updatePointsDisplay();
}, 1000);

// Init
loadGame();
