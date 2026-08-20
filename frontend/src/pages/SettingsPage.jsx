import React, { useState } from 'react'
import { settingsStyles as s } from '../assets/dummyStyles'
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import Avatar, { Button, inputCls } from '../components/UIElements';
import { Camera, Eye, EyeOff, Trash2 } from 'lucide-react';
import axios from 'axios';

const Label = ({ children }) => <span className={s.label}>{children}</span>;

const Section = ({ title, children }) => (
  <div className={s.section}>
    <h2 className={s.sectionTitle}>{title}</h2>
    {children}
  </div>
);


function PwField(props) {
  const [show, setShow] = useState(false);
  return (
    <div className={s.pwWrapper}>
      <input
        {...props}
        type={show ? "text" : "password"}
        className={`${inputCls} ${s.pwInput}`}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className={s.pwToggle}
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}
 

const SettingsPage = () => {

  const { user, updateProfile, changePassword, logout } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState({
    name: user?.name || "",
    username: user?.username || "",
    bio: user?.bio || "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [busy, setBusy] = useState("");

  const pickImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // Run an async action, show a toast on success/failure.
  const run = (key, fn, ok) => async (e) => {
    e.preventDefault();
    setBusy(key);
    try {
      await fn();
      toast(ok);
    } catch (e2) {
      toast(e2.response?.data?.message || "Something went wrong", "error");
    } finally {
      setBusy("");
    }
  };

  const saveProfile = run(
    "profile",
    async () => {
      const fd = new FormData();
      fd.append("name", profile.name);
      fd.append("username", profile.username);
      fd.append("bio", profile.bio);
      if (image) fd.append("image", image);
      await updateProfile(fd);
    },
    "Profile updated!",
  );

  const savePassword = run(
    "password",
    async () => {
      await changePassword(pw);
      setPw({ currentPassword: "", newPassword: "" });
    },
    "Password updated!",
  );

  // NEW: Delete Account Functionality
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action is permanent and will remove all your polls and comments."
    );

    if (!confirmDelete) return;

    setBusy("delete");
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'https://pollit-11av.onrender.com'}/api/users/account`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast("Account deleted successfully!");
      if (logout) logout();
      else {
        localStorage.clear();
        window.location.href = "/login";
      }
    } catch (error) {
      toast(error.response?.data?.message || "Failed to delete account", "error");
    } finally {
      setBusy("");
    }
  };

return (
    <div className={s.container}>
      <h1 className={s.heading}>Settings</h1>

      {/* Profile Section */}
      <Section title="Profile">
        <form onSubmit={saveProfile} className="space-y-4">
          <div className={s.avatarRow}>
            <label className={s.avatarLabel}>
              <div className={s.avatarWrapper}>
                {preview ? (
                  <img src={preview} alt="preview" className={s.avatarImage} />
                ) : (
                  <Avatar user={user || {}} className={s.avatarPlaceholder} />
                )}

                <span className={s.avatarCameraBadge}>
                  <Camera size={10} />
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={pickImage}
              />
            </label>
            <div>
              <p className={s.avatarInfoTitle}>Profile photo</p>
              <p className={s.avatarInfoSub}>PNG or JPG</p>
            </div>
          </div>

          <div className={s.fieldRow}>
            <div className={s.fieldGroup}>
              <Label>Full name</Label>
              <input
                className={inputCls}
                value={profile.name}
                required
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    name: e.target.value,
                  })
                }
              />
            </div>

            <div className={s.fieldGroup}>
              <Label>Username</Label>
              <input
                className={inputCls}
                value={profile.username}
                required
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    username: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div>
            <Label>Email</Label>
            <input
              value={user?.email || ""}
              disabled
              className={`${inputCls} ${s.disabledInput}`}
            />
            <p className={s.disabledHint}>Email cannot be changed</p>
          </div>

          {/* Bio */}
          <div>
            <div className={s.bioRow}>
              <Label>Bio</Label>
              <span className={s.bioCharCount}>
                {profile.bio.length}/160
              </span>
            </div>
            <textarea
              value={profile.bio}
              maxLength={160}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  bio: e.target.value,
                })
              }
              className={`${s.bioTextarea} ${inputCls}`}
              placeholder="Tell the community about yourself"
            ></textarea>
          </div>

          <Button
            disabled={busy === "profile"}
            className={s.saveButton}
          >
            {busy === "profile" ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </Section>

      {/* Change Password Section */}
      <Section title="Change password">
        <form onSubmit={savePassword} className={s.passwordForm}>
          <div>
            <Label>Current password</Label>
            <PwField
              value={pw.currentPassword}
              required
              onChange={(e) =>
                setPw({
                  ...pw,
                  currentPassword: e.target.value,
                })
              }
            />
          </div>

          <div>
            <Label>New password</Label>
            <PwField
              value={pw.newPassword}
              minLength={8}
              required
              onChange={(e) =>
                setPw({
                  ...pw,
                  newPassword: e.target.value,
                })
              }
            />
          </div>

          <Button
            disabled={busy === "password"}
            className={s.saveButton}
          >
            {busy === "password" ? "Updating..." : "Update password"}
          </Button>
        </form>
      </Section>

      {/* Danger Zone / Delete Account Section */}
      <Section title="Danger Zone">
        <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-red-500 font-semibold text-sm">Delete Account</h3>
            <p className="text-xs text-gray-400 mt-1">
              Once deleted, your profile, polls, and comments will be permanently removed.
            </p>
          </div>
          <button
            type="button"
            disabled={busy === "delete"}
            onClick={handleDeleteAccount}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <Trash2 size={14} />
            {busy === "delete" ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </Section>
    </div>
  );
}

export default SettingsPage