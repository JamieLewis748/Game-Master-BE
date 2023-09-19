//IMPORTS

const { app, server } = require("../app")
const db = require("../connection");
const request = require("supertest");
const endpointsJSON = require("../endpoints.json")
const { testSeed, closeConnection } = require("../seed")
const { users } = require("./Data/Users")
const { events } = require("./Data/Events")

beforeEach(async () => {
  await testSeed({ users, events });
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
      .then(({ body }) => {
        expect(body).toMatchObject(users)
      });
  });
});

describe("GET /api/users/:user_id", () => {
  test("200: Should return status 200 if successfully accessed", () => {
    return request(app).get("/api/users/1").expect(200);
  });
  test('200: Should return 200', async () => {
    const users = (await request(app).get("/api/users")).body;

    await Promise.all(users.map(async (user) => {
      const { body } = await request(app).get(`/api/users/${user._id}`);
      const userArray = [user];
      expect(body).toMatchObject(userArray);
    }));
  }, 20000);
});

//PATCH
describe.only("PATCH /api/users/characterStats/:user_id", () => {
  test("200: Should return status 200 if successfully accessed", () => {
    return request(app).patch("/api/users/characterStats/1").expect(200);
  });

  test("200: Should update the characterStats.level of the user", async () => {
    const response = ( await request(app).patch("/api/users/characterStats/1")).body
    return await request(app).get("/api/users/1").expect(200)
    .then(({body}) => {
      console.log(body);
      expect(body[0].characterStats.level).toBe("8")
    })
  })
});


describe("POST /api/users", () => {
  test("200: Should return status 200 if successfully accessed", () => {
    return request(app).post("/api/users").send({
      "name": "Jamie",
      "username": "jamie1234",
      "email": "jamie@gmail.com",
      "img_url": ""
    }).expect(200)
  });
  test("200: Should return status 200 if successfully accessed",async () => {
    const data = {
      "name": "newUser",
      "username": "newUser1234",
      "email": "newUser@gmail.com",
      "img_url": ""
    }

    const event = (await request(app).post("/api/users").send(data)).body
    expect(event.acknowledged).toBe(true)

    return await request(app).get(`/api/users/${event.insertedId}`)
    .then((response) => {
      expect(response.body).toMatchObject([data])
    })
  });
});






//TEST EVENTS
describe("GET /api/events", () => {
  test("200: Should return status 200 if successfully accessed", () => {
    return request(app).get("/api/events").expect(200);
  });
  test("200: Should return an object if successfully accessed", () => {
    return request(app)
      .get("/api/events")
      .then(({ body }) => {
        expect(body).toMatchObject(events)
      });
  });
});

describe('GET /api/events/:event_id', () => {
  test("200: Should return status 200 if successfully accessed", () => {
    return request(app).get("/api/events/1").expect(200);
  });
  test('200: Should return 200', async () => {
    const events = (await request(app).get("/api/events")).body;

    await Promise.all(events.map(async (event) => {
      const { body } = await request(app).get(`/api/events/${event._id}`);
      const eventArray = [event];
      expect(body).toMatchObject(eventArray);
    }));
  }, 20000);
});

describe("POST /api/events", () => {
  test("200: Should return status 200 if successfully accessed", () => {
    return request(app).post("/api/events").send({
      image: 'https://example.com/event2.jpg',
      gameInfo: 'Event 2 - Family Board Games',
      isGameFull: false,
      gameType: 'Board Games',
      dateTime: '2023-09-21 19:30:00'
    }).expect(200)
      .then(({ body }) => {
        expect(body.acknowledged).toBe(true)
      })
  });
  test("200: Should return status 200 if successfully accessed",async () => {
    const data = {
      image: 'https://example.com/event2.jpg',
      gameInfo: 'Event 2 - Family Board Games',
      isGameFull: false,
      gameType: 'Board Games',
      dateTime: '2023-09-21 19:30:00'
    }

    const event = (await request(app).post("/api/events").send(data)).body
    expect(event.acknowledged).toBe(true)

    return await request(app).get(`/api/events/${event.insertedId}`).expect(200)
    .then((response) => {
      expect(response.body).toMatchObject([data])
    })
  });
});