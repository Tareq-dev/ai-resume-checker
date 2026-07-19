const mongoose = require("mongoose");

const { config } = require("./env");

mongoose.set("strictQuery", true);

async function connectDB() {
  //   console.log("Mongo URI:", config.mongoUri);
  const conn = await mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 10_000,
  });

  console.log(
    `MongoDB connected: ${conn.connection.host}/${conn.connection.name}`,
  );

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB Disconnected");
  });
}

module.exports = { connectDB };
