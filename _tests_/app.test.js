//IMPORTS

const { app, server } = require("../app")
const db = require("../connection");
const request = require("supertest");
const endpointsJSON = require("../endpoints.json")
const { testSeed, closeConnection } = require("../seed")
const { users } = require("./Data/Users")
const { events } = require("./Data/Events")
const { collections } = require("./Data/Collections")
const adminCode  = require("../AdminCode")

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
    return request(app).get("/api/users/1").send({userWhoRequested:"2"}).expect(200);
  });
  test('200: Should return 200', () => {
    return request(app).get("/api/users/5").send({userWhoRequested:"2"}).expect(200)
    .then(({body}) => {
      expect(body).toEqual([users[4]])
    })
  });
  test('404 : user exists but it returns User not found when user is blocked',() => {
    return request(app).get("/api/users/3").send({userWhoRequested:"2"}).expect(404)
    .then((msg) => {
      expect(JSON.parse(msg.text)).toBe("User not found")
    })
  });
  test('404 : user with that id does not exist',() => {
    return request(app).get("/api/users/100").send({userWhoRequested:"2"}).expect(404)
    .then((msg) => {
      expect(JSON.parse(msg.text)).toBe("User not found")
    })
  });
  test('400 : missing userWhoRequested',() => {
    return request(app).get("/api/users/1").expect(400)
    .then((msg) => {
      expect(JSON.parse(msg.text)).toBe("Bad Request")
    })
  });
});


describe("POST /api/users", () => {
  test("200: Should return status 200 if successfully accessed", () => {
    return request(app).post("/api/users").send({
      "name": "Jamie",
      "username": "jamie1234",
      "email": "jamie@gmail.com",
      "img_url": "",
      "characterName" : "Bomb"
    }).expect(200)
  });
  test("200: Should return status 200 if successfully accessed", async () => {
    const data = {
      "name": "newUser",
      "username": "newUser1234",
      "email": "newUser@gmail.com",
      "img_url": "",
      "characterName" : "Bam"
    }

    const event = (await request(app).post("/api/users").send(data)).body
    expect(event.acknowledged).toBe(true)

    data.characterStats = [{name:"Bam", level:"1", experience:"0", experienceToLevelup:"10"}]
    delete data.characterName

    return request(app).get(`/api/users/${event.insertedId}`).send({userWhoRequested: adminCode})
      .then((response) => {
        expect(response.body).toMatchObject([data])
      })
  });
  test("404: missing characterName", () => {
    const data = {
      "name": "newUser",
      "username": "newUser1234",
      "email": "newUser@gmail.com",
      "img_url": ""
    }

    return request(app).post("/api/users").send(data).expect(404)
    .then((msg) => {
      expect(JSON.parse(msg.text)).toBe("Bad Request")
    })
  });
  test("404: missing img_url", () => {
    const data = {
      "name": "newUser",
      "username": "newUser1234",
      "email": "newUser@gmail.com",
      "characterName" : "Bam"
    }

    return request(app).post("/api/users").send(data).expect(404)
    .then((msg) => {
      expect(JSON.parse(msg.text)).toBe("Bad Request")
    })
  });
  test("404: missing email", () => {
    const data = {
      "name": "newUser",
      "username": "newUser1234",
      "img_url": "",
      "characterName" : "Bam"
    }

    return request(app).post("/api/users").send(data).expect(404)
    .then((msg) => {
      expect(JSON.parse(msg.text)).toBe("Bad Request")
    })
  });
  test("404: missing username", () => {
    const data = {
      "name": "newUser",
      "email": "newUser@gmail.com",
      "img_url": "",
      "characterName" : "Bam"
    }

    return request(app).post("/api/users").send(data).expect(404)
    .then((msg) => {
      expect(JSON.parse(msg.text)).toBe("Bad Request")
    })
  });
  test("404: missing name", () => {
    const data = {
      "username": "newUser1234",
      "email": "newUser@gmail.com",
      "img_url": "",
      "characterName" : "Bam"
    }

    return request(app).post("/api/users").send(data).expect(404)
    .then((msg) => {
      expect(JSON.parse(msg.text)).toBe("Bad Request")
    })
  });
});

