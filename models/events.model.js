const { client } = require('../seed')
const { ObjectId } = require('mongodb');

function getAllEvents(isGameFull = undefined, gameType = undefined, sortBy = "dateTime", order = "1") {
    const db = client.db('game-master-test');
    const eventsCollection = db.collection('events');
    let searchBy = { isCompleted: "false" }
    if (isGameFull !== undefined) {
        if (isGameFull !== "false" && isGameFull !== "true") return Promise.reject({ status: 400, msg: "Bad Request" })
        searchBy["isGameFull"] = isGameFull
    }

    if (gameType !== undefined) {
        searchBy["gameType"] = gameType
    }

    let sort = {}

    if (order !== "1" && order !== "-1") return Promise.reject({ status: 400, msg: "Bad Request" })

    sort[sortBy] = Number(order)
    return eventsCollection.find(searchBy).sort(sort).toArray()
        .then((userArray) => {
            return userArray
        })
};


function getEvent(event_id) {
    const objectIdHexRegExp = /^[0-9a-fA-F]{24}$/
    if (isNaN(event_id) && objectIdHexRegExp.test(event_id) === false) return Promise.reject({ status: 400, msg: "Bad Request" })

    const db = client.db('game-master-test');
    const eventsCollection = db.collection('events');
    return eventsCollection.findOne({ _id: event_id })
        .then((event) => {
            return { event: event }
        })
};


function addNewEvent(image, gameInfo, isGameFull, gameType, dateTime, duration, capacity, prizeCollection_id) {
    const db = client.db('game-master-test');
    const eventsCollection = db.collection('events');
    const eventToAdd = {
        _id: new ObjectId().toHexString(),
        image: image,
        gameInfo: gameInfo,
        isGameFull: isGameFull,
        gameType: gameType,
        dateTime: dateTime,
        duration: duration,
        capacity: capacity,
        participants: [],
        requestedToParticipate: [],
        prizeCollection_id: prizeCollection_id
    }

    return eventsCollection.insertOne(eventToAdd)
        .then((msg) => {
            return msg
        })
};

const updateCompleted = (event_id) => {
    const db = client.db("game-master-test");
    const eventsCollection = db.collection("events");
    return eventsCollection
        .findOneAndUpdate({ _id: event_id }, { $set: { isCompleted: "true" } })
        .then((msg) => {
            return msg;
        });
};

module.exports = { getAllEvents, getEvent, addNewEvent, updateCompleted };