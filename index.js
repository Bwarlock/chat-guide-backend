const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const jwt = require("jsonwebtoken");

const app = express();
require("dotenv").config();

const UserRoutes = require("./routes/UserRoutes");
const AuthRoutes = require("./routes/AuthRoutes");
const MessageRoutes = require("./routes/MessageRoutes");
const { authMiddleware } = require("./middleware/authMiddleware");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());

mongoose
	.connect(process.env.MONGODB_URI, {
		dbName: process.env.DB_NAME,
		// useUnifiedTopology: true,
		// useNewUrlParser: true,
		// createIndexes: true,
	})
	.then(() => console.log("Connected to MongoDB"))
	.catch((err) => console.log("Could not connect to MongoDB", err));

const listener = app.listen(process.env.PORT || 8000, () => {
	console.log("Your app is listening on port " + listener.address().port);
});

app.use("/api/auth", AuthRoutes);
app.use("/api/user", authMiddleware, UserRoutes);
app.use("/api/message", authMiddleware, MessageRoutes);
