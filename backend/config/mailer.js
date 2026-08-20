import nodemailer from "nodemailer";

export const sendOtpEmail = async (to, otp, text) => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, "") : "";

  if (!user || !pass) {
    throw new Error("SMTP_USER or SMTP_PASS is missing in environment variables.");
  }

  // Optimized Transporter configuration for Gmail Port 465
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true, // true for 465
    auth: { user, pass },
    connectionTimeout: 10000, // 10s timeout to prevent infinite blocking
  });

  console.log("--> Attempting to send OTP email to:", to);

  return await transporter.sendMail({
    from: `PollIt <${process.env.EMAIL_FROM || user}>`,
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