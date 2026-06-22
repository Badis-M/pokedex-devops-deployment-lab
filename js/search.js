const form = document.querySelector("#search-form");
const input = document.querySelector("#pokemon-input");
const message = document.querySelector("#message");

function showMessage(text) {
  message.textContent = text;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const pokemonName = input.value.trim().toLowerCase();

  if (!pokemonName) {
    showMessage("Please enter a Pokémon name.");
    return;
  }

  window.location.href = `/pokemon?name=${pokemonName}`;
});