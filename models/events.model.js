const { client } = require('../seed')

function getAllEvents() {
    const db = client.db('game-master-test');
    const eventsCollection = db.collection('events');

    return eventsCollection.find().toArray()
        .then((userArray) => {
            console.log(userArray)
            return userArray
        })
};


module.exports = {getAllEvents}