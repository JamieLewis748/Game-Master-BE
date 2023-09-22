const { client } = require('../connection')
const { ObjectId } = require('mongodb');
const { modifyStats } = require('./users.model')
const ENV = require("../connection");

function getAllEvents(isGameFull = undefined, gameType = undefined, sortBy = "dateTime", order = "1") {
    const db = client.db(`game-master-${ENV}`);
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
            console.log("🚀 ~ file: events.model.js:28 ~ .then ~ userArray:", userArray)
            return userArray
        })
};


function getEvent(event_id) {
    const objectIdHexRegExp = /^[0-9a-fA-F]{24}$/
    if (isNaN(event_id) && objectIdHexRegExp.test(event_id) === false) return Promise.reject({ status: 400, msg: "Bad Request" })

    const db = client.db(`game-master-${ENV}`);
    const eventsCollection = db.collection('events');
    return eventsCollection.findOne({ _id: event_id })
        .then((event) => {
            return { event: event }
        })
};


function addNewEvent(image, gameInfo, isGameFull, gameType, dateTime, duration, capacity, prizeCollection_id) {
    const db = client.db(`game-master-${ENV}`);
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

const updateCompleted = async (event_id, host_id, participants, winner, duration) => {
    const db = client.db(`game-master-${ENV}`);
    const eventsCollection = db.collection("events");

    const eventInDatabase = (await eventsCollection.findOne({ _id: event_id }))
    if (host_id !== eventInDatabase.hostedBy) return Promise.reject({ status: 400, msg: "Not Host" })

    await Promise.all(participants.map(async (participant) => {
        if (participant === host_id) return
        else {
            try {
                if(winner === participant){
                    const creatureCollection = db.collection("collections");
                    const prizeCollection =  (await creatureCollection.findOne({_id : eventInDatabase.prizeCollection_id}))
                    const usersCollection = db.collection("users");
                    await usersCollection.findOneAndUpdate({_id : winner}, { $push: { "myCreatures": prizeCollection} })
                }
                await modifyStats(participant, "50")
            }
            catch(error) {

            }
        }
    }))

    await modifyStats(eventInDatabase.hostedBy, "75")

    return eventsCollection
        .findOneAndUpdate({ _id: event_id }, { $set: { isCompleted: "true" } })
        .then((msg) => {
            return msg;
        });
};

module.exports = { getAllEvents, getEvent, addNewEvent, updateCompleted };