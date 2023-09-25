const { getAllUsers, getUser, getMultipleUsers, addNewUser, modifyStats, requestNewFriend, fetchMyCollection, userBlockRequest, respondFriendReq } = require('../models/users.model.js')

const returnAllUsers = (req, res) => {
  const { topics } = req.query;
  const { sortBy } = req.query;
  const { orderBy } = req.query;
  getAllUsers(topics, sortBy, orderBy)
    .then((userArray) => {
      res.status(200).json(userArray);
    })
    .catch((error) => {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal Server Error" });
    });
};

const returnUser = (req, res) => {
    const {user_id} = req.params
  const { userWhoRequested } = req.body
  // if (!userWhoRequested) {
  //   res.status(400).json("Bad Request")
  // }
    getUser(user_id.toString(), userWhoRequested.toString())
        .then((msg) => {
            res.status(200).json(msg);
        })
        .catch((error) => {
            res.status(error.status).json(error.msg);
        });
};

const returnMultipleUsers = (req, res) => {
  const { ids } = req.body

  getMultipleUsers(ids)
      .then((msg) => {
          res.status(200).json(msg);
      })
      .catch((error) => {
          res.status(error.status).json(error.msg);
      });
};

const postNewUser = (req,res) => {
    const {name, username, email, img_url, characterName} = req.body
    addNewUser(name,username, email, img_url, characterName)
    .then((userArray)=> {
        res.status(200).json(userArray);
    })
    .catch((error) => {
      res.status(error.status).json(error.msg);
  });
};

const patchCharacterStats = (req, res) => {
    const {user_id} = req.params
    const { exp } = req.body
    modifyStats(user_id.toString(), exp)
    .then((msg) => {
        res.status(200).json(msg);
    })    
    .catch((error) => {
      res.status(error.status).json(error.msg);
  });
}

const postFriendRequest = (req, res) => {
  const { user_id } = req.params;
  if (user_id !== req.body._id) {
    requestNewFriend(user_id, req.body).then((msg) => {
      res.status(201).json(msg);
    });
  } else {
    res.status(200).send({ msg: "can not send friend request to self" });
  }
};

const handleFriendReq = (req, res) => {
  const { user_id } = req.params;
  const { sentFrom } = req.body;
  const { isAccepted } = req.body;
  respondFriendReq(user_id, sentFrom, isAccepted).then((msg) => {
    res.status(201).json(msg)
  }).catch((err) => {
    res.status(err.status).json(err.msg)
  })
}

const blockUser = (req, res) => {
  const { user_id } = req.params;
  const { userIdToGetBlocked } = req.body

  userBlockRequest(user_id.toString(), userIdToGetBlocked.toString())
  .then((response) => {
    res.status(204).json(response)
  })
  .catch((err) => {
    res.status(err.status).json(err.msg)
  })
  
}

const getOwnedCollections = (req, res) => {
  const { user_id } = req.params;
  fetchMyCollection(user_id)
    .then((data) => {
      return res.status(200).json(data);
    })
    .catch((error) => {
      res.status(error.status).json(error.msg);
    });
};

module.exports = {
  returnAllUsers,
  returnUser,
  postNewUser,
  patchCharacterStats,
  postFriendRequest,
  getOwnedCollections,
  blockUser,
  handleFriendReq,
  returnMultipleUsers
};