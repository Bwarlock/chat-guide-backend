const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

exports.register = async (req, res) => {
	try {
		const data = req.body;
		const user = await User.create(data);
		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
		await user.save();

		return res
			.status(200)
			.json({ message: "Registered successfully", token: token, user: user });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: error, message: error?.message });
	}
};

exports.login = async (req, res) => {
	try {
		const { password, ...rest } = req.body;
		user = await User.findOne(rest);
		if (!user || !(await bcrypt.compare(password, user.password))) {
			return res.status(404).json({ message: "Invalid Credentials" });
		}
		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

		return res
			.status(200)
			.json({ message: "Login Successful", token: token, user: user });
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: error, message: error?.message });
	}
};
