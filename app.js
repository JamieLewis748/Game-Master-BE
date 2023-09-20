const express = require("express");
const app = express();

const { returnAllUsers, returnUser, postNewUser, patchCharacterStats, postFriendRequest, handleFriendReq} = require("./controllers/users.controller");
const { returnAllEvents, returnEvent, postNewEvent } = require('./controllers/events.controller');
const { returnAllCollections, returnCollection, postNewCollection } = require('./controllers/collections.controller');

const server = app.listen(9095, () => console.log("App listening on port 9095!"));
app.use(express.json());

app.get("/api/users", returnAllUsers)
app.get("/api/users/:user_id", returnUser)
app.post("/api/users", postNewUser)
app.patch("/api/users/characterStats/:user_id", patchCharacterStats)
app.post("/api/users/:user_id", handleFriendReq);

app.get("/api/events", returnAllEvents)
app.get("/api/events/:event_id", returnEvent)
app.post("/api/events", postNewEvent)
app.post("/api/users/:user_id", postFriendRequest)

app.get("/api/collections", returnAllCollections)
app.get("/api/collections/:collection_id", returnCollection)
app.post("/api/collections", postNewCollection)

app.use((err, req, res, next) => {
  res.status(500).send({ msg: err });
});

module.exports = {app, server};