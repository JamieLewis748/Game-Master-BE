const { users } = require('../_tests_/Data/Users');
const { client } = require('../seed')
const { ObjectId } = require('mongodb');
const  adminCode = require("../AdminCode")
const {ENV} = require("../connection");
const socket = require('../socket.js')


function getAllUsers(query = undefined, sortBy = undefined, orderBy = undefined) {
  const db = client.db(`game-master-${ENV}`)
  const usersCollection = db.collection("users");
  let searchQuery = {};
  let orderQuery = {};
  if (query !== undefined) {
    searchQuery["topics"] = query;
  }
  if (
    (sortBy !== undefined && orderBy === undefined) ||
    (sortBy !== undefined && orderBy === 'desc')
  ) {
    orderQuery = { [sortBy]: -1 };
  }
  if (orderBy === 'asc') {
    orderQuery = { [sortBy]: 1 };
  }

  return usersCollection
    .find(searchQuery)
    .sort(orderQuery)
    .toArray()
    .then((userArray) => {
      return userArray;
    });
}

function getUser(user_id) {
  const db = client.db(`game-master-${ENV}`);
  const usersCollection = db.collection('users');

  let query = {}

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(user_id)) {
    query = { email: user_id }
  }
  // else if (userWhoRequested === undefined && userWhoRequested !== adminCode) return Promise.reject({ status: 400, msg: "Bad Request" })
  else {
    query = { _id: user_id }
  }

  return usersCollection.findOne(query)
    .then((userArray) => {
      if (!userArray) throw { status: 404, msg: "User not found" }
      // if (userArray.blocked.includes(userWhoRequested)) throw { status: 404, msg: "User not found" }
      else return { user: userArray }
    })
};

function getMultipleUsers(ids) {
  const db = client.db(`game-master-${ENV}`);
  const usersCollection = db.collection('users');

  let query = { _id: { $in: ids } }

  return usersCollection.find(query).toArray()
    .then((userArray) => {
      if (!userArray) throw { status: 404, msg: "User not found" }
      else return { users: userArray }
    })
};

function addNewUser(name = undefined, username = undefined, email = undefined, img_url = undefined, characterName = undefined) {
  if (name === undefined || username === undefined || email === undefined || img_url === undefined || characterName === undefined) {
    return Promise.reject({ status: 404, msg: "Bad Request" });
  }

  const userToAdd = {
    _id: new ObjectId().toHexString(),
    name: name,
    username: username,
    email: email,
    img_url: img_url,
    topics: [],
    friends: [],
    friendRequestsReceived: [],
    friendRequestsSent: [],
    blocked: [],
    characterStats: [
      {
        name: characterName,
        level: "1",
        experience: "0",
        experienceToLevelup: "10",
      },
    ],
    myCreatures: [],
    watchList: [],
  };

  const db = client.db(`game-master-${ENV}`);
  const usersCollection = db.collection('users');

  return usersCollection.insertOne(userToAdd)
    .then((msg) => {
      return msg
    })
};

const modifyStats = async (user_id, exp = undefined) => {
  console.log('======= inside modifyStats ===========')
  console.log("🚀 ~ file: users.model.js:110 ~ modifyStats ~ user_id:", user_id)
  console.log("🚀 ~ file: users.model.js:110 ~ modifyStats ~ exp:", exp)

  console.log("isNan(exp) ===========> ", isNaN(exp))
  
  if (exp === undefined) return Promise.reject({ status: 400, msg: "Missing exp" })
  if (isNaN(exp)) return Promise.reject({ status: 404, msg: "Bad Request" })

  const db = client.db(`game-master-${ENV}`);
  const usersCollection = db.collection('users');

  const userBeforeUpdate = (await usersCollection.find({ _id: user_id }).toArray())
  if (userBeforeUpdate.length === 0) return Promise.reject({ status: 400, msg: "User not found" })

  console.log(userBeforeUpdate[0])

  let totalExp = (Number(userBeforeUpdate[0].characterStats[0].experience)) + Number(exp)
  console.log("BEFORE WHILE ++++++++++++", totalExp)

  while (totalExp >= Number(userBeforeUpdate[0].characterStats[0].experienceToLevelup)) {
    console.log("in here")
    totalExp -= Number(userBeforeUpdate[0].characterStats[0].experienceToLevelup)
    userBeforeUpdate[0].characterStats[0].level = (Number(userBeforeUpdate[0].characterStats[0].level) + 1).toString()
    userBeforeUpdate[0].characterStats[0].experienceToLevelup = (Number(userBeforeUpdate[0].characterStats[0].experienceToLevelup) + 10).toString()
  }
  console.log(totalExp)
  userBeforeUpdate[0].characterStats[0].experience = totalExp.toString()

  console.log(userBeforeUpdate[0])
  return usersCollection.findOneAndUpdate({ _id: user_id }, { $set: { "characterStats": userBeforeUpdate[0].characterStats } })
    .then((msg) => {
      console.log("xp should be added")
      return msg
    }).catch((err) => {
      return err
    })
}

