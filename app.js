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
const Chat = require("./models/Chat");

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

app.use("/", authRoutes);
app.use("/auth", authRoutes);
app.use("/db", dbRoutes);

const PORT = process.env.PORT || 5000;

// SOCKET SETUP
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT"],
    credentials: true,
  },
  secure: true,
});

let taskStream, chatStream; // Store the [ChangeStream] for tasks, chats

let rooms = []; // 'Set' for rooms available.

/**
 * Open a Socket connection.
 * JOIN - Add a user to a room with Room Id same as teamId (tid).
 * CHANGE - [ChangeStream] listener which notifies about updates, Use socket to emit infos.
 */
io.on("connection", (socket) => {
  socket.on("join", (tid) => {
    console.log(`A client has connected to room ${tid}`);
    if (tid && !rooms.includes(tid.toString())) rooms.push(tid);
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
          if (err || !team) {
            console.log(err);
          } else {
            const index = rooms.indexOf(team._id.toString());
            io.to(rooms[index]).emit("tasks", team);
          }
        });
    });
  }

  if (chatStream) {
    chatStream.on("change", (next) => {
      Chat.find({ chatId: next.fullDocument.chatId })
        .sort("createdAt")
        .exec((err, chats) => {
          if (err) {
            console.log(err);
          } else {
            const index = rooms.indexOf(next.fullDocument.chatId.toString());
            io.to(rooms[index]).emit("chats", chats);
          }
        });
    });
  }
});

/**
 * Open Server on 'PORT'.
 * Connect to the database, get references for collections and open [ChangeStreams] on them.
 */
server.listen(PORT, async (req, res) => {
  // Connect to DB
  const connection = await connectDB();
  const client = connection.client;

  // FIXME: 11 listeners added to [ChangeStream]. Why and how ? <- Happening Sometimes. Possible MemoryLeak

  const taskCollection = client.db("stack").collection("tasks");
  const chatCollection = client.db("stack").collection("chats");

  // Watch for changes in 'tasks' collection
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

  // Watch for changes in 'chats' collection
  chatStream = chatCollection.watch(
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
