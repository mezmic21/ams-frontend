"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function AdminDashboard() {
  const router = useRouter();
  const [halls, setHalls] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [accessLog, setAccessLog] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [selectedDay, setSelectedDay] = useState(
    Math.min(new Date().getDay() - 1, 4) < 0 ? 0 : Math.min(new Date().getDay() - 1, 4)
  );

  const today = Math.min(new Date().getDay() - 1, 4) < 0
    ? -1
    : Math.min(new Date().getDay() - 1, 4);

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    const role = localStorage.getItem("role");
    if (!storedName || role !== "admin") {
      router.push("/");
      return;
    }
    setName(storedName);
    fetchHallsAndLog();
  }, []);

  useEffect(() => {
    fetchTimetable(selectedDay);
  }, [selectedDay]);

const [pendingOverrides, setPendingOverrides] = useState([]);

  const fetchHallsAndLog = async () => {
    try {
      const [hallsRes, logRes, pendingRes] = await Promise.all([
        API.get("/halls/"),
        API.get("/access/log"),
        API.get("/overrides/pending"),
      ]);
      setHalls(hallsRes.data);
      setAccessLog(logRes.data);
      setPendingOverrides(pendingRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetable = async (day: number) => {
    try {
      const res = await API.get(`/timetable/?day=${day}`);
      setTimetable(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  const handleApprove = async (overrideId: string) => {
    try {
      await API.post(`/overrides/approve/${overrideId}`);
      fetchHallsAndLog();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (overrideId: string) => {
    try {
      await API.post(`/overrides/reject/${overrideId}`);
      fetchHallsAndLog();
    } catch (err) {
      console.error(err);
    } 
  };

  const fetchAll = () => {
    fetchHallsAndLog();
    fetchTimetable(selectedDay);
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  // Theme
  const t = isDark ? {
    pageBg: "#0a0f1e",
    navBg: "#0d1b4b",
    navBorder: "#1e3a6e",
    cardBg: "#131929",
    cardBorder: "#1e2d4a",
    slotBg: "#0d1b4b",
    slotBorder: "#1e3a6e",
    textPrimary: "#ffffff",
    textSecondary: "#94a3b8",
    textMuted: "#64748b",
    textAccent: "#60a5fa",
    dayUnselected: "#0d1b4b",
    dayUnselectedText: "#94a3b8",
    dayUnselectedBorder: "#1e2d4a",
    dayToday: "#1e3a6e",
    dayTodayText: "#60a5fa",
    dayTodayBorder: "#1e3a6e",
    tableBorder: "#1e2d4a",
    tableHover: "#0d1b4b",
    logoutBg: "#131929",
    logoutText: "#94a3b8",
    logoutBorder: "#1e2d4a",
    roleBg: "#3b1764",
    roleText: "#c084fc",
  } : {
    pageBg: "#f1f5f9",
    navBg: "#ffffff",
    navBorder: "#e2e8f0",
    cardBg: "#ffffff",
    cardBorder: "#e2e8f0",
    slotBg: "#f8fafc",
    slotBorder: "#cbd5e1",
    textPrimary: "#0f172a",
    textSecondary: "#334155",
    textMuted: "#64748b",
    textAccent: "#2563eb",
    dayUnselected: "#f1f5f9",
    dayUnselectedText: "#475569",
    dayUnselectedBorder: "#cbd5e1",
    dayToday: "#dbeafe",
    dayTodayText: "#1d4ed8",
    dayTodayBorder: "#93c5fd",
    tableBorder: "#e2e8f0",
    tableHover: "#f8fafc",
    logoutBg: "#f1f5f9",
    logoutText: "#475569",
    logoutBorder: "#cbd5e1",
    roleBg: "#f3e8ff",
    roleText: "#7e22ce",
  };

  const getOccupancyColor = (occupancy: number, capacity: number) => {
    const pct = (occupancy / capacity) * 100;
    if (pct >= 85) return { bg: isDark ? "#2d0f0f" : "#fef2f2", border: "#ef4444", bar: "#ef4444" };
    if (pct >= 50) return { bg: isDark ? "#1a1200" : "#fffbeb", border: "#f59e0b", bar: "#f59e0b" };
    return { bg: isDark ? "#0f2d1f" : "#f0fdf4", border: "#10b981", bar: "#10b981" };
  };

  return (
    <div className="min-h-screen transition-all duration-300"
      style={{ background: t.pageBg }}>

      {/* Navbar */}
      <div className="px-6 py-4 flex justify-between items-center transition-all duration-300"
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
            <p className="text-xs" style={{ color: t.textAccent }}>
              University of Moratuwa · Faculty of Engineering · Mechanical Engineering
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium" style={{ color: t.textPrimary }}>{name}</p>
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: t.roleBg, color: t.roleText }}>
              Admin
            </span>
          </div>

          {/* Theme switcher */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
            style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}
          >
            {isDark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#6366f1" strokeWidth="2" strokeLinecap="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          <button
            onClick={() => router.push("/dashboard/admin/enroll")}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: t.logoutBg, color: "#10b981", border: `1px solid ${t.logoutBorder}` }}
          >
            + Enroll Face
          </button>

          <button
            onClick={() => router.push("/dashboard/admin/notifications")}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
            style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}
          >
            <span style={{ color: t.textAccent }}>🔔</span>
          </button>

          <button
            onClick={() => router.push("/dashboard/admin/select")}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: t.logoutBg, color: t.textAccent, border: `1px solid ${t.logoutBorder}` }}
          >
            ← Back
          </button>
          <button
            onClick={() => router.push("/dashboard/change-password")}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: t.cardBg, color: t.textMuted, border: `1px solid ${t.cardBorder}` }}
          >
            🔑 Password
          </button>
          
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: t.logoutBg, color: t.logoutText, border: `1px solid ${t.logoutBorder}` }}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1" style={{ color: t.textPrimary }}>
            Mechanical Engineering Dashboard
          </h1>
          <p style={{ color: t.textMuted }}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long", year: "numeric",
              month: "long", day: "numeric",
            })}
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Halls", value: halls.length, color: "#2563eb" },
            {
              label: "Occupied Now",
              value: (halls as any[]).filter(h => h.status === "occupied").length,
              color: "#10b981"
            },
            { label: `Activities on ${DAYS[selectedDay]}`, value: timetable.length, color: "#a855f7" },
            { label: "Access Events", value: accessLog.length, color: "#f59e0b" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl p-5 transition-all duration-300"
              style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
              <p className="text-3xl font-bold mb-1" style={{ color: stat.color }}>
                {stat.value}
              </p>
              <p className="text-sm" style={{ color: t.textMuted }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Halls Grid */}
        <div className="rounded-2xl overflow-hidden mb-8 transition-all duration-300"
          style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
          <div className="px-6 py-4" style={{ borderBottom: `1px solid ${t.cardBorder}` }}>
            <h2 className="font-semibold" style={{ color: t.textPrimary }}>
              Lecture Hall Status
            </h2>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto mb-3"/>
                <p style={{ color: t.textMuted }}>Loading halls...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {(halls as any[]).map((hall) => {
                  const colors = getOccupancyColor(hall.current_occupancy, hall.capacity);
                  return (
                    <div key={hall.id} className="p-4 rounded-xl transition-all"
                      style={{ background: colors.bg, border: `1px solid ${colors.border}` }}>
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold" style={{ color: t.textPrimary }}>
                          {hall.name}
                        </p>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: hall.status === "occupied"
                              ? isDark ? "#064e3b" : "#dcfce7"
                              : isDark ? "#1e2d4a" : "#f1f5f9",
                            color: hall.status === "occupied" ? "#10b981" : t.textMuted
                          }}>
                          {hall.status === "occupied" ? "● Occupied" : "Vacant"}
                        </span>
                      </div>
                      <p className="text-xs mb-2" style={{ color: t.textSecondary }}>
                        {hall.building}
                      </p>
                      {hall.current_subject && (
                        <p className="text-xs font-medium mb-1" style={{ color: t.textPrimary }}>
                          {hall.current_subject}
                        </p>
                      )}
                      {hall.current_lecturer && (
                        <p className="text-xs mb-2" style={{ color: t.textSecondary }}>
                          {hall.current_lecturer}
                        </p>
                      )}
                      <div className="flex justify-between text-xs mb-1"
                        style={{ color: t.textMuted }}>
                        <span>{hall.current_occupancy}/{hall.capacity}</span>
                        <span>{Math.round((hall.current_occupancy / hall.capacity) * 100)}%</span>
                      </div>
                      <div className="w-full rounded-full h-1.5"
                        style={{ background: isDark ? "#1e2d4a" : "#e2e8f0" }}>
                        <div className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${Math.min((hall.current_occupancy / hall.capacity) * 100, 100)}%`,
                            background: colors.bar
                          }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Schedule + Day Selector */}
        <div className="rounded-2xl overflow-hidden mb-8 transition-all duration-300"
          style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
          <div className="px-6 py-4" style={{ borderBottom: `1px solid ${t.cardBorder}` }}>
            <h2 className="font-semibold" style={{ color: t.textPrimary }}>Schedule</h2>
          </div>
          <div className="p-4">
            {/* Day Selector */}
            <div className="flex gap-2 flex-wrap mb-6">
              {DAYS.map((day, index) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(index)}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    background: selectedDay === index
                      ? "#2563eb"
                      : index === today
                      ? t.dayToday
                      : t.dayUnselected,
                    color: selectedDay === index
                      ? "white"
                      : index === today
                      ? t.dayTodayText
                      : t.dayUnselectedText,
                    border: selectedDay === index
                      ? "1px solid #2563eb"
                      : index === today
                      ? `1px solid ${t.dayTodayBorder}`
                      : `1px solid ${t.dayUnselectedBorder}`,
                  }}
                  onMouseEnter={(e) => {
                    if (selectedDay !== index) {
                      (e.target as HTMLElement).style.borderColor = "#2563eb";
                      (e.target as HTMLElement).style.color = "#2563eb";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedDay !== index) {
                      (e.target as HTMLElement).style.borderColor =
                        index === today ? t.dayTodayBorder : t.dayUnselectedBorder;
                      (e.target as HTMLElement).style.color =
                        index === today ? t.dayTodayText : t.dayUnselectedText;
                    }
                  }}
                >
                  {day}
                  {index === today && <span className="ml-1 text-xs opacity-70">•</span>}
                </button>
              ))}
            </div>

            {timetable.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-2xl mb-2">📅</p>
                <p style={{ color: t.textMuted }}>
                  No lectures scheduled for {DAYS[selectedDay]}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${t.tableBorder}` }}>
                      {["Subject", "Hall", "Lecturer", "Batch", "Time"].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide"
                          style={{ color: t.textMuted }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(timetable as any[]).map((slot) => (
                      <tr key={slot.id}
                        className="transition-all"
                        style={{ borderBottom: `1px solid ${t.tableBorder}` }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = t.tableHover)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium" style={{ color: t.textPrimary }}>
                              {slot.subject.replace(/\s*\([LPDT]|CAD\)\s*$/, "").replace(/\s*\(CAD\)\s*$/, "")}
                            </span>
                            {slot.subject.includes("(P)") && (
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{
                                  background: isDark ? "#422006" : "#fff7ed",
                                  color: isDark ? "#f97316" : "#c2410c"
                                }}>
                                Practical
                              </span>
                            )}
                            {(slot.subject.includes("(L)") || slot.subject.includes("(T)") || slot.subject.includes("(D)") || slot.subject.includes("(CAD)")) && (
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{
                                  background: isDark ? "#1e3a6e" : "#eff6ff",
                                  color: isDark ? "#60a5fa" : "#1d4ed8"
                                }}>
                                {slot.subject.includes("(T)") ? "Tutorial" : slot.subject.includes("(D)") ? "Drawing" : slot.subject.includes("(CAD)") ? "CAD" : "Lecture"}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4" style={{ color: t.textSecondary }}>
                          {slot.hall}
                        </td>
                        <td className="py-3 px-4" style={{ color: t.textSecondary }}>
                          {slot.lecturer}
                        </td>
                        <td className="py-3 px-4" style={{ color: t.textSecondary }}>
                          {slot.batch}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs px-2 py-1 rounded-lg font-medium"
                            style={{
                              background: isDark ? "#1e3a6e" : "#eff6ff",
                              color: isDark ? "#60a5fa" : "#1d4ed8"
                            }}>
                            {slot.start_time.slice(0, 5)} — {slot.end_time.slice(0, 5)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Pending Approvals */}
        {(pendingOverrides as any[]).length > 0 && (
          <div className="rounded-2xl overflow-hidden mb-8 transition-all duration-300"
            style={{ background: isDark ? "#1a1200" : "#fffbeb", border: "1px solid #f59e0b" }}>
            <div className="px-6 py-4 flex justify-between items-center"
              style={{ borderBottom: "1px solid #f59e0b" }}>
              <div className="flex items-center gap-2">
                <span>⏳</span>
                <h2 className="font-semibold" style={{ color: "#f59e0b" }}>
                  Pending Reschedule Approvals
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                  style={{ background: "#f59e0b", color: "#000" }}>
                  {(pendingOverrides as any[]).length}
                </span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {(pendingOverrides as any[]).map((override) => (
                <div key={override.id} className="p-4 rounded-xl"
                  style={{ background: isDark ? "#131929" : "#ffffff", border: `1px solid ${override.has_clash ? "#ef4444" : t.cardBorder}` }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm" style={{ color: t.textPrimary }}>
                          {override.subject}
                        </p>
                        {override.has_clash ? (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: isDark ? "#2d0f0f" : "#fef2f2", color: "#ef4444" }}>
                            ⚠️ Clash detected
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: isDark ? "#0f2d1f" : "#f0fdf4", color: "#10b981" }}>
                            ✅ No clash
                          </span>
                        )}
                      </div>
                      <p className="text-xs mb-3" style={{ color: t.textSecondary }}>
                        Requested by {override.lecturer}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div className="p-2 rounded-lg"
                          style={{ background: isDark ? "#2d0f0f" : "#fef2f2" }}>
                          <p style={{ color: t.textMuted }}>Original date</p>
                          <p className="font-medium" style={{ color: "#ef4444" }}>
                            {override.override_date}
                          </p>
                        </div>
                        <div className="p-2 rounded-lg"
                          style={{ background: isDark ? "#0f2d1f" : "#f0fdf4" }}>
                          <p style={{ color: t.textMuted }}>New date</p>
                          <p className="font-medium" style={{ color: "#10b981" }}>
                            {override.new_date}
                          </p>
                        </div>
                        <div className="p-2 rounded-lg"
                          style={{ background: isDark ? "#0d1b4b" : "#eff6ff" }}>
                          <p style={{ color: t.textMuted }}>Old hall</p>
                          <p className="font-medium" style={{ color: t.textAccent }}>
                            {override.old_hall}
                          </p>
                        </div>
                        <div className="p-2 rounded-lg"
                          style={{ background: isDark ? "#0d1b4b" : "#eff6ff" }}>
                          <p style={{ color: t.textMuted }}>New hall</p>
                          <p className="font-medium" style={{ color: t.textAccent }}>
                            {override.new_hall}
                          </p>
                        </div>
                      </div>

                      {override.new_start_time && (
                        <p className="text-xs mb-2" style={{ color: t.textSecondary }}>
                          New time: {override.new_start_time.slice(0, 5)} — {override.new_end_time.slice(0, 5)}
                        </p>
                      )}
                      <p className="text-xs italic mb-3" style={{ color: t.textMuted }}>
                        Reason: {override.reason}
                      </p>

                      {/* Clash details */}
                      {override.has_clash && (
                        <div className="p-3 rounded-xl"
                          style={{ background: isDark ? "#2d0f0f" : "#fef2f2", border: "1px solid #ef4444" }}>
                          <p className="text-xs font-semibold mb-2" style={{ color: "#ef4444" }}>
                            ⚠️ The following sessions clash with this timeslot:
                          </p>
                          {override.clashes.map((clash: any, i: number) => (
                            <div key={i} className="text-xs mb-1 flex items-center gap-2">
                              <span style={{ color: "#ef4444" }}>•</span>
                              <span style={{ color: isDark ? "#fca5a5" : "#7f1d1d" }}>
                                {clash.subject} ({clash.start_time.slice(0, 5)} — {clash.end_time.slice(0, 5)})
                                {clash.type === "rescheduled_slot" && " [rescheduled]"}
                              </span>
                            </div>
                          ))}
                          <p className="text-xs mt-2" style={{ color: isDark ? "#fca5a5" : "#7f1d1d" }}>
                            Approving this may cause a double-booking.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Approve / Reject */}
                    <div className="flex flex-col gap-2 min-w-20">
                      <button
                        onClick={() => handleApprove(override.id)}
                        className="px-4 py-2 rounded-lg text-xs font-medium text-white"
                        style={{ background: override.has_clash ? "#b45309" : "#059669" }}
                      >
                        {override.has_clash ? "Approve anyway" : "Approve"}
                      </button>
                      <button
                        onClick={() => handleReject(override.id)}
                        className="px-4 py-2 rounded-lg text-xs font-medium text-white"
                        style={{ background: "#dc2626" }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Access Log */}
        <div className="rounded-2xl overflow-hidden transition-all duration-300"
          style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
          <div className="px-6 py-4 flex justify-between items-center"
            style={{ borderBottom: `1px solid ${t.cardBorder}` }}>
            <h2 className="font-semibold" style={{ color: t.textPrimary }}>
              Live Access Log
            </h2>
            <button
              onClick={fetchAll}
              className="text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{ background: t.slotBg, color: t.textAccent, border: `1px solid ${t.slotBorder}` }}
            >
              Refresh
            </button>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto mb-3"/>
                <p style={{ color: t.textMuted }}>Loading...</p>
              </div>
            ) : accessLog.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-2xl mb-2">📋</p>
                <p style={{ color: t.textMuted }}>No access events yet</p>
                <p className="text-xs mt-1" style={{ color: t.textMuted }}>
                  Events will appear here when the Pi scans a face
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${t.tableBorder}` }}>
                      {["Person", "Hall", "Event", "Method", "Status", "Time"].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-semibold uppercase tracking-wide"
                          style={{ color: t.textMuted }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(accessLog as any[]).map((event) => (
                      <tr key={event.id}
                        className="transition-all"
                        style={{ borderBottom: `1px solid ${t.tableBorder}` }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = t.tableHover)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td className="py-3 px-4 font-medium" style={{ color: t.textPrimary }}>
                          {event.user}
                        </td>
                        <td className="py-3 px-4" style={{ color: t.textSecondary }}>
                          {event.hall}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs px-2 py-1 rounded-full font-medium"
                            style={{
                              background: event.event_type === "entry"
                                ? isDark ? "#064e3b" : "#dcfce7"
                                : isDark ? "#1e2d4a" : "#f1f5f9",
                              color: event.event_type === "entry" ? "#10b981" : t.textMuted
                            }}>
                            {event.event_type}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs px-2 py-1 rounded-full font-medium"
                            style={{
                              background: isDark ? "#2e1065" : "#f5f3ff",
                              color: isDark ? "#c084fc" : "#7e22ce"
                            }}>
                            {event.method}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs px-2 py-1 rounded-full font-medium"
                            style={{
                              background: event.granted
                                ? isDark ? "#064e3b" : "#dcfce7"
                                : isDark ? "#2d0f0f" : "#fef2f2",
                              color: event.granted ? "#10b981" : "#ef4444"
                            }}>
                            {event.granted ? "Granted" : "Denied"}
                          </span>
                        </td>
                        <td className="py-3 px-4" style={{ color: t.textMuted }}>
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}