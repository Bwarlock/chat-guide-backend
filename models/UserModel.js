const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	username: {
		type: String,
		required: true,
		unique: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	image: {
		type: String,
	},
	private: {
		type: Boolean,
		default: false,
	},
	friendRequests: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],
	friends: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],
	sentFriendRequests: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	],
});

userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();
	this.password = await bcrypt.hash(this.password, 12);
	next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
