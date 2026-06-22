"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import API from "@/lib/api";

type DetectedRole = "student" | "lecturer" | "admin" | null;

function detectRole(index: string): DetectedRole {
  if (/^\d+[A-Za-z]$/.test(index)) return "student";
  if (/^adm\d+$/i.test(index)) return "admin";
  if (/^lec\d+$/i.test(index)) return "lecturer";
  return null;
}

export default function EnrollFacePage() {
  const router = useRouter();
  const [adminName, setAdminName] = useState("");
  const [isDark, setIsDark] = useState(true);

  // Step 1 fields — always visible
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [indexNumber, setIndexNumber] = useState("");
  const [detectedRole, setDetectedRole] = useState<DetectedRole>(null);

  // Common fields — visible once role detected
  const [phoneNumber, setPhoneNumber] = useState("");
  const [rfidUid, setRfidUid] = useState("");

  // Student-specific
  const [batch, setBatch] = useState("ME Batch 24");

  // Admin-specific
  const [adminDepartment, setAdminDepartment] = useState("");

  // Lecturer-specific
  const [lecturerFaculty, setLecturerFaculty] = useState("Engineering");
  const [lecturerDepartment, setLecturerDepartment] = useState("Mechanical Engineering");

  // Photo
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusType, setStatusType] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    const role = localStorage.getItem("role");
    if (!storedName || role !== "admin") {
      router.push("/");
      return;
    }
    setAdminName(storedName);
  }, []);

  // Attach stream after video element mounts
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive]);

  // Auto-detect role as index is typed
  useEffect(() => {
    setDetectedRole(detectRole(indexNumber));
  }, [indexNumber]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setCameraActive(true);
    } catch {
      setStatusType("error");
      setStatusMsg("Could not access camera. Please check permissions or use file upload instead.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        setPhotoBlob(blob);
        setPhotoPreview(URL.createObjectURL(blob));
      }
    }, "image/jpeg", 0.9);
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoBlob(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const retake = () => {
    setPhotoBlob(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async () => {
    if (!name || !email || !indexNumber || !detectedRole || !photoBlob) {
      setStatusType("error");
      setStatusMsg("Please complete all required fields and provide a photo.");
      return;
    }

    setSubmitting(true);
    setStatusType("idle");
    setStatusMsg("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("role", detectedRole);
    formData.append("index_number", indexNumber);
    if (phoneNumber) formData.append("phone_number", phoneNumber);
    if (rfidUid) formData.append("rfid_uid", rfidUid);

    if (detectedRole === "student") {
      if (batch) formData.append("batch", batch);
      formData.append("student_id", indexNumber);
    } else if (detectedRole === "admin") {
      if (adminDepartment) formData.append("admin_department", adminDepartment);
    } else if (detectedRole === "lecturer") {
      if (lecturerFaculty) formData.append("lecturer_faculty", lecturerFaculty);
      if (lecturerDepartment) formData.append("lecturer_department", lecturerDepartment);
    }

    formData.append("photo", photoBlob, "photo.jpg");

    try {
      const res = await API.post("/enrollment/request", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStatusType("success");
      setStatusMsg(res.data.message || `${res.data.user_name} enrolled successfully!`);
    } catch (err: any) {
      setStatusType("error");
      setStatusMsg(err.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setName(""); setEmail(""); setIndexNumber(""); setDetectedRole(null);
    setPhoneNumber(""); setRfidUid(""); setBatch("ME Batch 24");
    setAdminDepartment(""); setLecturerFaculty("Engineering");
    setLecturerDepartment("Mechanical Engineering");
    setPhotoBlob(null); setPhotoPreview(null);
    setStatusType("idle"); setStatusMsg("");
  };

  const t = isDark ? {
    pageBg: "#0a0f1e", navBg: "#0d1b4b", navBorder: "#1e3a6e",
    cardBg: "#131929", cardBorder: "#1e2d4a",
    textPrimary: "#ffffff", textSecondary: "#94a3b8", textMuted: "#64748b",
    textAccent: "#60a5fa", inputBg: "#0d1b4b", inputBorder: "#1e3a6e",
    roleBg: "#3b1764", roleText: "#c084fc",
    studentBg: "#0f2d1f", studentBorder: "#10b981", studentText: "#10b981",
    lecturerBg: "#1e3a6e", lecturerBorder: "#60a5fa", lecturerText: "#60a5fa",
    adminBg: "#3b1764", adminBorder: "#c084fc", adminText: "#c084fc",
  } : {
    pageBg: "#f1f5f9", navBg: "#ffffff", navBorder: "#e2e8f0",
    cardBg: "#ffffff", cardBorder: "#e2e8f0",
    textPrimary: "#0f172a", textSecondary: "#334155", textMuted: "#64748b",
    textAccent: "#2563eb", inputBg: "#f8fafc", inputBorder: "#cbd5e1",
    roleBg: "#f3e8ff", roleText: "#7e22ce",
    studentBg: "#f0fdf4", studentBorder: "#10b981", studentText: "#15803d",
    lecturerBg: "#eff6ff", lecturerBorder: "#2563eb", lecturerText: "#1d4ed8",
    adminBg: "#f3e8ff", adminBorder: "#7e22ce", adminText: "#7e22ce",
  };

  const inputStyle = {
    background: t.inputBg, border: `1px solid ${t.inputBorder}`,
    color: t.textPrimary, borderRadius: "10px", padding: "10px 14px",
    width: "100%", fontSize: "14px", outline: "none",
  };

  const roleBadge = detectedRole ? {
    student: { bg: t.studentBg, border: t.studentBorder, text: t.studentText, label: "👤 Student", hint: "Batch, RFID, phone required" },
    lecturer: { bg: t.lecturerBg, border: t.lecturerBorder, text: t.lecturerText, label: "🎓 Lecturer", hint: "Faculty, department, RFID, phone required" },
    admin: { bg: t.adminBg, border: t.adminBorder, text: t.adminText, label: "🛡️ Admin", hint: "Administration department, RFID, phone required" },
  }[detectedRole] : null;

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
          <div className="text-right">
            <p className="text-sm font-medium" style={{ color: t.textPrimary }}>{adminName}</p>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: t.roleBg, color: t.roleText }}>Admin</span>
          </div>
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
          <button onClick={() => router.push("/dashboard/admin")}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: t.cardBg, color: t.textAccent, border: `1px solid ${t.cardBorder}` }}>
            ← Back
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: t.textPrimary }}>Enroll New Member</h1>
          <p className="text-sm mt-1" style={{ color: t.textMuted }}>
            Register a student, lecturer, or admin for facial recognition access
          </p>
        </div>

        {/* Status banner */}
        {statusType !== "idle" && (
          <div className="mb-6 p-4 rounded-xl flex items-start gap-3"
            style={{
              background: statusType === "success" ? (isDark ? "#0f2d1f" : "#f0fdf4") : (isDark ? "#2d0f0f" : "#fef2f2"),
              border: `1px solid ${statusType === "success" ? "#10b981" : "#ef4444"}`
            }}>
            <span className="text-xl">{statusType === "success" ? "✅" : "❌"}</span>
            <div className="flex-1">
              <p className="text-sm" style={{ color: statusType === "success" ? "#10b981" : "#ef4444" }}>
                {statusMsg}
              </p>
            </div>
            {statusType === "success" && (
              <button onClick={resetForm}
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: t.cardBg, color: t.textAccent, border: `1px solid ${t.cardBorder}` }}>
                Enroll Another
              </button>
            )}
          </div>
        )}

        {statusType !== "success" && (
          <div className="rounded-2xl p-6 transition-all duration-300"
            style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}>

            {/* Step 1 — always visible */}
            <p className="text-xs font-bold mb-3 tracking-widest" style={{ color: t.textMuted }}>
              STEP 1 — IDENTITY
            </p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: t.textSecondary }}>Full Name *</label>
                <input type="text" placeholder="e.g. Saman Kumara"
                  value={name} onChange={e => setName(e.target.value)} style={inputStyle}/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: t.textSecondary }}>Email *</label>
                <input type="email" placeholder="e.g. samank.24@uom.lk"
                  value={email} onChange={e => setEmail(e.target.value)} style={inputStyle}/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: t.textSecondary }}>
                  Index Number *
                  <span className="ml-2 font-normal text-xs" style={{ color: t.textMuted }}>
                    (e.g. 240484B for student, lec042 for lecturer, adm001 for admin)
                  </span>
                </label>
                <input type="text" placeholder="Enter index number"
                  value={indexNumber} onChange={e => setIndexNumber(e.target.value)} style={inputStyle}/>

                {/* Role detection badge */}
                {indexNumber && (
                  <div className="mt-2 px-3 py-2 rounded-lg text-xs font-medium"
                    style={{
                      background: roleBadge ? roleBadge.bg : isDark ? "#2d0f0f" : "#fef2f2",
                      border: `1px solid ${roleBadge ? roleBadge.border : "#ef4444"}`,
                      color: roleBadge ? roleBadge.text : "#ef4444",
                    }}>
                    {roleBadge ? (
                      <span>{roleBadge.label} detected — {roleBadge.hint}</span>
                    ) : (
                      <span>⚠️ Index format not recognized — check the format above</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Step 2 — role-specific fields, revealed once role is detected */}
            {detectedRole && (
              <>
                <div className="mb-4 border-t pt-5" style={{ borderColor: t.cardBorder }}>
                  <p className="text-xs font-bold mb-3 tracking-widest" style={{ color: t.textMuted }}>
                    STEP 2 — {detectedRole.toUpperCase()} DETAILS
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  {/* Common fields for all roles */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: t.textSecondary }}>
                        Phone Number
                      </label>
                      <input type="tel" placeholder="e.g. 0771234567"
                        value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} style={inputStyle}/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: t.textSecondary }}>
                        RFID Card UID
                      </label>
                      <input type="text" placeholder="Tap card or type UID"
                        value={rfidUid} onChange={e => setRfidUid(e.target.value)} style={inputStyle}/>
                    </div>
                  </div>

                  {/* Student-specific */}
                  {detectedRole === "student" && (
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: t.textSecondary }}>Batch</label>
                      <input type="text" placeholder="e.g. ME Batch 24"
                        value={batch} onChange={e => setBatch(e.target.value)} style={inputStyle}/>
                    </div>
                  )}

                  {/* Lecturer-specific */}
                  {detectedRole === "lecturer" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: t.textSecondary }}>Faculty</label>
                        <select value={lecturerFaculty} onChange={e => setLecturerFaculty(e.target.value)} style={inputStyle}>
                          <option value="Engineering">Engineering</option>
                          <option value="Architecture">Architecture</option>
                          <option value="Medicine">Medicine</option>
                          <option value="Information Technology">Information Technology</option>
                          <option value="Business">Business</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: t.textSecondary }}>Department</label>
                        <select value={lecturerDepartment} onChange={e => setLecturerDepartment(e.target.value)} style={inputStyle}>
                          <option value="Mechanical Engineering">Mechanical Engineering</option>
                          <option value="Computer Science & Engineering">Computer Science</option>
                          <option value="Electrical Engineering">Electrical Engineering</option>
                          <option value="Electronic & Telecommunication">Electronic & Telecom</option>
                          <option value="Civil Engineering">Civil Engineering</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Admin-specific */}
                  {detectedRole === "admin" && (
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: t.textSecondary }}>
                        Administration Department
                      </label>
                      <input type="text" placeholder="e.g. Faculty Office, Registry, IT Division"
                        value={adminDepartment} onChange={e => setAdminDepartment(e.target.value)} style={inputStyle}/>
                    </div>
                  )}
                </div>

                {/* Step 3 — Photo */}
                <div className="border-t pt-5 mb-6" style={{ borderColor: t.cardBorder }}>
                  <p className="text-xs font-bold mb-3 tracking-widest" style={{ color: t.textMuted }}>
                    STEP 3 — PHOTO
                  </p>

                  {!photoPreview && !cameraActive && (
                    <div className="flex gap-3">
                      <button onClick={startCamera}
                        className="flex-1 py-8 rounded-xl flex flex-col items-center gap-2"
                        style={{ background: t.inputBg, border: `1px dashed ${t.inputBorder}`, color: t.textAccent }}>
                        <span className="text-2xl">📷</span>
                        <span className="text-sm font-medium">Use Webcam</span>
                      </button>
                      <label className="flex-1 py-8 rounded-xl flex flex-col items-center gap-2 cursor-pointer"
                        style={{ background: t.inputBg, border: `1px dashed ${t.inputBorder}`, color: t.textAccent }}>
                        <span className="text-2xl">📁</span>
                        <span className="text-sm font-medium">Upload Photo</span>
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden"/>
                      </label>
                    </div>
                  )}

                  {cameraActive && (
                    <div>
                      <video ref={videoRef} autoPlay playsInline
                        className="w-full rounded-xl"
                        style={{ background: "#000", transform: "scaleX(-1)" }}/>
                      <div className="flex gap-3 mt-3">
                        <button onClick={capturePhoto}
                          className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white"
                          style={{ background: "#2563eb" }}>
                          📸 Capture
                        </button>
                        <button onClick={stopCamera}
                          className="px-4 py-2.5 rounded-xl text-sm font-medium"
                          style={{ background: t.inputBg, color: t.textMuted, border: `1px solid ${t.inputBorder}` }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {photoPreview && (
                    <div>
                      <img src={photoPreview} alt="Preview"
                        className="w-full rounded-xl max-h-72 object-cover"/>
                      <button onClick={retake}
                        className="mt-3 w-full py-2 rounded-xl text-sm font-medium"
                        style={{ background: t.inputBg, color: t.textMuted, border: `1px solid ${t.inputBorder}` }}>
                        Retake / Choose Different Photo
                      </button>
                    </div>
                  )}
                  <canvas ref={canvasRef} className="hidden"/>
                </div>

                <button onClick={handleSubmit} disabled={submitting}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
                  style={{ background: "#2563eb", opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? "Processing..." : `Enroll ${detectedRole.charAt(0).toUpperCase() + detectedRole.slice(1)}`}
                </button>
              </>
            )}

            {/* Prompt when no role detected yet */}
            {!detectedRole && !indexNumber && (
              <div className="text-center py-8"
                style={{ borderTop: `1px solid ${t.cardBorder}` }}>
                <p className="text-3xl mb-2">👆</p>
                <p className="text-sm" style={{ color: t.textMuted }}>
                  Fill in the identity fields above to reveal the enrollment form
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}