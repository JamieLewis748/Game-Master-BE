const { client } = require('../seed')
const { ObjectId } = require('mongodb');

function getAllCollections() {
    const db = client.db('game-master-test');
    const collectionCreaturesCollection = db.collection('collections');
    return collectionCreaturesCollection.find().toArray()
        .then((collectionArray) => {
            return collectionArray
        })
};

function getCollection(collection_id) {
    const db = client.db('game-master-test');
    const collectionCreaturesCollection = db.collection('collections');
    return collectionCreaturesCollection.find({_id: collection_id}).toArray()
        .then((userArray) => {
            return userArray
        })
};

function addNewCollection(name, img_url) {
    const db = client.db('game-master-test');
    const collectionCreaturesCollection = db.collection('collections');
    const collectionToAdd = {
        _id: new ObjectId().toHexString(),
        name: name,
        img_url: img_url
    }

    return collectionCreaturesCollection.insertOne(collectionToAdd)
        .then((msg) => {
            return msg
        })
};


module.exports = { getAllCollections, getCollection, addNewCollection }