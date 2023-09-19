const express = require("express");
const app = express();
const {returnAllUsers, returnUser, postNewUser} = require('./controllers/users.controller')
const { returnAllEvents, returnEvent, postNewEvent } = require('./controllers/events.controller')
const {returnAllCollections, returnCollection, postNewCollection} = require('./controllers/collections.controller')

const server = app.listen(9090, () => console.log("App listening on port 9090!"));
app.use(express.json());

app.get("/api/users", returnAllUsers)
app.get("/api/users/:user_id", returnUser)
app.post("/api/users", postNewUser)

app.get("/api/events", returnAllEvents)
app.get("/api/events/:event_id", returnEvent)
app.post("/api/events", postNewEvent)

app.get("/api/collections", returnAllCollections)
app.get("/api/collections/:collection_id", returnCollection)
app.post("/api/collections", postNewCollection)

app.use((err, req, res, next) => {
  res.status(500).send({ msg: err });
});

module.exports = {app, server};