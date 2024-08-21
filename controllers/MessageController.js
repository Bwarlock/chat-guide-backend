const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const Message = require("../models/MessageModel");

async function syncMessages(user, message) {
	// do the socket checking first
	// in case socket is not available
	await User.findByIdAndUpdate(message.recipientId, {
		$push: { messageQueue: message._id },
	});
}

exports.createMessage = async (req, res) => {
	try {
		const data = req.body;
		const message = await Message.create(data);
		await message.save();
		syncMessages(req.user, message);

		return res.status(200).json({ chatMessage: message });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: error, message: error?.message });
	}
};

exports.getMessages = async (req, res) => {
	try {
		const user = await User.findOne({ _id: req.user._id }).populate(
			"messageQueue"
		);

		return res.status(200).json({ chatMessages: user.messageQueue });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: error, message: error?.message });
	}
};

exports.deleteMessageQueue = async (req, res) => {
	try {
		await User.findByIdAndUpdate(
			req.user._id,
			{ $set: { messageQueue: [] } } // Set messageQueue to an empty array
		);
		return res.status(200).json({ message: "Message Queue Deleted" });
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
