const express = require("express");
const app = express();
const cors = require('cors');

const {returnAllUsers, returnUser, returnMultipleUsers, postNewUser, patchCharacterStats, postFriendRequest, getOwnedCollections, blockUser, handleFriendReq} = require('./controllers/users.controller')
const {returnAllEvents, returnEvent, postNewEvent, patchCompletedStatus} = require("./controllers/events.controller");
const {returnAllCollections, returnCollection, postNewCollection} = require('./controllers/collections.controller')

app.use(cors());

app.use(express.json());

app.get("/api/users", returnAllUsers)
app.get("/api/users/:user_id", returnUser)
app.get("/api/manyusers", returnMultipleUsers)
app.post("/api/users", postNewUser)
app.patch("/api/users/characterStats/:user_id", patchCharacterStats)
app.post("/api/users/:user_id/friends", handleFriendReq);
app.post("/api/users/:user_id/inviteFriend", postFriendRequest);
app.get("/api/users/:user_id/myCreatures", getOwnedCollections)
app.patch("/api/users/block/:user_id", blockUser)


app.get("/api/events", returnAllEvents)
app.get("/api/events/:event_id", returnEvent)
app.post("/api/events", postNewEvent)
app.patch("/api/events/:event_id", patchCompletedStatus);

app.get("/api/collections", returnAllCollections)
app.get("/api/collections/:collection_id", returnCollection)
app.post("/api/collections", postNewCollection)

app.use((err, req, res, next) => {
  res.status(500).send({ msg: err });
});

module.exports = { app }