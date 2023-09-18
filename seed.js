const { dbTestConnection } = require("./connection.test");
const { usersTestData } = require("./_tests_/data/users_test_data");


const seed = () => {
    dbTestConnection()
        .then(() => {
        db.dropDatabase()
    })
        .then(() => {
            db.users.insertMany(usersTestData)
    })
}

seed()