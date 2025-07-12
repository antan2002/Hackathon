const mongoose = require('mongoose');

const connectDB = async () => {
  console.log("Connecting to DB...");

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("MongoDB connection failed!");
    console.error("Error Message:", err.message);
    process.exit(1); // Stop the server if DB connection fails
  }
};

module.exports = connectDB;
