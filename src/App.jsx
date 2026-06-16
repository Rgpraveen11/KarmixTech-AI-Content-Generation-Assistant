import { useState, useRef, useEffect } from "react";

// ─── DATA: Content types with their form fields ───────────────────────────────
const CONTENT_TYPES = [
  {
    id: "blog",
    label: "Blog Post",
    icon: "✍️",
    description: "Long-form article with structure",
    fields: [
      { id: "topic", label: "Topic", type: "text",
        placeholder: "e.g. The future of remote work in 2026" },
      { id: "audience", label: "Target Audience", type: "text",
        placeholder: "e.g. startup founders, HR managers" },
      { id: "tone", label: "Tone", type: "select",
        options: ["Informative", "Conversational", "Persuasive", "Inspirational", "Technical"] },
      { id: "length", label: "Length", type: "select",
        options: ["Short (~300 words)", "Medium (~600 words)", "Long (~1000 words)"] },
      { id: "keywords", label: "SEO Keywords (optional)", type: "text",
        placeholder: "e.g. remote work, productivity" },
    ],
  },
  {
    id: "caption",
    label: "Social Caption",
    icon: "📱",
    description: "Instagram, LinkedIn, Twitter & more",
    fields: [
      { id: "platform", label: "Platform", type: "select",
        options: ["Instagram", "LinkedIn", "Twitter/X", "TikTok", "Facebook"] },
      { id: "topic", label: "What is it about?", type: "text",
        placeholder: "e.g. Launching our new product feature" },
      { id: "tone", label: "Tone", type: "select",
        options: ["Casual & Fun", "Professional", "Witty", "Motivational", "Storytelling"] },
      { id: "cta", label: "Call to Action (optional)", type: "text",
        placeholder: "e.g. Visit the link in bio" },
      { id: "hashtags", label: "Include Hashtags?", type: "select",
        options: ["Yes", "No"] },
    ],
  },
  {
    id: "email",
    label: "Email",
    icon: "📧",
    description: "Professional or marketing emails",
    fields: [
      { id: "type", label: "Email Type", type: "select",
        options: ["Cold Outreach", "Newsletter", "Follow-up", "Promotional", "Onboarding"] },
      { id: "recipient", label: "Recipient", type: "text",
        placeholder: "e.g. potential client, existing subscriber" },
      { id: "subject", label: "Subject / Goal", type: "text",
        placeholder: "e.g. Introduce our new pricing plan" },
      { id: "tone", label: "Tone", type: "select",
        options: ["Formal", "Friendly", "Urgent", "Empathetic", "Persuasive"] },
      { id: "cta", label: "Desired Action", type: "text",
        placeholder: "e.g. Book a demo, Click to upgrade" },
    ],
  },
  {
    id: "marketing",
    label: "Marketing Copy",
    icon: "🚀",
    description: "Ads, landing pages, taglines",
    fields: [
      { id: "format", label: "Format", type: "select",
        options: ["Ad Copy", "Landing Page Hero", "Product Description", "Tagline / Slogan"] },
      { id: "product", label: "Product / Service", type: "text",
        placeholder: "e.g. AI-powered project management tool" },
      { id: "audience", label: "Target Audience", type: "text",
        placeholder: "e.g. freelancers, small business owners" },
      { id: "tone", label: "Tone", type: "select",
        options: ["Bold & Punchy", "Trustworthy", "Luxurious", "Playful", "Minimalist"] },
      { id: "usp", label: "Key Benefit / USP", type: "text",
        placeholder: "e.g. saves 5 hours/week, zero learning curve" },
    ],
  },
];

