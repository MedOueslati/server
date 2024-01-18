const mongoose = require('mongoose');
const colors = require('colors');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Mongo database connected: ${conn.connection.host}`.underline.blue.bold

        );
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};


module.exports = connectDB;

