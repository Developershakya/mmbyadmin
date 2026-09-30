"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Eye, EyeOff, KeyRound, Pencil, UserRound } from "lucide-react";
import Header from "@/components/Header";
import useAuth from "@/lib/useAuth";

function Feedback({ message, error = false }) {
  if (!message) return null;
  return <p role="status" className={`mt-4 rounded-lg px-3 py-2 text-sm ${error ? "bg-[#FBE6E2] text-[#A32A17]" : "bg-[#E6F7EF] text-[#137A52]"}`}>{message}</p>;
}

export default function ProfilePage() {
  const router = useRouter();
  const authenticatedUser = useAuth();
  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState({ name: "", email: "", phone: "" });
  const [editing, setEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState("");
  const [profileError, setProfileError] = useState(false);
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  useEffect(() => {
    if (authenticatedUser === null) router.replace("/login");
    if (authenticatedUser) {
      setProfile(authenticatedUser);
      setDraft({
        name: authenticatedUser.name || "",
        email: authenticatedUser.email || "",
        phone: authenticatedUser.phone || "",
      });
    }
  }, [authenticatedUser, router]);

  async function saveProfile(event) {
    event.preventDefault();
    const updates = Object.fromEntries(
      Object.entries(draft).filter(([field, value]) => value !== (profile[field] || "")),
    );
    if (!Object.keys(updates).length) {
      setEditing(false);
      setProfileFeedback("No profile changes to save.");
      return;
    }
    setSavingProfile(true);
    setProfileFeedback("");
    setProfileError(false);
    try {
      const response = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Profile update failed.");
      setProfile(data.user);
      setDraft({ name: data.user.name || "", email: data.user.email || "", phone: data.user.phone || "" });
      setEditing(false);
      setProfileFeedback("Profile updated successfully.");
      window.dispatchEvent(new Event("auth-user-updated"));
      router.refresh();
    } catch (error) {
      setProfileError(true);
      setProfileFeedback(error.message || "Profile update failed.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(event) {
    event.preventDefault();
    setPasswordFeedback("");
    setPasswordError(false);
    if (password.newPassword !== password.confirmPassword) {
      setPasswordError(true);
      setPasswordFeedback("New password and confirmation do not match.");
      return;
    }
    if (password.newPassword.length < 8) {
      setPasswordError(true);
      setPasswordFeedback("New password must be at least 8 characters.");
      return;
    }

    setSavingPassword(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(password),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Password update failed.");
      setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordFeedback(data.message || "Password updated successfully.");
    } catch (error) {
      setPasswordError(true);
      setPasswordFeedback(error.message || "Password update failed.");
    } finally {
      setSavingPassword(false);
    }
  }

  if (authenticatedUser === undefined || !profile) {
    return <div className="min-h-screen bg-[#FAF7F2] text-[#1A1205]"><Header dashboard/><p className="p-8 text-sm text-[#8A7A60]">Loading profile...</p></div>;
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A1205]">
      <Header dashboard />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="font-[Poppins] text-2xl font-bold">Profile</h1>
          <p className="mt-1 text-sm text-[#8A7A60]">Your account information and security settings.</p>
        </div>

        <section className="mb-5 rounded-2xl border border-[#EDE5D8] bg-white p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-[Poppins] text-base font-bold"><UserRound size={18} className="text-[#C8901A]"/>Personal Information</h2>
            {!editing && <button type="button" onClick={() => { setEditing(true); setProfileFeedback(""); }} className="flex items-center gap-2 rounded-lg border border-[#EDE5D8] px-3 py-2 text-sm font-semibold"><Pencil size={15}/>Edit Profile</button>}
          </div>
          {editing ? (
            <form onSubmit={saveProfile} className="space-y-4">
              {[["Full name", "name", "text"], ["Email", "email", "email"], ["Mobile / phone", "phone", "tel"]].map(([label, field, type]) => <label key={field} className="block text-sm font-semibold">{label}<input required={field !== "phone"} type={type} autoComplete={field === "phone" ? "tel" : field} value={draft[field]} onChange={(event) => setDraft((current) => ({ ...current, [field]: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-[#EDE5D8] bg-white px-3 py-2.5 font-normal outline-none focus:border-[#C8901A]"/></label>)}
              <div className="flex gap-2"><button disabled={savingProfile} className="rounded-lg bg-[#C8901A] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{savingProfile ? "Saving..." : "Save changes"}</button><button type="button" disabled={savingProfile} onClick={() => { setEditing(false); setDraft({ name: profile.name || "", email: profile.email || "", phone: profile.phone || "" }); }} className="rounded-lg border border-[#EDE5D8] px-4 py-2.5 text-sm font-semibold">Cancel</button></div>
            </form>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">{[["Name", profile.name], ["Email", profile.email], ["Mobile / phone", profile.phone]].map(([label, value]) => <div key={label}><div className="text-xs font-bold uppercase text-[#8A7A60]">{label}</div><div className="mt-1 break-words text-sm font-semibold">{value || "N/A"}</div></div>)}</div>
          )}
          <Feedback message={profileFeedback} error={profileError}/>
        </section>

        <section className="rounded-2xl border border-[#EDE5D8] bg-white p-5 sm:p-6">
          <h2 className="mb-5 flex items-center gap-2 font-[Poppins] text-base font-bold"><KeyRound size={18} className="text-[#C8901A]"/>Change Password</h2>
          <form onSubmit={changePassword} className="space-y-4">
            {[["Current password", "currentPassword"], ["New password", "newPassword"], ["Confirm new password", "confirmPassword"]].map(([label, field]) => <label key={field} className="block text-sm font-semibold">{label}<input required type="password" autoComplete={field === "currentPassword" ? "current-password" : "new-password"} value={password[field]} onChange={(event) => setPassword((current) => ({ ...current, [field]: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-[#EDE5D8] px-3 py-2.5 font-normal outline-none focus:border-[#C8901A]"/></label>)}
            <button type="submit" disabled={savingPassword} className="flex items-center gap-2 rounded-lg bg-[#1A1205] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{savingPassword ? "Updating..." : <><Check size={15}/>Update password</>}</button>
          </form>
          <Feedback message={passwordFeedback} error={passwordError}/>
        </section>
      </main>
    </div>
  );
}