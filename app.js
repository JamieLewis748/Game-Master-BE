const express = require("express");
const app = express();
const {returnAllUsers, returnUser, postNewUser, patchCharacterStats} = require('./controllers/users.controller')
const { returnAllEvents, returnEvent, postNewEvent } = require('./controllers/events.controller')

const server = app.listen(9090, () => console.log("App listening on port 9090!"));
app.use(express.json());

app.get("/api/users", returnAllUsers)
app.get("/api/users/:user_id", returnUser)
app.post("/api/users", postNewUser)
app.patch("/api/users/characterStats/:user_id", patchCharacterStats)

app.get("/api/events", returnAllEvents)
app.get("/api/events/:event_id", returnEvent)
app.post("/api/events", postNewEvent)

app.use((err, req, res, next) => {
  res.status(500).send({ msg: err });
});

module.exports = {app, server};