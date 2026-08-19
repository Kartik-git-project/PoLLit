import React, { useState } from 'react'
import { forgotPasswordStyles as s } from '../assets/dummyStyles';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import OtpStep from '../components/OtpStep';
import { authInputCls, AuthButton } from '../components/UIElements';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

const ForgotPasswordPage = () => {
  const { forgotPassword, verifyResetOtp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const titles = ["Reset your password", "Check your inbox", "New password"];
  const subtitles = [
    "Enter your email and we'll send you a reset code.",
    "Enter the 6-digit code we sent to your email.",
    "Choose a strong password for your account.",
  ];

  //  to send code
  const sendCode = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await forgotPassword(email);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Could not send code");
    } finally {
      setBusy(false);
    }
  };

  const verify = async (code) => {
    await verifyResetOtp({ email, otp: code });
    setOtp(code);
    setStep(3);
  };

  //  to reset the password
  const reset = async (e) => {
    e.preventDefault();
    setError("");
    if (pw !== pw2) return setError("Password do not match");
    setBusy(true);
    try {
      await resetPassword({ email, otp, password: pw });
      navigate("/login", { state: { reset: true } });
    } catch (err) {
      setError(err.response?.data?.message || "Could not reset password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title={titles[step - 1]}
      subtitle={subtitles[step - 1]}
    >
      {/* step indicator */}
      <div className={s.stepContainer}>
        {[1, 2, 3].map((sNum) => (
          <div
            key={sNum}
            className={`${s.stepItemWrapper} ${sNum < 3 ? "flex-1" : ""}`}
          >
            <div
              className={`${s.stepCircleBase} ${
                sNum < step
                  ? s.stepCircleDone
                  : sNum === step
                    ? s.stepCircleActive
                    : s.stepCircleInactive
              }`}
            >
              {sNum < step ? "✓" : sNum}
            </div>
            {sNum < 3 && (
              <div
                className={`${s.stepLineBase} ${
                  sNum < step ? s.stepLineDone : s.stepLineInactive
                }`}
              />
            )}
          </div>
        ))}
      </div>

        {error && (
        <div className={s.errorBox}>
            <AlertCircle size={16} className={s.errorIcon} />
            <p className={s.errorText}>{error}</p>
        </div>
        )}

        {/* step 1 */}
        {step === 1 && (
        <form onSubmit={sendCode} className={s.emailForm}>
            <div className={s.emailInputWrapper}>
            <label className={s.label}>Email address</label>
            <input
                type="email"
                className={authInputCls}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            </div>
            <div className=" pt-1">
            <AuthButton disabled={busy}>
                {busy ? (
                <>
                    <svg
                    className="animate-spin w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                    />
                    </svg>
                    Sending code...
                </>
                ) : (
                "Send Reset Code →"
                )}
            </AuthButton>
            </div>
        </form>
        )}

        {/* step 2 */}
        {step === 2 && (
        <OtpStep
            email={email}
            onSubmit={verify}
            onResend={() => forgotPassword(email)}
            submitText="Verify Code →"
        />
        )}

        {/* Step 3 — New password */}
      {step === 3 && (
        <form onSubmit={reset} className={s.newPasswordForm}>
          <div className={s.passwordInputWrapper}>
            <label className={s.label}>New password</label>
            <div className={s.passwordInputWithToggle}>
              <input
                className={`${authInputCls} ${s.passwordInput}`}
                type={showPw ? "text" : "password"}
                minLength={8}
                required
                placeholder="Min. 8 characters"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className={s.toggleButton}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className={s.passwordInputWrapper}>
            <label className={s.label}>Confirm password</label>
            <div className={s.passwordInputWithToggle}>
              <input
                className={`${authInputCls} ${
                  pw2 && pw2 === pw
                    ? s.confirmInputValid
                    : pw2
                      ? s.confirmInputInvalid
                      : ""
                }`}
                type={showPw ? "text" : "password"}
                minLength={8}
                required
                placeholder="Re-enter password"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
              />
              {pw2 && (
                <span
                  className={`${s.confirmFeedback} ${
                    pw2 === pw ? s.confirmFeedbackValid : s.confirmFeedbackInvalid
                  }`}
                >
                  {pw2 === pw ? "✓" : "✗"}
                </span>
              )}
            </div>
          </div>
          <div className="pt-1">
            <AuthButton disabled={busy || pw !== pw2}>
              {busy ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Resetting…
                </>
              ) : (
                "Reset password →"
              )}
            </AuthButton>
          </div>
        </form>
      )}

        <p className={s.footerLink}>
            Remember it?{" "}
            <Link  to="/login" className={s.link}>
                Sign in
            </Link>
        </p>

    </AuthLayout>
  );
}

export default ForgotPasswordPage;