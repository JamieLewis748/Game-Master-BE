const express = require("express");
const app = express();

app.listen(9090, () => console.log("App listening on port 9090!"));
app.use(express.json());

app.get("/", (req, res) => {
  res.send(200)
})

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: err });
});

module.exports = app;