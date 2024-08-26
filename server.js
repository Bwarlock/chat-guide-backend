const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const jwt = require("jsonwebtoken");

const http = require("http");
const { Server } = require("socket.io");
const MessageSocket = require("./controllers/MessageSocket");

const app = express();
require("dotenv").config();

const UserRoutes = require("./routes/UserRoutes");
const AuthRoutes = require("./routes/AuthRoutes");
const MessageRoutes = require("./routes/MessageRoutes");
const {
	authMiddleware,
	socketAuthMiddleware,
} = require("./middleware/authMiddleware");
const { messageSocket } = require("./controllers/MessageController");

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

const server = http.createServer(app);
const msgSocket = MessageSocket.init(server);
// const msgSocket = new Server(server);
// console.log(msgSocket);
msgSocket.use(socketAuthMiddleware);
messageSocket(msgSocket);
// msgSocket.on("connection", (socket) => {

// 	console.log("sdiia",socket);
// });
// msgSocket.on("ping", (socket) => {
// 	console.log("sdsadasdiia");
// });

app.use("/ping", (req, res) => {
	return res.status(200).json({ status: "pong" });
});
app.use("/api/auth", AuthRoutes);
app.use("/api/user", authMiddleware, UserRoutes);
app.use("/api/message", authMiddleware, MessageRoutes);

app.all("*", (req, res, next) => {
	res.status(404).send("Not Found");
});

const listener = server.listen(process.env.PORT || 8000, () => {
	console.log("Your app is listening on port " + listener.address().port);
});
