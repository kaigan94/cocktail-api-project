// ======================
// Utility Functions
// ======================
function mapRawCocktailData(raw) {
  return {
    id: raw.idDrink,
    name: raw.strDrink,
    thumbnail: raw.strDrinkThumb,
    category: raw.strCategory,
    alcoholic: raw.strAlcoholic,
    glass: raw.strGlass,
    instructions: raw.strInstructions,
    ingredients: extractIngredients(raw),
  };
}

function extractIngredients(raw) {
  const ingredients = [];
  for (let i = 1; i <= 15; i++) {
    const ingredient = raw[`strIngredient${i}`];
    const measure = raw[`strMeasure${i}`];
    if (ingredient) {
      ingredients.push({ ingredient, measure });
    }
  }
  return ingredients;
}

// ======================
// Loader Functions
// ======================
function showLoader() {
  document.getElementById("loader").classList.remove("hidden");
  document.body.classList.add("overflow-hidden");
}

function hideLoader() {
  document.getElementById("loader").classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
}

function showError(message) {
  const errorDiv = document.getElementById("error-message");
  errorDiv.textContent = message;
  errorDiv.classList.remove("hidden");
}

function hideError() {
  const errorDiv = document.getElementById("error-message");
  errorDiv.classList.add("hidden");
}

// ======================
// Global Variables + Mobile Menu
// ======================
let cameFrom = "start";

const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
const navButtons = document.querySelectorAll("#nav-links button");
const menuOverlay = document.getElementById("menu-overlay");
const logo = document.querySelector("header img");

const pages = {
  start: document.querySelector("#start-page"),
  details: document.querySelector("#details-page"),
  search: document.querySelector("#search-page"),
  favorites: document.querySelector("#favorites-page"),
};

// ======================
// Mobile Menu Event Listeners
// ======================
menuToggle?.addEventListener("click", () => {
  const isOpen = navLinks?.classList.contains("mobile-menu-open");

  if (!isOpen) {
    navLinks?.classList.remove("hidden");
    navLinks?.classList.add("mobile-menu-open");
    menuOverlay?.classList.remove("hidden", "opacity-0");
    setTimeout(() => menuOverlay?.classList.add("opacity-100"), 10);
  } else {
    navLinks?.classList.remove("mobile-menu-open");
    setTimeout(() => navLinks?.classList.add("hidden"), 300);
    menuOverlay?.classList.remove("opacity-100");
    setTimeout(() => menuOverlay?.classList.add("hidden", "opacity-0"), 300);
  }
});

document.addEventListener("click", (e) => {
  const isInsideMenu = navLinks?.contains(e.target);
  const isToggleButton = menuToggle?.contains(e.target);
  const isLogo = logo?.contains(e.target);
  const isOpen = window.innerWidth < 640 && !navLinks?.classList.contains("hidden");

  if (!isInsideMenu && !isToggleButton && !isLogo && isOpen) {
    navLinks?.classList.add("opacity-0", "translate-y-[-10px]");
    setTimeout(() => navLinks?.classList.add("hidden"), 300);
    menuOverlay?.classList.remove("opacity-100");
    setTimeout(() => menuOverlay?.classList.add("hidden", "opacity-0"), 300);
  }
});

navButtons?.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (window.innerWidth < 640) {
      navLinks?.classList.add("opacity-0", "translate-y-[-10px]");
      setTimeout(() => navLinks?.classList.add("hidden"), 300);
      menuOverlay?.classList.remove("opacity-100");
      setTimeout(() => menuOverlay?.classList.add("hidden", "opacity-0"), 300);
    }
  });
});

window.addEventListener("resize", () => {
  if (window.innerWidth >= 640) {
    navLinks?.classList.remove("hidden", "opacity-0", "translate-y-[-10px]");
    navLinks?.classList.add("opacity-100", "translate-y-0");
    menuOverlay?.classList.add("hidden", "opacity-0");
  }
});

