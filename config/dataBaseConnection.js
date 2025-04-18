const mongoose = require('mongoose');

const connectDb = async () => {
    try {
        const connect = await mongoose.connect(process.env.DATABASE_CONNECTION)
        console.log(
            "Connected to MongoDB",
            connect.connection.host,
            connect.connection.name
        )
    } catch (error) {
        console.log(error)
    }
}
module.exports = connectDb;