const { client } = require('../seed');
const { ObjectId } = require('mongodb');

function getAllUsers(query = undefined) {
    const db = client.db("game-master-test");
  const usersCollection = db.collection("users"); 
  let searchQuery = {}
  if (query !== undefined) {
    searchQuery['topics'] = query
  }

      return usersCollection
        .find(searchQuery)
        .toArray()
        .then((userArray) => {
          return userArray;
        });
  } 

function getUser(user_id) {
    const db = client.db('game-master-test');
    const usersCollection = db.collection('users');

    return usersCollection.find({ _id: user_id }).toArray()
        .then((userArray) => {
            return userArray
        })
};

function addNewUser(name, username, email, img_url) {
    const db = client.db('game-master-test');
    const usersCollection = db.collection('users');
    const userToAdd = {
        _id: new ObjectId().toHexString(),
        name: name,
        username: username,
        email:email,
        img_url:img_url,
        friends: [],
        friendRequestsReceived : [],
        friendRequestsSent : [],
        blocked:[]
    }

    return usersCollection.insertOne(userToAdd)
        .then((msg) => {
            return msg
        })
};

module.exports = { getAllUsers, getUser, addNewUser }