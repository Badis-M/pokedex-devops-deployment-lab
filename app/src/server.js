const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
    return res.render("index", {
        title: "Home",
    });
});

app.get("/search", (req, res) => {
    return res.render("search", {
        title: "Search Pokémon",
    });
});

app.get("/all", (req, res) => {
    return res.render("all", {
        title: "All Pokémon",
    });
});

app.get("/about", (req, res) => {
    return res.render("about", {
        title: "About",
    });
});

app.get("/pokedex", (req, res) => {
    return res.render("pokedex", {
        title: "Pokédex by Type",
    });
});

app.get("/pokemon", (req, res) => {
    return res.render("pokemon", {
        title: "Pokémon Details",
    });
});

app.get("/health", (req, res) => {
    return res.status(200).json({
        status: "ok",
        service: "pokedex-ci-cd-lab",
    });
});

app.get("/api/pokemon", async (req, res) => {
    const limit = Number(req.query.limit || 48);
    const offset = Number(req.query.offset || 0);

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        return res.status(400).json({
            error: "Limit must be an integer between 1 and 100",
        });
    }

    if (!Number.isInteger(offset) || offset < 0) {
        return res.status(400).json({
            error: "Offset must be a positive integer",
        });
    }

    try {
        const apiResponse = await fetch(
            `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`,
        );

        if (!apiResponse.ok) {
            return res.status(502).json({
                error: "Failed to fetch Pokemon list",
            });
        }

        const data = await apiResponse.json();

        return res.status(200).json({
            count: data.count,
            limit,
            offset,
            results: data.results.map((pokemon) => ({
                name: pokemon.name,
                url: pokemon.url,
            })),
        });
    } catch {
        return res.status(500).json({
            error: "Failed to fetch Pokemon list",
        });
    }
});

app.get("/api/pokemon/type/:type", async (req, res) => {
    const pokemonType = req.params.type.toLowerCase();
    const limit = Number(req.query.limit || 24);
    const offset = Number(req.query.offset || 0);

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        return res.status(400).json({
            error: "Limit must be an integer between 1 and 100",
        });
    }

    if (!Number.isInteger(offset) || offset < 0) {
        return res.status(400).json({
            error: "Offset must be a positive integer",
        });
    }

    try {
        const apiResponse = await fetch(`https://pokeapi.co/api/v2/type/${pokemonType}`);

        if (!apiResponse.ok) {
            return res.status(404).json({
                error: "Pokemon type not found",
            });
        }

        const typeData = await apiResponse.json();

        const pokemonList = typeData.pokemon
            .slice(offset, offset + limit)
            .map((entry) => ({
                name: entry.pokemon.name,
                url: entry.pokemon.url,
            }));

        return res.status(200).json({
            type: pokemonType,
            count: typeData.pokemon.length,
            limit,
            offset,
            results: pokemonList,
        });
    } catch {
        return res.status(500).json({
            error: "Failed to fetch Pokemon type data",
        });
    }
});

app.get("/api/pokemon/:name", async (req, res) => {
    const pokemonName = req.params.name.toLowerCase();

    try {
        const apiResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);

        if (!apiResponse.ok) {
            return res.status(404).json({
                error: "Pokemon not found",
            });
        }

        const pokemon = await apiResponse.json();

        return res.status(200).json({
            id: pokemon.id,
            name: pokemon.name,
            image: pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default,
            sprite: pokemon.sprites.front_default,
            height: pokemon.height,
            weight: pokemon.weight,
            baseExperience: pokemon.base_experience,
            types: pokemon.types.map((typeInfo) => typeInfo.type.name),
            abilities: pokemon.abilities.map((abilityInfo) => ({
                name: abilityInfo.ability.name,
                isHidden: abilityInfo.is_hidden,
            })),
            stats: pokemon.stats.map((statInfo) => ({
                name: statInfo.stat.name,
                value: statInfo.base_stat,
                max: 255,
            })),
            moves: pokemon.moves.slice(0, 12).map((moveInfo) => moveInfo.move.name),
        });
    } catch {
        return res.status(500).json({
            error: "Failed to fetch Pokemon data",
        });
    }
});


if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
    app.use((req, res) => {

        return res.status(404).render("404", {
            title: "Page Not Found",
        });
    });
}

module.exports = app;