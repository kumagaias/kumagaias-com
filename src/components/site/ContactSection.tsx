import { useState } from "react";
import { useLang } from "../../contexts/LanguageContext";

function contactAddress() {
  const parts = ["support", "kumagaias", "com"];
  return `${parts[0]}@${parts[1]}.${parts[2]}`;
}

const contactEndpoint = import.meta.env.VITE_CONTACT_API_URL;

export default function ContactSection() {
  const { lang } = useLang();
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (data.get("company_url")) return;

    const name = String(data.get("name") ?? "").trim();
    const replyTo = String(data.get("reply_to") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();
    if (!name || !replyTo || !message) {
      setStatus(lang === "jp" ? "必須項目を入力してください。" : "Please fill in the required fields.");
      return;
    }

    if (contactEndpoint) {
      setSending(true);
      setStatus("");
      try {
        const res = await fetch(`${contactEndpoint.replace(/\/$/, "")}/contact`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name, reply_to: replyTo, message, company_url: data.get("company_url") ?? "" }),
        });
        if (!res.ok) throw new Error(`Contact API failed: ${res.status}`);
        event.currentTarget.reset();
        setStatus(lang === "jp" ? "送信しました。" : "Message sent.");
      } catch {
        setStatus(lang === "jp" ? "送信に失敗しました。メールアプリから送信してください。" : "Could not send. Please use your email app.");
      } finally {
        setSending(false);
      }
      return;
    }

    const subject = encodeURIComponent(`Inquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${replyTo}\n\n${message}`);
    window.location.href = `mailto:${contactAddress()}?subject=${subject}&body=${body}`;
    setStatus(lang === "jp" ? "メールアプリを起動します。" : "Opening your email app.");
  }

  return (
    <section id="contact" style={{ maxWidth: "1020px", margin: "0 auto", padding: "56px 24px" }}>
      <div className="contact-panel" style={{
        display: "grid", gridTemplateColumns: "minmax(0, 0.88fr) minmax(300px, 1.12fr)",
        gap: "28px", alignItems: "start", padding: "28px", borderRadius: "8px",
        background: "rgba(8,14,18,0.72)", color: "#f6fbff",
        border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 18px 44px rgba(0,0,0,0.24)",
      }}>
        <div>
          <p style={{ margin: "0 0 10px", fontSize: "0.76rem", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "#8de0d2" }}>
            Contact
          </p>
          <h2 style={{ margin: 0, fontSize: "1.75rem", lineHeight: 1.25 }}>
            {lang === "jp" ? "プロダクト開発や協業の相談" : "Product development and collaboration"}
          </h2>
          <p style={{ margin: "14px 0 0", lineHeight: 1.7, opacity: 0.78, fontWeight: 600 }}>
            {lang === "jp"
              ? "Web / モバイルアプリの企画、開発、運用、協業に関するご相談を承ります。"
              : "We welcome inquiries about web and mobile app planning, development, operations, and collaboration."}
          </p>
        </div>

        <form onSubmit={onSubmit} className="contact-form">
          <input name="company_url" tabIndex={-1} autoComplete="off" aria-hidden="true" className="contact-honeypot" />
          <FormField label={lang === "jp" ? "お名前" : "Name"} name="name" autoComplete="name" />
          <FormField label={lang === "jp" ? "返信先メールアドレス" : "Reply email"} name="reply_to" type="email" autoComplete="email" />
          <label className="contact-label">
            {lang === "jp" ? "お問い合わせ内容" : "Message"}
            <textarea name="message" rows={6} required className="contact-input" />
          </label>
          <button type="submit" className="contact-submit" disabled={sending}>
            {sending ? (lang === "jp" ? "送信中..." : "Sending...") : (lang === "jp" ? "送信" : "Send")}
          </button>
          {status && <p style={{ margin: "10px 0 0", fontSize: "0.86rem", color: "#8de0d2", fontWeight: 700 }}>{status}</p>}
        </form>
      </div>
    </section>
  );
}

function FormField({ label, name, type = "text", autoComplete }: { label: string; name: string; type?: string; autoComplete?: string }) {
  return (
    <label className="contact-label">
      {label}
      <input name={name} type={type} required autoComplete={autoComplete} className="contact-input" />
    </label>
  );
}
