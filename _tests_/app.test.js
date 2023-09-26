//IMPORTS

const { app } = require("../app")
const { server } = require("../listen")
const db = require("../connection");
const request = require("supertest");
const endpointsJSON = require("../endpoints.json")
const { testSeed, closeConnection } = require("../seed")
const { users } = require("./Data/Users")
const { events } = require("./Data/Events")
const { collections } = require("./Data/Collections")
const adminCode = require("../AdminCode")

beforeEach(async () => {
  await testSeed({ users, events, collections });
});

afterAll(() => {
  closeConnection()
  server.close()
})


//TEST SUITE
describe("GET /api/users", () => {
  test("200: Should return status 200 on successful access", () => {
    return request(app).get("/api/users").expect(200);
  });
  test("200: Should return an object with expected users data structure", () => {
    return request(app)
      .get("/api/users")
      .then(({ body }) => {
        expect(body).toMatchObject(users);
      });
  });
});

describe("GET /api/users/:user_id", () => {
  test("200: Should return status 200 for a valid user ID and userWhoRequested", () => {
    return request(app)
      .get("/api/users/00000020f51bb4362eee2a01")
      .expect(200);
  });
  test("200: Should return status 200 and the expected user data for a valid user ID", () => {
    return request(app)
      .get("/api/users/aiden@gmail.com")
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({ user: users[10] });
      });
  });
  test("200: Should return status 200 and the expected user data for a valid user ID", () => {
    return request(app)
      .get("/api/users/noah@gmail.com")
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({ user: users[8] });
      });
  });
  test("200: Should return status 200 and the expected user data for a valid user ID", () => {
    return request(app)
      .get("/api/users/00000020f51bb4362eee2a05")
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual({ user: users[4] });
      });
  });
  // test("404 : Should return 404 when the user exists but is blocked", () => {
  //   return request(app)
  //     .get("/api/users/00000020f51bb4362eee2a03")
  //     .send({ userWhoRequested: "00000020f51bb4362eee2a02" })
  //     .expect(404)
  //     .then((msg) => {
  //       expect(JSON.parse(msg.text)).toBe("User not found");
  //     });
  // });
  test('404 : Should return 404 with "User not found" for a non-existent user ID', () => {
    return request(app)
      .get("/api/users/100")
      .expect(404)
      .then((msg) => {
        expect(JSON.parse(msg.text)).toBe("User not found");
      });
  });
  // test('400 : Should return 400 with "Bad Request" for a missing userWhoRequested parameter', () => {
  //   return request(app)
  //     .get("/api/users/00000020f51bb4362eee2a01")
  //     .expect(400)
  //     .then((msg) => {
  //       expect(JSON.parse(msg.text)).toBe("Bad Request");
  //     });
  // });
});





describe("GET /api/manyusers", () => {
  test("200: Should return status 200 on successful access", () => {
    return request(app).get("/api/manyusers").send({
      ids: ["00000020f51bb4362eee2a01", "00000020f51bb4362eee2a02", "00000020f51bb4362eee2a03"]
    }).expect(200);
  });
  test("200: Should return an object with expected users data structure", () => {
    return request(app)
      .get("/api/manyusers").send({
        ids: ["00000020f51bb4362eee2a01", "00000020f51bb4362eee2a02", "00000020f51bb4362eee2a03"]
      }).expect(200)
      .then(({ body }) => {
        let expectedResult = [...users]
        expectedResult = expectedResult.slice(0,3)
        expect(body.users).toMatchObject(expectedResult);
      });
  });
});




