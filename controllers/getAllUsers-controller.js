const { getAllUsers } = require("../models/getAllUsers-model");

exports.getUsers = (req, res, next) => {
  getAllUsers()
    .then((usersArr) => {
      res.status(200).send(usersArr);
    })
    .catch(next);
};
