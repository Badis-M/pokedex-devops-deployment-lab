const nameElement = document.querySelector("#pokemon-name");
const message = document.querySelector("#message");
const detail = document.querySelector("#pokemon-detail");
const image = document.querySelector("#pokemon-image");
const typesElement = document.querySelector("#pokemon-types");
const heightElement = document.querySelector("#pokemon-height");
const weightElement = document.querySelector("#pokemon-weight");
const statsElement = document.querySelector("#pokemon-stats");
const idElement = document.querySelector("#pokemon-id");
const xpElement = document.querySelector("#pokemon-xp");
const abilitiesElement = document.querySelector("#pokemon-abilities");
const movesElement = document.querySelector("#pokemon-moves");
const backLink = document.querySelector("#back-link");
const { formatPokemonName } = window.pokedexUtils;

function mapPokemonApiResponse(data) {
    return {
        id: data.id,
        name: data.name,
        image: data.sprites.front_default || "images/pokeball.png",
        types: data.types.map((entry) => formatPokemonName(entry.type.name)),
        height: data.height,
        weight: data.weight,
        baseExperience: data.base_experience,
        stats: data.stats.map((entry) => ({
            name: formatPokemonName(entry.stat.name),
            value: entry.base_stat,
            max: 255,
        })),
        abilities: data.abilities.map((entry) => ({
            name: formatPokemonName(entry.ability.name),
            isHidden: entry.is_hidden,
        })),
        moves: data.moves.slice(0, 12).map((entry) => formatPokemonName(entry.move.name)),
    };
}

function getSelectedPokemon() {
    const params = new URLSearchParams(window.location.search);
    return params.get("name");
}

function getSelectedType() {
    const params = new URLSearchParams(window.location.search);
    return params.get("type");
}

function updateBackLink() {
    const selectedType = getSelectedType();

    if (!selectedType) {
        backLink.href = "all.html";
        backLink.textContent = "← Back to all Pokémon";
        return;
    }

    backLink.href = `pokedex.html?type=${selectedType}`;
    backLink.textContent = `← Back to ${formatPokemonName(selectedType)} Pokémon`;
}


function renderStats(stats) {
    statsElement.innerHTML = "";

    stats.forEach((stat) => {
        const maxValue = stat.max || 255;
        const percentage = Math.min((stat.value / maxValue) * 100, 100);

        const item = document.createElement("li");
        item.innerHTML = `
      <span class="stat-name">${stat.name}</span>
      <div class="stat-bar">
        <div style="width: ${percentage}%"></div>
      </div>
      <strong>${stat.value} / ${maxValue}</strong>
    `;
        statsElement.appendChild(item);
    });
}

function renderAbilities(abilities) {
    abilitiesElement.innerHTML = "";

    abilities.forEach((ability) => {
        const item = document.createElement("li");
        item.textContent = ability.isHidden
            ? `${ability.name} hidden`
            : ability.name;
        abilitiesElement.appendChild(item);
    });
}

function renderMoves(moves) {
    movesElement.innerHTML = "";

    moves.forEach((move) => {
        const item = document.createElement("li");
        item.textContent = move;
        movesElement.appendChild(item);
    });
}

function renderPokemon(pokemon) {
    nameElement.textContent = formatPokemonName(pokemon.name);
    image.src = pokemon.image;
    image.alt = `${pokemon.name} sprite`;
    typesElement.textContent = pokemon.types.join(", ");
    heightElement.textContent = `${pokemon.height}`;
    weightElement.textContent = `${pokemon.weight}`;
    idElement.textContent = `#${pokemon.id}`;
    xpElement.textContent = pokemon.baseExperience || "N/A";

    renderStats(pokemon.stats);
    renderAbilities(pokemon.abilities);
    renderMoves(pokemon.moves);

    message.textContent = "";
    detail.classList.remove("hidden");
}

async function loadPokemon() {
    const pokemonName = getSelectedPokemon();
    updateBackLink();
    if (!pokemonName) {
        message.textContent = "Missing Pokémon name.";
        return;
    }

    message.textContent = "Loading...";

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        const data = await response.json();

        if (!response.ok) {
            message.textContent = "Pokemon not found.";
            return;
        }

        renderPokemon(mapPokemonApiResponse(data));
    } catch {
        message.textContent = "Unable to reach PokéAPI.";
    }
}

loadPokemon();