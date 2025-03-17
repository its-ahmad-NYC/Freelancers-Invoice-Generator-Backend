const express = require("express");
const { signup, login, getProfile, updateProfile } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/multer");

const router = express.Router();

router.post("/signup", upload("profile_pics").single("profile_pic"), signup);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

module.exports = router;
