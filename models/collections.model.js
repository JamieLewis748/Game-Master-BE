const { client } = require('../seed')
const { ObjectId } = require('mongodb');
const {ENV} = require('../connection')

function getAllCollections() {
    const db = client.db(`game-master-${ENV}`);
    const collectionCreaturesCollection = db.collection('collections');
    return collectionCreaturesCollection.find().toArray()
        .then((collectionArray) => {
            return collectionArray
        })
};

function getCollection(collection_id) {
    let query = {}

    const objectIdHexRegExp = /^[0-9a-fA-F]{24}$/
    if(!isNaN(collection_id) || objectIdHexRegExp.test(collection_id)){
        query = {_id : collection_id}
    }
    else {
        query = {name: collection_id}
    }


    const db = client.db(`game-master-${ENV}`);
    const collectionCreaturesCollection = db.collection('collections');
    return collectionCreaturesCollection.findOne(query)
        .then((collection) => {
            if(!collection) throw {status: 400,msg:"User does not exist"}
            return {collections:collection}
        })
};

function addNewCollection(name, image) {
    const db = client.db(`game-master-${ENV}`);
    const collectionCreaturesCollection = db.collection('collections');

    if (name === undefined || name === "") return Promise.reject({ status: 404, msg: "Bad Request" });
    if (image === undefined || image === "") return Promise.reject({ status: 404, msg: "Bad Request" });

    const collectionToAdd = {
        _id: new ObjectId().toHexString(),
        name: name,
        image: image
    }

    return collectionCreaturesCollection.insertOne(collectionToAdd)
        .then((msg) => {
            return msg
        })
};



module.exports = { getAllCollections, getCollection, addNewCollection
};