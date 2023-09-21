const {app} = require("./app")

const server = app.listen(9095, () =>
  console.log("App listening on port 9095!")
);

module.exports = {server};