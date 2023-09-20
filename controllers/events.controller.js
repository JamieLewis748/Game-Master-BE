const {
  getAllEvents,
  getEvent,
  addNewEvent,
  updateCompleted,
} = require("../models/events.model.js");

const returnAllEvents = (req, res) => {
    const {isGameFull, gameType, sortBy, order} = req.query
    getAllEvents(isGameFull, gameType, sortBy, order).then((data)=>{
        res.status(200).json(data)
    })
};

const returnEvent = (req, res) => {
    const {event_id} = req.params
    getEvent(event_id).then((data)=>{
        res.status(200).json(data)
    })
};

const postNewEvent = (req,res) => {
    const {image, gameInfo, isGameFull, gameType, dateTime, duration, capacity, collection_id} = req.body
    addNewEvent(image, gameInfo, isGameFull, gameType, dateTime, duration, capacity, collection_id)
    .then((userArray)=> {
        res.status(200).json(userArray);
    })
}

const patchCompletedStatus = (req, res) => {
    const { event_id } = req.params;
    updateCompleted(event_id).then((data) => {
      res.status(200).json(data);
    });
}

module.exports = {
  returnAllEvents,
  returnEvent,
  postNewEvent,
  patchCompletedStatus,
};