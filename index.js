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
}

function hideLoader() {
  document.getElementById("loader").classList.add("hidden");
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

menuToggle?.addEventListener("click", () => {
  const isHidden = navLinks?.classList.contains("hidden");

  if (isHidden) {
    navLinks?.classList.remove("hidden", "opacity-0", "translate-y-[-10px]");
    navLinks?.classList.add("opacity-100", "translate-y-0");
    menuOverlay?.classList.remove("opacity-0", "hidden");
    setTimeout(() => menuOverlay?.classList.add("opacity-100"), 10);
  } else {
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

document.addEventListener("click", (e) => {
  const isInside = navLinks?.contains(e.target) || menuToggle?.contains(e.target);
  if (!isInside && window.innerWidth < 640) {
    navLinks?.classList.add("opacity-0", "translate-y-[-10px]");
    setTimeout(() => navLinks?.classList.add("hidden"), 300);
    menuOverlay?.classList.remove("opacity-100");
    setTimeout(() => menuOverlay?.classList.add("hidden", "opacity-0"), 300);
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth >= 640) {
    navLinks?.classList.remove("hidden");
    navLinks?.classList.remove("opacity-0", "translate-y-[-10px]");
    navLinks?.classList.add("opacity-100", "translate-y-0");
    menuOverlay?.classList.add("hidden", "opacity-0");
  }
});

const pages = {
  start: document.querySelector("#start-page"),
  details: document.querySelector("#details-page"),
  search: document.querySelector("#search-page"),
  favorites: document.querySelector("#favorites-page"),
};

// ======================
// Fetch Functions
// ======================
async function fetchRandomCocktail() {
  document.getElementById("search-results").innerHTML = "";
  showLoader();
  hideError();
  try {
    const response = await fetch("https://www.thecocktaildb.com/api/json/v1/1/random.php");
    if (!response.ok) throw new Error("Failed to fetch random cocktail.");
    const data = await response.json();
    if (!data.drinks || !data.drinks[0]) throw new Error("No cocktail found.");

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

// ======================
// Display Functions
// ======================
function displayCocktail(cocktail) {
  const cocktailDiv = document.getElementById("cocktail");
  const searchForm = document.getElementById("search-form");
  searchForm.style.display = "none";
  cocktailDiv.innerHTML = `
<h1 class="text-2xl font-bold text-orange-600 mb-6">${cocktail.strDrink}</h1>
    <img src="${cocktail.strDrinkThumb}" alt="${cocktail.strDrink}" data-id="${cocktail.idDrink}" class="rounded-lg shadow-md max-w-xs object-contain" />
  `;
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
    favoritesList.className = "flex flex-col items-center justify-center text-center min-h-[200px]";
    favoritesList.innerHTML = `
      <div>
        <p class="text-gray-600 text-lg font-semibold mb-2">No favorites yet.</p>
        <p class="text-gray-500 text-sm">Start adding some drinks!</p>
      </div>
    `;
    return;
  }

  favoritesList.className = favorites.length === 1 ? "flex flex-col items-center gap-4 w-full" : "grid grid-cols-1 md:grid-cols-2 gap-6 w-full";

  favorites.forEach((fav) => {
    const item = document.createElement("li");
    item.className = "bg-stone-50 rounded shadow p-4 flex flex-col items-center relative text-red-600";

    item.innerHTML = `
      <div class="flex justify-between items-start w-full">
        <h3 class="text-lg font-bold text-center">${fav.name}</h3>
      <button data-id="${fav.id}" class="remove-fav text-red-500 hover:text-red-700 text-xl ml-4">
          <i class="bi bi-trash-fill"></i>
      </button>
      </div>
      <img src="${fav.thumbnail}" alt="${fav.name}" class="rounded max-h-40 object-contain mt-2 cursor-pointer" />
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

// Fade out när man tar bort favorit
function animateRemoveFavorite(id, item) {
  item.classList.remove("animate-fade-in");
  item.classList.add("animate-fade-out");
  setTimeout(() => {
    removeFavorite(id);
  }, 300);
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
document.getElementById("search-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const cocktailName = document.getElementById("search-input").value.trim();
  if (cocktailName) fetchCocktailsByName(cocktailName);
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

  const lastPage = localStorage.getItem("lastPage") || "start";
  const lastRandomDrink = JSON.parse(localStorage.getItem("lastRandomDrink"));

  if (lastPage === "search") {
    switchPage("search");
  } else if (lastPage === "favorites") {
    displayFavorites();
    switchPage("favorites");
  } else {
    // Hem-sidan (start)
    if (lastRandomDrink) {
      displayCocktail(lastRandomDrink); // Visa sparade drinken
    } else {
      fetchRandomCocktail(); // Om ingen finns, hämta ny
    }
    switchPage("start");
  }
});
