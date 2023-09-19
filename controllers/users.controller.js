const { request } = require('express');
const {
  getAllUsers,
  getUser,
  addNewUser,
  requestNewFriend
} = require("../models/users.model.js");

const returnAllUsers = (req, res) => {
    getAllUsers()
        .then((userArray) => {
            res.status(200).json(userArray);
        })
        .catch((error) => {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
};

const returnUser = (req, res) => {
    const {user_id} = req.params
    getUser(user_id)
        .then((msg) => {
            res.status(200).json(msg);
        })
        .catch((error) => {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
};

const postNewUser = (req,res) => {
    const {name, username, email, img_url} = req.body
    addNewUser(name,username, email, img_url)
    .then((userArray)=> {
        res.status(200).json(userArray);
    })
}

const postFriendRequest = (req, res) => {
  const { user_id } = req.params;
  if (user_id * 1 !== req.body._id) {
    requestNewFriend(user_id, req.body).then((msg) => {
      res.status(201).json(msg);
    });
  } else {
    res.status(200).send({ msg: "can not send friend request to self" });
  }
};

module.exports = { returnAllUsers, returnUser, postNewUser, postFriendRequest };