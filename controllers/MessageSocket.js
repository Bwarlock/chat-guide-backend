const { Server } = require("socket.io");

let msgSocket;

module.exports = {
	init: (server) => {
		msgSocket = new Server(server, {
			cors: {
				origin: "*",
				// methods: ["GET", "POST"],
			},
		});
		return msgSocket;
	},
	getSocket: () => {
		if (!msgSocket) {
			throw new Error("Socket.io not initialized");
		}
		return msgSocket;
	},
};
