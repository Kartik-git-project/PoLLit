import nodemailer from "nodemailer";

export const sendOtpEmail = async (to, otp, text) => {
  try {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, "") : "";

    if (!user || !pass) {
      console.error("❌ SMTP Error: Credentials missing in environment variables.");
      return;
    }

    // Gmail Service + Force IPv4 (Fixes Render ENETUNREACH error)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
      family: 4, // 🎯 FORCE IPv4 DNS Resolution
    });

    console.log("--> Attempting to send OTP email to:", to);

    const info = await transporter.sendMail({
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

    console.log("✅ Email Sent Successfully! Message ID:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Mailer Error Failed to Send:", error.message);
  }
};