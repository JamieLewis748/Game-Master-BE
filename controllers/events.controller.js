const {
  getAllEvents,
  getEvent,
  addNewEvent,
  updateCompleted,
  handleWatchList,
  updateRequestToParticipateWithNewUser
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
    getEvent(event_id.toString()).then((data) => {
        res.status(200).json(data)
    })
        .catch((error) => {
            res.status(error.status).json(error.msg);
        });
};

const postNewEvent = (req, res) => {
    const { hostedBy, image, gameInfo, isGameFull, gameType, dateTime, duration, capacity, prizeCollection_id} = req.body
    addNewEvent(hostedBy, image, gameInfo, isGameFull, gameType, dateTime, duration, capacity, prizeCollection_id)
        .then((userArray) => {
            res.status(200).json(userArray);
        })
        .catch((error) => {
            res.status(error.status).json(error.msg);
        });
}

const patchRequestParticipateEvent = (req, res) => {
  const { event_id } = req.params;
    const { user_id } = req.body
    updateRequestToParticipateWithNewUser(event_id, user_id).then((data) => {
      res.status(200).json(data);
    });
}

const patchCompletedStatus = (req, res) => {
    const { event_id } = req.params;
    const { host_id, participants, winner, duration } = req.body
    updateCompleted(
      event_id.toString(),
      host_id.toString(),
      participants,
      winner,
      duration
    ).then((data) => {
      res.status(200).json(data);
    });
}

const postWatchList = (req, res) => {
    const { event_id } = req.params
    const {user_id} = req.body
    handleWatchList(event_id.toString(), user_id.toString())
      .then((msg) => {
        res.status(201).json(msg);
      })
      .catch((error) => {
        res.status(error.status).json(error.msg);
      });
}
module.exports = {
  returnAllEvents,
  returnEvent,
  postNewEvent,
  patchRequestParticipateEvent,
  patchCompletedStatus,
  postWatchList
};