import nodemailer from "nodemailer";

export const sendOtpEmail = async (to, otp, text) => {
  // Transporter inside the function ensures .env is 100% loaded when sending
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, "") : "",
    },
  });

  // Debug check in terminal
  console.log("--> Sending OTP using account:", process.env.SMTP_USER);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP_USER or SMTP_PASS is undefined in process.env");
  }

  await transporter.sendMail({
    from: `PollIt <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
    to,
    subject: text || "Verify your PollIt account",
    text: `Your OTP for PollIt is: ${otp}. This code is valid for 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #000; color: #fff;">
        <h2 style="color: #10b981;">PollIt Verification Code</h2>
        <p>Use the following OTP to complete your verification:</p>
        <h1 style="letter-spacing: 4px; color: #10b981;">${otp}</h1>
        <p style="color: #666; font-size: 12px;">Valid for 10 minutes.</p>
      </div>
    `,
  });
};