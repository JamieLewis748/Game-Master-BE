const express = require("express");
const app = express();
const returnAllUsers = require('./controllers/users.controller')
const { returnAllEvents, returnEvent } = require('./controllers/events.controller')

const server = app.listen(9090, () => console.log("App listening on port 9090!"));
app.use(express.json());

app.get("/api/users", returnAllUsers)

app.get("/api/events", returnAllEvents)
app.get("/api/events/:event_id", returnEvent)

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: err });
});

module.exports = {app, server};