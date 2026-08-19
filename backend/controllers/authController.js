import User from "../models/User.js";
import Poll from "../models/Poll.js";
import Comments from "../models/Comments.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { generateOtp, otpExpiry, otpValid } from "../utils/otp.js";
import { sendOtpEmail } from "../config/mailer.js";
import jwt from "jsonwebtoken";

// FIXED: process.env.JWT_SECRET instead of process.env
const makeToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const clean = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  username: u.username,
  avatar: u.avatar,
  bio: u.bio,
});

// to register a user and send otp to that email
export const register = async (req, res) => {
  let newUser = null;
  try {
    const { name, email, username, password } = req.body;
    if (!name || !email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists)
      return res.status(400).json({
        message: "Email or username already taken",
      });

    let avatar = "";
    if (req.file) {
      try {
        avatar = await uploadToCloudinary(req.file.buffer);
      } catch (e) {
        console.warn("Avatar upload skipped: ", e.message);
      }
    }

    const otp = generateOtp();
    newUser = await User.create({
      name,
      email,
      username,
      password,
      avatar,
      otp,
      otpExpires: otpExpiry(),
    });

    // Email sending with Rollback mechanism
    try {
      await sendOtpEmail(email, otp, "verify your PollIt account");
    } catch (emailError) {
      // Agar email bhejte waqt problem aati hai toh DB se unverified user ko delete kar do
      if (newUser) {
        await User.findByIdAndDelete(newUser._id);
      }
      console.error("Mailer Error:", emailError.message);
      return res.status(500).json({
        message: `Failed to send verification email: ${emailError.message}`,
      });
    }

    res.status(201).json({
      needsVerification: true,
      email,
    });
  } catch (err) {
    // Safety check for DB rollback
    if (newUser) {
      await User.findByIdAndDelete(newUser._id);
    }
    res.status(500).json({ message: err.message });
  }
};

// to verify otp
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({
        message: "User not found",
      });

    if (!user.isVerified && !otpValid(user, otp))
      return res.status(400).json({ message: "Invalid or expired OTP" });

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

// to resend OTP
export const resendOtp = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.otp = generateOtp();
    user.otpExpires = otpExpiry();

    await user.save();
    await sendOtpEmail(user.email, user.otp, "Verify your PollIt account");

    res.json({ message: "OTP sent successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// login a user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({
        message: "Invalid email or password",
      });

    if (!user.isVerified)
      return res.status(403).json({
        message: "Please verify your email first",
        needsVerification: true,
        email,
      });

    res.json({
      token: makeToken(user._id),
      user: clean(user),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// to update your profile
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

// to change the password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 8)
      return res.status(400).json({
        message: "New Password must be at least 8 characters",
      });

    const user = await User.findById(req.userId);
    if (!user)
      return res.status(400).json({
        message: "User not found",
      });

    if (!(await user.matchPassword(currentPassword)))
      return res.status(400).json({
        message: "Current Password is incorrect!",
      });

    user.password = newPassword;
    await user.save();
    res.json({
      message: "Password Updated!",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// to delete an account
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

// to get logged in user's profile
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(400).json({ message: "User not found" });

    // FIXED: Query updated from "voted.user" to "votes.user"
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

// to send reset password otp
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = otpExpiry();
    await user.save();

    await sendOtpEmail(email, otp, "reset your PollIt password");
    res.json({ message: "Password reset OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// to verify reset password otp
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

// to reset password
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