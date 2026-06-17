"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function StudentDashboard() {
  const router = useRouter();
  const [timetable, setTimetable] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(
    Math.min(new Date().getDay() - 1, 4) < 0 ? 0 : Math.min(new Date().getDay() - 1, 4)
  );
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    const role = localStorage.getItem("role");
    if (!storedName || role !== "student") {
      router.push("/");
      return;
    }
    setName(storedName);
  }, []);

  useEffect(() => {
    fetchTimetable(selectedDay);
  }, [selectedDay]);

  const fetchTimetable = async (day: number) => {
    setLoading(true);
    try {
      const res = await API.get(`/timetable/?day=${day}`);
      setTimetable(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  const today = Math.min(new Date().getDay() - 1, 4) < 0
    ? -1
    : Math.min(new Date().getDay() - 1, 4);

  const getTimeStatus = (startTime: string, endTime: string) => {
    const now = new Date();
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    const start = startH * 60 + startM;
    const end = endH * 60 + endM;
    const current = now.getHours() * 60 + now.getMinutes();
    if (selectedDay !== today) return null;
    if (current >= start && current <= end) return "ongoing";
    if (current < start && start - current <= 30) return "upcoming";
    if (current > end) return "done";
    return null;
  };

  // Theme colors
  const t = isDark ? {
    pageBg: "#0a0f1e",
    navBg: "#0d1b4b",
    navBorder: "#1e3a6e",
    cardBg: "#131929",
    cardBorder: "#1e2d4a",
    slotBg: "#0d1b4b",
    slotBorder: "#1e3a6e",
    ongoingBg: "#0f2d1f",
    ongoingBorder: "#10b981",
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
    divider: "#1e3a6e",
    logoutBg: "#131929",
    logoutText: "#94a3b8",
    logoutBorder: "#1e2d4a",
    roleBg: "#1e3a6e",
    roleText: "#60a5fa",
  } : {
    pageBg: "#f1f5f9",
    navBg: "#ffffff",
    navBorder: "#e2e8f0",
    cardBg: "#ffffff",
    cardBorder: "#e2e8f0",
    slotBg: "#f8fafc",
    slotBorder: "#cbd5e1",
    ongoingBg: "#f0fdf4",
    ongoingBorder: "#10b981",
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
    divider: "#e2e8f0",
    logoutBg: "#f1f5f9",
    logoutText: "#475569",
    logoutBorder: "#cbd5e1",
    roleBg: "#dbeafe",
    roleText: "#1d4ed8",
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
              University of Moratuwa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium" style={{ color: t.textPrimary }}>
              {name}
            </p>
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: t.roleBg, color: t.roleText }}>
              Student
            </span>
          </div>

          {/* Theme switcher */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
            style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              // Sun icon
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
              // Moon icon
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#6366f1" strokeWidth="2" strokeLinecap="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
          <button
            onClick={() => router.push("/dashboard/student/notifications")}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
            style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}
          >
            <span style={{ color: t.textAccent }}>🔔</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: t.logoutBg,
              color: t.logoutText,
              border: `1px solid ${t.logoutBorder}`
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1" style={{ color: t.textPrimary }}>
            Good day, {name.split(" ")[0]}!
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
            { 
              label: "Total Today", 
              value: timetable.length, 
              color: "#2563eb" 
            },
            { 
              label: "Lectures", 
              value: (timetable as any[]).filter(s => 
                s.subject.includes("(L)") || 
                s.subject.includes("(T)") || 
                s.subject.includes("(D)") ||
                s.subject.includes("(CAD)")
              ).length, 
              color: "#60a5fa" 
            },
            { 
              label: "Practicals", 
              value: (timetable as any[]).filter(s => 
                s.subject.includes("(P)")
              ).length, 
              color: "#f97316" 
            },
            { label: "Main Hall", value: "MELR4", color: "#a855f7" },
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

        {/* Day Selector */}
        <div className="mb-6 rounded-2xl p-4 transition-all duration-300"
          style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
          <p className="text-xs mb-3 font-medium" style={{ color: t.textMuted }}>
            SELECT DAY
          </p>
          <div className="flex gap-2 flex-wrap">
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
                {index === today && (
                  <span className="ml-1 text-xs opacity-70">•</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Timetable */}
        <div className="rounded-2xl overflow-hidden transition-all duration-300"
          style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
          <div className="px-6 py-4" style={{ borderBottom: `1px solid ${t.cardBorder}` }}>
            <h2 className="font-semibold" style={{ color: t.textPrimary }}>
              {DAYS[selectedDay]} Schedule
            </h2>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto mb-3"/>
                <p style={{ color: t.textMuted }}>Loading schedule...</p>
              </div>
            ) : timetable.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-2xl mb-2">📅</p>
                <p style={{ color: t.textMuted }}>
                  No lectures scheduled for {DAYS[selectedDay]}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {(timetable as any[]).map((slot) => {
                  const status = getTimeStatus(slot.start_time, slot.end_time);
                  return (
                    <div key={slot.id}
                      className="flex items-center justify-between p-4 rounded-xl transition-all"
                      style={{
                        background: status === "ongoing"
                          ? t.ongoingBg
                          : t.slotBg,
                        border: status === "ongoing"
                          ? `1px solid ${t.ongoingBorder}`
                          : `1px solid ${t.slotBorder}`,
                        opacity: status === "done" ? 0.6 : 1,
                      }}
                    >
                      <div className="flex items-center gap-4">
                        {/* Time block */}
                        <div className="text-center min-w-16">
                          <p className="text-xs font-bold"
                            style={{ color: t.textAccent }}>
                            {slot.start_time.slice(0, 5)}
                          </p>
                          <p className="text-xs" style={{ color: t.textMuted }}>—</p>
                          <p className="text-xs font-bold"
                            style={{ color: t.textAccent }}>
                            {slot.end_time.slice(0, 5)}
                          </p>
                        </div>
                        {/* Divider */}
                        <div className="w-px h-10"
                          style={{ background: t.divider }}/>
                        {/* Details */}
                        <div> 
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-semibold text-sm"
                              style={{ color: t.textPrimary }}>
                              {slot.subject.replace(/\s*\([LP]\)\s*$/, "").replace(/\s*\(CAD\)\s*$/, "").replace(/\s*\(D\)\s*$/, "").replace(/\s*\(T\)\s*$/, "")}
                            </p>
                              {slot.subject.includes("(P)") && (
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                                  style={{
                                    background: isDark ? "#422006" : "#fff7ed",
                                    color: isDark ? "#f97316" : "#c2410c",
                                    border: isDark ? "none" : "1px solid #fed7aa"
                                  }}>
                                  Practical
                                </span>
                              )}
                              {(slot.subject.includes("(L)") || slot.subject.includes("(T)") || slot.subject.includes("(D)") || slot.subject.includes("(CAD)")) && (
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                                  style={{
                                    background: isDark ? "#1e3a6e" : "#eff6ff",
                                    color: isDark ? "#60a5fa" : "#1d4ed8",
                                    border: isDark ? "none" : "1px solid #bfdbfe"
                                  }}>
                                  {slot.subject.includes("(T)") ? "Tutorial" : slot.subject.includes("(D)") ? "Drawing" : slot.subject.includes("(CAD)") ? "CAD" : "Lecture"}
                                </span>
                              )}
                          </div>
                          <p className="text-xs mt-0.5"
                            style={{ color: t.textSecondary }}>
                            {slot.lecturer}
                          </p>
                          <p className="text-xs"
                            style={{ color: t.textSecondary }}>
                            {slot.hall} · {slot.building}
                          </p>
                          
                          
                        </div>
                      </div>
                      {/* Status badge */}
                      <div>
                        {status === "ongoing" && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{ background: "#064e3b", color: "#10b981" }}>
                            ● Live
                          </span>
                        )}
                        {status === "upcoming" && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{ background: "#1e3a6e", color: "#60a5fa" }}>
                            Soon
                          </span>
                        )}
                        {status === "done" && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{ background: isDark ? "#1a1a1a" : "#f1f5f9", color: t.textMuted }}>
                            Done
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}