describe("POST /api/users", () => {
  test("200: Should return status 200 on successful user creation", () => {
    return request(app)
      .post("/api/users")
      .send({
        name: "Jamie",
        username: "jamie1234",
        email: "jamie@gmail.com",
        img_url: "",
        characterName: "Bomb",
      })
      .expect(200);
  });
  test("200: Should create a user and retrieve it with the expected data", async () => {
    const data = {
      name: "newUser",
      username: "newUser1234",
      email: "newUser@gmail.com",
      img_url: "",
      characterName: "Bam",
    };

    const event = (await request(app).post("/api/users").send(data)).body;
    expect(event.acknowledged).toBe(true);

    data.characterStats = [
      { name: "Bam", level: "1", experience: "0", experienceToLevelup: "10" },
    ];
    delete data.characterName;

    return request(app)
      .get(`/api/users/${event.insertedId}`)
      .send({ userWhoRequested: adminCode })
      .then(({ body }) => {
        expect(body).toMatchObject({ user: data });
      });
  });
  test("404: Should return 404 with 'Bad Request' for missing 'characterName' object key", () => {
    const data = {
      name: "newUser",
      username: "newUser1234",
      email: "newUser@gmail.com",
      img_url: "",
    };

    return request(app)
      .post("/api/users")
      .send(data)
      .expect(404)
      .then((msg) => {
        expect(JSON.parse(msg.text)).toBe("Bad Request");
      });
  });
  test("404: Should return 404 with 'Bad Request' for missing 'img_url' object key", () => {
    const data = {
      name: "newUser",
      username: "newUser1234",
      email: "newUser@gmail.com",
      characterName: "Bam",
    };

    return request(app)
      .post("/api/users")
      .send(data)
      .expect(404)
      .then((msg) => {
        expect(JSON.parse(msg.text)).toBe("Bad Request");
      });
  });
  test("404: Should return 404 with 'Bad Request' for missing 'email' object key", () => {
    const data = {
      name: "newUser",
      username: "newUser1234",
      img_url: "",
      characterName: "Bam",
    };

    return request(app)
      .post("/api/users")
      .send(data)
      .expect(404)
      .then((msg) => {
        expect(JSON.parse(msg.text)).toBe("Bad Request");
      });
  });
  test("404: Should return 404 with 'Bad Request' for missing 'username' object key", () => {
    const data = {
      name: "newUser",
      email: "newUser@gmail.com",
      img_url: "",
      characterName: "Bam",
    };

    return request(app)
      .post("/api/users")
      .send(data)
      .expect(404)
      .then((msg) => {
        expect(JSON.parse(msg.text)).toBe("Bad Request");
      });
  });
  test("404: Should return 404 with 'Bad Request' for missing 'name' object key", () => {
    const data = {
      username: "newUser1234",
      email: "newUser@gmail.com",
      img_url: "",
      characterName: "Bam",
    };

    return request(app)
      .post("/api/users")
      .send(data)
      .expect(404)
      .then((msg) => {
        expect(JSON.parse(msg.text)).toBe("Bad Request");
      });
  });
});

describe("PATCH /api/users/block/:user_id", () => {
  test("204: Should return status 204 on successful user blocking", () => {
    return request(app)
      .patch("/api/users/block/00000020f51bb4362eee2a07")
      .send({ userIdToGetBlocked: "00000020f51bb4362eee2a06" })
      .expect(204);
  });
  test("204: Should allow blocking a single user and return 204", async () => {
    await request(app)
      .patch("/api/users/block/00000020f51bb4362eee2a07")
      .send({ userIdToGetBlocked: "00000020f51bb4362eee2a06" })
      .expect(204);

    return request(app)
      .get("/api/users/00000020f51bb4362eee2a07")
      .send({ userWhoRequested: adminCode })
      .expect(200)
      .then(({ body }) => {
        expect(body.user.blocked).toEqual(["00000020f51bb4362eee2a06"]);
      });
  });

  test("204: Should allow blocking multiple users and return 204", async () => {
    await request(app)
      .patch("/api/users/block/00000020f51bb4362eee2a07")
      .send({ userIdToGetBlocked: "00000020f51bb4362eee2a01" })
      .expect(204);
    await request(app)
      .patch("/api/users/block/00000020f51bb4362eee2a07")
      .send({ userIdToGetBlocked: "00000020f51bb4362eee2a02" })
      .expect(204);
    await request(app)
      .patch("/api/users/block/00000020f51bb4362eee2a07")
      .send({ userIdToGetBlocked: "00000020f51bb4362eee2a09" })
      .expect(204);

    return request(app)
      .get("/api/users/00000020f51bb4362eee2a07")
      .send({ userWhoRequested: adminCode })
      .expect(200)
      .then(({ body }) => {
        expect(body.user.blocked).toEqual([
          "00000020f51bb4362eee2a01",
          "00000020f51bb4362eee2a02",
          "00000020f51bb4362eee2a09",
        ]);
      });
  });

  test("404: Should return 404 for an invalid user_id format", () => {
    return request(app)
      .patch("/api/users/block/apple")
      .send({ userIdToGetBlocked: "00000020f51bb4362eee2a06" })
      .expect(404)
      .then((msg) => {
        expect(JSON.parse(msg.text)).toBe("Bad request");
      });
  });
  test("404: Should return 404 for a non-existent user_id", () => {
    return request(app)
      .patch("/api/users/block/1.0")
      .send({ userIdToGetBlocked: "00000020f51bb4362eee2a06" })
      .expect(404)
      .then((msg) => {
        expect(JSON.parse(msg.text)).toBe("Bad request");
      });
  });
});