describe("PATCH /api/users/characterStats/:user_id", () => {
  test("200: Should return status 200 if successfully accessed", () => {
    return request(app).patch("/api/users/characterStats/1").send({ exp: 80 }).expect(200);
  });

  test("200: Should update the characterStats.level of the user", async () => {
    await request(app).patch("/api/users/characterStats/1").send({ exp: 80 })

    return await request(app).get("/api/users/1").send({userWhoRequested: adminCode}).expect(200)
      .then(({ body }) => {
        expect(body[0].characterStats.level).toBe("8")
      })
  });
  test("200: Should update the characterStats.level of the user", async () => {
    await request(app).patch("/api/users/characterStats/2").send({ exp: 40})
    return await request(app).get("/api/users/2").send({userWhoRequested: adminCode}).expect(200)
      .then(({ body }) => {
        expect(body[0].characterStats.level).toBe("6")
      })
  });
  test("200: Should update the characterStats.level of the user", async () => {
    await request(app).patch("/api/users/characterStats/2").send({ exp: 100})
    return await request(app).get("/api/users/2").send({userWhoRequested: adminCode}).expect(200)
      .then(({ body }) => {
        expect(body[0].characterStats.level).toBe("7")
      })
  });
  test("200: Should update the characterStats.level of the user", async () => {
    return request(app).patch("/api/users/characterStats/100").send({ exp: 100}).expect(400)
  });
  test("404: Should update the characterStats.level of the user", () => {
    return request(app).patch("/api/users/characterStats/1").expect(400)
    .then((msg) => {
      expect(JSON.parse(msg.text)).toBe("Missing exp")
    })
  });
  test("404: Should update the characterStats.level of the user", () => {
    return request(app).patch("/api/users/characterStats/1").send({ exp: "abanana" }).expect(404)
    .then((msg) => {
      expect(JSON.parse(msg.text)).toBe("Bad Request")
    })
  });
  test("404: Should update the characterStats.level of the user", () => {
    return request(app).patch("/api/users/characterStats/100").send({ exp: "100" }).expect(400)
    .then((msg) => {
      expect(JSON.parse(msg.text)).toBe("User not found")
    })
  });
});








