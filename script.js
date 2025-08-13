// DOM Elements
const modal = document.getElementById("addGameModal");
const openBtn = document.getElementById("openModalBtn");
const closeBtn = document.querySelector(".close-btn");
const addGameForm = document.getElementById("addGameForm");
const gameList = document.getElementById("game-list");
const navLinks = document.querySelectorAll(".footer-nav a");
const pages = {
  home: document.getElementById("home-page"),
  stats: document.getElementById("stats-page"),
  profile: document.getElementById("profile-page"),
};

const profileForm = document.getElementById("profile-form");

// Open modal
openBtn.addEventListener("click", () => {
  modal.style.display = "block";
  modal.setAttribute("aria-hidden", "false");
  document.getElementById("gameTitle").focus();
});

// Close modal
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
});

// Close modal when clicking outside modal content
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
  }
});

// Navigation page switching
function showPage(page) {
  for (const key in pages) {
    if (key === page) {
      pages[key].hidden = false;
      navLinks.forEach((link) => {
        link.setAttribute("aria-current", link.textContent.toLowerCase() === page ? "page" : "false");
      });
    } else {
      pages[key].hidden = true;
    }
  }
  if (page === "stats") {
    renderStatsPage();
  } else if (page === "profile") {
    loadProfile();
  }
}

navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const page = e.target.textContent.toLowerCase();
    showPage(page);
  });
});

// Show home page by default on load
document.addEventListener("DOMContentLoaded", () => {
  loadGamesFromStorage();
  updateStats();
  showPage("home");
});

// Add game form submission
addGameForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = document.getElementById("gameTitle").value.trim();
  const image = document.getElementById("gameImage").value.trim();
  const link = document.getElementById("gameLink").value.trim();

  if (!title || !image || !link) return;

  const gameData = {
    title,
    image,
    link,
    completed: false,
  };

  addGameToDOM(gameData);
  saveGameToStorage(gameData);

  addGameForm.reset();
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");

  updateStats();
  showPage("home"); // Return to home after adding
});

// Add game to DOM with completion toggle
function addGameToDOM(game) {
  const li = document.createElement("li");
  li.classList.add("game-item");

  li.innerHTML = `
    <label class="completed-label">
      <input type="checkbox" class="completed-checkbox" ${
        game.completed ? "checked" : ""
      } aria-label="Mark ${game.title} as completed">
      <span>✔ Completed</span>
    </label>
    <a href="${game.link}" target="_blank" rel="noopener noreferrer">
      <img src="${game.image}" alt="${game.title}" />
      <h3>${game.title}</h3>
    </a>
  `;

  const checkbox = li.querySelector(".completed-checkbox");
  checkbox.addEventListener("change", () => {
    game.completed = checkbox.checked;
    updateStats();
    saveAllGamesToStorage();
  });

  gameList.appendChild(li);
}

// Save a single game to localStorage
function saveGameToStorage(game) {
  const games = JSON.parse(localStorage.getItem("games")) || [];
  games.push(game);
  localStorage.setItem("games", JSON.stringify(games));
}

// Save all games from DOM to localStorage (after toggling completion)
function saveAllGamesToStorage() {
  const games = [];
  document.querySelectorAll(".game-item").forEach((item) => {
    const title = item.querySelector("h3").textContent;
    const image = item.querySelector("img").src;
    const link = item.querySelector("a").href;
    const completed = item.querySelector(".completed-checkbox").checked;

    games.push({ title, image, link, completed });
  });
  localStorage.setItem("games", JSON.stringify(games));
}

// Load games from storage and render them
function loadGamesFromStorage() {
  const games = JSON.parse(localStorage.getItem("games")) || [];
  games.forEach(addGameToDOM);
}

// Update main stats (XP, level, badges)
function updateStats() {
  const games = JSON.parse(localStorage.getItem("games")) || [];

  const totalGames = games.length;
  const completedGames = games.filter((g) => g.completed).length;

  const xp = totalGames * 10;
  const level = Math.floor(xp / 50) + 1;
  const badges = Math.floor(completedGames / 5);
  const hoursPlayed = totalGames * 5;

  document.getElementById("total-games").textContent = totalGames;
  document.getElementById("completed-games").textContent = completedGames;
  document.getElementById("total-hours").textContent = hoursPlayed;
  document.getElementById("xp").textContent = xp;
  document.getElementById("level").textContent = level;
  document.getElementById("badge-count").textContent = badges;

  // Special badge logic
  const specialBadge = document.getElementById("special-badge");
  if (xp > 100) {
    specialBadge.style.display = "inline-block";
  } else {
    specialBadge.style.display = "none";
  }
}
// Render detailed stats on Stats page
function renderStatsPage() {
  const games = JSON.parse(localStorage.getItem("games")) || [];
  const totalGames = games.length;
  const completedGames = games.filter((g) => g.completed).length;
  const completionPercent = totalGames ? ((completedGames / totalGames) * 100).toFixed(1) : 0;
  const xp = totalGames * 10;
  const level = Math.floor(xp / 50) + 1;
  const badges = Math.floor(completedGames / 5);
  const hoursPlayed = totalGames * 5;

  const statsDiv = document.getElementById("detailed-stats");
  statsDiv.innerHTML = `
    <p><strong>Total Games:</strong> ${totalGames}</p>
    <p><strong>Completed Games:</strong> ${completedGames}</p>
    <p><strong>Completion Percentage:</strong> ${completionPercent}%</p>
    <p><strong>Total XP:</strong> ${xp}</p>
    <p><strong>Level:</strong> ${level}</p>
    <p><strong>Badges Earned:</strong> ${badges}</p>
    <p><strong>Total Hours Played:</strong> ${hoursPlayed}</p>

    <h3>Completed Games</h3>
    <ul>
      ${
        games
          .filter((g) => g.completed)
          .map((g) => `<li>${g.title}</li>`)
          .join("") || "<li>None yet</li>"
      }
    </ul>

    <h3>Games to Complete</h3>
    <ul>
      ${
        games
          .filter((g) => !g.completed)
          .map((g) => `<li>${g.title}</li>`)
          .join("") || "<li>All done! 🎉</li>"
      }
    </ul>
  `;
}

// Load profile data to Profile form
function loadProfile() {
  const profile = JSON.parse(localStorage.getItem("profile")) || {};
  document.getElementById("username").value = profile.username || "";
  document.getElementById("favorite-genre").value = profile.favoriteGenre || "";
}

// Save profile form submission
profileForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const favoriteGenre = document.getElementById("favorite-genre").value.trim();

  const profile = { username, favoriteGenre };
  localStorage.setItem("profile", JSON.stringify(profile));

  alert("Profile saved!");
});