// ======================
// Logo Click to Home
// ======================
logo?.addEventListener("click", () => {
  localStorage.setItem("lastPage", "start");
  const lastRandomDrink = JSON.parse(localStorage.getItem("lastRandomDrink"));
  if (lastRandomDrink) {
    displayCocktail(lastRandomDrink);
  } else {
    fetchRandomCocktail();
  }
  switchPage("start");
});

// ======================
// ✨ Style and logic for persistent HTML buttons
// ======================
window.addEventListener("DOMContentLoaded", () => {
  hideLoader();

  const detailsBtn = document.getElementById("details-link");
  const newBtn = document.getElementById("new-cocktail");
  const prevBtn = document.getElementById("prev-cocktail");

  detailsBtn?.classList.add(
    "flex",
    "items-center",
    "justify-center",
    "gap-2",
    "text-white",
    "bg-orange-500",
    "hover:bg-orange-600",
    "transition",
    "px-5",
    "py-3",
    "rounded-xl",
    "font-semibold",
    "shadow-lg",
    "text-base"
  );

  newBtn?.classList.add(
    "flex",
    "items-center",
    "justify-center",
    "gap-2",
    "text-white",
    "bg-orange-500",
    "hover:bg-orange-600",
    "transition",
    "px-5",
    "py-3",
    "rounded-xl",
    "font-semibold",
    "shadow-lg",
    "text-base"
  );

  prevBtn?.classList.add(
    "flex",
    "items-center",
    "justify-center",
    "gap-2",
    "text-orange-600",
    "border",
    "border-orange-400",
    "hover:bg-orange-100",
    "transition",
    "px-5",
    "py-3",
    "rounded-xl",
    "font-semibold",
    "shadow",
    "text-base"
  );

  detailsBtn?.addEventListener("click", () => {
    const cocktailImg = document.querySelector("#cocktail img");
    const drinkId = cocktailImg?.getAttribute("data-id");
    if (drinkId) {
      cameFrom = "start";
      localStorage.setItem("lastPage", "details");
      fetchCocktailDetailsById(drinkId);
    }
  });

  newBtn?.addEventListener("click", fetchRandomCocktail);

  prevBtn?.addEventListener("click", () => {
    const previous = JSON.parse(localStorage.getItem("previousDrink"));
    if (previous) {
      displayCocktail(previous);
    }
  });

  if (localStorage.getItem("previousDrink")) {
    prevBtn?.classList.remove("hidden");
  }
});

// ======================
// Favorite Toggle Functions
// ======================
function toggleFavorite(cocktail, favIcon, favText, undoBtn) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const index = favorites.findIndex((f) => f.id === cocktail.id);

  if (index === -1) {
    favorites.push({ id: cocktail.id, name: cocktail.name, thumbnail: cocktail.thumbnail });
    localStorage.setItem("favorites", JSON.stringify(favorites));
    favIcon.classList.remove("bi-heart");
    favIcon.classList.add("bi-heart-fill");
    favText.textContent = "Added to Favorites";
    favText.classList.remove("hidden");
    favText.classList.add("opacity-100");
    undoBtn?.classList.remove("hidden");
  }
}

function undoFavorite(cocktail, favIcon, favText, undoBtn) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const index = favorites.findIndex((f) => f.id === cocktail.id);
  if (index > -1) {
    favorites.splice(index, 1);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    favIcon.classList.remove("bi-heart-fill");
    favIcon.classList.add("bi-heart");
    favText.classList.add("hidden");
    favText.classList.remove("opacity-100");
    undoBtn?.classList.add("hidden");
  }
}

// ======================
// Fetch Functions
// ======================
async function fetchRandomCocktail() {
  const currentDrink = JSON.parse(localStorage.getItem("lastRandomDrink"));
  showLoader();
  hideError();

  try {
    const response = await fetch("https://www.thecocktaildb.com/api/json/v1/1/random.php");
    if (!response.ok) throw new Error("Failed to fetch random cocktail.");
    const data = await response.json();
    if (!data.drinks || !data.drinks[0]) throw new Error("No cocktail found.");

    // Spara nuvarande som "previous"
    if (currentDrink) {
      localStorage.setItem("previousDrink", JSON.stringify(currentDrink));
      document.getElementById("prev-cocktail").classList.remove("hidden");
    }

    localStorage.setItem("lastRandomDrink", JSON.stringify(data.drinks[0]));
    displayCocktail(data.drinks[0]);
  } catch (error) {
    console.error(error);
    showError("Oops! Couldn't load a random cocktail. Try again.");
  } finally {
    hideLoader();
  }
}

