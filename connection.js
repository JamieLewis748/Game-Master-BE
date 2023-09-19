const { MongoClient } = require("mongodb");
const {password} = require("./db_password")
const uri =

  `mongodb+srv://emm__:${password}@cluster0.pfbhecj.mongodb.net`;

const client = new MongoClient(uri);
exports.dbConnection = (req, res) => {
  return client.connect().then(() => {
    return client.db();
  });
};

// you will need to create your own db_password.js function
// make and export a function that just returns the password provided seperate to the repo
// if you do not call the file db_password then ensure it is still added to .git.ignore
// you will still need to connect to the db with mongoDB extention or in terminal to get up and running