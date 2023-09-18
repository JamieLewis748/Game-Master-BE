const { client } = require('../seed')

const returnAllUsers = (req, res) => {
    const db = client.db('game-master-test');
    const usersCollection = db.collection('users');

    usersCollection.find().toArray()
        .then((userArray) => {
            res.status(200).json(userArray);
        })
        .catch((error) => {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
};


module.exports = returnAllUsers