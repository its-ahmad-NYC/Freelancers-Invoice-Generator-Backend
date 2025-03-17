const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const {User} = require("../models/index");
const upload = require("../middlewares/multer");


const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidUsername = (username) => /^[a-zA-Z0-9_]{3,20}$/.test(username);
const isValidPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    
    const profilePic = req.file ? `http://localhost:5000/uploads/profile_pics/${req.file.filename}` : null;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    if (!isValidUsername(username)) {
      return res.status(400).json({
        message: "Username must be 3-20 characters (letters, numbers, underscores only)",
      });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters, include an uppercase letter, lowercase letter, a number, and a special character",
      });
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email: { [Op.iLike]: email } }, { username: { [Op.iLike]: username } }],
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email or username already taken" });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      profile_pic: profilePic, 
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        profile_pic: newUser.profile_pic, 
      },
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body; 

    if (!identifier || !password) {
      return res.status(400).json({ message: "Both fields are required" });
    }


    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: { [Op.iLike]: identifier } },
          { username: { [Op.iLike]: identifier } }
        ],
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    
    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" } 
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId; 

    const user = await User.findByPk(userId, {
      attributes: ["id", "username", "email", "createdAt", "updatedAt"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { username, email, password } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    
    if (email && !isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    if (username && !isValidUsername(username)) {
      return res.status(400).json({
        message: "Username must be 3-20 characters (letters, numbers, underscores only)",
      });
    }
    if (password && !isValidPassword(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters, include an uppercase letter, lowercase letter, a number, and a special character",
      });
    }

  
    if (req.file) {
      user.profile_pic = `http://localhost:5000/uploads/profile_pics/${req.file.filename}`;
    }

  
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profile_pic: user.profile_pic, 
      },
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