describe("PATCH /api/users/characterStats/:user_id", () => {
  test("200: Should return status 200 on successful exp/experience update", () => {
    return request(app)
      .patch("/api/users/characterStats/00000020f51bb4362eee2a01")
      .send({ exp: 80 })
      .expect(200);
  });

  test("200: Should return status 200 on successful characterStats.level update", async () => {
    await request(app)
      .patch("/api/users/characterStats/00000020f51bb4362eee2a01")
      .send({ exp: 80 });

    return await request(app)
      .get("/api/users/00000020f51bb4362eee2a01")
      .send({ userWhoRequested: adminCode })
      .expect(200)
      .then(({ body }) => {
        expect(body.user.characterStats.level).toBe("8");
      });
  });
  test("200: Should return status 200 on different user's successful characterStats.level update", async () => {
    await request(app)
      .patch("/api/users/characterStats/00000020f51bb4362eee2a02")
      .send({ exp: 40 });
    return await request(app)
      .get("/api/users/00000020f51bb4362eee2a02")
      .send({ userWhoRequested: adminCode })
      .expect(200)
      .then(({ body }) => {
        expect(body.user.characterStats.level).toBe("6");
      });
  });
  test("200: Should return status 200 on different user's successful characterStats.level update", async () => {
    await request(app)
      .patch("/api/users/characterStats/00000020f51bb4362eee2a02")
      .send({ exp: 100 });
    return await request(app)
      .get("/api/users/00000020f51bb4362eee2a02")
      .send({ userWhoRequested: adminCode })
      .expect(200)
      .then(({ body }) => {
        expect(body.user.characterStats.level).toBe("7");
      });
  });
  test("400: Should return 400 for an invalid user ID", async () => {
    return request(app).patch("/api/users/characterStats/100").send({ exp: 100 }).expect(400)
  });
  test("400: Should return 400 with 'Missing exp' for missing exp/experience", () => {
    return request(app)
      .patch("/api/users/characterStats/00000020f51bb4362eee2a01")
      .expect(400)
      .then((msg) => {
        expect(JSON.parse(msg.text)).toBe("Missing exp");
      });
  });
  test("404: Should return 404 with 'Bad Request' for an invalid exp/experience", () => {
    return request(app)
      .patch("/api/users/characterStats/00000020f51bb4362eee2a01")
      .send({ exp: "abanana" })
      .expect(404)
      .then((msg) => {
        expect(JSON.parse(msg.text)).toBe("Bad Request");
      });
  });
  test("400: Should return 400 with 'User not found' for a non-existent user", () => {
    return request(app).patch("/api/users/characterStats/100").send({ exp: "100" }).expect(400)
      .then((msg) => {
        expect(JSON.parse(msg.text)).toBe("User not found")
      })
  });
});

describe("GET /api/events ", () => {
  test("200: Should return status 200 on successful access", () => {
    return request(app).get("/api/events").expect(200);
  });
  test("200: Should return status 200 and an array of events in asc order by dateTime when 'isCompleted' is false", () => {
    return request(app)
      .get("/api/events")
      .expect(200)
      .then(({ body }) => {
        expect(body.length > 0).toBe(true);
        let onlyGameNotFullEvents = [...events];
        onlyGameNotFullEvents = onlyGameNotFullEvents.filter(
          (event) => event.isCompleted === "false"
        );
        onlyGameNotFullEvents = onlyGameNotFullEvents.sort(function (a, b) {
          return new Date(a.dateTime) - new Date(b.dateTime);
        });
        expect(body).toMatchObject(onlyGameNotFullEvents);
      });
  });
  test("200: Should return status 200 and an array of events when 'isGameFull' is false", () => {
    return request(app)
      .get("/api/events?isGameFull=false")
      .expect(200)
      .then(({ body }) => {
        expect(body.length > 0).toBe(true);
        let onlyGameNotFullEvents = [...events];
        onlyGameNotFullEvents = onlyGameNotFullEvents.filter(
          (event) => event.isCompleted === "false"
        );
        onlyGameNotFullEvents = onlyGameNotFullEvents.filter(
          (event) => event.isGameFull === "false"
        );
        onlyGameNotFullEvents = onlyGameNotFullEvents.sort(function (a, b) {
          return new Date(a.dateTime) - new Date(b.dateTime);
        });
        expect(body).toMatchObject(onlyGameNotFullEvents);
      });
  });
  test("200: Should return status 200 and events of the specified 'game type' Board Games", () => {
    return request(app)
      .get("/api/events?gameType=Board Games")
      .expect(200)
      .then(({ body }) => {
        expect(body.length > 0).toBe(true);
        let onlyGameNotFullEvents = [...events];
        onlyGameNotFullEvents = onlyGameNotFullEvents.filter(
          (event) => event.isCompleted === "false"
        );
        onlyGameNotFullEvents = onlyGameNotFullEvents.filter(
          (event) => event.gameType === "Board Games"
        );
        onlyGameNotFullEvents = onlyGameNotFullEvents.sort(function (a, b) {
          return new Date(a.dateTime) - new Date(b.dateTime);
        });
        expect(body).toMatchObject(onlyGameNotFullEvents);
      });
  });
  test("200: Should return status 200 and events of the specified 'game type' Card Games", () => {
    return request(app)
      .get("/api/events?gameType=Card Games")
      .expect(200)
      .then(({ body }) => {
        expect(body.length > 0).toBe(true);
        let onlyGameNotFullEvents = [...events];
        onlyGameNotFullEvents = onlyGameNotFullEvents.filter(
          (event) => event.isCompleted === "false"
        );
        onlyGameNotFullEvents = onlyGameNotFullEvents.filter(
          (event) => event.gameType === "Card Games"
        );
        onlyGameNotFullEvents = onlyGameNotFullEvents.sort(function (a, b) {
          return new Date(a.dateTime) - new Date(b.dateTime);
        });
        expect(body).toMatchObject(onlyGameNotFullEvents);
      });
  });
  test("200: Should return status 200 and an array of onlyGameNotFullEvents in asc order by dateTime", () => {
    return request(app)
      .get("/api/events?sortBy=dateTime&order=1")
      .expect(200)
      .then(({ body }) => {
        expect(body.length > 0).toBe(true);
        let onlyGameNotFullEvents = [...events];
        onlyGameNotFullEvents = onlyGameNotFullEvents.filter(
          (event) => event.isCompleted === "false"
        );
        onlyGameNotFullEvents = onlyGameNotFullEvents.sort(function (a, b) {
          return new Date(a.dateTime) - new Date(b.dateTime);
        });
        expect(body).toMatchObject(onlyGameNotFullEvents);
      });
  });
  test("200: Should return status 200 and an array of onlyGameNotFullEvents in DEC order by dateTime", () => {
    return request(app)
      .get("/api/events?sortBy=dateTime&order=-1")
      .expect(200)
      .then(({ body }) => {
        let onlyGameNotFullEvents = [...events];
        onlyGameNotFullEvents = onlyGameNotFullEvents.filter(
          (event) => event.isCompleted === "false"
        );
        onlyGameNotFullEvents = onlyGameNotFullEvents.sort(function (a, b) {
          return new Date(b.dateTime) - new Date(a.dateTime);
        });
        expect(body).toMatchObject(onlyGameNotFullEvents);
      });
  });
  test("400: Should return status 400 for invalid dateTime order", () => {
    return request(app)
      .get("/api/events?sortBy=dateTime&order=banana")
      .expect(400)
      .then((msg) => {
        expect(JSON.parse(msg.text)).toBe("Bad Request");
      });
  });
  test("400: Should return status 400 for invalid isGameFull", () => {
    return request(app)
      .get("/api/events?isGameFull=banana&sortBy=dateTime")
      .expect(400)
      .then((msg) => {
        expect(JSON.parse(msg.text)).toBe("Bad Request");
      });
  });
});

