"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

export default function StudentNotifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [name, setName] = useState("");
  const [isDark, setIsDark] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    const role = localStorage.getItem("role");
    if (!storedName || role !== "student") {
      router.push("/");
      return;
    }
    setName(storedName);
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await API.get("/overrides/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await API.post("/overrides/notifications/read-all");
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const t = isDark ? {
    pageBg: "#0a0f1e", navBg: "#0d1b4b", navBorder: "#1e3a6e",
    cardBg: "#131929", cardBorder: "#1e2d4a",
    textPrimary: "#ffffff", textSecondary: "#94a3b8", textMuted: "#64748b",
    textAccent: "#60a5fa", unreadBg: "#0d1b4b", unreadBorder: "#1e3a6e",
    readBg: "#0a0f1e", readBorder: "#1e2d4a", roleBg: "#1e3a6e", roleText: "#60a5fa",
  } : {
    pageBg: "#f1f5f9", navBg: "#ffffff", navBorder: "#e2e8f0",
    cardBg: "#ffffff", cardBorder: "#e2e8f0",
    textPrimary: "#0f172a", textSecondary: "#334155", textMuted: "#64748b",
    textAccent: "#2563eb", unreadBg: "#eff6ff", unreadBorder: "#bfdbfe",
    readBg: "#f8fafc", readBorder: "#e2e8f0", roleBg: "#dbeafe", roleText: "#1d4ed8",
  };

  const getNotifStyle = (type: string) => {
    if (type === "cancellation") return { icon: "❌", bg: isDark ? "#2d0f0f" : "#fef2f2" };
    if (type === "reschedule_pending") return { icon: "⏳", bg: isDark ? "#1a1200" : "#fffbeb" };
    if (type === "reschedule_approved") return { icon: "✅", bg: isDark ? "#0f2d1f" : "#f0fdf4" };
    if (type === "reschedule_rejected") return { icon: "🚫", bg: isDark ? "#2d0f0f" : "#fef2f2" };
    return { icon: "🔔", bg: isDark ? "#0d1b4b" : "#eff6ff" };
  };

  return (
    <div className="min-h-screen transition-all duration-300"
      style={{ background: t.pageBg }}>
      {/* Navbar */}
      <div className="px-6 py-4 flex justify-between items-center"
        style={{ background: t.navBg, borderBottom: `1px solid ${t.navBorder}` }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: "#2563eb" }}>
            <span className="text-white font-bold text-xs">AMS</span>
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: t.textPrimary }}>
              Access Management System
            </p>
            <p className="text-xs" style={{ color: t.textAccent }}>University of Moratuwa</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium" style={{ color: t.textPrimary }}>{name}</p>
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: t.roleBg, color: t.roleText }}>Student</span>
          </div>
          <button
            onClick={() => setIsDark(!isDark)}
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}
          >
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
          <button
            onClick={() => router.push("/dashboard/student")}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: t.cardBg, color: t.textAccent, border: `1px solid ${t.cardBorder}` }}
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: t.textPrimary }}>
              Notifications
            </h1>
            <p className="text-sm mt-1" style={{ color: t.textMuted }}>
              {(notifications as any[]).filter(n => !n.is_read).length} unread
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={markAllRead}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: t.cardBg, color: t.textAccent, border: `1px solid ${t.cardBorder}` }}>
              Mark all read
            </button>
            <button onClick={fetchNotifications}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: t.cardBg, color: t.textMuted, border: `1px solid ${t.cardBorder}` }}>
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto mb-3"/>
            <p style={{ color: t.textMuted }}>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 rounded-2xl"
            style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
            <p className="text-4xl mb-3">🔔</p>
            <p className="font-medium" style={{ color: t.textPrimary }}>No notifications yet</p>
            <p className="text-sm mt-1" style={{ color: t.textMuted }}>
              Cancellations and schedule changes will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {(notifications as any[]).map((notif) => {
              const style = getNotifStyle(notif.type);
              return (
                <div key={notif.id} className="p-4 rounded-xl transition-all"
                  style={{
                    background: notif.is_read ? t.readBg : t.unreadBg,
                    border: `1px solid ${notif.is_read ? t.readBorder : t.unreadBorder}`,
                  }}>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: style.bg }}>
                      <span>{style.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed"
                        style={{ color: notif.is_read ? t.textSecondary : t.textPrimary }}>
                        {notif.message}
                      </p>
                      <p className="text-xs mt-1" style={{ color: t.textMuted }}>
                        {new Date(notif.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                        style={{ background: "#2563eb" }}/>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}