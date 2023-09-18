const { dbConnection } = require("../seed");

exports.getAllUsers = () => {
//   const db = client.db("game-master-test");
  const usersCollection = db.collection("users");

  return dbConnection().then((db) => {
    console.log(
      "🚀 ~ file: getAllUsers-model.js:8 ~ returndbConnection ~ db:",
      db
    );
    // console.log("🚀 ~ file: getAllUsers-model.js:6 ~ returndbConnection", db.collection("users").find().toArray())
    return usersCollection.find().toArray();
});
};


// const returnAllUsers = (req, res) => {
//   const db = client.db("game-master-test");
//   const usersCollection = db.collection("users");

//   usersCollection
//     .find()
//     .toArray()
//     .then((userArray) => {
//       res.status(200).json(userArray);
//     })
//     .catch((error) => {
//       console.error("Error fetching users:", error);
//       res.status(500).json({ error: "Internal Server Error" });
//     });
// };

// module.exports = returnAllUsers;