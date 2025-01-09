const {app} = require("./app")

const ENV = process.env.NODE_ENV || "test"; 
if (ENV === "test") {
  const server = app.listen(9095, () =>
    console.log("App listening on port 9095!")
  );
}

module.exports = {server};