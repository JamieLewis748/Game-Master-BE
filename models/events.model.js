const { client } = require('../seed')
const { ObjectId } = require('mongodb');

function getAllEvents() {
    const db = client.db('game-master-test');
    const eventsCollection = db.collection('events');
    return eventsCollection.find().toArray()
        .then((userArray) => {
            return userArray
        })
};
function getEvent(event_id) {
    const db = client.db('game-master-test');
    const eventsCollection = db.collection('events');
    return eventsCollection.find({_id: event_id}).toArray()
        .then((userArray) => {
            return userArray
        })
};

function addNewEvent(image, gameInfo, isGameFull, gameType, dateTime) {
    const db = client.db('game-master-test');
    const eventsCollection = db.collection('events');
    const eventToAdd = {
        _id: new ObjectId().toHexString(),
        image: image,
        gameInfo: gameInfo,
        isGameFull:isGameFull,
        gameType:gameType,
        dateTime: dateTime,
        participants: []
    }

    return eventsCollection.insertOne(eventToAdd)
        .then((msg) => {
            return msg
        })
};


module.exports = { getAllEvents, getEvent, addNewEvent }