describe("GET /api/events/:event_id", () => {
  test("200: Should return status 200 on successful event retrieval", () => {
    return request(app).get("/api/events/00000020f51bb4362eee2e01").expect(200);
  })
  test("200: Should return 200 for each event retrieved by ID", () => {
    return Promise.all(
      events.map(async (event) => {
        const { body } = await request(app).get(`/api/events/${event._id}`);
        expect(body).toMatchObject({ event: event });
      })
    );
  }, 20000);
});

describe("POST /api/events", () => {
  test("POST /api/events - Create a new event", async () => {
    const newEvent = {
      hostedBy: "00000020f51bb4362eee2a01",
      image: "https://example.com/event3.jpg",
      gameInfo: "Event 3 - Card Games Night",
      isGameFull: false,
      gameType: "Card Games",
      dateTime: "2023-09-28 20:00:00",
      duration: "3:00:00",
      capacity: 8,
      prizeCollection_id: "00000020f61bb4362eee2c02",
    };

    const response = await request(app)
      .post('/api/events')
      .send(newEvent)
      .expect(200);

    expect(response.body.acknowledged).toBe(true);
  });
  test("200: Should return status 200 on successful event creation", () => {
    return request(app)
      .post("/api/events")
      .send({
        hostedBy: "00000020f51bb4362eee2a01",
        image: "https://example.com/event2.jpg",
        gameInfo: "Event 2 - Family Board Games",
        isGameFull: false,
        gameType: "Board Games",
        dateTime: "2023-09-21 19:30:00",
        duration: "2:00:00",
        capacity: 6,
        prizeCollection_id: "00000020f61bb4362eee2c01",
      })
      .expect(200)
      .then(({ body }) => {
        expect(body.acknowledged).toBe(true);
      });
  });
  test("200: Should return status 200 on create and retrieve event with matching data", async () => {
    const data = {
      hostedBy: "00000020f51bb4362eee2a01",
      image: "https://example.com/event2.jpg",
      gameInfo: "Event 2 - Family Board Games",
      isGameFull: false,
      gameType: "Board Games",
      dateTime: "2023-09-21 19:30:00",
      duration: "2:00:00",
      capacity: 6,
      prizeCollection_id: "00000020f61bb4362eee2c01",
    };

    const event = (await request(app).post("/api/events").send(data)).body
    expect(event.acknowledged).toBe(true)

    return await request(app).get(`/api/events/${event.insertedId}`).expect(200)
      .then(({ body }) => {
        expect(body).toMatchObject({ event: data })
      })
  });
});

