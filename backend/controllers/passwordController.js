import { sendOtpEmail } from "../config/mailer.js";
import User from "../models/User.js";
import { generateOtp, otpExpiry, otpValid } from "../utils/otp.js";


// if user forget the password send an email OTP
export const forgotPassword = async (req, res) =>{
    try {
        const user = await User.findOne({email: req.body.email});
        if(!user) return res.status(400).json({
            message: "No account with this email"
        });
        
        user.otp = generateOtp();
        user.otpExpires = otpExpiry();

        await user.save();
        await sendOtpEmail(user.email, user.otp, "reset your pollit password");
        res.json({
            message: "OTP sned to your email"
        });
    }
    
    catch (err) {
        res.status(500).json({message: err.message});
    }
}


// to chec the OTP is valid or not   
export const verifyResetOtp = async(req, res) =>{
    try {
        const {email,otp} = req.body;
        const user = await User.findOne({email});
        if(!user) return res.status(400).json({
            message: "User not found"
        });  

        if(!otpValid(user, otp)) return res.status(400).json({
            message: "Invalid or expired OTP"
        });
        res.json({ok: true});
    } 
    
    catch (err) {
        res.status(500).json({message: err.message});
    }
}

// to reset the password
export const resetPassword = async (req, res) =>{
    try {
        const {email, otp, password} = req.body;
        if(!password || password.length < 8){
            return res.status(400).json({
                message : "Password must be atleast of 8 characters"
            }); 
        }  

        const user = await User.findOne({email});
        if(!user) return res.status(400).json({
            message: "User not found"
        });  

        if(!otpValid(user, otp)) return res.status(400).json({
            message: "Invalid or expired OTP"
        });

        user.password = password;
        user.otp = undefined;
        user.otpExpires = undefined;
        user.isVerified = true;
        await user.save();
        res.json({
            message: "Password reset successfully"
        });
    } 

    catch (err) {
        res.status(500).json({message: err.message});
    }
}


