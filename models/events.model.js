const { client } = require('../seed')

function getAllEvents() {
    const db = client.db('game-master-test');
    const eventsCollection = db.collection('events');

    return eventsCollection.find().toArray()
        .then((userArray) => {
            return userArray
        })
};
function getEvent() {
    const db = client.db('game-master-test');
    const eventsCollection = db.collection('events');

    return eventsCollection.find().toArray()
        .then((userArray) => {
            return userArray
        })
};


module.exports = { getAllEvents, getEvent }