const {
    getAllEvents,
    getEvent,
    addNewEvent,
    updateCompleted,
} = require("../models/events.model.js");

const returnAllEvents = (req, res) => {
    const { isGameFull, gameType, sortBy, order } = req.query
    getAllEvents(isGameFull, gameType, sortBy, order).then((data) => {
        res.status(200).json(data)
    })
        .catch((error) => {
            res.status(error.status).json(error.msg);
        });
};

const returnEvent = (req, res) => {
    const { event_id } = req.params
    getEvent(event_id).then((data) => {
        res.status(200).json(data)
    })
        .catch((error) => {
            res.status(error.status).json(error.msg);
        });
};

const postNewEvent = (req, res) => {
    const { image, gameInfo, isGameFull, gameType, dateTime, duration, capacity, prizeCollection_id } = req.body
    addNewEvent(image, gameInfo, isGameFull, gameType, dateTime, duration, capacity, prizeCollection_id)
        .then((userArray) => {
            res.status(200).json(userArray);
        })
        .catch((error) => {
            res.status(error.status).json(error.msg);
        });
}

const patchCompletedStatus = (req, res) => {
    const { event_id } = req.params;
    const { host_id, participants, winner, duration } = req.body
    updateCompleted(event_id, host_id, participants, winner, duration).then((data) => {
        res.status(200).json(data);
    });
}

module.exports = {
    returnAllEvents,
    returnEvent,
    postNewEvent,
    patchCompletedStatus,
};