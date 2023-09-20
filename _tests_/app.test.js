//IMPORTS

const { app, server } = require("../app")
const db = require("../connection");
const request = require("supertest");
const endpointsJSON = require("../endpoints.json")
const { testSeed, closeConnection } = require("../seed")
const { users } = require("./Data/Users")
const { events } = require("./Data/Events")
const { collections } = require("./Data/Collections")

beforeEach(async () => {
  await testSeed({ users, events, collections });
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

describe("PATCH /api/users/characterStats/:user_id", () => {
  test("200: Should return status 200 if successfully accessed", () => {
    return request(app).patch("/api/users/characterStats/1").send({exp: 80}).expect(200);
  });

  test("200: Should update the characterStats.level of the user", async () => {
    await request(app).patch("/api/users/characterStats/1").send({exp: 80})
    return await request(app).get("/api/users/1").expect(200)
    .then(({body}) => {
      expect(body[0].characterStats.level).toBe("8")
    })
  });
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
  test("200: Should return status 200 if successfully accessed", async () => {
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

describe("GET /api/events", () => {
  test("200: Should return status 200 if successfully accessed", () => {
    return request(app).get("/api/events").expect(200);
  });
  test("200: Should return an object if successfully accessed", () => {
    return request(app)
      .get("/api/events")
      .then(({ body }) => {
        let onlyGameNotFullEvents = [...events]
        onlyGameNotFullEvents = onlyGameNotFullEvents.sort(function (a, b) {
          return new Date(a.dateTime) - new Date(b.dateTime)
        })
        expect(body).toMatchObject(onlyGameNotFullEvents)
      });
  });
  test("200: Should return an object if successfully accessed", () => {
    return request(app)
      .get("/api/events?isGameFull=false")
      .then(({ body }) => {
        let onlyGameNotFullEvents = [...events]
        onlyGameNotFullEvents = onlyGameNotFullEvents.filter((event) => event.isGameFull === "false")
        onlyGameNotFullEvents = onlyGameNotFullEvents.sort(function (a, b) {
          return new Date(a.dateTime) - new Date(b.dateTime)
        })
        expect(body).toMatchObject(onlyGameNotFullEvents)
      });
  });
  test("200: Should return an object if successfully accessed", () => {
    return request(app)
      .get("/api/events?gameType=Board Games")
      .then(({ body }) => {
        let onlyGameNotFullEvents = [...events]
        onlyGameNotFullEvents = onlyGameNotFullEvents.filter((event) => event.gameType === "Board Games")
        onlyGameNotFullEvents = onlyGameNotFullEvents.sort(function (a, b) {
          return new Date(a.dateTime) - new Date(b.dateTime)
        })
        expect(body).toMatchObject(onlyGameNotFullEvents)
      });
  });
  test("200: Should return an object if successfully accessed", () => {
    return request(app)
      .get("/api/events?gameType=Card Games")
      .then(({ body }) => {
        let onlyGameNotFullEvents = [...events]
        onlyGameNotFullEvents = onlyGameNotFullEvents.filter((event) => event.gameType === "Card Games")
        onlyGameNotFullEvents = onlyGameNotFullEvents.sort(function (a, b) {
          return new Date(a.dateTime) - new Date(b.dateTime)
        })
        expect(body).toMatchObject(onlyGameNotFullEvents)
      });
  });
  test("200: Should return an object if successfully accessed", () => {
    return request(app)
      .get("/api/events?sortBy=dateTime&order=1")
      .then(({ body }) => {
        let onlyGameNotFullEvents = [...events]
        onlyGameNotFullEvents = onlyGameNotFullEvents.sort(function (a, b) {
          return new Date(a.dateTime) - new Date(b.dateTime)
        })
        expect(body).toMatchObject(onlyGameNotFullEvents)
      });
  });
  test("200: Should return an object if successfully accessed", () => {
    return request(app)
      .get("/api/events?sortBy=dateTime&order=-1")
      .then(({ body }) => {
        let onlyGameNotFullEvents = [...events]
        onlyGameNotFullEvents = onlyGameNotFullEvents.sort(function (a, b) {
          return new Date(b.dateTime) - new Date(a.dateTime)
        })
        expect(body).toMatchObject(onlyGameNotFullEvents)
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
  test("200: Should return status 200 if successfully accessed", async () => {
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

describe("GET /api/collections", () => {
  test("200: Should return status 200 if successfully accessed", () => {
    return request(app).get("/api/collections").expect(200);
  });
  test("200: Should return an object if successfully accessed", () => {
    return request(app)
      .get("/api/collections")
      .then(({ body }) => {
        expect(body).toMatchObject(collections)
      });
  });
});

describe("GET /api/collections/:collection_id", () => {
  test("200: Should return status 200 if successfully accessed", () => {
    return request(app).get("/api/collections/1").expect(200);
  });
  test("200: Should return an object if successfully accessed", () => {
    return request(app)
      .get("/api/collections/1")
      .then(({ body }) => {
        expect(body).toMatchObject([collections[0]])
      });
  });
});


describe("POST /api/collections", () => {
  test("200: Should return status 200 if successfully accessed", () => {
    return request(app).post("/api/collections").send({
      name: "Rock",
      img_url: 'https://example.com/event2.jpg'
    }).expect(200)
      .then(({ body }) => {
        expect(body.acknowledged).toBe(true)
      })
  });
  test("200: Should return status 200 if successfully accessed", async () => {
    const data = {
      name: "Rock",
      img_url: 'https://example.com/event2.jpg'
    }

    const event = (await request(app).post("/api/collections").send(data)).body
    expect(event.acknowledged).toBe(true)
    return await request(app).get(`/api/collections/${event.insertedId}`).expect(200)
      .then((response) => {
        expect(response.body).toMatchObject([data])
      })
  });
});

describe("POST /api/users/:user_id", () => {
  test("201: Should return status 201 if successfully posted", () => {
    return request(app)
      .post("/api/users/1")
      .send({
        _id: 5,
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
        .post("/api/users/1")
        .send({
          _id: 5,
          username: "henry1234",
          img_url: "",
          topics: ["RPGs", "Tabletop"],
        })
        .expect(201)
        .then(({body}) => {
          expect(typeof body === "object").toBe(true);
          expect(body.modifiedCount === 1).toBe(true);
        });
    });
    test("201: Should be unable to friend request self and recieve message instead", () => {
      return request(app)
        .post("/api/users/5")
        .send({
          _id: 5,
          username: "henry1234",
          img_url: "",
          topics: ["RPGs", "Tabletop"],
        })
        .expect(200)
        .then(({body}) => {
          expect(typeof body === "object").toBe(true);
          expect(body.msg === "can not send friend request to self").toBe(true);
        });
    });
})



describe
  ("200: GET /users with  queries", () => {
    test("200: GET /users?topics=BoardGame", () => {
      return request(app).get("/api/users?topics=BoardGames").expect(200);
    });
    test("200: should only return users with topic specified in query", () => {
      return request(app)
        .get("/api/users?topics=BoardGames")
        .expect(200)
        .then(({ body }) => {
          body.map((user) => {
            expect(user.topics.includes("Board Games")).toBe(true);
          });
        });
    });
    test("200: GET /users?topics=CardGames", () => {
      return request(app).get("/api/users?topics=CardGames").expect(200);
    });
    test("200: should only return users with topic specified in query", () => {
      return request(app)
        .get("/api/users?topics=CardGames")
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
    test("200: should return all users", () => {
      return request(app)
        .get("/api/users?sortBy=characterStats.level")
        .expect(200)
        .then(({ body }) => {
          expect(body.length).toBe(users.length);
        });
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
        .get(
          "/api/users?sortBy=characterStats.experienceToLevelUp&&orderBy=asc"
        )
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
        .get("/api/users?topic=BoardGame&&sortBy=username&&orderBy=asc")
        .expect(200)
        .then(({ body }) => {
          usernamesOnly = body.map((user) => {
            expect(user.topics.includes("Board Games")).toBe(true);
            return user.username});
          expect(usernamesOnly).toBeSorted({ ascending: true });
        });
    });
  })


  //some tests false positive due to missing topics key in Users data (on other branch)


