import Brevo from "@getbrevo/brevo";

export const sendOtpEmail = async (to, otp, text) => {
  try {
    const apiInstance = new Brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(
      Brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );

    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.subject = text || "Verify your PollIt account";
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.sender = { name: "PollIt", email: "noreply@pollit.com" };
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #000; color: #fff;">
        <h2 style="color: #10b981;">PollIt Verification Code</h2>
        <p>Use the following OTP to complete your verification:</p>
        <h1 style="letter-spacing: 4px; color: #10b981;">${otp}</h1>
        <p style="color: #666; font-size: 12px;">Valid for 10 minutes.</p>
      </div>
    `;

    console.log("--> Triggering OTP via Brevo API to:", to);
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Email Sent Successfully via Brevo!", data);
    return data;
  } catch (error) {
    console.error("❌ Brevo Mailer Error:", error.message || error);
  }
};