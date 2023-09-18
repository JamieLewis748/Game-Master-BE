//IMPORTS

const app = require("../app")
const db = require("../connection");
const request = require("supertest");
const endpointsJSON = require("../endpoints.json")

//TEST SUITE
describe("GET /api", () => {
  test("200: Should return status 200 if successfully accessed", () => {
    return request(app).get("/api").expect(200);
  });
  test("200: Should return an object if successfully accessed", () => {
    return request(app)
      .get("/api")
      .then((endpoints) => {
        expect(typeof endpoints).toBe("object");
      });
  });
  test("200: Should return an object with all the data from the endpoints.json", () => {
    return request(app)
      .get("/api")
      .then(({ body }) => {
        expect(body).toMatchObject(endpointsJSON);
      });
  });
});