describe("GET /api/collections", () => {
  test("200: Should return status 200 on successful access", () => {
    return request(app).get("/api/collections").expect(200);
  });
  test("200: Should return status 200 and collections data when accessed successfully", () => {
    return request(app)
      .get("/api/collections")
      .then(({ body }) => {
        expect(body).toMatchObject(collections)
      });
  });
});

describe("GET /api/collections/:collection_id", () => {
  test("200: Should return status 200 on successful collection retrieval by ID", () => {
    return request(app)
      .get("/api/collections/00000020f61bb4362eee2c01")
      .expect(200);
  });
  test("200: Should return status 200 and collection data by 'ID' object key when accessed successfully", () => {
    return request(app)
      .get("/api/collections/00000020f61bb4362eee2c01")
      .then(({ body }) => {
        expect(body).toMatchObject({ collections: collections[0] });
      });
  });
  test("200: Should return status 200 and collection data by 'name' object key when accessed successfully", () => {
    return request(app)
      .get("/api/collections/wind")
      .then(({ body }) => {
        expect(body).toMatchObject({ collections: collections[3] });
      });
  });
  test("400: Should return status 400 for an invalid collection 'name'", () => {
    return request(app).get("/api/collections/banana").expect(400);
  });
  test("400: Should return 400 for a non-existent collection 'ID'", () => {
    return request(app).get("/api/collections/100").expect(400);
  });
});


describe("POST /api/collections", () => {
  test("200: Should return status 200 on successful collection creation", () => {
    return request(app)
      .post("/api/collections")
      .send({
        name: "Rock",
        image: "https://example.com/event2.jpg",
      })
      .expect(200)
      .then(({ body }) => {
        expect(body.acknowledged).toBe(true);
      });
  });
  test("200: Should retrun status 200, create and retrieve a collection with matching data", async () => {
    const data = {
      name: "Rock",
      image: "https://example.com/event2.jpg",
    };

    const event = (await request(app).post("/api/collections").send(data)).body;
    expect(event.acknowledged).toBe(true);

    return await request(app)
      .get(`/api/collections/${event.insertedId}`)
      .expect(200)
      .then(({ body }) => {
        expect(body).toMatchObject({ collections: data });
      });
  });
  test("404: Should return status 404 for missing 'name' and 'img_url'", () => {
    return request(app).post("/api/collections").send({}).expect(404);
  });
  test("404: Should return status 404 for missing 'img_url'", () => {
    return request(app)
      .post("/api/collections")
      .send({
        name: "test",
      })
      .expect(404);
  });
  test("404: Should return status 404 for missing 'name'", () => {
    return request(app)
      .post("/api/collections")
      .send({
        image: "test",
      })
      .expect(404)
      .then((msg) => {
        expect(JSON.parse(msg.text)).toBe("Bad Request");
      });
  });
});

describe("POST /api/users/:user_id/inviteFriend", () => {
  test("201: Should return status 201 if successfully posted", () => {
    return request(app)
      .post("/api/users/00000020f51bb4362eee2a01/inviteFriend")
      .send({
        _id: '00000020f51bb4362eee2a05',
        username: "henry1234",
        img_url: "",
        topics: ["RPGs", "Tabletop"],
      })
      .expect(201)
      .then(({ body }) => {
        expect(body.acknowledged).toBe(true);
      });
  });
  test("201: Should return msg object with modifiedCount: 1 if successful", () => {
    return request(app)
      .post("/api/users/00000020f51bb4362eee2a01/inviteFriend")
      .send({
        _id: '00000020f51bb4362eee2a05',
        username: "henry1234",
        img_url: "",
        topics: ["RPGs", "Tabletop"],
      })
      .expect(201)
      .then(({ body }) => {
        expect(typeof body === "object").toBe(true);
        expect(body.modifiedCount === 1).toBe(true);
      });
  });
  test("201: Should be unable to friend request self and recieve message instead", () => {
    return request(app)
      .post("/api/users/00000020f51bb4362eee2a05/inviteFriend")
      .send({
        _id: '00000020f51bb4362eee2a05',
        username: "henry1234",
        img_url: "",
        topics: ["RPGs", "Tabletop"],
      })
      .expect(200)
      .then(({ body }) => {
        expect(typeof body === "object").toBe(true);
        expect(body.msg === "can not send friend request to self").toBe(true);
      });
  });
});