// ─── STRUCTURED PROMPT BUILDER ────────────────────────────────────────────────
// This is the core of the app — each type gets a tailored system + user prompt
function buildPrompt(typeId, fields, values) {
  const type = CONTENT_TYPES.find(t => t.id === typeId);
  const fieldMap = {};
  fields.forEach(f => { fieldMap[f.id] = values[f.id] || ""; });

  const systemPrompts = {
    blog: `You are an expert content writer. Write a well-structured blog post. 
           Include a compelling headline, an intro hook, clear sections with 
           subheadings, and a conclusion with a CTA.`,
    caption: `You are a social media expert. Write an engaging caption that matches 
              the platform's style and character limits. Make it scroll-stopping 
              from the first line.`,
    email: `You are a professional copywriter specializing in email marketing. 
            Write a complete email (subject line + body) that is personalized, 
            clear, and drives the desired action.`,
    marketing: `You are a creative marketing copywriter. Write persuasive, punchy 
                copy that communicates value clearly and makes the reader act.`,
  };

  const detailLines = fields
    .map(f => `- ${f.label}: ${fieldMap[f.id] || "(not specified)"}`)
    .join("\n");

  return {
    system: systemPrompts[typeId],
    user: `Generate ${type.label} content with these details:\n\n${detailLines}\n\n
           Format it cleanly with proper structure.`,
  };
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ContentGenerator() {
  const [activeType, setActiveType] = useState("blog");
  const [values, setValues]         = useState({});
  const [output, setOutput]         = useState("");
  const [loading, setLoading]       = useState(false);
  const [copied, setCopied]         = useState(false);
  const [error, setError]           = useState("");
  const outputRef = useRef(null);

  const currentType = CONTENT_TYPES.find(t => t.id === activeType);

  // Reset form when switching content types
  useEffect(() => {
    setValues({});
    setOutput("");
    setError("");
  }, [activeType]);

  // ── API Call ────────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    const { system, user } = buildPrompt(activeType, currentType.fields, values);
    setLoading(true);
    setOutput("");
    setError("");

    try {
  const response = await fetch(
  "https://api.groq.com/openai/v1/chat/completions",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: system,
        },
        {
          role: "user",
          content: user,
        },
      ],
    }),
  }
);

const data = await response.json();

const text =
  data.choices?.[0]?.message?.content ||
  "No content generated.";
