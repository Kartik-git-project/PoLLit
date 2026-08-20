import User from "../models/User.js";
import Poll from "../models/Poll.js";
import Comments from "../models/Comments.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { generateOtp, otpExpiry, otpValid } from "../utils/otp.js";
import { sendOtpEmail } from "../config/mailer.js";
import jwt from "jsonwebtoken";

const makeToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const clean = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  username: u.username,
  avatar: u.avatar,
  bio: u.bio,
});

// Register user and trigger OTP email
export const register = async (req, res) => {
  console.log("1. Register Request Received:", req.body);
  try {
    const { name, email, username, password } = req.body;
    console.log("2. Checking user existence...");

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    console.log("3. User exists check complete:", !!exists);

    let avatar = "";
    if (req.file) {
      console.log("4. Uploading to Cloudinary...");
      avatar = await uploadToCloudinary(req.file.buffer);
      console.log("5. Cloudinary Done:", avatar);
    }

    const otp = generateOtp();
    console.log("6. Creating User in DB...");
    const newUser = await User.create({
      name,
      email,
      username,
      password,
      avatar,
      otp,
      otpExpires: otpExpiry(),
    });
    console.log("7. User Created in DB!");

    return res.status(201).json({
      needsVerification: true,
      email: newUser.email,
    });
  } catch (err) {
    console.error("Register Error:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isVerified && !otpValid(user, otp)) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({
      token: makeToken(user._id),
      user: clean(user),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Resend OTP
export const resendOtp = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.otp = generateOtp();
    user.otpExpires = otpExpiry();
    await user.save();

    sendOtpEmail(user.email, user.otp, "Verify your PollIt account").catch((e) =>
      console.error("Resend Mailer Error:", e.message)
    );

    res.json({ message: "OTP sent successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email first",
        needsVerification: true,
        email,
      });
    }

    res.json({
      token: makeToken(user._id),
      user: clean(user),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const { name, username, bio } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (username && username !== user.username) {
      const taken = await User.findOne({ username });
      if (taken) return res.status(400).json({ message: "Username already taken" });
      user.username = username;
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;

    if (req.file) {
      try {
        user.avatar = await uploadToCloudinary(req.file.buffer);
      } catch (e) {
        console.warn("Avatar upload skipped:", e.message);
      }
    }

    await user.save();
    res.json({ user: clean(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        message: "New Password must be at least 8 characters",
      });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(400).json({ message: "User not found" });

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: "Current Password is incorrect!" });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: "Password Updated!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete account
export const deleteAccount = async (req, res) => {
  try {
    const id = req.userId;
    const myPolls = await Poll.find({ creator: id }).select("_id");
    const pollIds = myPolls.map((p) => p._id);

    await Comments.deleteMany({ $or: [{ user: id }, { poll: { $in: pollIds } }] });
    await Poll.deleteMany({ creator: id });
    await Poll.updateMany({}, { $pull: { votes: { user: id } } });
    await User.findByIdAndDelete(id);

    res.json({ message: "Account deleted Successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get current user profile
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(400).json({ message: "User not found" });

    const [created, voted] = await Promise.all([
      Poll.countDocuments({ creator: user._id }),
      Poll.countDocuments({ "votes.user": user._id }),
    ]);

    res.json({
      user: clean(user),
      stats: {
        created,
        voted,
        bookmarked: user.bookmarks ? user.bookmarks.length : 0,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Forgot password OTP
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = otpExpiry();
    await user.save();

    sendOtpEmail(email, otp, "reset your PollIt password").catch((e) =>
      console.error("Forgot Pass Mailer Error:", e.message)
    );

    res.json({ message: "Password reset OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify reset OTP
export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!otpValid(user, otp)) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!otpValid(user, otp)) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = password;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};