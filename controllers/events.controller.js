const { client } = require('../seed')
const {getAllEvents} = require('../models/events.model.js')

const returnAllEvents = (req, res) => {
    console.log("here")
    getAllEvents().then((data)=>{
        console.log(data)
        res.status(200).json(data)
    })
};


module.exports = returnAllEvents