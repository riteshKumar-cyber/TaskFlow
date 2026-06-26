const User = require("../models/user");
const Task = require("../models/Task");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/GenerateToken");

const register = async (req, res) => {
  try {
    const { name, email, password } =
      req.body;

    const userExists =
      await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User Registered",
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user =
      await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Password",
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePhoto: user.profilePhoto || "",
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect current password",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({
      message: "Password updated successfully ✅",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateProfilePhoto = async (req, res) => {
  try {
    const { profilePhoto } = req.body;

    if (profilePhoto === undefined) {
      return res.status(400).json({
        message: "Profile photo is required",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.profilePhoto = profilePhoto;
    await user.save();

    res.json({
      message: "Profile photo updated successfully ✅",
      profilePhoto: user.profilePhoto,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Delete all tasks associated with this user
    await Task.deleteMany({ user: req.user._id });

    // Delete the user account
    await User.findByIdAndDelete(req.user._id);

    res.json({
      message: "Account deleted successfully ",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateProfileDetails = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check email availability if changing email
    if (email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          message: "Email address is already in use",
        });
      }
    }

    user.name = name;
    user.email = email;
    await user.save();

    res.json({
      message: "Profile details updated fully ",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto || "",
      }
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  updatePassword,
  updateProfilePhoto,
  deleteAccount,
  updateProfileDetails,
};