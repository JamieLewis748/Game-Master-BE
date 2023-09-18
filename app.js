const express = require("express");
const app = express();
const { getEndpoints } = require("./controllers/getEndpoints-controller");
const { getUsers } = require("./controllers/getAllUsers-controller");

const server = app.listen(9094, () => console.log("App listening on port 9090!"));

app.use(express.json());

app.get("/api", getEndpoints);
app.get("/api/users", getUsers);

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: err });
});

module.exports = {app, server};