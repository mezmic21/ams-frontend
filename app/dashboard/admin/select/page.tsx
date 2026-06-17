"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const faculties = [
  {
    name: "Engineering",
    code: "ENG",
    active: true,
    departments: [
      { name: "Mechanical Engineering", code: "ME", active: true },
      { name: "Computer Science & Engineering", code: "CSE", active: false },
      { name: "Electrical Engineering", code: "EE", active: false },
      { name: "Electronic & Telecommunication", code: "ETE", active: false },
      { name: "Civil Engineering", code: "CE", active: false },
      { name: "Chemical & Process Engineering", code: "CPE", active: false },
      { name: "Material Science Engineering", code: "MSE", active: false },
      { name: "Textile & Apparel Engineering", code: "TAE", active: false },
      { name: "Earth Resources Engineering", code: "ERE", active: false },
      { name: "Transport Management & Logistics", code: "TML", active: false },
    ],
  },
  { name: "Architecture", code: "ARC", active: false, departments: [] },
  { name: "Medicine", code: "MED", active: false, departments: [] },
  { name: "Information Technology", code: "IT", active: false, departments: [] },
  { name: "Business", code: "BUS", active: false, departments: [] },
];

export default function SelectPage() {
  const router = useRouter();
  const [step, setStep] = useState<"faculty" | "department">("faculty");
  const [selectedFaculty, setSelectedFaculty] = useState<any>(null);
  const [comingSoon, setComingSoon] = useState(false);
  const [name, setName] = useState("");
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    const role = localStorage.getItem("role");
    if (!storedName || role !== "admin") {
      router.push("/");
      return;
    }
    setName(storedName);
  }, []);

  const handleFacultyClick = (faculty: any) => {
    if (!faculty.active) {
      setComingSoon(true);
      setTimeout(() => setComingSoon(false), 2000);
      return;
    }
    setSelectedFaculty(faculty);
    setStep("department");
  };

  const handleDeptClick = (dept: any) => {
    if (!dept.active) {
      setComingSoon(true);
      setTimeout(() => setComingSoon(false), 2000);
      return;
    }
    router.push("/dashboard/admin");
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
    cardActiveBg: "#0d1b4b",
    cardActiveBorder: "#1e3a6e",
    cardActiveHover: "#1e3a6e",
    textPrimary: "#ffffff",
    textSecondary: "#94a3b8",
    textMuted: "#64748b",
    textAccent: "#60a5fa",
    logoutBg: "#131929",
    logoutText: "#94a3b8",
    logoutBorder: "#1e2d4a",
    roleBg: "#3b1764",
    roleText: "#c084fc",
    codeBg: "#1e3a6e",
    codeText: "#60a5fa",
    disabledBg: "#0d0d0d",
    disabledBorder: "#1a1a1a",
    disabledText: "#334155",
  } : {
    pageBg: "#f1f5f9",
    navBg: "#ffffff",
    navBorder: "#e2e8f0",
    cardBg: "#ffffff",
    cardBorder: "#e2e8f0",
    cardActiveBg: "#f8fafc",
    cardActiveBorder: "#cbd5e1",
    cardActiveHover: "#e2e8f0",
    textPrimary: "#0f172a",
    textSecondary: "#334155",
    textMuted: "#64748b",
    textAccent: "#2563eb",
    logoutBg: "#f1f5f9",
    logoutText: "#475569",
    logoutBorder: "#cbd5e1",
    roleBg: "#f3e8ff",
    roleText: "#7e22ce",
    codeBg: "#dbeafe",
    codeText: "#1d4ed8",
    disabledBg: "#f8fafc",
    disabledBorder: "#e2e8f0",
    disabledText: "#94a3b8",
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

      {/* Coming Soon Toast */}
      {comingSoon && (
        <div className="fixed top-4 right-4 px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2"
          style={{ background: "#131929", border: "1px solid #1e3a6e" }}>
          <span style={{ color: "#f59e0b" }}>⏳</span>
          <span className="text-sm font-medium" style={{ color: "#94a3b8" }}>
            Coming Soon
          </span>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Faculty Step */}
        {step === "faculty" && (
          <>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-2" style={{ color: t.textPrimary }}>
                Select Faculty
              </h2>
              <p style={{ color: t.textMuted }}>
                Choose a faculty to manage
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {faculties.map((faculty) => (
                <button
                  key={faculty.name}
                  onClick={() => handleFacultyClick(faculty)}
                  className="p-6 rounded-2xl text-left transition-all duration-200"
                  style={{
                    background: faculty.active ? t.cardActiveBg : t.disabledBg,
                    border: `1px solid ${faculty.active ? t.cardActiveBorder : t.disabledBorder}`,
                    opacity: faculty.active ? 1 : 0.5,
                  }}
                  onMouseEnter={(e) => {
                    if (faculty.active) {
                      (e.currentTarget as HTMLElement).style.borderColor = "#2563eb";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      faculty.active ? t.cardActiveBorder : t.disabledBorder;
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      background: faculty.active ? t.codeBg : t.disabledBg,
                    }}>
                    <span className="font-bold text-sm"
                      style={{ color: faculty.active ? t.codeText : t.disabledText }}>
                      {faculty.code}
                    </span>
                  </div>
                  <p className="font-bold mb-2"
                    style={{ color: faculty.active ? t.textPrimary : t.disabledText }}>
                    {faculty.name}
                  </p>
                  {faculty.active ? (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: "#064e3b", color: "#10b981" }}>
                      ● Active
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: isDark ? "#1a1a1a" : "#f1f5f9",
                        color: t.disabledText
                      }}>
                      Coming Soon
                    </span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Department Step */}
        {step === "department" && selectedFaculty && (
          <>
            <div className="mb-6">
              <button
                onClick={() => setStep("faculty")}
                className="text-sm flex items-center gap-1 transition-all"
                style={{ color: t.textAccent }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                ← Back to Faculties
              </button>
            </div>

            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
                style={{ background: t.codeBg }}>
                <span className="text-xs font-medium" style={{ color: t.codeText }}>
                  Faculty of {selectedFaculty.name}
                </span>
              </div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: t.textPrimary }}>
                Select Department
              </h2>
              <p style={{ color: t.textMuted }}>
                Choose a department to manage
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {selectedFaculty.departments.map((dept: any) => (
                <button
                  key={dept.name}
                  onClick={() => handleDeptClick(dept)}
                  className="p-6 rounded-2xl text-left transition-all duration-200"
                  style={{
                    background: dept.active ? t.cardActiveBg : t.disabledBg,
                    border: `1px solid ${dept.active ? t.cardActiveBorder : t.disabledBorder}`,
                    opacity: dept.active ? 1 : 0.5,
                  }}
                  onMouseEnter={(e) => {
                    if (dept.active) {
                      (e.currentTarget as HTMLElement).style.borderColor = "#2563eb";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor =
                      dept.active ? t.cardActiveBorder : t.disabledBorder;
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      background: dept.active ? t.codeBg : t.disabledBg,
                    }}>
                    <span className="font-bold text-sm"
                      style={{ color: dept.active ? t.codeText : t.disabledText }}>
                      {dept.code}
                    </span>
                  </div>
                  <p className="font-bold text-sm mb-2"
                    style={{ color: dept.active ? t.textPrimary : t.disabledText }}>
                    {dept.name}
                  </p>
                  {dept.active ? (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: "#064e3b", color: "#10b981" }}>
                      ● Active
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: isDark ? "#1a1a1a" : "#f1f5f9",
                        color: t.disabledText
                      }}>
                      Coming Soon
                    </span>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}