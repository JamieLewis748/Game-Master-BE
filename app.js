const express = require("express");
const app = express();

app.listen(9090, () => console.log("App listening on port 9090!"));
app.use(express.json());

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: err });
});

module.exports = app;