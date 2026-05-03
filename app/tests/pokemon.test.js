const request = require("supertest");
const app = require("../src/server");

describe("GET /api/pokemon/:name", () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should return formatted pokemon data", async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({
                id: 25,
                name: "pikachu",
                sprites: {
                    front_default: "https://example.com/pikachu.png",
                    other: {
                        "official-artwork": {
                            front_default: "https://example.com/pikachu-official.png",
                        },
                    },
                },
                base_experience: 112,
                abilities: [
                    {
                        ability: {
                            name: "static",
                        },
                        is_hidden: false,
                    },
                ],
                moves: [
                    {
                        move: {
                            name: "thunder-shock",
                        },
                    },
                ],
                height: 4,
                weight: 60,
                types: [
                    {
                        type: {
                            name: "electric",
                        },
                    },
                ],
                stats: [
                    {
                        base_stat: 35,
                        stat: {
                            name: "hp",
                        },
                    },
                ],
                other: {
                    "official-artwork": {
                        front_default: "https://example.com/pikachu-official.png",
                    },
                },
            }),
        });

        const response = await request(app).get("/api/pokemon/pikachu");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            id: 25,
            name: "pikachu",
            image: "https://example.com/pikachu-official.png",
            sprite: "https://example.com/pikachu.png",
            height: 4,
            weight: 60,
            baseExperience: 112,
            types: ["electric"],
            abilities: [
                {
                    name: "static",
                    isHidden: false,
                },
            ],
            stats: [
                {
                    name: "hp",
                    value: 35,
                    max: 255,
                },
            ],
            moves: ["thunder-shock"],
        });
    });

    it("should return 404 when pokemon is not found", async () => {
        global.fetch.mockResolvedValue({
            ok: false,
        });

        const response = await request(app).get("/api/pokemon/unknown");

        expect(response.status).toBe(404);
        expect(response.body).toEqual({
            error: "Pokemon not found",
        });
    });
});

describe("GET /api/pokemon/type/:type", () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should return pokemon list filtered by type", async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({
                pokemon: [
                    {
                        pokemon: {
                            name: "charmander",
                            url: "https://pokeapi.co/api/v2/pokemon/4/",
                        },
                    },
                    {
                        pokemon: {
                            name: "vulpix",
                            url: "https://pokeapi.co/api/v2/pokemon/37/",
                        },
                    },
                ],
            }),
        });

        const response = await request(app).get("/api/pokemon/type/fire");
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            type: "fire",
            count: 2,
            limit: 24,
            offset: 0,
            results: [
                {
                    name: "charmander",
                    url: "https://pokeapi.co/api/v2/pokemon/4/",
                },
                {
                    name: "vulpix",
                    url: "https://pokeapi.co/api/v2/pokemon/37/",
                },
            ],
        });
    });
});

describe("GET /api/pokemon", () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should return paginated pokemon list", async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: async () => ({
                count: 1350,
                results: [
                    {
                        name: "bulbasaur",
                        url: "https://pokeapi.co/api/v2/pokemon/1/",
                    },
                    {
                        name: "ivysaur",
                        url: "https://pokeapi.co/api/v2/pokemon/2/",
                    },
                ],
            }),
        });

        const response = await request(app).get("/api/pokemon?limit=2&offset=0");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            count: 1350,
            limit: 2,
            offset: 0,
            results: [
                {
                    name: "bulbasaur",
                    url: "https://pokeapi.co/api/v2/pokemon/1/",
                },
                {
                    name: "ivysaur",
                    url: "https://pokeapi.co/api/v2/pokemon/2/",
                },
            ],
        });
    });
});