describe("GET /api/events", () => {
  test("200: Should return status 200 if successfully accessed", () => {
    return request(app).get("/api/events").expect(200);
  });
  test("200: Should return an object if successfully accessed", () => {
    return request(app)
      .get("/api/events").expect(200)
      .then(({ body }) => {
        let onlyGameNotFullEvents = [...events]
        onlyGameNotFullEvents = onlyGameNotFullEvents
        .filter((event) => event.completed === "false")
        onlyGameNotFullEvents = onlyGameNotFullEvents.sort(function (a, b) {
          return new Date(a.dateTime) - new Date(b.dateTime)
        })
        expect(body).toMatchObject(onlyGameNotFullEvents)
      });
  });
  test("200: Should return an object if successfully accessed", () => {
    return request(app)
      .get("/api/events?isGameFull=false").expect(200)
      .then(({ body }) => {
        let onlyGameNotFullEvents = [...events]
        onlyGameNotFullEvents = onlyGameNotFullEvents
        .filter((event) => event.completed === "false")
        onlyGameNotFullEvents = onlyGameNotFullEvents.filter((event) => event.isGameFull === "false")
        onlyGameNotFullEvents = onlyGameNotFullEvents.sort(function (a, b) {
          return new Date(a.dateTime) - new Date(b.dateTime)
        })
        expect(body).toMatchObject(onlyGameNotFullEvents)
      });
  });
  test("200: Should return an object if successfully accessed", () => {
    return request(app)
      .get("/api/events?gameType=Board Games").expect(200)
      .then(({ body }) => {
        let onlyGameNotFullEvents = [...events]
        onlyGameNotFullEvents = onlyGameNotFullEvents
        .filter((event) => event.completed === "false")
        onlyGameNotFullEvents = onlyGameNotFullEvents.filter((event) => event.gameType === "Board Games")
        onlyGameNotFullEvents = onlyGameNotFullEvents.sort(function (a, b) {
          return new Date(a.dateTime) - new Date(b.dateTime)
        })
        expect(body).toMatchObject(onlyGameNotFullEvents)
      });
  });
  test("200: Should return an object if successfully accessed", () => {
    return request(app)
      .get("/api/events?gameType=Card Games").expect(200)
      .then(({ body }) => {
        let onlyGameNotFullEvents = [...events]
        onlyGameNotFullEvents = onlyGameNotFullEvents
        .filter((event) => event.completed === "false")
        onlyGameNotFullEvents = onlyGameNotFullEvents.filter((event) => event.gameType === "Card Games")
        onlyGameNotFullEvents = onlyGameNotFullEvents.sort(function (a, b) {
          return new Date(a.dateTime) - new Date(b.dateTime)
        })
        expect(body).toMatchObject(onlyGameNotFullEvents)
      });
  });
  test("200: Should return an object if successfully accessed", () => {
    return request(app)
      .get("/api/events?sortBy=dateTime&order=1").expect(200)
      .then(({ body }) => {
        let onlyGameNotFullEvents = [...events]
        onlyGameNotFullEvents = onlyGameNotFullEvents
        .filter((event) => event.completed === "false")
        onlyGameNotFullEvents = onlyGameNotFullEvents.sort(function (a, b) {
          return new Date(a.dateTime) - new Date(b.dateTime)
        })
        expect(body).toMatchObject(onlyGameNotFullEvents)
      });
  });
  test("200: Should return an object if successfully accessed", () => {
    return request(app)
      .get("/api/events?sortBy=dateTime&order=-1").expect(200)
      .then(({ body }) => {
        let onlyGameNotFullEvents = [...events]
        onlyGameNotFullEvents = onlyGameNotFullEvents
        .filter((event) => event.completed === "false")
        onlyGameNotFullEvents = onlyGameNotFullEvents.sort(function (a, b) {
          return new Date(b.dateTime) - new Date(a.dateTime)
        })
        expect(body).toMatchObject(onlyGameNotFullEvents)
      });
  });
  test("400: invalid order", () => {
    return request(app)
      .get("/api/events?sortBy=dateTime&order=banana").expect(400)
      .then((msg) => {
        expect(JSON.parse(msg.text)).toBe("Bad Request")
      });
  });
  test("400: invalid isGameFull", () => {
    return request(app)
      .get("/api/events?isGameFull=banana&sortBy=dateTime").expect(400)
      .then((msg) => {
        expect(JSON.parse(msg.text)).toBe("Bad Request")
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
      dateTime: '2023-09-21 19:30:00',
      duration: '2:00:00',
      capacity: 6,
      participants: ["1", "3"],
      requestedToParticipate: [],
      collection_id: "1"
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
      dateTime: '2023-09-21 19:30:00',
      duration: '2:00:00',
      capacity: "6",
      collection_id: "1"
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
  test("200: Should return an object if successfully accessed", () => {
    return request(app)
      .get("/api/collections/tree")
      .then(({ body }) => {
        expect(body).toMatchObject([collections[3]])
      });
  });
  test("400: Not found", () => {
    return request(app)
      .get("/api/collections/banana")
      .expect(400)
  });
  test("400: Not found", () => {
    return request(app)
      .get("/api/collections/100")
      .expect(400)
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
  test("404: Missing name and img_url", () => {
    return request(app).post("/api/collections").send({}).expect(404)
  });
  test("404: Missing img_url", () => {
    return request(app).post("/api/collections").send({
      name : "test"
    }).expect(404)
  });
  test("404: Missing name", () => {
    return request(app).post("/api/collections").send({
      img_url : "test"
    }).expect(404)
    .then((msg) => {
      expect(JSON.parse(msg.text)).toBe("Bad Request")
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
  })
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
        .then(({ body }) => {
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
        .then(({ body }) => {
          expect(typeof body === "object").toBe(true);
          expect(body.msg === "can not send friend request to self").toBe(true);
        });
    });
})   
  
describe("200: GET /users with  queries", () => {
  test("200: GET /users?topics=Board+Games", () => {
    return request(app).get("/api/users?topics=Board+Games").expect(200);
  })
  test("200: should only return users with topic specified in query", () => {
    return request(app).get("/api/users?topics=Board+Games")
      .expect(200)
      .then(({ body }) => {
        body.map((user) => {
          expect(user.topics.includes('Board Games')).toBe(true)
        })
      })
  })
})
describe("200: GET /users with  queries", () => {
    test("200: GET /users?topics=BoardGame", () => {
      return request(app).get("/api/users?topics=Board+Games").expect(200);
    });
    test("200: should only return users with topic specified in query", () => {
      return request(app)
        .get("/api/users?topics=Board+Games")
        .expect(200)
        .then(({ body }) => {
          body.map((user) => {
            expect(user.topics.includes("Board Games")).toBe(true);
          });
        });
    });
    test("200: GET /users?topics=CardGames", () => {
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
        .get("/api/users?topics=Board+Games&&sortBy=username&&orderBy=asc")
        .expect(200)
        .then(({ body }) => {
          const usernamesOnly = body.map((user) => {
            expect(user.topics.includes("Board Games")).toBe(true);
            return user.username});
          expect(usernamesOnly).toBeSorted({ ascending: true });
        });
    });   
  }) 
  
describe.only
  ("200: GET /users/user_id/myCreatures", () => {
    test("200: Return status 200 on successful get", () => {
      return request(app).get("/api/users/1/myCreatures").expect(200);
    });
    test("200: should return users myCreatures array", () => {
      return request(app)
        .get("/api/users/1/myCreatures")
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual(users[0].myCreatures);
        });
    })
  })

describe("200: PATCH /api/events/:event_id", () => {
  test("200: should return 200 when successfully patched", () => {
    return request(app).patch("/api/events/2").expect(200);
  });
  test("200: should return acknowledgement upon successful patch", async ()=>{
    await request(app).patch("/api/events/2")
    return await request(app)
      .get("/api/events/2")
      .expect(200)
      .then(({ body }) => {
        expect(body[0].isCompleted).toBe("true");
      });
  });
});