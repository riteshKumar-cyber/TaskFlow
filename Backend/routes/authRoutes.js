const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  register,
  login,
  updatePassword,
  updateProfilePhoto,
  deleteAccount,
  updateProfileDetails,
} = require("../controllers/authcontroller");

const router = express.Router();

router.post(
  "/register",
  register
);

router.post(
  "/login",
  login
);

router.put(
  "/update-password",
  protect,
  updatePassword
);

router.put(
  "/update-profile-photo",
  protect,
  updateProfilePhoto
);

router.put(
  "/update-profile-details",
  protect,
  updateProfileDetails
);

router.delete(
  "/delete-account",
  protect,
  deleteAccount
);

module.exports = router;