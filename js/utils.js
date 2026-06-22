window.pokedexUtils = {
    formatPokemonName(name) {
        return name
            .split("-")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ");
    },

    extractPokemonId(url) {
        const parts = url.split("/").filter(Boolean);
        return parts[parts.length - 1];
    },

    createSpritePlaceholder(pokemonId) {
        const placeholder = document.createElement("div");
        placeholder.className = "sprite-placeholder";
        placeholder.innerHTML = `<span></span><small>#${pokemonId}</small>`;

        return placeholder;
    },
};