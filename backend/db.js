// const mongoose = require('mongoose');
// const mongoURI = "mongodb://localhost27017/?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false"
// const connectToMongo = () => {
//     mongoose.connect(mongoURI, () => {
//         console.log("Connected to Mongo Successfully");
//     })
// }
// module.exports = connectToMongo;

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {});
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
