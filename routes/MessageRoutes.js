const express = require("express");
const router = express.Router();
const MessageController = require("../controllers/MessageController");

router.post("/create-message", MessageController.createMessage);
router.get("/get-messages", MessageController.getMessages);
router.post("/received-messages", MessageController.receivedMessages);
router.get("/restore-messages", MessageController.restoreMessages);

module.exports = router;