describe("200: GET /users with  queries", () => {
  test("200: GET /users?topics=Board+Games", () => {
    return request(app).get("/api/users?topics=Board+Games").expect(200);
  });
  test("200: should only return users with topic Board Games", () => {
    return request(app)
      .get("/api/users?topics=Board+Games")
      .expect(200)
      .then(({ body }) => {
        body.map((user) => {
          expect(user.topics.includes("Board Games")).toBe(true);
        });
      });
  });
});
describe("200: GET /users with  queries", () => {
  test("200: GET /users?topics=BoardGame", () => {
    return request(app).get("/api/users?topics=Board+Games").expect(200);
  });
  test("200: should only return users with topic Board Games", () => {
    return request(app)
      .get("/api/users?topics=Board+Games")
      .expect(200)
      .then(({ body }) => {
        body.map((user) => {
          expect(user.topics.includes("Board Games")).toBe(true);
        });
      });
  });
  test("200: GET should only return users with topic Card Games", () => {
    return request(app).get("/api/users?topics=Card+Games").expect(200);
  });
  test("200: should only return users with topic specified in query", () => {
    return request(app)
      .get("/api/users?topics=Card+Games")
      .expect(200)
      .then(({ body }) => {
        body.map((user) => {
          expect(user.topics.includes("Card Games")).toBe(true);
        });
      });
  });
  test("200: GET /users?sortBy=characterStats.level", () => {
    return request(app)
      .get("/api/users?sortBy=characterStats.level")
      .expect(200);
  });
  test("200: users array should be ordered by level", () => {
    return request(app)
      .get("/api/users?sortBy=characterStats.level")
      .expect(200)
      .then(({ body }) => {
        levelsOnly = body.map((user) => {
          return user.characterStats.level;
        });
        expect(levelsOnly).toBeSorted({ descending: true });
      });
  });
  test("200: users array should be ordered by experience", () => {
    return request(app)
      .get("/api/users?sortBy=characterStats.experience")
      .expect(200)
      .then(({ body }) => {
        expOnly = body.map((user) => {
          return user.characterStats.experience;
        });
        expect(expOnly).toBeSorted({ descending: true });
      });
  });
  test("200: users array should be ordered by experience to level up ascending", () => {
    return request(app)
      .get("/api/users?sortBy=characterStats.experienceToLevelUp&&orderBy=asc")
      .expect(200)
      .then(({ body }) => {
        expToLvlOnly = body.map((user) => {
          return user.characterStats.experienceToLevelUp;
        });
        expect(expToLvlOnly).toBeSorted({ ascending: true });
      });
  });
  test("200: users array should be ordered by alphabetical username ascending", () => {
    return request(app)
      .get("/api/users?sortBy=username&&orderBy=asc")
      .expect(200)
      .then(({ body }) => {
        usernamesOnly = body.map((user) => {
          return user.username;
        });
        expect(usernamesOnly).toBeSorted({ ascending: true });
      });
  });
  test("200: returns user array always containing Board Game topic ordered by alphabetical username ascending", () => {
    return request(app)
      .get("/api/users?topics=Board+Games&&sortBy=username&&orderBy=asc")
      .expect(200)
      .then(({ body }) => {
        const usernamesOnly = body.map((user) => {
          expect(user.topics.includes("Board Games")).toBe(true);
          return user.username;
        });
        expect(usernamesOnly).toBeSorted({ ascending: true });
      });
  });
});

describe("200: GET /users/user_id/myCreatures", () => {
  test("200: Return status 200 on successful get", () => {
    return request(app)
      .get("/api/users/00000020f51bb4362eee2a01/myCreatures")
      .expect(200);
  });
  test("200: should return users myCreatures array", () => {
    return request(app)
      .get("/api/users/00000020f51bb4362eee2a01/myCreatures")
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual(users[0].myCreatures);
      });
  });
});

