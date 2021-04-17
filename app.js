"use strict";

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const dbRoutes = require("./routes/dbRoutes");
const dotenv = require("dotenv");
const session = require("express-session");
const connectDB = require("./config/connect_db");
const cookieParser = require("cookie-parser");
// const session = require("express-session");
const { default: MongoStore } = require("connect-mongo");
const Team = require("./models/Team");

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
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Connect Database
// connectDB();

app.use("/", authRoutes);
app.use("/auth", authRoutes);
app.use("/db", dbRoutes);

const PORT = process.env.PORT || 5000;

// SOCKET TESTING
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT"],
    credentials: true,
  },
});

let taskStream;
io.on("connection", (socket) => {
  socket.on("join", (userId, tid) => {
    console.log(`A client with id ${userId} has connected`);
    socket.join(tid);
  });
  if (taskStream) {
    taskStream.on("change", (next) => {
      Team.findOne({ tasks: { $in: [next.fullDocument._id] } })
        .populate("tasks")
        .populate({
          path: "tasks",
          populate: {
            path: "membersAssigned",
          },
        })
        .populate("members", "firstname username email skypeId")
        .exec((err, team) => {
          if (err || !team) console.log(err);
          else {
            io.emit(team._id, team);
          }
        });
    });
  }
});

// Launch Server
server.listen(PORT, async (req, res) => {
  const client = await connectDB();
  const taskCollection = client.db("stack").collection("tasks");
  taskStream = taskCollection.watch(
    [
      {
        $match: {
          $or: [{ operationType: "insert" }, { operationType: "update" }],
        },
      },
    ],
    { fullDocument: "updateLookup" }
  );

  console.log(`Server running on port ${PORT}`);
});
