"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function LecturerDashboard() {
  const router = useRouter();
  const [timetable, setTimetable] = useState([]);
  const [halls, setHalls] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const [selectedDay, setSelectedDay] = useState(
    Math.min(new Date().getDay() - 1, 4) < 0 ? 0 : Math.min(new Date().getDay() - 1, 4)
  );

  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [rescheduleData, setRescheduleData] = useState({
    reason: "", new_date: "", new_start_time: "", new_end_time: "", new_hall_id: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    const role = localStorage.getItem("role");
    if (!storedName || role !== "lecturer") {
      router.push("/");
      return;
    }
    setName(storedName);
    fetchHalls();
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

  const fetchHalls = async () => {
    try {
      const res = await API.get("/halls/");
      setHalls(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  const getOverrideDate = () => {
    const today = new Date();
    const dayDiff = (selectedDay - today.getDay() + 1 + 7) % 7;
    const date = new Date(today);
    date.setDate(today.getDate() + dayDiff);
    return date.toISOString().split("T")[0];
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) return;
    setSubmitting(true);
    try {
      await API.post("/overrides/cancel", {
        slot_id: selectedSlot.id,
        override_date: getOverrideDate(),
        reason: cancelReason
      });
      setSuccessMsg("Session cancelled successfully!");
      setShowCancelModal(false);
      setCancelReason("");
      fetchTimetable(selectedDay);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleData.reason || !rescheduleData.new_date ||
      !rescheduleData.new_start_time || !rescheduleData.new_end_time ||
      !rescheduleData.new_hall_id) return;
    setSubmitting(true);
    try {
      await API.post("/overrides/reschedule", {
        slot_id: selectedSlot.id,
        override_date: getOverrideDate(),
        ...rescheduleData
      });
      setSuccessMsg("Reschedule request submitted for admin approval!");
      setShowRescheduleModal(false);
      setRescheduleData({
        reason: "", new_date: "", new_start_time: "",
        new_end_time: "", new_hall_id: ""
      });
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const today = Math.min(new Date().getDay() - 1, 4) < 0
    ? -1 : Math.min(new Date().getDay() - 1, 4);

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

  const t = isDark ? {
    pageBg: "#0a0f1e", navBg: "#0d1b4b", navBorder: "#1e3a6e",
    cardBg: "#131929", cardBorder: "#1e2d4a", slotBg: "#0d1b4b",
    slotBorder: "#1e3a6e", ongoingBg: "#0f2d1f", ongoingBorder: "#10b981",
    textPrimary: "#ffffff", textSecondary: "#94a3b8", textMuted: "#64748b",
    textAccent: "#60a5fa", dayUnselected: "#0d1b4b", dayUnselectedText: "#94a3b8",
    dayUnselectedBorder: "#1e2d4a", dayToday: "#1e3a6e", dayTodayText: "#60a5fa",
    dayTodayBorder: "#1e3a6e", divider: "#1e3a6e", logoutBg: "#131929",
    logoutText: "#94a3b8", logoutBorder: "#1e2d4a", roleBg: "#064e3b",
    roleText: "#10b981", modalBg: "#131929", modalBorder: "#1e3a6e",
    inputBg: "#0d1b4b", inputBorder: "#1e3a6e",
  } : {
    pageBg: "#f1f5f9", navBg: "#ffffff", navBorder: "#e2e8f0",
    cardBg: "#ffffff", cardBorder: "#e2e8f0", slotBg: "#f8fafc",
    slotBorder: "#cbd5e1", ongoingBg: "#f0fdf4", ongoingBorder: "#10b981",
    textPrimary: "#0f172a", textSecondary: "#334155", textMuted: "#64748b",
    textAccent: "#2563eb", dayUnselected: "#f1f5f9", dayUnselectedText: "#475569",
    dayUnselectedBorder: "#cbd5e1", dayToday: "#dbeafe", dayTodayText: "#1d4ed8",
    dayTodayBorder: "#93c5fd", divider: "#e2e8f0", logoutBg: "#f1f5f9",
    logoutText: "#475569", logoutBorder: "#cbd5e1", roleBg: "#dcfce7",
    roleText: "#15803d", modalBg: "#ffffff", modalBorder: "#e2e8f0",
    inputBg: "#f8fafc", inputBorder: "#cbd5e1",
  };

  const inputStyle = {
    background: t.inputBg,
    border: `1px solid ${t.inputBorder}`,
    color: t.textPrimary,
    borderRadius: "10px",
    padding: "10px 14px",
    width: "100%",
    fontSize: "14px",
    outline: "none",
  };

  return (
    <div className="min-h-screen transition-all duration-300"
      style={{ background: t.pageBg }}>

      {/* Success Toast */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2"
          style={{ background: "#064e3b", border: "1px solid #10b981" }}>
          <span>✅</span>
          <span className="text-sm font-medium text-white">{successMsg}</span>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-md mx-4 rounded-2xl p-6"
            style={{ background: t.modalBg, border: `1px solid ${t.modalBorder}` }}>
            <h3 className="text-lg font-bold mb-1" style={{ color: t.textPrimary }}>
              Cancel Session
            </h3>
            <p className="text-sm mb-4" style={{ color: t.textMuted }}>
              {selectedSlot.subject.replace(/\s*\([LPDT]\)\s*$/, "").replace(/\s*\(CAD\)\s*$/, "")}
            </p>
            <div className="mb-4 p-3 rounded-xl"
              style={{ background: isDark ? "#2d0f0f" : "#fef2f2", border: "1px solid #ef4444" }}>
              <p className="text-sm font-medium" style={{ color: "#ef4444" }}>
                ⚠️ This will cancel the session for {DAYS[selectedDay]} only.
                Students will be notified immediately.
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2"
                style={{ color: t.textSecondary }}>
                Reason for cancellation
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Medical leave, Department meeting..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{ ...inputStyle, resize: "none" }}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowCancelModal(false); setCancelReason(""); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: t.inputBg, color: t.textMuted, border: `1px solid ${t.inputBorder}` }}
              >
                Go Back
              </button>
              <button
                onClick={handleCancel}
                disabled={submitting || !cancelReason.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white"
                style={{
                  background: cancelReason.trim() ? "#dc2626" : "#7f1d1d",
                  opacity: submitting ? 0.7 : 1
                }}
              >
                {submitting ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-md mx-4 rounded-2xl p-6"
            style={{ background: t.modalBg, border: `1px solid ${t.modalBorder}` }}>
            <h3 className="text-lg font-bold mb-1" style={{ color: t.textPrimary }}>
              Reschedule Session
            </h3>
            <p className="text-sm mb-4" style={{ color: t.textMuted }}>
              {selectedSlot.subject.replace(/\s*\([LPDT]\)\s*$/, "").replace(/\s*\(CAD\)\s*$/, "")}
            </p>
            <div className="mb-3 p-3 rounded-xl"
              style={{ background: isDark ? "#1e3a6e" : "#eff6ff", border: "1px solid #3b82f6" }}>
              <p className="text-sm" style={{ color: "#60a5fa" }}>
                📋 Reschedule requests require admin approval before taking effect.
              </p>
            </div>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-medium mb-1"
                  style={{ color: t.textSecondary }}>
                  Reason
                </label>
                <input
                  type="text"
                  placeholder="Reason for rescheduling"
                  value={rescheduleData.reason}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1"
                  style={{ color: t.textSecondary }}>
                  New Date
                </label>
                <input
                  type="date"
                  value={rescheduleData.new_date}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, new_date: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1"
                    style={{ color: t.textSecondary }}>
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={rescheduleData.new_start_time}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, new_start_time: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1"
                    style={{ color: t.textSecondary }}>
                    End Time
                  </label>
                  <input
                    type="time"
                    value={rescheduleData.new_end_time}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, new_end_time: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1"
                  style={{ color: t.textSecondary }}>
                  New Hall
                </label>
                <select
                  value={rescheduleData.new_hall_id}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, new_hall_id: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">Select a hall</option>
                  {(halls as any[]).map((hall) => (
                    <option key={hall.id} value={hall.id}>
                      {hall.name} — {hall.building}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setRescheduleData({
                    reason: "", new_date: "", new_start_time: "",
                    new_end_time: "", new_hall_id: ""
                  });
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: t.inputBg, color: t.textMuted, border: `1px solid ${t.inputBorder}` }}
              >
                Go Back
              </button>
              <button
                onClick={handleReschedule}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white"
                style={{ background: "#2563eb", opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}

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
            <p className="text-sm font-medium" style={{ color: t.textPrimary }}>{name}</p>
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: t.roleBg, color: t.roleText }}>
              Lecturer
            </span>
          </div>
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
            onClick={() => router.push("/dashboard/lecturer/notifications")}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
            style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}
          >
            <span style={{ color: t.textAccent }}>🔔</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: t.logoutBg, color: t.logoutText, border: `1px solid ${t.logoutBorder}` }}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1" style={{ color: t.textPrimary }}>
            Welcome, Prof. {name.split(" ").slice(-1)[0]}!
          </h1>
          <p style={{ color: t.textMuted }}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long", year: "numeric", month: "long", day: "numeric",
            })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: `Lectures on ${DAYS[selectedDay]}`, value: timetable.length, color: "#2563eb" },
            { label: "Practicals", value: (timetable as any[]).filter(s => s.subject.includes("(P)")).length, color: "#f97316" },
            { label: "Lectures", value: (timetable as any[]).filter(s => s.subject.includes("(L)") || s.subject.includes("(T)") || s.subject.includes("(D)") || s.subject.includes("(CAD)")).length, color: "#60a5fa" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl p-5 transition-all duration-300"
              style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
              <p className="text-3xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-sm" style={{ color: t.textMuted }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Day Selector */}
        <div className="mb-6 rounded-2xl p-4 transition-all duration-300"
          style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
          <p className="text-xs mb-3 font-medium" style={{ color: t.textMuted }}>SELECT DAY</p>
          <div className="flex gap-2 flex-wrap">
            {DAYS.map((day, index) => (
              <button
                key={day}
                onClick={() => setSelectedDay(index)}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: selectedDay === index ? "#2563eb" : index === today ? t.dayToday : t.dayUnselected,
                  color: selectedDay === index ? "white" : index === today ? t.dayTodayText : t.dayUnselectedText,
                  border: selectedDay === index ? "1px solid #2563eb" : index === today ? `1px solid ${t.dayTodayBorder}` : `1px solid ${t.dayUnselectedBorder}`,
                }}
                onMouseEnter={(e) => {
                  if (selectedDay !== index) {
                    (e.target as HTMLElement).style.borderColor = "#2563eb";
                    (e.target as HTMLElement).style.color = "#2563eb";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedDay !== index) {
                    (e.target as HTMLElement).style.borderColor = index === today ? t.dayTodayBorder : t.dayUnselectedBorder;
                    (e.target as HTMLElement).style.color = index === today ? t.dayTodayText : t.dayUnselectedText;
                  }
                }}
              >
                {day}{index === today && <span className="ml-1 text-xs opacity-70">•</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Timetable */}
        <div className="rounded-2xl overflow-hidden transition-all duration-300"
          style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>
          <div className="px-6 py-4 flex justify-between items-center"
            style={{ borderBottom: `1px solid ${t.cardBorder}` }}>
            <h2 className="font-semibold" style={{ color: t.textPrimary }}>
              {DAYS[selectedDay]} Teaching Schedule
            </h2>
            <button onClick={() => fetchTimetable(selectedDay)}
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{ background: t.slotBg, color: t.textAccent, border: `1px solid ${t.slotBorder}` }}>
              Refresh
            </button>
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
                <p style={{ color: t.textMuted }}>No lectures on {DAYS[selectedDay]}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(timetable as any[]).map((slot) => {
                  const status = getTimeStatus(slot.start_time, slot.end_time);
                  return (
                    <div key={slot.id} className="p-4 rounded-xl transition-all"
                      style={{
                        background: status === "ongoing" ? t.ongoingBg : t.slotBg,
                        border: `1px solid ${status === "ongoing" ? t.ongoingBorder : t.slotBorder}`,
                        opacity: status === "done" ? 0.5 : 1,
                      }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-center min-w-16">
                            <p className="text-xs font-bold" style={{ color: t.textAccent }}>
                              {slot.start_time.slice(0, 5)}
                            </p>
                            <p className="text-xs" style={{ color: t.textMuted }}>—</p>
                            <p className="text-xs font-bold" style={{ color: t.textAccent }}>
                              {slot.end_time.slice(0, 5)}
                            </p>
                          </div>
                          <div className="w-px h-10" style={{ background: t.divider }}/>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="font-semibold text-sm" style={{ color: t.textPrimary }}>
                                {slot.subject.replace(/\s*\(P\)|\(L\)|\(T\)|\(D\)|\(CAD\)\s*$/, "")}
                              </p>
                              {slot.subject.includes("(P)") && (
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                  style={{ background: isDark ? "#422006" : "#fff7ed", color: isDark ? "#f97316" : "#c2410c" }}>
                                  Practical
                                </span>
                              )}
                              {(slot.subject.includes("(L)") || slot.subject.includes("(T)") || slot.subject.includes("(D)") || slot.subject.includes("(CAD)")) && (
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                  style={{ background: isDark ? "#1e3a6e" : "#eff6ff", color: isDark ? "#60a5fa" : "#1d4ed8" }}>
                                  {slot.subject.includes("(T)") ? "Tutorial" : slot.subject.includes("(D)") ? "Drawing" : slot.subject.includes("(CAD)") ? "CAD" : "Lecture"}
                                </span>
                              )}
                            </div>
                            <p className="text-xs" style={{ color: t.textSecondary }}>
                              {slot.hall} · {slot.building}
                            </p>
                            <p className="text-xs" style={{ color: t.textSecondary }}>
                              Batch: {slot.batch}
                            </p>
                          </div>
                        </div>

                        {/* Status + Action buttons */}
                        <div className="flex items-center gap-2">
                          {status === "ongoing" && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{ background: "#064e3b", color: "#10b981" }}>● Live</span>
                          )}
                          {status === "upcoming" && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{ background: "#1e3a6e", color: "#60a5fa" }}>Soon</span>
                          )}
                          {status === "done" && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{ background: isDark ? "#1a1a1a" : "#f1f5f9", color: t.textMuted }}>Done</span>
                          )}

                          {/* Action buttons */}
                          <button
                            onClick={() => { setSelectedSlot(slot); setShowRescheduleModal(true); }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                            style={{ background: isDark ? "#1e3a6e" : "#eff6ff", color: isDark ? "#60a5fa" : "#1d4ed8", border: `1px solid ${isDark ? "#2563eb" : "#bfdbfe"}` }}
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => { setSelectedSlot(slot); setShowCancelModal(true); }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                            style={{ background: isDark ? "#2d0f0f" : "#fef2f2", color: "#ef4444", border: "1px solid #7f1d1d" }}
                          >
                            Cancel
                          </button>
                        </div>
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