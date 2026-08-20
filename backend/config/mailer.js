import { Resend } from "resend";

export const sendOtpEmail = async (to, otp, text) => {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    console.log("--> Sending OTP via Resend HTTP API to:", to);

    const data = await resend.emails.send({
      from: "PollIt <onboarding@resend.dev>", // Resend free testing domain
      to: [to],
      subject: text || "Verify your PollIt account",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #000; color: #fff;">
          <h2 style="color: #10b981;">PollIt Verification Code</h2>
          <p>Use the following OTP to complete your verification:</p>
          <h1 style="letter-spacing: 4px; color: #10b981;">${otp}</h1>
          <p style="color: #666; font-size: 12px;">Valid for 10 minutes.</p>
        </div>
      `,
    });

    console.log("✅ Email Sent Successfully via Resend!", data);
    return data;
  } catch (error) {
    console.error("❌ Resend Mailer Error:", error.message);
  }
};