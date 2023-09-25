const { client } = require('../seed')
const {getAllCollections, getCollection, addNewCollection
} = require("../models/collections.model.js");

const returnAllCollections = (req, res) => {
    getAllCollections().then((data)=>{
        res.status(200).json(data)
    })
};

const returnCollection = (req, res) => {
    const {collection_id} = req.params
    getCollection(collection_id).then((data)=>{
        res.status(200).json(data)
    }).catch((error) => {
        res.status(error.status).json(error.msg)
    })

};

const postNewCollection = (req,res) => {
    const {name, image} = req.body
    addNewCollection(name, image)
    .then((data)=> {
        res.status(200).json(data);
    }).catch((error) => {
        res.status(error.status).json(error.msg)
    })
}



module.exports = {returnAllCollections, returnCollection, postNewCollection
};