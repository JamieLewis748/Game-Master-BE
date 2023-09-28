const { client } = require('../seed')
const { ObjectId } = require('mongodb');
const { modifyStats } = require('./users.model')
const { ENV } = require("../connection");
const socket = require('../socket.js')

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

function addNewEvent(hostedBy, image, gameInfo, isGameFull, gameType, dateTime, duration, capacity, prizeCollection_id) {
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
        participants: [hostedBy],
        requestedToParticipate: [],
        prizeCollection_id: prizeCollection_id,
        isCompleted: "false",
        hostedBy: hostedBy
    }

    return eventsCollection.insertOne(eventToAdd)
        .then((msg) => {
            return msg
        })
};


async function updateRequestToParticipateWithNewUser(event_id, user_id) {
    const db = client.db(`game-master-${ENV}`);
    const eventsCollection = db.collection('events');
    const usersCollection = db.collection('users');

    const event = await eventsCollection.findOne({ _id: event_id })

    const user = await usersCollection.findOne({ _id: user_id })

    const host = await usersCollection.findOne({ _id: event.hostedBy })

    return eventsCollection.updateOne({ _id: event_id }, { $push: { "requestedToParticipate": user_id } })
        .then((msg) => {
            socket.emit("notification", {
                type: "msg",
                from: `${user.username} has requested to participate in ${event.gameInfo}`,
                to: host.username,
            })
            return msg
        })
};

async function updateParticipateWithNewUser(event_id, user_id) {
    const db = client.db(`game-master-${ENV}`);
    const eventsCollection = db.collection('events');
    const usersCollection = db.collection('users');

    const event = await eventsCollection.findOne({ _id: event_id })

    const user = await usersCollection.findOne({ _id: user_id })

    return eventsCollection.updateOne({ _id: event_id }, {
        $pull: { requestedToParticipate: user_id },
        $push: { participants: user_id }
    })
        .then((msg) => {
            socket.emit("notification", {
                type: "msg",
                from: `You have been accepted into ${event.gameInfo}`,
                to: user.username,
            })
            return msg
        })
};

const updateCompleted = async (event_id, host_id, participants, winner, duration) => {
    const db = client.db(`game-master-${ENV}`);
    const eventsCollection = db.collection("events");
    const usersCollection = db.collection("users");
    const creatureCollection = db.collection("collections");

    const eventInDatabase = (await eventsCollection.findOne({ _id: event_id }).then((event) => {
        if (host_id !== event.hostedBy) return Promise.reject({ status: 400, msg: "Not Host" })
        return event
    }))
    console.log(eventInDatabase, "---eventInDatabase");
    console.log(participants, '---participants')

    await Promise.all(participants.map(async (participant) => {
        if (participant === host_id) return
        else {
            try {
                if (winner === participant) {
                    console.log('+++++ winner is participant!! +++++')
                    const prizeCollection = (await creatureCollection.findOne({ _id: eventInDatabase.prizeCollection_id }))
                    await usersCollection.findOneAndUpdate({ _id: winner }, { $push: { "myCreatures": prizeCollection } })
                    const winnerUser = await usersCollection.findOne({ _id: participant })
                    await socket.emit("notification", {
                        type: "msg",
                        from: `You have been given a new collection`,
                        to: winnerUser.username,
                    })
                }
                const user = await usersCollection.findOne({ _id: participant })
                await socket.emit("notification", {
                    type: "msg",
                    from: `You have been given 50 xp`,
                    to: user.username,
                })
                await modifyStats(participant, 50)
            }
            catch (error) {
                return Promise.reject({ status: 400, msg: "Error adding xp" })
            }
        }
    }))
    console.log('--------- line 156 -------------')
    await modifyStats(eventInDatabase.hostedBy, 75).then(() => {
        console.log('-------------- stats modified ---------------')
    })

    console.log('++++++ setting event completed: true +++++++++')
    return eventsCollection.findOneAndUpdate({ _id: event_id }, { $set: { isCompleted: "true" } })
        .then((msg) => {
            return msg;
        });
};

const handleWatchList = async (event_id, user_id) => {
    const objectIdHexRegExp = /^[0-9a-fA-F]{24}$/
    const db = client.db(`game-master-${ENV}`);
    const usersCollection = db.collection("users");
    const eventsCollection = db.collection("events");
    let updatedWatchList = [];

    if (!objectIdHexRegExp.test(event_id) || event_id === undefined || user_id === undefined || !objectIdHexRegExp.test(user_id)) {
        return Promise.reject({ status: 400, msg: "Bad request" });
    }
    const userWatchList = await (usersCollection.findOne({ _id: user_id }).then((user) => {
        if (user.watchList) {
            return user.watchList
        } else {
            user.watchList = []
            return user.watchList
        }
    }).catch((err) => {
        return Promise.reject({ status: 404, msg: "Not Found" });
    }))

    await eventsCollection.findOne({ _id: event_id }).then((response) => {
        if (response === null) {
            return Promise.reject({ status: 404, msg: "Not Found" });
        }
    }).catch((err) => {
        return Promise.reject({ status: 404, msg: "Not Found" });
    })

    if (!userWatchList.includes(event_id)) {
        updatedWatchList.push(event_id)
        updatedWatchList.push(...userWatchList)
        return usersCollection
            .updateOne(
                { _id: user_id },
                { $set: { watchList: updatedWatchList } }
            )
            .then((msg) => {
                return msg;
            });
    } else {
        updatedWatchList = await (userWatchList.filter((eachEvent) => {
            if (eachEvent !== event_id) {
                return eachEvent;
            }
            usersCollection
                .updateOne(
                    { _id: user_id },
                    { $set: { watchList: updatedWatchList } }
                )
                .then((msg) => {
                    return msg;
                });
        }));
    }
};

const cancelEvent = async (event_id, user_id) => {
    const objectIdHexRegExp = /^[0-9a-fA-F]{24}$/
    const db = client.db(`game-master-${ENV}`);
    const usersCollection = db.collection("users");
    const eventsCollection = db.collection("events");
    let thisUser

    if (!objectIdHexRegExp.test(event_id) || event_id === undefined || user_id === undefined || !objectIdHexRegExp.test(user_id)) {
        return Promise.reject({ status: 400, msg: "Bad request" });
    }
    thisUser = await (usersCollection.findOne({ _id: user_id }).then((user) => {
        if (user === null) {
            return Promise.reject({ status: 404, msg: "Not Found" });
        } else {
            return user
        }
    }).catch((err) => {
        return Promise.reject({ status: 404, msg: "Not Found" });
    }))

    await eventsCollection.findOne({ _id: event_id }).then((response) => {
        if (response === null) {
            return Promise.reject({ status: 404, msg: "Not Found" });
        }
    }).catch((err) => {
        return Promise.reject({ status: 404, msg: "Not Found" });
    })
    if (event_id === thisUser._id) {
        return Promise.reject({ status: 400, msg: "Bad request" });
    } else {
        return eventsCollection.findOneAndDelete({ _id: event_id })
            .then((msg) => {
                return msg
            }).catch((err) => {
                return err
            })
    }
}

module.exports = { getAllEvents, getEvent, addNewEvent, updateRequestToParticipateWithNewUser, updateParticipateWithNewUser, updateCompleted, handleWatchList, cancelEvent };