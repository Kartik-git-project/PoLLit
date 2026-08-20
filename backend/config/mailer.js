export const sendOtpEmail = async (to, otp, text) => {
  try {
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
      console.error("❌ Brevo Error: BREVO_API_KEY is missing in env.");
      return;
    }

    console.log("--> Sending OTP via Brevo Direct API to:", to);

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "PollIt", email: "noreply@pollit.com" },
        to: [{ email: to }],
        subject: text || "Verify your PollIt account",
        htmlContent: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #000; color: #fff;">
            <h2 style="color: #10b981;">PollIt Verification Code</h2>
            <p>Use the following OTP to complete your verification:</p>
            <h1 style="letter-spacing: 4px; color: #10b981;">${otp}</h1>
            <p style="color: #666; font-size: 12px;">Valid for 10 minutes.</p>
          </div>
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to send email");
    }

    console.log("✅ Email Sent Successfully via Brevo Direct API!", data);
    return data;
  } catch (error) {
    console.error("❌ Brevo Mailer Error:", error.message);
  }
};