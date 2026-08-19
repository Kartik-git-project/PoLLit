import React from "react";
import AuthLayout from "../components/AuthLayout";
import OtpStep from "../components/OtpStep";
import { useAuth } from "../context/AuthContext";
import { Navigate, useLocation, useNavigate, Link } from "react-router-dom";
import { verifyOtpStyles as s } from "../assets/dummyStyles";

const VerifyOtpPage = () => {
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const email = useLocation().state?.email;

  if (!email) return <Navigate to="/signup" replace />;

  // to submit
  const submit = async (otp) => {
    await verifyOtp({ email, otp });
    navigate("/login", { state: { verified: true } });
  };

  return (
    <AuthLayout
      title="Check your inbox"
      subtitle="We sent a 6-digit code to verify your email address."
    >
      <OtpStep
        email={email}
        onSubmit={submit}
        onResend={() => resendOtp(email)}
        submitText="Verify email &rarr;"
      />

      <p className={s.footerText}>
        Wrong email?{" "}
        <Link to="/signup" className={s.link}>
          Go Back
        </Link>
      </p>
    </AuthLayout>
  );
};

export default VerifyOtpPage;