describe("POST /api/users/:user_id/friends", () => {
  test("201: Should return status 201 if successfully posted", () => {
    return request(app)
      .post("/api/users/00000020f51bb4362eee2a01/friends")
      .send({
        user_id: "00000020f51bb4362eee2a01",
        sentFrom: "00000020f51bb4362eee2a06",
        isAccepted: true,
      })
      .expect(201);
  });
  test("201: Should remove id from from requests recieved when posted", async () => {
    const event = await request(app)
      .post("/api/users/00000020f51bb4362eee2a01/friends")
      .send({
        user_id: "00000020f51bb4362eee2a01",
        sentFrom: "00000020f51bb4362eee2a20",
        isAccepted: true,
      })
      .expect(201);
    return request(app)
      .get("/api/users/00000020f51bb4362eee2a01")
      .send({ userWhoRequested: adminCode })
      .then(({ body }) => {
        expect(body.user.friendRequestsReceived).toEqual([
          "00000020f51bb4362eee2a06",
          "00000020f51bb4362eee2a21",
          "00000020f51bb4362eee2a09",
          "00000020f51bb4362eee2a07",
        ]);
      });
  });
  test("201: only handles friend request from id inside friendRequestsReceived", async () => {
    const event = await request(app)
      .get("/api/users/00000020f51bb4362eee2a01")
      .send({ userWhoRequested: adminCode })
      .then(({ body }) => {
        expect(
          body.user.friendRequestsReceived.includes("00000020f51bb4362eee2a07")
        ).toBe(true);
      });
    await request(app)
      .post("/api/users/00000020f51bb4362eee2a01/friends")
      .send({
        user_id: "00000020f51bb4362eee2a01",
        sentFrom: "00000020f51bb4362eee2a07",
        isAccepted: true,
      })
      .expect(201);
    return request(app)
      .get("/api/users/00000020f51bb4362eee2a01")
      .send({ userWhoRequested: adminCode })
      .then(({ body }) => {
        expect(body.user.friendRequestsReceived).toEqual([
          "00000020f51bb4362eee2a06",
          "00000020f51bb4362eee2a20",
          "00000020f51bb4362eee2a21",
          "00000020f51bb4362eee2a09",
        ]);
      });
  });
  test("201: Should remove id from from requests sent when posted", async () => {
    const event = await request(app)
      .post("/api/users/00000020f51bb4362eee2a01/friends")
      .send({
        user_id: "00000020f51bb4362eee2a01",
        sentFrom: "00000020f51bb4362eee2a20",
        isAccepted: true,
      })
      .expect(201);
    return request(app)
      .get("/api/users/00000020f51bb4362eee2a20")
      .send({ userWhoRequested: adminCode })
      .then(({ body }) => {
        expect(body.user.friendRequestsSent).toEqual([]);
      });
  });
  test("201: Should add id to friends if isAccepted is posted", async () => {
    const event = await request(app)
      .post("/api/users/00000020f51bb4362eee2a01/friends")
      .send({
        user_id: "00000020f51bb4362eee2a01",
        sentFrom: "00000020f51bb4362eee2a20",
        isAccepted: true,
      })
      .expect(201);
    return request(app)
      .get("/api/users/00000020f51bb4362eee2a01")
      .send({ userWhoRequested: adminCode })
      .then(({ body }) => {
        expect(body.user.friends).toEqual([
          "00000020f51bb4362eee2a02",
          "00000020f51bb4362eee2a03",
          "00000020f51bb4362eee2a04",
          "00000020f51bb4362eee2a20",
        ]);
      });
  });
  test("201: Should add id to friends of sender if isAccepted is posted", async () => {
    const event = await request(app)
      .post("/api/users/00000020f51bb4362eee2a01/friends")
      .send({
        user_id: "00000020f51bb4362eee2a01",
        sentFrom: "00000020f51bb4362eee2a20",
        isAccepted: true,
      })
      .expect(201);
    return request(app)
      .get("/api/users/00000020f51bb4362eee2a20")
      .send({ userWhoRequested: adminCode })
      .then(({ body }) => {
        expect(body.user.friends).toEqual([
          "00000020f51bb4362eee2a03",
          "00000020f51bb4362eee2a01",
        ]);
      });
  });
});

