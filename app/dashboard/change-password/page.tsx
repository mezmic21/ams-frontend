"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [isDark, setIsDark] = useState(true);
  const [isForced, setIsForced] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusType, setStatusType] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    const storedRole = localStorage.getItem("role");
    const mustChange = localStorage.getItem("must_change_password") === "true";
    if (!storedName || !storedRole) {
      router.push("/");
      return;
    }
    setName(storedName);
    setRole(storedRole);
    setIsForced(mustChange);
  }, []);

  const getDashboardPath = (r: string) => {
    if (r === "student") return "/dashboard/student";
    if (r === "lecturer") return "/dashboard/lecturer";
    return "/dashboard/admin/select";
  };

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setStatusType("error");
      setStatusMsg("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatusType("error");
      setStatusMsg("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setStatusType("error");
      setStatusMsg("New password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      await API.post("/profile/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setStatusType("success");
      setStatusMsg("Password changed successfully! Redirecting...");
      localStorage.setItem("must_change_password", "false");
      setTimeout(() => router.push(getDashboardPath(role)), 1500);
    } catch (err: any) {
      setStatusType("error");
      setStatusMsg(err.response?.data?.detail || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const t = isDark ? {
    pageBg: "#0a0f1e", navBg: "#0d1b4b", navBorder: "#1e3a6e",
    cardBg: "#131929", cardBorder: "#1e2d4a",
    textPrimary: "#ffffff", textSecondary: "#94a3b8", textMuted: "#64748b",
    textAccent: "#60a5fa", inputBg: "#0d1b4b", inputBorder: "#1e3a6e",
  } : {
    pageBg: "#f1f5f9", navBg: "#ffffff", navBorder: "#e2e8f0",
    cardBg: "#ffffff", cardBorder: "#e2e8f0",
    textPrimary: "#0f172a", textSecondary: "#334155", textMuted: "#64748b",
    textAccent: "#2563eb", inputBg: "#f8fafc", inputBorder: "#cbd5e1",
  };

  const inputStyle = {
    background: t.inputBg, border: `1px solid ${t.inputBorder}`,
    color: t.textPrimary, borderRadius: "10px", padding: "10px 14px",
    width: "100%", fontSize: "14px", outline: "none",
  };

  return (
    <div className="min-h-screen transition-all duration-300" style={{ background: t.pageBg }}>
      {/* Navbar */}
      <div className="px-6 py-4 flex justify-between items-center"
        style={{ background: t.navBg, borderBottom: `1px solid ${t.navBorder}` }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#2563eb" }}>
            <span className="text-white font-bold text-xs">AMS</span>
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: t.textPrimary }}>Access Management System</p>
            <p className="text-xs" style={{ color: t.textAccent }}>University of Moratuwa</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium" style={{ color: t.textPrimary }}>{name}</p>
          <button onClick={() => setIsDark(!isDark)}
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
            {isDark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
          {!isForced && (
            <button onClick={() => router.push(getDashboardPath(role))}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: t.cardBg, color: t.textAccent, border: `1px solid ${t.cardBorder}` }}>
              ← Back
            </button>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-12">
        {isForced && (
          <div className="mb-6 p-4 rounded-xl"
            style={{ background: isDark ? "#1a1200" : "#fffbeb", border: "1px solid #f59e0b" }}>
            <p className="text-sm font-medium" style={{ color: "#f59e0b" }}>
              🔑 You're logging in with a temporary password. Please set a new personal password to continue.
            </p>
          </div>
        )}

        <div className="rounded-2xl p-6" style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
          <h1 className="text-xl font-bold mb-1" style={{ color: t.textPrimary }}>
            {isForced ? "Set Your Password" : "Change Password"}
          </h1>
          <p className="text-sm mb-6" style={{ color: t.textMuted }}>
            {isForced
              ? "Choose a personal password — minimum 6 characters"
              : "Enter your current password and choose a new one"}
          </p>

          {statusType !== "idle" && (
            <div className="mb-4 p-3 rounded-xl"
              style={{
                background: statusType === "success" ? (isDark ? "#0f2d1f" : "#f0fdf4") : (isDark ? "#2d0f0f" : "#fef2f2"),
                border: `1px solid ${statusType === "success" ? "#10b981" : "#ef4444"}`
              }}>
              <p className="text-sm" style={{ color: statusType === "success" ? "#10b981" : "#ef4444" }}>
                {statusMsg}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: t.textSecondary }}>
                {isForced ? "Temporary Password" : "Current Password"}
              </label>
              <input type="password"
                placeholder={isForced ? "Enter your temporary password" : "Enter current password"}
                value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                style={inputStyle}/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: t.textSecondary }}>
                New Password
              </label>
              <input type="password" placeholder="Minimum 6 characters"
                value={newPassword} onChange={e => setNewPassword(e.target.value)}
                style={inputStyle}/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: t.textSecondary }}>
                Confirm New Password
              </label>
              <input type="password" placeholder="Repeat new password"
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                style={inputStyle}/>
            </div>
          </div>

          <button onClick={handleSubmit} disabled={submitting}
            className="w-full mt-6 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: "#2563eb", opacity: submitting ? 0.7 : 1 }}>
            {submitting ? "Saving..." : isForced ? "Set Password & Continue" : "Change Password"}
          </button>
        </div>
      </div>
    </div>
  );
}