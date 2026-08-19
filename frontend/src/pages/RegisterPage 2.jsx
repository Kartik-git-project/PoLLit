import React, { useState } from "react";
import { signupStyles as s } from "../assets/dummyStyles";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { AlertCircle, User, Camera, Eye, EyeOff } from "lucide-react";
import { authInputCls, AuthButton } from "../components/UIElements";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const change = (e) =>
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

  // for image handling
  const pickImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // to submit the form data and get otp
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (image) data.append("image", image);
      await register(data);
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (err) {
      setError(err.response?.data?.message || "Signup Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join thousands of people shaping opinions."
    >
      {error && (
        <div className={s.errorBox}>
          <AlertCircle size={16} className={s.errorIcon} />
          <p className={s.errorText}>{error}</p>
        </div>
      )}

      <form onSubmit={submit} className={s.form}>
        {/* for avatar */}
        <div className={s.avatarContainer}>
          <label className={s.avatarLabel}>
            <div className={s.avatarCircle}>
              {preview ? (
                <img src={preview} alt="preview" className={s.avatarImage} />
              ) : (
                <User size={22} className={s.avatarPlaceholder} />
              )}
            </div>
            <span className={s.avatarCamera}>
              <Camera size={10} className={s.avatarCameraIcon} />
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={pickImage}
            />
          </label>
          <div>
            <p className={s.avatarInfoTitle}>Profile photo</p>
            <p className={s.avatarInfoSub}>Optional • PNG or JPG</p>
          </div>
        </div>

        <div className=" grid grid-cols-2 gap-3">
          <div className={s.field}>
            <label className={s.label}>Full name</label>
            <input
              name="name"
              required
              placeholder="Your Name"
              value={form.name}
              onChange={change}
              className={authInputCls}
            />
          </div>

          <div className={s.field}>
            <label className={s.label}>Email</label>
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={change}
              className={authInputCls}
            />
          </div>
        </div>

        <div className={s.field}>
          <label className={s.label}>Username</label>
          <div className={s.inputWrapper}>
            <span className={s.prefix}>@</span>
            <input
              name="username"
              required
              placeholder="u_name"
              value={form.username}
              onChange={change}
              className={`${s.inputWithPrefix} ${authInputCls}`}
            />
          </div>
        </div>

        <div className={s.field}>
          <label className={s.label}>Password</label>
          <div className={s.inputWrapper}>
            <input
              name="password"
              type={show ? "text" : "password"}
              required
              placeholder="Min 8 characters"
              minLength={8}
              value={form.password}
              onChange={change}
              className={`${s.inputWithSuffix} ${authInputCls}`}
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className={s.toggleButton}
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {form.password.length > 0 && (
            <div className={s.strengthContainer}>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`${s.strengthBarBase} ${
                    form.password.length >= i * 3
                      ? i <= 1
                        ? s.strengthWeak
                        : i <= 2
                        ? s.strengthMedium
                        : i <= 3
                        ? s.strengthStrong
                        : s.strengthVeryStrong
                      : s.strengthInactive
                  }`}
                />
              ))}
            </div>
          )}
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
                Creating account...
              </>
            ) : (
              <>Create account &rarr;</>
            )}
          </AuthButton>
        </div>
      </form>

      <p className={s.footerText}>
        Already have an account?{" "}
        <Link to="/login" className={s.footerLink}>
          Sign in
        </Link>
      </p>

      <p className={s.terms}>
        By creating an account, you agree to our Terms of Service.
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;