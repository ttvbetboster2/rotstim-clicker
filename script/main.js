// Game State
const Game = {
  points: 0,
  pointsPerClick: 1,
  maxDVDs: 15,
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
    },
  },
};

// DOM
const pointsDisplay = document.getElementById("points");
const stimButton = document.getElementById("stimBtn");
const clickUpgradeBtn = document.getElementById("clickUpgradeBtn");
const clickUpgradeCostSpan = document.getElementById("clickUpgradeCost");
const dvdUpgradeBtn = document.getElementById("dvdUpgradeBtn");
const dvdUpgradeCostSpan = document.getElementById("dvdUpgradeCost");

// Price increment SYS
function calculateLinearCost(baseCost, increment, owned) {
  return baseCost + increment * owned;
}

// Keep the button updated
function updatePointsDisplay() {
  pointsDisplay.textContent = Game.points;
}

// Click THE Button
stimButton.addEventListener("click", () => {
  Game.points += Game.pointsPerClick;
  updatePointsDisplay();

  const rect = stimButton.getBoundingClientRect();
  const popupX = rect.left + rect.width / 2;
  const popupY = rect.top;
  spawnFloatingPopup(popupX, popupY, `+${Game.pointsPerClick}`, "#bb00ff");
});

// Click Upgrade
clickUpgradeBtn.addEventListener("click", () => {
  const upgrade = Game.upgrades.click;
  if (Game.points >= upgrade.cost) {
    Game.points -= upgrade.cost;
    Game.pointsPerClick += 1;
    upgrade.owned++;
    upgrade.cost = calculateLinearCost(
      upgrade.baseCost,
      upgrade.increment,
      upgrade.owned
    );
    updatePointsDisplay();
    clickUpgradeCostSpan.textContent = upgrade.cost;
  }
});

// DVD Upgrade
dvdUpgradeBtn.addEventListener("click", () => {
  const upgrade = Game.upgrades.dvd;
  if (Game.points >= upgrade.cost && upgrade.owned < Game.maxDVDs) {
    Game.points -= upgrade.cost;
    upgrade.owned++;
    upgrade.cost = calculateLinearCost(
      upgrade.baseCost,
      upgrade.increment,
      upgrade.owned
    );
    updatePointsDisplay();
    dvdUpgradeCostSpan.textContent = upgrade.cost;
    createDVD();
  }
});

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

// Bouncing DVD
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

  const hue = Math.floor(Math.random() * 360);
  dvd.style.filter = `hue-rotate(${hue}deg) brightness(1.5)`;
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

//save/load game
function saveGame() {
  const data = {
    points: Game.points,
    pointsPerClick: Game.pointsPerClick,
    upgrades: {
      clickOwned: Game.upgrades.click.owned,
      dvdOwned: Game.upgrades.dvd.owned,
    },
  };
  localStorage.setItem("rotstimSave", JSON.stringify(data));
}

function loadGame() {
  const save = JSON.parse(localStorage.getItem("rotstimSave"));
  if (!save) return;

  Game.points = save.points || 0;
  Game.pointsPerClick = save.pointsPerClick || 1;
  Game.upgrades.click.owned = save.upgrades.clickOwned || 0;
  Game.upgrades.dvd.owned = save.upgrades.dvdOwned || 0;

  // Recalculate upgrade costs
  Game.upgrades.click.cost = calculateLinearCost(
    Game.upgrades.click.baseCost,
    Game.upgrades.click.increment,
    Game.upgrades.click.owned
  );
  Game.upgrades.dvd.cost = calculateLinearCost(
    Game.upgrades.dvd.baseCost,
    Game.upgrades.dvd.increment,
    Game.upgrades.dvd.owned
  );

  // Spawn DVDs again
  for (let i = 0; i < Game.upgrades.dvd.owned; i++) {
    createDVD();
  }

  // Update UI
  clickUpgradeCostSpan.textContent = Game.upgrades.click.cost;
  dvdUpgradeCostSpan.textContent = Game.upgrades.dvd.cost;
  updatePointsDisplay();
}

// localStorage.removeItem("rotstimSave"); If i want to reset everything.

setInterval(saveGame, 10000); // Save every 10 seconds
loadGame();
