
const mongoose = require("mongoose");


const connectToDB = function () {
    mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true }).then((data) => {
        console.log("Database connected", data.connection.host)
    }).catch((err) => {
        console.log("Database connection error\n", err);
        process.exit(1)
    })
}


module.exports = connectToDB;