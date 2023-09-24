const { MongoClient } = require("mongodb");
const { password } = require("./db_password")

const uri =
    
    `mongodb+srv://emm__:${password}@cluster0.pfbhecj.mongodb.net`;

const client = new MongoClient(uri);
const dbConnection = (req, res) => {
  return client.connect()
};

const closeConnection = (req, res) => {
    return client.close()
}

const testSeed = (data) => {
    const db = client.db('game-master-test')
    return dbConnection()
    .then(() => {
        return db.collection("users").deleteMany({})
    })
    .then(() => {
        return db.collection("users").insertMany(data.users)
    })
    .then(() => {
        return db.collection("events").deleteMany({})
    })
    .then(() => {
        return db.collection("events").insertMany(data.events)
    })
    .then(() => {
        return db.collection("collections").deleteMany({})
    })
    .then(() => {
        return db.collection("collections").insertMany(data.collections)
    })
}

module.exports = {testSeed, closeConnection, client}
