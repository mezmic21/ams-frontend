"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.post(
        `/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
      );
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);

      if (res.data.role === "student") router.push("/dashboard/student");
      else if (res.data.role === "lecturer") router.push("/dashboard/lecturer");
      else if (res.data.role === "admin") router.push("/dashboard/admin/select");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#0a0f1e" }}>
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ background: "linear-gradient(135deg, #0d1b4b 0%, #1a3a8f 100%)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: "#2563eb" }}>
            <span className="text-white font-bold text-sm">AMS</span>
          </div>
          <span className="text-white font-semibold text-lg">
            Access Management System
          </span>
        </div>

        <div>
          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            Smart Access<br />
            <span style={{ color: "#60a5fa" }}>Control for</span><br />
            Modern Campus
          </h1>
          <p className="text-blue-200 text-lg leading-relaxed mb-8">
            Automated lecture hall access using facial recognition,
            real-time occupancy tracking, and intelligent scheduling
            for University of Moratuwa.
          </p>

          {/* Feature pills */}
          <div className="flex flex-col gap-3">
            {[
              "Facial Recognition Entry",
              "Real-time Hall Occupancy",
              "Smart Timetable Management",
              "Role-based Access Control",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "#2563eb" }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-blue-100 text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-blue-300 text-sm">
            Mechatronics Driven University Administration Management Project 
          </p>
          <p className="text-blue-400 text-xs mt-1">
            ME1110 - Group 4
          </p>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: "#2563eb" }}>
              <span className="text-white font-bold text-sm">AMS</span>
            </div>
            <span className="text-white font-semibold">
              Access Management System
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Welcome back
            </h2>
            <p style={{ color: "#94a3b8" }}>
              Sign in to your AMS account
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2"
                style={{ color: "#cbd5e1" }}>
                Email address
              </label>
              <input
                type="email"
                placeholder="yourname@uom.lk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all"
                style={{
                  background: "#131929",
                  border: "1px solid #1e2d4a",
                  fontSize: "15px",
                }}
                onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                onBlur={(e) => e.target.style.borderColor = "#1e2d4a"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2"
                style={{ color: "#cbd5e1" }}>
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 outline-none transition-all"
                style={{
                  background: "#131929",
                  border: "1px solid #1e2d4a",
                  fontSize: "15px",
                }}
                onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                onBlur={(e) => e.target.style.borderColor = "#1e2d4a"}
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl text-sm"
                style={{ background: "#2d1515", color: "#f87171", border: "1px solid #7f1d1d" }}>
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all"
              style={{
                background: loading ? "#1e40af" : "linear-gradient(135deg, #1d4ed8, #2563eb)",
                fontSize: "15px",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>

          <div className="mt-8 pt-6" style={{ borderTop: "1px solid #1e2d4a" }}>
            <div className="grid grid-cols-3 gap-3">
              {[
                { role: "Student", color: "#1d4ed8" },
                { role: "Lecturer", color: "#065f46" },
                { role: "Admin", color: "#7c3aed" },
              ].map((item) => (
                <div key={item.role}
                  className="text-center py-2 px-3 rounded-lg"
                  style={{ background: "#131929", border: "1px solid #1e2d4a" }}>
                  <div className="w-2 h-2 rounded-full mx-auto mb-1"
                    style={{ background: item.color }}/>
                  <p className="text-xs" style={{ color: "#64748b" }}>
                    {item.role}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-center text-xs mt-3" style={{ color: "#334155" }}>
              Role is determined automatically on login
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}