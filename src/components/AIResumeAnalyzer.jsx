import { useState, useRef } from "react";
import ScoreRing from "./ScoreRing";
import Badge from "./Badge";
import Card from "./Card";
import SectionLabel from "./SectionLabel";
import Tip from "./Tip";
import SectionCheck from "./SectionCheck";
import ProgressBar from "./ProgressBar";

const SECTION = { UPLOAD: "upload", ANALYZING: "analyzing", RESULT: "result" };
const API_KEY = process.env.REACT_APP_GROQ_API_KEY;

const SYSTEM_PROMPT = `You are an expert ATS Resume Analyzer and NLP specialist.
Return ONLY valid JSON, no markdown, no backticks, no extra text.
{
  "ats_score": 0,
  "overall_verdict": "",
  "candidate_name": "",
  "experience_years": "",
  "skills": { "technical": [], "soft": [], "tools": [] },
  "experience_summary": "",
  "education": "",
  "strengths": ["","",""],
  "weaknesses": ["","",""],
  "missing_keywords": [],
  "sections_found": {
    "summary": true, "experience": true, "education": true,
    "skills": true, "projects": false, "certifications": false, "contact": true
  },
  "improvement_tips": [
    { "priority": "high", "title": "", "detail": "" },
    { "priority": "medium", "title": "", "detail": "" },
    { "priority": "low", "title": "", "detail": "" }
  ],
  "job_match_score": null,
  "job_match_notes": null
}`;

const STEPS = [
  "Parsing resume structure...",
  "Running NLP keyword extraction...",
  "Scoring ATS compatibility...",
  "Identifying skill gaps...",
  "Generating improvement tips...",
  "Finalizing analysis...",
];

