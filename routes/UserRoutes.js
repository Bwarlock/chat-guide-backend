const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/get-users", UserController.users);
router.get("/get-friends", UserController.friends);
router.get("/find-users", UserController.findUsers);
router.get("/get-friend-requests", UserController.getFriendRequest);
router.post("/send-friend-request", UserController.sendFriendRequest);
router.post("/accept-friend-request", UserController.acceptFriendRequest);

module.exports = router;
