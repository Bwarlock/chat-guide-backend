const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");

router.get("/get-users", UserController.users);
router.get("/get-user/:id", UserController.user);
router.get("/get-friends", UserController.friends);
router.get("/find-users", UserController.findUsers);
router.get("/get-friend-requests", UserController.getFriendRequest);
router.post("/send-friend-request", UserController.sendFriendRequest);
router.post("/cancel-friend-request", UserController.cancelFriendRequest);
router.post("/accept-friend-request", UserController.acceptFriendRequest);

module.exports = router;
