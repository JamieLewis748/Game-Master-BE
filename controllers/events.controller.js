const { client } = require('../seed')
const {getAllEvents, getEvent} = require('../models/events.model.js')

const returnAllEvents = (req, res) => {
    getAllEvents().then((data)=>{
        res.status(200).json(data)
    })
};


const returnEvent = (req, res) => {
    const {event_id} = req.params
    console.log(event_id);
    getEvent().then((data)=>{
        res.status(200).json(data)
    })
};




module.exports = { returnAllEvents, returnEvent }