const request = require("supertest");
const app = require("./app");


describe("Test GET /portfolios", () => {
  test("It should response the GET method", done => {
    request(app)
      .get("/portfolios")
      .then(response => {
        expect(response.statusCode).toBe(200);
        done();
      });
  });
});