const { MongoClient } = require("mongodb");
const { password } = require("./db_password")
const { Pool } = require("pg");


const ENV = process.env.NODE_ENV || "test";
require("dotenv").config({ path: `${__dirname}/.env.${ENV}` });


let uri
if (ENV === "test"){
   console.log("🚀 ~ file: connection.js:12 ~ ENV:", ENV)
   uri = `mongodb+srv://emm__:${password}@cluster0.pfbhecj.mongodb.net`
}  

else if (ENV === "live") {
  console.log("🚀 ~ file: connection.js:16 ~ ENV:", ENV)
  uri = `mongodb+srv://Emm:k89J6N7JN522M3Q3@cluster0.pdcei6g.mongodb.net/`;
}

if (!process.env.PGDATABASE) {
  throw new Error("PGDATABASE not set");
}


const client = new MongoClient(uri);
console.log("🚀 ~ file: connection.js:27 ~ uri:", uri)


const dbConnection = (req, res) => {
  return client.connect()
    .then(() => {
      return client.db()
    })
  
};

dbConnection()

module.exports = new Pool();
module.exports = ENV;
module.exports = {client};