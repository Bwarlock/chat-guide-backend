const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

exports.users = async (req, res) => {
	try {
		const users = await User.find({
			_id: { $nin: [...req.user.friends, req.user._id] },
		});

		res.status(200).json({ message: "Users Retrieved", users: users });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: error, message: error?.message });
	}
};

exports.friends = async (req, res) => {
	try {
		const user = await User.findById(req.user._id)
			.populate("friends", "name email image")
			.lean();
		console.log(user);
		return res.status(200).json({ friends: user.friends });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: error, message: error?.message });
	}
};
exports.findUsers = async (req, res) => {
	try {
		const users = await User.find({ _id: { $ne: req.user._id } });

		res.status(200).json({ message: "Users Found", users: users });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: error, message: error?.message });
	}
};

exports.getFriendRequest = async (req, res) => {
	try {
		//fetch the user document based on the User id
		const user = await User.findById(req.user._id)
			.populate("friendRequests", "name email image")
			.lean();
		console.log(user);
		return res.status(200).json({ friendRequests: user.friendRequests });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: error, message: error?.message });
	}
};

exports.sendFriendRequest = async (req, res) => {
	try {
		const { id } = req.body;
		const senderUserId = req.user._id;
		console.log(id, senderUserId);
		//update the recepient's friendRequestsArray!
		await User.findByIdAndUpdate(id, {
			$push: { friendRequests: senderUserId },
		});

		//update the sender's sentFriendRequests array
		await User.findByIdAndUpdate(senderUserId, {
			$push: { sentFriendRequests: id },
		});

		return res.status(200).json({ message: "Friend Request Sent" });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: error, message: error?.message });
	}
};

exports.acceptFriendRequest = async (req, res) => {
	try {
		const { id } = req.body;
		const recepientId = req.user._id;

		//retrieve the documents of sender and the recipient
		const sender = await User.findById(id);
		const recepient = await User.findById(recepientId);

		sender.friends.push(recepientId);
		recepient.friends.push(id);

		recepient.friendRequests = recepient.friendRequests.filter(
			(request) => request.toString() !== id.toString()
		);
		recepient.sentFriendRequests = sender.sentFriendRequests.filter(
			(request) => request.toString() !== id.toString()
		);

		sender.sentFriendRequests = sender.sentFriendRequests.filter(
			(request) => request.toString() !== recepientId.toString()
		);
		sender.friendRequests = recepient.friendRequests.filter(
			(request) => request.toString() !== recepientId.toString()
		);

		await sender.save();
		await recepient.save();

		return res.status(200).json({ message: "Friend Request accepted" });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: error, message: error?.message });
	}
};
