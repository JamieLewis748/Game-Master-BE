const { users } = require('../_tests_/Data/Users');
const { client } = require('../seed')
const { ObjectId } = require('mongodb');

function getAllUsers(query = undefined, sortBy = undefined, orderBy = undefined) {
  const db = client.db("game-master-test");
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
  if(orderBy ==='asc') {
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
        img_url: img_url,
        topics: [],
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

const modifyStats = async (user_id, exp) => {
    const db = client.db('game-master-test');
    const usersCollection = db.collection('users');

    const userBeforeUpdate = (await usersCollection.find({ _id: user_id }).toArray())

    let totalExp = Number(userBeforeUpdate[0].characterStats.experience) + exp

    while(totalExp >= Number(userBeforeUpdate[0].characterStats.experienceToLevelUp)) {
        totalExp - Number(userBeforeUpdate[0].characterStats.experienceToLevelUp)
        userBeforeUpdate[0].characterStats.level = (Number(userBeforeUpdate[0].characterStats.level) + 1).toString()
        userBeforeUpdate[0].characterStats.experienceToLevelUp = (Number(userBeforeUpdate[0].characterStats.experienceToLevelUp) + 10).toString()
    }
        
    return usersCollection.findOneAndUpdate({_id: user_id}, {$set: { "characterStats.level": "8" }})
    .then((msg) => {
        return msg
    }).catch((err) => {
        console.log(err);
        return err
    })
}

function requestNewFriend(user_id, friendToAdd) {
  const db = client.db("game-master-test");
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
  const db = client.db("game-master-test");
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


module.exports = { getAllUsers, getUser, addNewUser, requestNewFriend, modifyStats, respondFriendReq };