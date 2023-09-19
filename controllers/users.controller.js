const { getAllUsers, getUser, addNewUser } = require('../models/users.model.js')

const returnAllUsers = (req, res) => {
    const {topics} = req.query
    getAllUsers(topics)
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


module.exports = {returnAllUsers, returnUser, postNewUser}