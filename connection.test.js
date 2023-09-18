const { MongoClient } = require("mongodb");
const { password } = require("./db_password");
const uri = `mongodb://localhost:27017/game-master-testdb`;

const client = new MongoClient(uri);
exports.dbTestConnection = (req, res) => {
  return client.connect().then(() => {
    return client.db();
  });
};

