const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const Message = require("../models/MessageModel");

const mongoose = require("mongoose");
const Image = require("../models/ImageModel");
const formidable = require("formidable");
const fs = require("fs");
const connectedUsers = {};

// async function syncMessages(user, message) {
// 	// do the socket checking first
// 	// in case socket is not available
// 	await User.findByIdAndUpdate(message.recipientId, {
// 		$push: { messageQueue: message._id },
// 	});
// }
exports.getImage = async (req, res) => {
	try {
		const { id } = req.params;
		const message = await Message.findById(id).populate("image", "imageBase64");
		console.log(message.recipientId, req.user._id, message.senderId);
		if (
			(message.recipientId.toString() == req.user._id.toString() ||
				message.senderId.toString() == req.user._id.toString()) &&
			message.image.imageBase64
		) {
			return res.status(200).send(message.image.imageBase64);
		} else {
			throw new Error("Unauthorized or Missing Resource");
		}
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: error, message: error?.message });
	}
};

exports.createMessage = async (req, res) => {
	const form = new formidable.IncomingForm();
	console.log("hi creating");
	form.parse(req, async (error, fields, files) => {
		if (error) {
			console.log(error);
			return res.status(500).json({ error: error, message: error?.message });
		}
		try {
			const MessageSocket = require("./MessageSocket");
			const msgSocket = MessageSocket.getSocket();

			const { senderId, recipientId, messageType, message, imageUrl } = fields;
			const data = {
				senderId: senderId[0],
				recipientId: recipientId[0],
				messageType: messageType[0],
				message: message[0],
				imageUrl: imageUrl[0],
			};

			const imageFile = files.image ? files.image[0] : null;
			let imageId = null;

			if (data.messageType == "image" && imageFile) {
				if (imageFile.size > 10 * 1024 * 1024) {
					return res
						.status(400)
						.json({ message: "File size exceeds the 10 MB limit." });
				}
				console.log(imageFile);
				const imageBase64 = fs.readFileSync(imageFile.filepath, {
					encoding: "base64",
				});
				const newImage = await Image.create({
					fileName: imageFile.originalFilename,
					fileSize: imageFile.size,
					mimeType: imageFile.mimetype,
					imageBase64: imageBase64,
				});
				await newImage.save();
				imageId = newImage._id;
			}

			if (imageId) {
				data.image = imageId;
			}

			// console.log(data, imageFile);

			const newMessage = await Message.create(data);
			await newMessage.save();
			const reciId = newMessage.recipientId.toString();
			if (connectedUsers[reciId] && connectedUsers[reciId].id) {
				const id = connectedUsers[reciId].id;
				msgSocket.to(id).emit("receiveMessage", newMessage);
			}

			return res.status(200).json({ chatMessage: newMessage });
		} catch (error) {
			console.log(error);
			return res.status(500).json({ error: error, message: error?.message });
		}
	});
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
