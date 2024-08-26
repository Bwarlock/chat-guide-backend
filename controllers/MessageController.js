const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const Message = require("../models/MessageModel");

const mongoose = require("mongoose");
const connectedUsers = {};

// async function syncMessages(user, message) {
// 	// do the socket checking first
// 	// in case socket is not available
// 	await User.findByIdAndUpdate(message.recipientId, {
// 		$push: { messageQueue: message._id },
// 	});
// }

exports.createMessage = async (req, res) => {
	try {
		const MessageSocket = require("./MessageSocket");
		const msgSocket = MessageSocket.getSocket();

		const data = req.body;
		const message = await Message.create(data);
		await message.save();
		const recipientId = message.recipientId.toString();
		console.log(
			"my socket",
			message.recipientId.toString(),
			JSON.stringify(message),
			connectedUsers[recipientId]
			// connectedUsers[jsonMessage.recipientId].id
		);
		if (connectedUsers[recipientId] && connectedUsers[recipientId].id) {
			const id = connectedUsers[recipientId].id;
			msgSocket.to(id).emit("receiveMessage", message);
		}

		return res.status(200).json({ chatMessage: message });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: error, message: error?.message });
	}
};

exports.getMessages = async (req, res) => {
	try {
		const messages = await Message.find({
			recipientId: req.user._id,
			delivered: false,
		}).lean();

		return res.status(200).json({ chatMessages: messages });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: error, message: error?.message });
	}
};

exports.receivedMessages = async (req, res) => {
	try {
		console.log(req.body);
		const messagesIds = req.body;
		const objectIds = messagesIds.map((id) => new mongoose.Types.ObjectId(id));
		await Message.updateMany(
			{ _id: { $in: objectIds } },
			{ $set: { delivered: true } }
		);

		return res.status(200).json({ message: "Delivered" });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: error, message: error?.message });
	}
};

exports.restoreMessages = async (req, res) => {
	try {
		const messages = await Message.find({
			$or: [{ recipientId: req.user._id }, { senderId: req.user._id }],
		}).sort({
			createdAt: 1,
		});

		return res
			.status(200)
			.json({ message: "Messages Reterieved", chatMessages: messages });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: error, message: error?.message });
	}
};

exports.messageSocket = (io) => {
	console.log("hissdasd");
	io.on("connection", (socket) => {
		const userId = socket.user._id.toString();
		// const userId = socket.handshake.query.token;
		// if (clients.has(socket)) {
		// console.log("User already connected");
		// } else {
		console.log(`User connected: ${userId}`);
		socket.join(userId);
		connectedUsers[userId] = socket;
		console.log(userId, socket.id);

		socket.on("messageReceived", async (messageId) => {
			await Message.updateOne({ _id: messageId }, { delivered: true });
		});
		socket.on("ping", () => {
			console.log("pong");
		});
		// Handle disconnection
		socket.on("disconnect", () => {
			console.log(`User disconnected: ${userId}`);
			connectedUsers[userId] = undefined;
		});
		// }
	});
	io.on("connect_error", (err) => {
		console.log(`connect_error hnyo due to ${err.message}`);
	});
};
