"use strict";

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

// Init Express
const app = express();

dotenv.config({ path: "./.env" });

app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;

// Launch Server
app.listen(PORT, (req, res) => {
  console.log(`Server running on port ${PORT}`);
});
