const request = require("supertest");
const app = require("../src/server");

describe("GET /health", () => {
  it("should return service health status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      service: "pokedex-devops-deployment-lab",
    });
  });
});