setOutput(text);
setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      setOutput(text);
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Only enable generate when all required fields are filled
  const allFilled = currentType.fields
    .filter(f => !f.label.includes("optional"))
    .every(f => values[f.id]?.trim());

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:"#0f0f13",
                  fontFamily:"'Inter',system-ui,sans-serif", color:"#e8e6e1" }}>

      {/* ── Header ── */}
      <div style={{ borderBottom:"1px solid #1e1e2e", padding:"20px 32px",
                    display:"flex", alignItems:"center", gap:14 }}>
        <div style={{ width:36, height:36, borderRadius:10,
                      background:"linear-gradient(135deg,#7c6af7,#a78bf8)",
                      display:"flex", alignItems:"center",
                      justifyContent:"center", fontSize:18 }}>✦</div>
        <div>
          <div style={{ fontWeight:700, fontSize:17 }}>ContentCraft AI</div>
          <div style={{ fontSize:12, color:"#6b6b80" }}>Structured content generation</div>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:"0 auto", padding:"36px 24px" }}>

        {/* ── Content Type Tabs ── */}
        <div style={{ marginBottom:32 }}>
          <div style={{ fontSize:12, fontWeight:600, color:"#6b6b80",
                        textTransform:"uppercase", marginBottom:12 }}>Content Type</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
            {CONTENT_TYPES.map(t => (
              <button key={t.id} onClick={() => setActiveType(t.id)} style={{
                background: activeType===t.id
                  ? "linear-gradient(135deg,#1a1633,#221e44)" : "#13131a",
                border: activeType===t.id
                  ? "1px solid #7c6af7" : "1px solid #1e1e2e",
                borderRadius:12, padding:"14px 12px",
                cursor:"pointer", textAlign:"left", outline:"none",
              }}>
                <div style={{ fontSize:22, marginBottom:6 }}>{t.icon}</div>
                <div style={{ fontSize:13, fontWeight:600,
                              color: activeType===t.id ? "#c4b5fd":"#ccc" }}>{t.label}</div>
                <div style={{ fontSize:11, color:"#555", marginTop:2 }}>{t.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Form ── */}
        <div style={{ background:"#13131a", border:"1px solid #1e1e2e",
                      borderRadius:16, padding:"28px 28px 24px" }}>
          <div style={{ fontSize:14, fontWeight:600, color:"#9d96c8", marginBottom:22 }}>
            {currentType.icon} {currentType.label} — Fill in the details
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {currentType.fields.map(field => (
              <div key={field.id} style={{
                gridColumn: ["topic","subject","product"].includes(field.id)
                  ? "1 / -1" : undefined
              }}>
                <label style={{ display:"block", fontSize:12, fontWeight:600,
                                color:"#6b6b80", marginBottom:6 }}>
                  {field.label.toUpperCase()}
                </label>

                {field.type === "select" ? (
                  <select value={values[field.id]||""}
                    onChange={e => setValues(v=>({...v,[field.id]:e.target.value}))}
                    style={{ width:"100%", background:"#0f0f13",
                             border:"1px solid #2a2a3a", borderRadius:8,
                             padding:"10px 12px", color: values[field.id]?"#e8e6e1":"#444",
                             fontSize:13, outline:"none" }}>
                    <option value="">Select…</option>
                    {field.options.map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type="text" value={values[field.id]||""}
                    onChange={e => setValues(v=>({...v,[field.id]:e.target.value}))}
                    placeholder={field.placeholder}
                    style={{ width:"100%", background:"#0f0f13",
                             border:"1px solid #2a2a3a", borderRadius:8,
                             padding:"10px 12px", color:"#e8e6e1",
                             fontSize:13, outline:"none", boxSizing:"border-box" }} />
                )}
              </div>
            ))}
          </div>

          <button onClick={handleGenerate} disabled={loading||!allFilled} style={{
            marginTop:24, width:"100%",
            background: loading||!allFilled
              ? "#1e1e2e" : "linear-gradient(135deg,#7c6af7,#a78bf8)",
            color: loading||!allFilled ? "#444":"#fff",
            border:"none", borderRadius:10, padding:"13px 0",
            fontSize:14, fontWeight:700,
            cursor: loading||!allFilled ? "not-allowed":"pointer",
          }}>
            {loading
              ? "⏳ Generating…"
              : `✦ Generate ${currentType.label}`}
          </button>
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{ marginTop:16, background:"#1a0d0d",
                        border:"1px solid #4a1f1f", borderRadius:10,
                        padding:"12px 16px", color:"#f87171", fontSize:13 }}>
            {error}
          </div>
        )}

        {/* ── Output ── */}
        {output && (
          <div ref={outputRef} style={{ marginTop:24, background:"#13131a",
                                        border:"1px solid #1e1e2e", borderRadius:16,
                                        overflow:"hidden" }}>
            <div style={{ display:"flex", alignItems:"center",
                          justifyContent:"space-between", padding:"14px 20px",
                          borderBottom:"1px solid #1e1e2e", background:"#0f0f13" }}>
              <div style={{ fontSize:13, fontWeight:600, color:"#9d96c8" }}>
                ✦ Generated {currentType.label}
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={handleCopy} style={{
                  background: copied?"#1a2e1a":"#1e1e2e",
                  border:`1px solid ${copied?"#2d5a2d":"#2a2a3a"}`,
                  borderRadius:7, padding:"6px 14px", fontSize:12,
                  color: copied?"#4ade80":"#aaa", cursor:"pointer", fontWeight:600
                }}>
                  {copied ? "✓ Copied" : "Copy"}
                </button>
                <button onClick={()=>{setOutput("");setValues({});}} style={{
                  background:"#1e1e2e", border:"1px solid #2a2a3a",
                  borderRadius:7, padding:"6px 14px",
                  fontSize:12, color:"#aaa", cursor:"pointer"
                }}>Clear</button>
              </div>
            </div>
            <div style={{ padding:"24px", whiteSpace:"pre-wrap", fontSize:14,
                          lineHeight:1.75, color:"#d8d4ec",
                          maxHeight:520, overflowY:"auto" }}>
              {output}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        select option { background: #13131a; }
        input::placeholder { color: #444; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}