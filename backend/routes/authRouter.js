import express from "express";
import { changePassword, deleteAccount, getMe, login, register, resendOtp, updateProfile, verifyOtp } from "../controllers/authController.js";
import { forgotPassword, resetPassword, verifyResetOtp } from "../controllers/passwordController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../config/cloudinary.js";

const authRouter = express.Router();

// Safe upload wrapper that catches any file parsing issues
const safeUpload = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.warn("Multer Notice:", err.message);
    }
    next();
  });
};

authRouter.post('/register', safeUpload, register);
authRouter.post('/verify-otp', verifyOtp);
authRouter.post('/resend-otp', resendOtp);

authRouter.post('/login', login);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/verify-reset-otp', verifyResetOtp);

authRouter.post('/reset-password', resetPassword);
authRouter.get('/me', protect, getMe);
authRouter.patch('/profile', protect, safeUpload, updateProfile);

authRouter.patch('/password', protect, changePassword);
authRouter.delete('/account', protect, deleteAccount);

export default authRouter;