export default function AIResumeAnalyzer() {
  const [section, setSection]       = useState(SECTION.UPLOAD);
  const [resumeText, setResumeText] = useState("");
  const [jobDesc, setJobDesc]       = useState("");
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState("");
  const [loadStep, setLoadStep]     = useState(0);
  const [activeTab, setActiveTab]   = useState("overview");
  const fileRef  = useRef();
  const timerRef = useRef();

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setResumeText(ev.target.result);
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setResumeText(ev.target.result);
      reader.readAsText(file);
    }
  };

  const analyzeResume = async () => {
    if (!resumeText.trim()) { setError("Please paste your resume text."); return; }
    if (!API_KEY) { setError("Add REACT_APP_GROQ_API_KEY in .env file then restart npm start."); return; }
    setError("");
    setSection(SECTION.ANALYZING);
    setLoadStep(0);
    let step = 0;
    timerRef.current = setInterval(() => {
      step++;
      if (step < STEPS.length) setLoadStep(step);
    }, 900);

    const userMsg = jobDesc.trim()
      ? `RESUME:\n${resumeText}\n\n---JOB DESCRIPTION---\n${jobDesc}`
      : `RESUME:\n${resumeText}`;

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 2000,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userMsg }
          ],
        }),
      });

      clearInterval(timerRef.current);
      if (!res.ok) { const e = await res.json(); throw new Error(e?.error?.message || "API Error"); }
      const data   = await res.json();
      const raw    = data.choices?.[0]?.message?.content || "";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setResult(parsed);
      setSection(SECTION.RESULT);
      setActiveTab("overview");
    } catch (err) {
      clearInterval(timerRef.current);
      setError("Error: " + err.message);
      setSection(SECTION.UPLOAD);
    }
  };

  const reset = () => {
    setSection(SECTION.UPLOAD);
    setResumeText(""); setJobDesc(""); setResult(null); setError("");
  };

  const tx = {
    width: "100%", background: "#060c18", border: "1px solid #1e293b",
    borderRadius: "10px", color: "#cbd5e1", padding: "14px 16px",
    fontSize: "13px", fontFamily: "monospace", resize: "vertical",
    boxSizing: "border-box", outline: "none", lineHeight: "1.7",
  };
  const root = { fontFamily: "'Courier New', monospace", background: "#0a0f1a", minHeight: "100vh", color: "#e2e8f0" };
  const main = { maxWidth: "900px", margin: "0 auto", padding: "28px 20px" };

  const Header = ({ done }) => (
    <div style={{ background: "#0d1424", borderBottom: "1px solid #1e293b", padding: "14px 28px", display: "flex", alignItems: "center", gap: "14px", position: "sticky", top: 0, zIndex: 10 }}>
      <div style={{ width: "40px", height: "40px", background: "linear-gradient(135deg,#1d4ed8,#7c3aed)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>📄</div>
      <div>
        <div style={{ fontSize: "16px", fontWeight: "700", color: "#60a5fa", letterSpacing: "0.05em" }}>AI RESUME ANALYZER</div>
        <div style={{ fontSize: "11px", color: "#334155" }}>{done ? "Analysis Complete ✓" : "NLP Powered · ATS Scoring · Smart Suggestions"}</div>
      </div>
      {done && <button onClick={reset} style={{ marginLeft: "auto", background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: "7px", padding: "7px 16px", cursor: "pointer", fontFamily: "monospace", fontSize: "12px" }}>↩ New Analysis</button>}
    </div>
  );

  // ── UPLOAD SCREEN ──
  if (section === SECTION.UPLOAD) return (
    <div style={root}>
      <Header />
      <div style={main}>
        <Card>
          <SectionLabel icon="📋" text="STEP 1 — RESUME TEXT" color="#60a5fa" />
          <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onClick={() => fileRef.current.click()}
            style={{ border: "1px dashed #334155", borderRadius: "8px", padding: "18px", textAlign: "center", cursor: "pointer", marginBottom: "12px", color: "#475569", fontSize: "13px" }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = "#60a5fa"; e.currentTarget.style.background = "#060c18"; }}
            onMouseOut={(e)  => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.background = "transparent"; }}>
            📁 Drag & drop or click to upload .txt file
          </div>
          <input ref={fileRef} type="file" accept=".txt,.md" onChange={handleFile} style={{ display: "none" }} />
          <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)}
            placeholder="...or paste your resume text here" rows={10} style={tx}
            onFocus={(e) => (e.target.style.borderColor = "#1d4ed8")}
            onBlur={(e)  => (e.target.style.borderColor = "#1e293b")} />
          {resumeText && <div style={{ fontSize: "11px", color: "#334155", marginTop: "6px" }}>✓ {resumeText.trim().split(/\s+/).length} words detected</div>}
        </Card>

        <Card>
          <SectionLabel icon="🎯" text="STEP 2 — JOB DESCRIPTION (Optional)" color="#fbbf24" />
          <textarea value={jobDesc} onChange={(e) => setJobDesc(e.target.value)}
            placeholder="Paste job description for match score..." rows={5} style={tx}
            onFocus={(e) => (e.target.style.borderColor = "#fbbf24")}
            onBlur={(e)  => (e.target.style.borderColor = "#1e293b")} />
        </Card>

        {error && <div style={{ background: "#3d0000", border: "1px solid #991b1b", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", color: "#f87171", fontSize: "13px" }}>{error}</div>}

        <button onClick={analyzeResume}
          style={{ width: "100%", padding: "15px", background: "linear-gradient(135deg,#1d4ed8,#7c3aed)", border: "none", borderRadius: "10px", color: "#fff", fontSize: "15px", fontWeight: "700", fontFamily: "monospace", cursor: "pointer", letterSpacing: "0.08em" }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseOut={(e)  => (e.currentTarget.style.opacity = "1")}>
          ⚡ ANALYZE RESUME WITH AI
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginTop: "16px" }}>
          {[{ icon: "🔍", text: "NLP Skill Extraction" }, { icon: "📊", text: "ATS Score Analysis" }, { icon: "💡", text: "Smart Suggestions" }].map((f) => (
            <div key={f.text} style={{ background: "#0d1424", border: "1px solid #1e293b", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
              <div style={{ fontSize: "22px", marginBottom: "4px" }}>{f.icon}</div>
              <div style={{ fontSize: "11px", color: "#475569" }}>{f.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── ANALYZING SCREEN ──
  if (section === SECTION.ANALYZING) return (
    <div style={root}>
      <Header />
      <div style={{ ...main, textAlign: "center", paddingTop: "80px" }}>
        <div style={{ width: "70px", height: "70px", margin: "0 auto 28px", border: "3px solid #1e293b", borderTop: "3px solid #1d4ed8", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ color: "#60a5fa", fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>Analyzing your resume...</div>
        <div style={{ color: "#334155", fontSize: "13px", marginBottom: "40px" }}>{STEPS[loadStep]}</div>
        <div style={{ maxWidth: "340px", margin: "0 auto", textAlign: "left" }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: i < STEPS.length - 1 ? "1px solid #0d1424" : "none" }}>
              <span style={{ width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", background: i < loadStep ? "#166534" : i === loadStep ? "#1d4ed8" : "#1e293b", color: i < loadStep ? "#4ade80" : "#fff" }}>
                {i < loadStep ? "✓" : i + 1}
              </span>
              <span style={{ fontSize: "12px", color: i < loadStep ? "#4ade80" : i === loadStep ? "#e2e8f0" : "#334155" }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── RESULT SCREEN ──
  const r = result;
  const tabs = ["overview", "skills", "sections", "tips"];
  const tabLabels = { overview: "📊 OVERVIEW", skills: "🔍 SKILLS", sections: "📋 SECTIONS", tips: "💡 TIPS" };

  return (
    <div style={root}>
      <Header done />
      <div style={main}>

        <Card style={{ display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "center" }}>
          <ScoreRing score={r.ats_score} label="ATS SCORE" size={130} />
          {r.job_match_score !== null && <ScoreRing score={r.job_match_score} label="JOB MATCH" size={100} />}
          <div style={{ flex: 1, minWidth: "200px" }}>
            <div style={{ color: "#60a5fa", fontSize: "15px", fontWeight: "700", marginBottom: "4px" }}>{r.candidate_name}</div>
            <div style={{ color: "#475569", fontSize: "12px", marginBottom: "10px" }}>Experience: <span style={{ color: "#fbbf24" }}>{r.experience_years}</span></div>
            <div style={{ color: "#94a3b8", fontSize: "13px", lineHeight: "1.7" }}>{r.overall_verdict}</div>
          </div>
        </Card>

        <div style={{ display: "flex", gap: "4px", background: "#0d1424", borderRadius: "10px", border: "1px solid #1e293b", padding: "4px", marginBottom: "20px" }}>
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: "8px 10px", borderRadius: "7px", cursor: "pointer", border: "none", fontFamily: "monospace", fontSize: "11px", fontWeight: activeTab === tab ? "700" : "400", background: activeTab === tab ? "#1d4ed8" : "transparent", color: activeTab === tab ? "#fff" : "#475569" }}>
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <Card borderColor="#166534">
                <SectionLabel icon="✅" text="STRENGTHS" color="#4ade80" />
                {r.strengths.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                    <span style={{ color: "#34d399", flexShrink: 0 }}>▸</span>
                    <span style={{ color: "#94a3b8", fontSize: "13px", lineHeight: "1.6" }}>{item}</span>
                  </div>
                ))}
              </Card>
              <Card borderColor="#991b1b">
                <SectionLabel icon="⚠" text="WEAKNESSES" color="#f87171" />
                {r.weaknesses.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                    <span style={{ color: "#f87171", flexShrink: 0 }}>▸</span>
                    <span style={{ color: "#94a3b8", fontSize: "13px", lineHeight: "1.6" }}>{item}</span>
                  </div>
                ))}
              </Card>
            </div>
            <Card>
              <SectionLabel icon="💼" text="EXPERIENCE SUMMARY" color="#a78bfa" />
              <div style={{ color: "#94a3b8", fontSize: "13px", lineHeight: "1.7", marginBottom: "14px" }}>{r.experience_summary}</div>
              <SectionLabel icon="🎓" text="EDUCATION" color="#a78bfa" />
              <div style={{ color: "#94a3b8", fontSize: "13px", lineHeight: "1.7" }}>{r.education}</div>
            </Card>
            {r.missing_keywords?.length > 0 && (
              <Card borderColor="#92400e">
                <SectionLabel icon="🔑" text="MISSING KEYWORDS" color="#fbbf24" />
                {r.missing_keywords.map((k) => <Badge key={k} text={k} color="amber" />)}
              </Card>
            )}
            {r.job_match_notes && (
              <Card borderColor="#0d9488">
                <SectionLabel icon="🎯" text="JOB MATCH NOTES" color="#2dd4bf" />
                <div style={{ color: "#94a3b8", fontSize: "13px", lineHeight: "1.7" }}>{r.job_match_notes}</div>
              </Card>
            )}
          </div>
        )}

        {/* SKILLS */}
        {activeTab === "skills" && (
          <div>
            <Card>
              <SectionLabel icon="⚙" text="TECHNICAL SKILLS" color="#60a5fa" />
              {r.skills.technical?.length > 0 ? r.skills.technical.map((s) => <Badge key={s} text={s} color="blue" />) : <span style={{ color: "#334155", fontSize: "13px" }}>None detected</span>}
            </Card>
            <Card>
              <SectionLabel icon="🛠" text="TOOLS & TECHNOLOGIES" color="#4ade80" />
              {r.skills.tools?.length > 0 ? r.skills.tools.map((s) => <Badge key={s} text={s} color="green" />) : <span style={{ color: "#334155", fontSize: "13px" }}>None detected</span>}
            </Card>
            <Card>
              <SectionLabel icon="🧠" text="SOFT SKILLS" color="#c084fc" />
              {r.skills.soft?.length > 0 ? r.skills.soft.map((s) => <Badge key={s} text={s} color="purple" />) : <span style={{ color: "#334155", fontSize: "13px" }}>None detected</span>}
            </Card>
            <Card>
              <SectionLabel icon="📊" text="SKILL COVERAGE" color="#2dd4bf" />
              {[
                { label: "Technical Skills", val: r.skills.technical?.length || 0, max: 15, color: "#60a5fa" },
                { label: "Tools & Tech",     val: r.skills.tools?.length || 0,     max: 10, color: "#4ade80" },
                { label: "Soft Skills",      val: r.skills.soft?.length || 0,      max: 8,  color: "#c084fc" },
              ].map((bar) => (
                <div key={bar.label} style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "5px" }}>
                    <span style={{ color: "#94a3b8" }}>{bar.label}</span>
                    <span style={{ color: bar.color }}>{bar.val} found</span>
                  </div>
                  <ProgressBar value={bar.val} max={bar.max} color={bar.color} />
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* SECTIONS */}
        {activeTab === "sections" && (
          <Card>
            <SectionLabel icon="📋" text="RESUME SECTIONS CHECKLIST" color="#60a5fa" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              {r.sections_found && Object.entries(r.sections_found).map(([key, val]) => (
                <SectionCheck key={key} label={key.toUpperCase()} found={val} />
              ))}
            </div>
            <div style={{ marginTop: "14px", fontSize: "12px", color: "#475569" }}>
              {Object.values(r.sections_found || {}).filter(Boolean).length} of {Object.keys(r.sections_found || {}).length} sections found.
            </div>
          </Card>
        )}

        {/* TIPS */}
        {activeTab === "tips" && (
          <Card>
            <SectionLabel icon="💡" text="IMPROVEMENT TIPS" color="#fbbf24" />
            {r.improvement_tips?.map((tip, i) => <Tip key={i} tip={tip} />)}
          </Card>
        )}

        <div style={{ textAlign: "center", fontSize: "11px", color: "#1e293b", marginTop: "16px" }}>
          Powered by Groq AI (Llama 3.3 70B) — NLP Resume Analysis
        </div>
      </div>
    </div>
  );
}