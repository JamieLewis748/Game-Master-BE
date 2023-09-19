const { client } = require('../seed')
const {getAllCollections, getCollection, addNewCollection } = require('../models/collections.model.js')

const returnAllCollections = (req, res) => {
    getAllCollections().then((data)=>{
        res.status(200).json(data)
    })
};

const returnCollection = (req, res) => {
    const {collection_id} = req.params
    getCollection(collection_id).then((data)=>{
        res.status(200).json(data)
    })
};

const postNewCollection = (req,res) => {
    const {name, img_url} = req.body
    addNewCollection(name, img_url)
    .then((data)=> {
        res.status(200).json(data);
    })
}



module.exports = { returnAllCollections, returnCollection, postNewCollection }