function requestNewFriend(user_id, friendToAdd) {
  const db = client.db(`game-master-${ENV}`);
  const usersCollection = db.collection("users");

  return usersCollection
    .updateOne(
      { _id: user_id },
      { $push: { friendRequestsReceived: friendToAdd } }
    )
    .then((msg) => {
      return msg;
    });
}

async function respondFriendReq(user_id, sentFrom, isAccepted) {
  const db = client.db(`game-master-${ENV}`);
  const usersCollection = db.collection("users");

  const respondingUser = await usersCollection.findOne({ _id: user_id });
  if (!respondingUser) {
    return Promise.reject({ status: 404, msg: "Bad request" });
  }

  const requestingUser = await usersCollection.findOne({ _id: sentFrom });
  if (!requestingUser) {
    return Promise.reject({ status: 404, msg: "Bad request" });
  }


  const updatedRecieved = await respondingUser.friendRequestsReceived.filter(
    (requestsReceived) => {
      if (requestsReceived !== sentFrom.toString()) {
        return requestsReceived;
      }
    }
  );

  const updatedRequested = await requestingUser.friendRequestsSent.filter(
    (requestsSent) => {
      if (requestsSent !== user_id.toString()) {
        return requestsSent;
      }
    }
  );

  if (isAccepted === true) {
    try {
      await usersCollection
        .findOneAndUpdate(
          { _id: user_id },
          { $set: { friendRequestsReceived: updatedRecieved } }
        )
      await usersCollection
        .findOneAndUpdate(
          { _id: sentFrom },
          { $set: { friendRequestsSent: updatedRequested } }
        )
      await usersCollection
        .updateOne({ _id: user_id }, { $push: { friends: sentFrom } })
      return usersCollection
        .updateOne({ _id: sentFrom }, { $push: { friends: user_id } })
        .then((msg) => {
          socket.emit("notification", {
            type: "msg",
            from: `Friend requested accepted by ${requestingUser.username}`,
            to: "tree1",
          })
          return msg;
        });
    } catch (err) {
      return err
    }
  } else {
    try {
      await usersCollection
        .findOneAndUpdate(
          { _id: user_id },
          { $set: { friendRequestsReceived: updatedRecieved } }
        )
      return usersCollection
        .findOneAndUpdate(
          { _id: sentFrom },
          { $set: { friendRequestsSent: updatedRequested } }
        )
        .then((msg) => {
          return msg;
        })
    } catch (err) {
      return err
    }
  }
}

function fetchMyCollection(user_id) {
  const db = client.db(`game-master-${ENV}`);
  const usersCollection = db.collection("users");
  return usersCollection
    .find({ _id: user_id })
    .toArray()
    .then((userArray) => {
      return userArray[0].myCreatures;
    });
}

async function userBlockRequest(user_id = undefined, userIdToGetBlocked) {
  const objectIdHexRegExp = /^[0-9a-fA-F]{24}$/
  if (!objectIdHexRegExp.test(user_id) || user_id === undefined || user_id === userIdToGetBlocked) {
    return Promise.reject({ status: 404, msg: "Bad request" })
  }
  if (
    userIdToGetBlocked === undefined || !objectIdHexRegExp.test(userIdToGetBlocked)
  ) {
    return Promise.reject({ status: 404, msg: "Bad request" });
  }

  const db = client.db(`game-master-${ENV}`);
  const usersCollection = db.collection("users");

  const user = (await usersCollection.find({ _id: user_id }).toArray())
  if (user.length === 0) {
    return Promise.reject({ status: 404, msg: "Bad request" })
  }

  const userToGetBlocked = (await usersCollection.find({ _id: userIdToGetBlocked }).toArray())
  if (userToGetBlocked.length === 0) {
    return Promise.reject({ status: 400, msg: "User not found" })
  }

  user[0].blocked.push(userIdToGetBlocked)

  return usersCollection.findOneAndUpdate({ _id: user_id }, { $set: { "blocked": user[0].blocked } })
    .then((msg) => {
      return msg
    })
}

module.exports = { getAllUsers, getUser, getMultipleUsers, addNewUser, requestNewFriend, modifyStats, fetchMyCollection, userBlockRequest, respondFriendReq };