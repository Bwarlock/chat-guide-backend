const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

exports.user = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).lean();

		return res.status(200).json({ user: user });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: error, message: error?.message });
	}
};

exports.users = async (req, res) => {
	try {
		const users = await User.find({
			_id: {
				$nin: [
					...req.user.friends,
					...req.user.sentFriendRequests,
					req.user._id,
				],
			},
			private: false,
		}).lean();

		res.status(200).json({ message: "Users Retrieved", users: users });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: error, message: error?.message });
	}
};

exports.friends = async (req, res) => {
	try {
		const user = await User.findById(req.user._id)
			.populate("friends", "name email image username")
			.lean();

		return res.status(200).json({ friends: user.friends });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: error, message: error?.message });
	}
};
exports.findUsers = async (req, res) => {
	try {
		const { searchQuery } = req.query;
		const users = await User.find({
			_id: {
				$nin: [
					...req.user.friends,
					...req.user.sentFriendRequests,
					req.user._id,
				],
			},
			$or: [
				{ name: { $regex: searchQuery, $options: "i" } },
				{ username: { $regex: searchQuery, $options: "i" } },
				{ email: { $regex: searchQuery, $options: "i" } },
			],
		});

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
			.populate("sentFriendRequests", "name email image")
			.lean();

		return res.status(200).json({
			friendRequests: user.friendRequests,
			sentFriendRequests: user.sentFriendRequests,
		});
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

exports.cancelFriendRequest = async (req, res) => {
	try {
		const { id } = req.body;
		const senderUserId = req.user._id;
		console.log(id, senderUserId);
		//update the recepient's friendRequestsArray!

		await User.findByIdAndUpdate(id, {
			$pull: { friendRequests: senderUserId },
		});
		await User.findByIdAndUpdate(senderUserId, {
			$pull: { sentFriendRequests: id },
		});

		return res.status(200).json({ message: "Friend Request Cancelled" });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: error, message: error?.message });
	}
};

exports.acceptFriendRequest = async (req, res) => {
	try {
		const { id } = req.body;
		const recipientId = req.user._id;

		// Remove friend requests using $pull
		await User.findByIdAndUpdate(recipientId, {
			$pull: {
				friendRequests: id,
				sentFriendRequests: id,
			},
		});

		await User.findByIdAndUpdate(id, {
			$pull: {
				friendRequests: recipientId,
				sentFriendRequests: recipientId,
			},
		});

		// Add each other to friends list using $addToSet to prevent duplicates
		await User.findByIdAndUpdate(id, { $addToSet: { friends: recipientId } });
		await User.findByIdAndUpdate(recipientId, { $addToSet: { friends: id } });

		return res.status(200).json({ message: "Friend Request accepted" });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: error, message: error?.message });
	}
};

exports.private = async (req, res) => {
	try {
		const { private } = req.body;
		console.log(private);
		await User.findByIdAndUpdate(req.user._id, {
			private: private ?? req.user.private,
		});

		return res.status(200).json({ message: "Private Preference Changed" });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: error, message: error?.message });
	}
};
