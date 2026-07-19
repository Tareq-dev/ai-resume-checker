const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const env = require("./config/env");
const { connectDB } = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const healthRouter = require("./routes/health");
const authRouter = require("./routes/auth");

const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: true, // Reflect request origin
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

if (!env.config.isProd) {
  app.use(morgan("dev"));
}

app.use("/api/health", healthRouter);
app.use("/api/auth",authRouter);

// 404 Handler
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

async function start() {
  // console.log("Health router loaded:", healthRouter);
  try {
    await connectDB();
    app.listen(env.config.port, () => {
      console.log(`Server running on port ${env.config.port}`);
    });
  } catch (err) {
    console.error("Failed to start the server: ", err.message);
    process.exit(1);
  }
}

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

start();

module.exports = app;