async function fetchCocktailDetailsById(id) {
  showLoader();
  hideError();
  try {
    const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`);
    const data = await response.json();
    if (!data.drinks || !data.drinks[0]) throw new Error("No cocktail found by ID.");

    displayCocktailDetails(mapRawCocktailData(data.drinks[0]));
    switchPage("details");
  } catch (error) {
    console.error(error);
    showError("Oops! Couldn't load cocktail details. Try again.");
  } finally {
    hideLoader();
  }
}

async function fetchCocktailsByName(cocktailName) {
  showLoader();
  hideError();
  try {
    const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${cocktailName}`);
    const data = await response.json();
    const cocktails = data.drinks || [];

    if (cocktails.length) {
      displaySearchResults(cocktails);
    } else {
      displayNoResults();
    }
  } catch (error) {
    console.error(error);
    showError("Couldn't search cocktails. Please try again.");
  } finally {
    hideLoader();
  }
}

// By ingredient
async function fetchCocktailsByIngredient(ingredient) {
  showLoader();
  hideError();
  try {
    const response = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${ingredient}`);
    const data = await response.json();
    const cocktails = data.drinks || [];

    if (cocktails.length) {
      displaySearchResults(cocktails);
    } else {
      displayNoResults();
    }
  } catch (error) {
    console.error(error);
    showError("Couldn't search by ingredient. Please try again.");
  } finally {
    hideLoader();
  }
}

// ======================
// Drink Title Style Helper (optional enhancement)
// ======================
function stylizeDrinkTitle(title) {
  return `<h1 class="text-2xl font-extrabold tracking-wide text-orange-600 text-center mb-6 border-b-4 border-orange-300 inline-block pb-1">${title}</h1>`;
}

// ======================
// Display Functions
// ======================
function displayCocktail(cocktail) {
  const cocktailDiv = document.getElementById("cocktail");
  const searchForm = document.getElementById("search-form");
  searchForm.style.display = "none";

  cocktailDiv.innerHTML = `
    ${stylizeDrinkTitle(cocktail.strDrink)}
    <img src="${cocktail.strDrinkThumb}" alt="${cocktail.strDrink}" data-id="${cocktail.idDrink}" class="rounded-xl shadow-md max-w-xs object-contain mb-6" />
  `;
}

const detailsBtn = document.getElementById("details-link");
const newBtn = document.getElementById("new-cocktail");
const prevBtn = document.getElementById("prev-cocktail");

detailsBtn?.addEventListener("click", () => {
  const cocktailImg = document.querySelector("#cocktail img");
  if (!cocktailImg) return;
  const drinkId = cocktailImg.getAttribute("data-id");
  if (!drinkId) return;
  cameFrom = "start";
  localStorage.setItem("lastPage", "details");
  fetchCocktailDetailsById(drinkId);
});

newBtn?.addEventListener("click", fetchRandomCocktail);

prevBtn?.addEventListener("click", () => {
  const previous = JSON.parse(localStorage.getItem("previousDrink"));
  if (previous) {
    displayCocktail(previous);
  }
});

// Visa knappen om tidigare drink finns
if (localStorage.getItem("previousDrink")) {
  prevBtn?.classList.remove("hidden");
}

function displayCocktailDetails(cocktail) {
  const detailsDiv = document.getElementById("cocktail-details");
  detailsDiv.innerHTML = `
    <div class="relative bg-white rounded-xl shadow-lg pt-16 pb-10 px-6 sm:px-10 w-full max-w-md mx-auto flex flex-col items-center space-y-6 animate-fade-in">
<div class="absolute top-6 right-4 z-10 flex flex-col items-end gap-2 pr-1 pt-1">
      <button id="back-to-search" class="hidden bg-orange-500 text-white py-2 px-3 rounded hover:bg-orange-600 transition text-sm">← Back</button>
      <button id="back-to-home" class="hidden bg-orange-500 text-white py-2 px-3 rounded hover:bg-orange-600 transition text-sm">← Back</button>
      <button id="back-to-favorites" class="hidden bg-orange-500 text-white py-2 px-3 rounded hover:bg-orange-600 transition text-sm">← Back</button>
    </div>

<div class="absolute top-0 left-4 z-10 flex flex-col items-start gap-1 pt-1">
  <button id="fav-btn" title="Add to favorites"
    class="bg-stone-200 text-black text-sm py-1 px-2 rounded hover:bg-stone-400 transition flex items-center">
    <i id="fav-icon" class="bi text-lg text-red-500"></i>
    <span id="fav-text" class="ml-2 text-sm font-medium hidden opacity-0 transition-opacity duration-500">Added to Favorites</span>
  </button>
  <button id="undo-fav-btn" class="text-xs text-red-600 underline hidden">Remove from Favorites</button>
</div>


<h2 class="text-xl font-bold text-orange-600 text-center pt-8">${cocktail.name}</h2>
      <img src="${cocktail.thumbnail}" alt="${cocktail.name}" class="rounded-xl w-full max-w-[300px] object-contain shadow mx-auto px-4" />

      <div class="text-left w-full text-gray-800 space-y-2 text-sm">
  <div class="flex items-start gap-x-3">
    <i class="bi bi-tags text-orange-600"></i>
    <p><span class="font-semibold">Category:</span> ${cocktail.category}</p>
  </div>
  <div class="flex items-start gap-x-3">
    <i class="bi bi-cup-straw text-orange-600"></i>
    <p><span class="font-semibold">Alcoholic:</span> ${cocktail.alcoholic}</p>
  </div>
  <div class="flex items-start gap-x-3">
    <i class="bi bi-cup text-orange-600"></i>
    <p><span class="font-semibold">Glass:</span> ${cocktail.glass}</p>
  </div>
  <div class="flex items-start gap-x-3">
    <i class="bi bi-list-check text-orange-600"></i>
    <p><span class="font-semibold">Instructions:</span> ${cocktail.instructions}</p>
  </div>
  <div class="flex items-start gap-x-3 mt-4">
    <i class="bi bi-card-list text-orange-600"></i>
    <p class="font-semibold">Ingredients:</p>
  </div>
  <ul class="list-disc list-inside space-y-1 pl-7">
    ${cocktail.ingredients.map((i) => `<li>${i.measure || ""} ${i.ingredient}</li>`).join("")}
  </ul>
</div>

    </div>
  `;

  const favBtn = document.getElementById("fav-btn");
  const favIcon = document.getElementById("fav-icon");
  const favText = document.getElementById("fav-text");
  const undoBtn = document.getElementById("undo-fav-btn");

  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const isAlreadyFavorite = favorites.some((f) => f.id === cocktail.id);

  if (isAlreadyFavorite) {
    favIcon.classList.remove("bi-heart");
    favIcon.classList.add("bi-heart-fill");
    favText.textContent = "Added to Favorites";
    favText.classList.remove("hidden");
    favText.classList.add("opacity-100");
    undoBtn.classList.remove("hidden");
  } else {
    favIcon.classList.remove("bi-heart-fill");
    favIcon.classList.add("bi-heart");
    favText.classList.add("hidden");
    undoBtn.classList.add("hidden");
  }

  // 🧡 Klick på hjärt = toggle
  favBtn.addEventListener("click", () => {
    toggleFavorite(cocktail, favIcon, favText, undoBtn);
  });

  // Undo-knapp
  undoBtn.addEventListener("click", () => {
    undoFavorite(cocktail, favIcon, favText, undoBtn);
  });

  const backToSearchBtn = document.getElementById("back-to-search");
  const backToHomeBtn = document.getElementById("back-to-home");
  const backToFavoritesBtn = document.getElementById("back-to-favorites");

  favBtn.addEventListener("click", () => {
    toggleFavorite(cocktail, favIcon, favText, favBtn);
  });

  if (cameFrom === "search") {
    backToSearchBtn.classList.remove("hidden");
  } else if (cameFrom === "favorites") {
    backToFavoritesBtn.classList.remove("hidden");
  } else {
    backToHomeBtn.classList.remove("hidden");
  }

  backToSearchBtn.onclick = () => switchPage("search");
  backToHomeBtn.onclick = () => switchPage("start");
  backToFavoritesBtn.onclick = () => switchPage("favorites");

  favBtn.addEventListener("click", () => {
    toggleFavorite(cocktail, favIcon, favText, favBtn, undoBtn);
  });

  undoBtn.addEventListener("click", () => {
    undoFavorite(cocktail, favIcon, favText, undoBtn);
  });
}

function displaySearchResults(cocktails) {
  const resultsDiv = document.getElementById("search-results");
  resultsDiv.innerHTML = "";

  cocktails.forEach((cocktail) => {
    const item = document.createElement("li");
    item.className = "bg-stone-50 rounded shadow p-4 flex flex-col items-center animate-fade-in cursor-pointer hover:shadow-lg transition";

    item.innerHTML = `
      <h3 class="text-lg font-bold text-center mb-2">${cocktail.strDrink}</h3>
      <img src="${cocktail.strDrinkThumb}" alt="${cocktail.strDrink}" class="rounded max-h-40 object-contain mb-2" />
    `;

    item.addEventListener("click", () => {
      cameFrom = "search";
      fetchCocktailDetailsById(cocktail.idDrink);
      switchPage("details");
    });

    resultsDiv.appendChild(item);
  });
}

function displayNoResults() {
  const resultsDiv = document.getElementById("search-results");
  resultsDiv.innerHTML = "<li class='text-gray-600'>No cocktails found.</li>";
}

function displayFavorites() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const favoritesList = document.getElementById("favorites-list");

  favoritesList.innerHTML = "";

  if (favorites.length === 0) {
    favoritesList.className = "flex flex-col items-center gap-6 w-full max-w-md mx-auto";

    favoritesList.innerHTML = `
      <div class="bg-orange-50 border border-orange-300 rounded-xl shadow-md p-6 flex flex-col items-center animate-fade-in">
    <i class="bi bi-emoji-frown text-4xl text-orange-400 mb-3"></i>
    <p class="text-gray-700 text-lg font-semibold mb-1">No favorites yet.</p>
    <p class="text-gray-500 text-sm text-center">Start adding some drinks to fill this space with deliciousness!</p>
  </div>
    `;
    return;
  }

  favoritesList.className = "flex flex-col items-center gap-6 w-full max-w-md mx-auto";

  favorites.forEach((fav) => {
    const item = document.createElement("li");
    item.className =
      "bg-white rounded-xl shadow-md p-6 flex flex-col items-center w-full max-w-md transition hover:shadow-lg hover:scale-[1.01] duration-200 animate-fade-in border-l-2 border-orange-400";

    item.innerHTML = `
    <div class="flex justify-between items-center w-full mb-2">
      <h3 class="text-lg font-bold text-orange-600">${fav.name}</h3>
      <button data-id="${fav.id}" class="remove-fav text-red-500 hover:text-red-700 text-xl">
        <i class="bi bi-trash-fill"></i>
      </button>
    </div>
    <img src="${fav.thumbnail}" alt="${fav.name}" class="rounded max-h-48 object-contain mt-2 cursor-pointer shadow" />
  `;

    item.querySelector("img").addEventListener("click", () => {
      cameFrom = "favorites";
      fetchCocktailDetailsById(fav.id);
      switchPage("details");
    });

    item.querySelector(".remove-fav").addEventListener("click", (e) => {
      e.stopPropagation();
      removeFavorite(fav.id);
    });

    favoritesList.appendChild(item);
  });
}

function removeFavorite(id) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites = favorites.filter((fav) => fav.id !== id);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  displayFavorites();
}

// ======================
// Page Switcher
// ======================
function switchPage(page) {
  Object.entries(pages).forEach(([key, el]) => {
    if (key === page) {
      el.classList.add("open");
      el.classList.remove("hidden");
    } else {
      el.classList.remove("open");
      el.classList.add("hidden");
    }
  });

  const searchForm = document.getElementById("search-form");
  if (page === "search") {
    searchForm.style.display = "flex";
  } else {
    searchForm.style.display = "none";
  }
}

// ======================
// Event Listeners
// ======================
document.getElementById("logo-link")?.addEventListener("click", () => {
  localStorage.setItem("lastPage", "start");
  const lastRandomDrink = JSON.parse(localStorage.getItem("lastRandomDrink"));
  if (lastRandomDrink) {
    displayCocktail(lastRandomDrink);
  } else {
    fetchRandomCocktail();
  }
  switchPage("start");
});

document.getElementById("prev-cocktail").addEventListener("click", () => {
  const previous = JSON.parse(localStorage.getItem("previousDrink"));
  if (previous) {
    displayCocktail(previous);
  }
});

document.getElementById("search-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("search-input").value.trim();
  const ingredient = document.getElementById("ingredient-input")?.value.trim();

  if (name) {
    fetchCocktailsByName(name);
  } else if (ingredient) {
    fetchCocktailsByIngredient(ingredient);
  }
});

document.getElementById("new-cocktail").addEventListener("click", fetchRandomCocktail);

document.getElementById("details-link").addEventListener("click", () => {
  const cocktailImg = document.querySelector("#cocktail img");
  const drinkId = cocktailImg.getAttribute("data-id");
  cameFrom = "start";
  localStorage.setItem("lastPage", "details");
  fetchCocktailDetailsById(drinkId);
});

document.getElementById("search-link").addEventListener("click", () => {
  localStorage.setItem("lastPage", "search");
  switchPage("search");
});

document.getElementById("favorites-link").addEventListener("click", () => {
  localStorage.setItem("lastPage", "favorites");
  displayFavorites();
  switchPage("favorites");
});

document.getElementById("start-link").addEventListener("click", () => {
  localStorage.setItem("lastPage", "start");

  const lastRandomDrink = JSON.parse(localStorage.getItem("lastRandomDrink"));

  if (lastRandomDrink) {
    displayCocktail(lastRandomDrink);
  } else {
    fetchRandomCocktail();
  }

  switchPage("start");
});

document.getElementById("clear-search").addEventListener("click", () => {
  document.getElementById("search-input").value = "";
  document.getElementById("search-results").innerHTML = "";
});

window.addEventListener("DOMContentLoaded", () => {
  hideLoader();

  // 🔒 Säkert startläge för mobilmenyn
  if (window.innerWidth < 640) {
    navLinks?.classList.remove("mobile-menu-open");
    navLinks?.classList.add("hidden", "opacity-0", "translate-y-[-10px]");
    menuOverlay?.classList.add("hidden", "opacity-0");
    menuOverlay?.classList.remove("opacity-100");
  } else {
    navLinks?.classList.remove("hidden", "opacity-0", "translate-y-[-10px]", "mobile-menu-open");
    navLinks?.classList.add("opacity-100", "translate-y-0");
    menuOverlay?.classList.add("hidden", "opacity-0");

    const scrollToTopBtn = document.getElementById("scroll-to-top");

    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        scrollToTopBtn.classList.remove("hidden");
      } else {
        scrollToTopBtn.classList.add("hidden");
      }
    });

    scrollToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // 🚀 Ladda rätt vy
  const lastPage = localStorage.getItem("lastPage") || "start";
  const lastRandomDrink = JSON.parse(localStorage.getItem("lastRandomDrink"));

  if (lastPage === "search") {
    switchPage("search");
  } else if (lastPage === "favorites") {
    displayFavorites();
    switchPage("favorites");
  } else {
    if (lastRandomDrink) {
      displayCocktail(lastRandomDrink);
    } else {
      fetchRandomCocktail();
    }
    switchPage("start");
  }
});