describe("200: PATCH /api/events/:event_id", () => {
  test("200: should return 200 when successfully patched", () => {
    return request(app)
      .patch("/api/events/00000020f51bb4362eee2e02")
      .send({
        host_id: "00000020f51bb4362eee2a01",
        participants: ["00000020f51bb4362eee2a01", "00000020f51bb4362eee2a03"],
        duration: "2:00:00",
      })
      .expect(200);
  });
  test("200: should return that event is now set to completed", async () => {
    await request(app)
      .patch("/api/events/00000020f51bb4362eee2e02")
      .send({
        host_id: "00000020f51bb4362eee2a01",
        participants: ["00000020f51bb4362eee2a01", "00000020f51bb4362eee2a03"],
        winner: "00000020f51bb4362eee2a01",
        duration: "2:00:00",
      });

    return await request(app)
      .get("/api/events/00000020f51bb4362eee2e02")
      .expect(200)
      .then(({ body }) => {
        expect(body.event.isCompleted).toBe("true");
      });
  });
  test("200: testing that winner now has the creature that it could win", async () => {
    await request(app)
      .get("/api/users/00000020f51bb4362eee2a03")
      .send({ userWhoRequested: adminCode })
      .expect(200)
      .then(({ body }) => {
        expect(body.user.myCreatures).toEqual([
          {
            _id: "00000020f61bb4362eee2c01",
            name: "grass",
            image: "https://publicdomainvectors.org/photos/Biteme.png",
          },
          {
            _id: "00000020f61bb4362eee2c02",
            name: "water",
            image:
              "https://publicdomainvectors.org/photos/Thuy-Quai-Vuong.png",
          },
        ]);
      });

    await request(app)
      .patch("/api/events/00000020f51bb4362eee2e02")
      .send({
        host_id: "00000020f51bb4362eee2a01",
        participants: ["00000020f51bb4362eee2a01", "00000020f51bb4362eee2a03"],
        winner: "00000020f51bb4362eee2a03",
        duration: "2:00:00",
      });

    return request(app)
      .get("/api/users/00000020f51bb4362eee2a03")
      .send({ userWhoRequested: adminCode })
      .expect(200)
      .then(({ body }) => {
        expect(body.user.myCreatures).toEqual([
          {
            _id: "00000020f61bb4362eee2c01",
            name: "grass",
            image: "https://publicdomainvectors.org/photos/Biteme.png",
          },
          {
            _id: "00000020f61bb4362eee2c02",
            name: "water",
            image:
              "https://publicdomainvectors.org/photos/Thuy-Quai-Vuong.png",
          },
          {
            _id: "00000020f61bb4362eee2c02",
            name: "water",
            image:
              "https://publicdomainvectors.org/photos/Thuy-Quai-Vuong.png",
          },
        ]);
      });
  });
  test("200: testing that the participant gets the exp", async () => {
    await request(app)
      .get("/api/users/00000020f51bb4362eee2a03")
      .send({ userWhoRequested: adminCode })
      .expect(200)
      .then(({ body }) => {
        expect(body.user.characterStats).toEqual({
          name: "Character3",
          level: "6",
          experience: "19",
          experienceToLevelUp: "60",
        });
      });

    await request(app)
      .patch("/api/events/00000020f51bb4362eee2e02")
      .send({
        host_id: "00000020f51bb4362eee2a01",
        participants: ["00000020f51bb4362eee2a01", "00000020f51bb4362eee2a03"],
        winner: "00000020f51bb4362eee2a03",
        duration: "2:00:00",
      });

    return request(app)
      .get("/api/users/00000020f51bb4362eee2a03")
      .send({ userWhoRequested: adminCode })
      .expect(200)
      .then(({ body }) => {
        expect(body.user.characterStats).toEqual({
          name: "Character3",
          level: "7",
          experience: "9",
          experienceToLevelUp: "70",
        });
      });
  });
  test("200: testing that the host gets the exp", async () => {
    await request(app)
      .get("/api/users/00000020f51bb4362eee2a01")
      .send({ userWhoRequested: adminCode })
      .expect(200)
      .then(({ body }) => {
        expect(body.user.characterStats).toEqual({
          name: "Character1",
          level: "7",
          experience: "29",
          experienceToLevelUp: "70",
        });
      });

    await request(app)
      .patch("/api/events/00000020f51bb4362eee2e02")
      .send({
        host_id: "00000020f51bb4362eee2a01",
        participants: ["00000020f51bb4362eee2a01", "00000020f51bb4362eee2a03"],
        winner: "00000020f51bb4362eee2a03",
        duration: "2:00:00",
      });

    return request(app)
      .get("/api/users/00000020f51bb4362eee2a01")
      .send({ userWhoRequested: adminCode })
      .expect(200)
      .then(({ body }) => {
        expect(body.user.characterStats).toEqual({
          name: "Character1",
          level: "8",
          experience: "34",
          experienceToLevelUp: "80",
        });
      });
  });
});

describe("201: POST /api/events/:event_id/watchList", () => {
  test("201: returns 201 when successful", () => {
     return request(app)
       .post("/api/events/00000020f51bb4362eee2e02/watchList")
       .send({
         user_id: '00000020f51bb4362eee2a01'
       })
       .expect(201);
  })
  test("201: returns modifiedCount of 1 when updated user watchList", async () => {
    await request(app)
      .post("/api/events/00000020f51bb4362eee2e03/watchList")
      .send({
        user_id: "00000020f51bb4362eee2a01",
      })
      .expect(201)

    return request(app)
      .get("/api/users/00000020f51bb4362eee2a01")
      .send({ userWhoRequested: "00000020f51bb4362eee2a02" })
      .then(({ body }) => {
        expect(body.user.watchList.includes("00000020f51bb4362eee2e03")).toBe(true);
      });
  });
  test("201: removes event_id from user watchList if already there", async () => {
    await request(app)
      .post("/api/events/00000020f51bb4362eee2e04/watchList")
      .send({
        user_id: "00000020f51bb4362eee2a01",
      })
      .expect(201);

    return request(app)
      .get("/api/users/00000020f51bb4362eee2a01")
      .send({ userWhoRequested: "00000020f51bb4362eee2a02" })
      .then(({ body }) => {
         expect(!body.user.watchList.includes("00000020f51bb4362eee2e04")).toBe(true);
      });
  });
  test("400: returns bad request if event_id is invalid", async () => {
    await request(app)
      .post("/api/events/banana/watchList")
      .send({
        user_id: "00000020f51bb4362eee2a01",
      })
      .expect(400)
    
  })
  test("400: returns bad request if user_id is invalid", async () => {
    await request(app)
      .post("/api/events/00000020f51bb4362eee2e04/watchList")
      .send({
        user_id: "banana",
      })
      .expect(400)
  })
  test("404: returns not found if user_id does not exist", async () => {
    await request(app)
      .post("/api/events/00000020f51bb4362eee2e04/watchList")
      .send({
        user_id: "00000020f51bb4362eee2a99",
      })
      .expect(404)
  })
  test("404: returns not found if event_id does not exist", async () => {
    await request(app)
      .post("/api/events/00000020f51bb4362aaa2e99/watchList")
      .send({
        user_id: "00000020f51bb4362eee2a01",
      })
    .expect(404)
      .then(({ body }) => {
    })
  })
})