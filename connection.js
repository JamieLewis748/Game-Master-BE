const { MongoClient } = require("mongodb");
const uri =
    
    //CHANGE LINK
    
  "mongodb+srv://jamielewis:northcoders@cluster0.phstpyz.mongodb.net/";

const client = new MongoClient(uri);
exports.dbConnection = (req, res) => {
  return client.connect().then(() => {
    return client.db();
  });
};
