const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

exports.authMiddleware = async (req, res, next) => {
	// console.log(req);
	try {
		const token = req.header("Authorization").replace("Bearer ", "");
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findOne({ _id: decoded.id });

		if (!user) {
			return res.status(401).json({ message: "Please authenticate" });
		}
		req.user = user;
		next();
	} catch (error) {
		return res.status(401).json({ message: "Please authenticate" });
	}
};

exports.socketAuthMiddleware = async (socket, next) => {
	try {
		console.log("hiiiii socket auth");
		const token = socket.handshake.auth.token;
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findOne({ _id: decoded.id });

		if (!user) {
			throw new Error("Please authenticate");
		}
		socket.user = user;
		next();
	} catch (error) {
		console.log(error);
		socket.emit("error", { message: error.message });
		socket.disconnect();
	}
};
