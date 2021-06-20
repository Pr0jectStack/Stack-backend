const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "../.env" });

const connectDB = async () => {
  try {
    console.log("Connecting...")
    const connection = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    console.log(`MongoDB Connected: ${connection.connection.host}`);
    return connection.connection;
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;
