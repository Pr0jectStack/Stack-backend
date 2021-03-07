"use strict";

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const dbRoutes = require("./routes/dbRoutes");
const dotenv = require("dotenv");
const session = require("express-session");
const connectDB = require("./config/connect_db");
const cookieParser = require("cookie-parser");
// const session = require("express-session");
const { default: MongoStore } = require("connect-mongo");

// Init Express
const app = express();

// Fetch ENV variables
dotenv.config({ path: "./.env" });

// Setup Sessions
// !! SECRET Always required. Not having it in '.env' will leave the app unsecure.
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  })
);

app.use(cors());
app.use(cookieParser());
app.use(bodyParser.json());

// Connect Database
connectDB();

app.use("/", authRoutes);
app.use("/auth", authRoutes);
app.use("/db", dbRoutes);

const PORT = process.env.PORT || 5000;

// Launch Server
app.listen(PORT, (req, res) => {
  console.log(`Server running on port ${PORT}`);
});
