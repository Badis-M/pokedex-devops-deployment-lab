const { formatPokemonName, extractPokemonId, createSpritePlaceholder } = window.pokedexUtils;
const grid = document.querySelector("#pokemon-grid");
const message = document.querySelector("#message");
const subtitle = document.querySelector("#page-subtitle");
const loadMoreButton = document.querySelector("#load-more-button");

const limit = 48;
let offset = 0;
let totalCount = 0;
let isLoading = false;

function renderPokemonCard(pokemon) {
  const pokemonId = extractPokemonId(pokemon.url);

  const link = document.createElement("a");
  link.className = "pokemon-list-card";
  link.href = `/pokemon?name=${pokemon.name}`;
  const image = document.createElement("img");
  image.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
  image.alt = `${pokemon.name} sprite`;

  image.onerror = () => {

    image.replaceWith(createSpritePlaceholder(pokemonId));

  };

  const title = document.createElement("h2");
  title.textContent = formatPokemonName(pokemon.name);

  const meta = document.createElement("p");
  meta.textContent = `#${pokemonId}`;

  link.appendChild(image);
  link.appendChild(title);
  link.appendChild(meta);

  grid.appendChild(link);
}

function updateStatus() {
  const loadedCount = grid.children.length;

  subtitle.textContent = `Displaying ${loadedCount} of ${totalCount || "..."} Pokémon.`;
  loadMoreButton.disabled = isLoading || loadedCount >= totalCount;

  if (loadedCount >= totalCount && totalCount > 0) {
    loadMoreButton.textContent = "All Pokémon loaded";
    return;
  }

  loadMoreButton.textContent = isLoading ? "Loading..." : "Load more";
}

async function loadPokemonBatch() {
  if (isLoading) {
    return;
  }

  isLoading = true;
  message.textContent = "";
  updateStatus();

  try {
    const response = await fetch(`/api/pokemon?limit=${limit}&offset=${offset}`);
    const data = await response.json();

    if (!response.ok) {
      message.textContent = data.error || "Unable to load Pokémon.";
      return;
    }

    totalCount = data.count;
    data.results.forEach(renderPokemonCard);
    offset += data.results.length;
  } catch {
    message.textContent = "Unable to reach the server.";
  } finally {
    isLoading = false;
    updateStatus();
  }
}

loadMoreButton.addEventListener("click", loadPokemonBatch);

loadPokemonBatch();