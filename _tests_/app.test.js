//IMPORTS

const {app,server} = require("../app")
const db = require("../connection");
const request = require("supertest");
const endpointsJSON = require("../endpoints.json")
const {testSeed, closeConnection} = require("../seed")
const {users} = require("./Data/User")
const {events} = require("./Data/Events")

beforeEach(async () => {
  await testSeed({users,events});
});

afterAll(() => {
  closeConnection()
  server.close()
})


//TEST SUITE
describe("GET /api/users", () => {
  test("200: Should return status 200 if successfully accessed", () => {
    return request(app).get("/api/users").expect(200);
  });
  test("200: Should return an object if successfully accessed", () => {
    return request(app)
      .get("/api/users")
      .then(({body}) => {
        body.map((user) => {
          delete user._id
        })
        users.map((user) => {
          delete user._id
        })
        expect(body).toMatchObject(users)
      });
  });
});

describe("GET /api/events", () => {
  test("200: Should return status 200 if successfully accessed", () => {
    return request(app).get("/api/events").expect(200);
  });
  test("200: Should return an object if successfully accessed", () => {
    return request(app)
      .get("/api/events")
      .then(({body}) => {
        body.map((user) => {
          delete user._id
        })
        events.map((user) => {
          delete user._id
        })
        expect(body).toMatchObject(events)
      });
  });
});