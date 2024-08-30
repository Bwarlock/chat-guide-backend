const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
	fileName: String,
	fileSize: Number,
	mimeType: String,
	imageBase64: String,
});

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;
