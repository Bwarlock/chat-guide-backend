const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
	{
		senderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		recipientId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			index: true,
		},
		messageType: {
			type: String,
			enum: ["text", "image"],
		},
		delivered: {
			type: Boolean,
			default: false,
			index: true,
		},
		message: String,
		imageUrl: String,
		image: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Image",
		},
	},
	{ timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
