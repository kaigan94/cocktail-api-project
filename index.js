import { mapRawCocktailData } from "./utilities.js";

fetch("https://www.thecocktaildb.com/api/json/v1/1/random.php")
  .then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error("Error");
    }
  })
  .then((data) => {
    console.log(data);
    displayCocktail(data);
  })
  .catch((error) => console.error("Fetch Error:", error));

function displayCocktail(data) {
  const cocktail = data.drinks[0];
  const cocktailDiv = document.getElementById("cocktail");

  // Cocktail name
  const cocktailName = cocktail.strDrink;
  const heading = document.createElement("h1");
  heading.innerHTML = cocktailName;
  cocktailDiv.appendChild(heading);

  // Cocktail image
  const cocktailImg = document.createElement("img");
  cocktailImg.src = cocktail.strDrinkThumb;
  cocktailDiv.appendChild(cocktailImg);
}

// Button to generate new drink
const button = document.getElementById("new-cocktail");

button.addEventListener("click", function () {
  document.getElementById("cocktail").innerHTML = "";

  fetch("https://www.thecocktaildb.com/api/json/v1/1/random.php")
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      displayCocktail(data);
    })
    .catch(function (error) {
      console.error("Fetch Error:", error);
    });
});

const startPage = document.querySelector("#start-page");
const seeMorePage = document.querySelector("#details-page");
const searchPage = document.querySelector("#search-page");

const navBar = document.querySelector(".navbar");

navBar.addEventListener("click", clickOnNavbar);
startPage.addEventListener("click", clickOnNavbar);

function clickOnNavbar() {
  if (event.target.classList.contains("link")) {
    return linkClick(event.target.id);
  }
}

function linkClick(id) {
  if (id === "start-link") {
    startPage.classList.add("open");
    seeMorePage.classList.remove("open");
    searchPage.classList.remove("open");
  }
  if (id === "search-link") {
    searchPage.classList.add("open");
    startPage.classList.remove("open");
    seeMorePage.classList.remove("open");
  }
  if (id === "details-link") {
    seeMorePage.classList.add("open");
    startPage.classList.remove("open");
    searchPage.classList.remove("open");
  }
}
