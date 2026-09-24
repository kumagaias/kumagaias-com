import { useState, type FormEvent } from "react";
import { useLang } from "../contexts/LanguageContext";

const contactEmail = "contact@kumagaias.com";
const contactEndpoint = import.meta.env.VITE_CONTACT_API_URL;

const supportApps = [
  { value: "gakkyu-alert", labelJp: "学級アラート (gakkyu-alert)", labelEn: "Class Alert (gakkyu-alert)", nameJp: "学級アラート", nameEn: "Class Alert" },
  { value: "pashabook", labelJp: "パシャブック (pashabook)", labelEn: "Pashabook (pashabook)", nameJp: "パシャブック", nameEn: "Pashabook" },
  { value: "other", labelJp: "その他", labelEn: "Other", nameJp: "", nameEn: "" },
];

function supportRequestHref(isJapanese: boolean, appName: string) {
  const subject = isJapanese ? `${appName}のサポート問い合わせ` : `${appName} support request`;
  const body = isJapanese
    ? `アプリ名: ${appName}\n登録メールアドレス（任意）:\n端末・OS（任意）:\nアプリのバージョン（任意）:\n\nお問い合わせ内容:`
    : `App: ${appName}\nAccount email (optional):\nDevice / OS (optional):\nApp version (optional):\n\nHow can we help?`;
  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

type FormStatus = {
  kind: "sending" | "success" | "error";
  message: string;
};

function AccountDeletionForm({ isJapanese }: { isJapanese: boolean }) {
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<FormStatus | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;

    const form = event.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      setStatus({
        kind: "error",
        message: isJapanese
          ? "登録メールアドレスを正しく入力してください。"
          : "Enter a valid registered email address.",
      });
      return;
    }

    const data = new FormData(form);
    if (String(data.get("company_url") ?? "").trim()) return;

    const registeredEmail = String(data.get("reply_to") ?? "").trim();
    const details = String(data.get("details") ?? "").trim();
    if (!registeredEmail) {
      setStatus({
        kind: "error",
        message: isJapanese ? "登録メールアドレスを入力してください。" : "Enter your registered email address.",
      });
      return;
    }

    if (!contactEndpoint) {
      setStatus({
        kind: "error",
        message: isJapanese
          ? "送信フォームを利用できません。下記の連絡先へメールでご依頼ください。"
          : "The request form is unavailable. Please email us using the contact link below.",
      });
      return;
    }

    const messageParts = [
      isJapanese
        ? "Pashabookアカウントおよび関連データの削除を依頼します。"
        : "I request deletion of my Pashabook account and associated data.",
      (isJapanese ? "登録メールアドレス: " : "Registered email: ") + registeredEmail,
    ];
    if (details) {
      messageParts.push((isJapanese ? "補足情報:\n" : "Additional details:\n") + details);
    }

    setSending(true);
    setStatus({
      kind: "sending",
      message: isJapanese ? "削除依頼を送信しています..." : "Sending your deletion request...",
    });

    try {
      const response = await fetch(contactEndpoint.replace(/\/$/, "") + "/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: isJapanese ? "Pashabookアカウント削除依頼" : "Pashabook account deletion request",
          reply_to: registeredEmail,
          message: messageParts.join("\n\n"),
          company_url: data.get("company_url") ?? "",
        }),
      });
      if (!response.ok) throw new Error("Contact request failed");

      form.reset();
      setStatus({
        kind: "success",
        message: isJapanese
          ? "削除依頼を受け付けました。確認が必要な場合は登録メールアドレスへご連絡します。"
          : "Your deletion request has been received. We will contact your registered email if verification is needed.",
      });
    } catch {
      setStatus({
        kind: "error",
        message: isJapanese
          ? "送信できませんでした。下記の連絡先へメールでご依頼ください。"
          : "We could not send your request. Please email us using the contact link below.",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} noValidate style={formStyle}>
        <input
          name="company_url"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="contact-honeypot"
        />
        <label htmlFor="deletion-reply-email" style={labelStyle}>
          {isJapanese ? "登録メールアドレス（必須）" : "Registered email address (required)"}
          <input
            id="deletion-reply-email"
            name="reply_to"
            type="email"
            autoComplete="email"
            required
            maxLength={320}
            aria-describedby="deletion-email-help"
            className="contact-input"
            style={inputStyle}
            disabled={sending}
          />
        </label>
        <p id="deletion-email-help" style={helpStyle}>
          {isJapanese
            ? "Pashabookアカウントに登録したメールアドレスを入力してください。"
            : "Use the email address registered to your Pashabook account."}
        </p>
        <label htmlFor="deletion-details" style={labelStyle}>
          {isJapanese ? "補足情報（任意）" : "Additional details (optional)"}
          <textarea
            id="deletion-details"
            name="details"
            rows={4}
            maxLength={5000}
            className="contact-input"
            style={inputStyle}
            disabled={sending}
          />
        </label>
        <p style={helpStyle}>
          {isJapanese
            ? "このフォームはアカウントと関連データの削除を依頼するためのものです。パスワードや決済情報は送信しないでください。"
            : "This form is for requesting deletion of your account and associated data. Do not send passwords or payment details."}
        </p>
        <button type="submit" className="contact-submit" style={submitStyle} disabled={sending}>
          {sending
            ? (isJapanese ? "送信中..." : "Sending...")
            : (isJapanese ? "アカウント削除を依頼" : "Request account deletion")}
        </button>
      </form>
      {status && (
        <div
          role={status.kind === "error" ? "alert" : "status"}
          aria-live={status.kind === "error" ? "assertive" : "polite"}
          style={statusStyle(status.kind)}
        >
          {status.message}{" "}
          {status.kind === "error" && (
            <a href={"mailto:" + contactEmail} style={{ color: "inherit", fontWeight: 800 }}>
              {contactEmail}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function SupportPage() {
  const { lang } = useLang();
  const isJapanese = lang === "jp";
  const [selectedApp, setSelectedApp] = useState("pashabook");
  const [customAppName, setCustomAppName] = useState("");
  const selectedOption = supportApps.find((app) => app.value === selectedApp);
  const appName = selectedApp === "other"
    ? customAppName.trim()
    : (isJapanese ? selectedOption?.nameJp : selectedOption?.nameEn) ?? "";

  return (
    <main style={{ minHeight: "100vh", background: "#f7f3ea", color: "#1f2d2e", padding: "112px 24px 56px" }}>
      <div style={{ maxWidth: "820px", margin: "0 auto" }}>
        <p style={{ margin: "32px 0 10px", fontSize: "0.76rem", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "#476c5c" }}>
          {isJapanese ? "アプリサポート" : "App Support"}
        </p>
        <h1 style={{ margin: 0, fontSize: "clamp(2rem, 5vw, 3.4rem)", lineHeight: 1.1 }}>
          {isJapanese ? `${appName || "アプリ"} サポート` : `${appName || "App"} Support`}
        </h1>
        <p style={{ margin: "18px 0 34px", maxWidth: "760px", lineHeight: 1.85, opacity: 0.78, fontWeight: 650 }}>
          {isJapanese
            ? "アプリの使い方や不具合についてのお問い合わせを受け付けています。Pashabookのアカウント削除依頼は、パシャブックを選ぶと表示されます。"
            : "Get help with an app or report a problem. Pashabook account deletion options appear when Pashabook is selected."}
        </p>

        <section style={{ ...sectionStyle, marginTop: 0 }}>
          <label htmlFor="support-app" style={labelStyle}>
            {isJapanese ? "アプリ名" : "App"}
            <select
              id="support-app"
              value={selectedApp}
              onChange={(event) => setSelectedApp(event.target.value)}
              className="contact-input"
              style={inputStyle}
            >
              {supportApps.map((app) => (
                <option key={app.value} value={app.value}>
                  {isJapanese ? app.labelJp : app.labelEn}
                </option>
              ))}
            </select>
          </label>
          {selectedApp === "other" && (
            <label htmlFor="support-other-app" style={{ ...labelStyle, marginTop: "14px" }}>
              {isJapanese ? "アプリ名を入力" : "Enter the app name"}
              <input
                id="support-other-app"
                value={customAppName}
                onChange={(event) => setCustomAppName(event.target.value)}
                className="contact-input"
                style={inputStyle}
                maxLength={120}
                aria-required="true"
              />
            </label>
          )}
        </section>

        {selectedApp === "pashabook" && (
          <section style={sectionStyle}>
          <h2 style={headingStyle}>{isJapanese ? "アカウントとデータを削除する" : "Delete your account and data"}</h2>
          <p style={paragraphStyle}>
            {isJapanese
              ? "サインインできる場合は、Pashabookアプリの「設定」から「アカウントを削除」を選び、確認画面で削除を確定してください。"
              : "If you can sign in, open Settings in the Pashabook app, choose Delete Account, and confirm the deletion."}
          </p>
          <p style={paragraphStyle}>
            {isJapanese
              ? "サインインできない場合は、下のフォームから削除を依頼できます。登録メールアドレスを入力してください。本人確認に追加情報が必要な場合は、返信でご案内します。"
              : "If you cannot sign in, request deletion using the form below. Enter the email address registered to your account. If additional information is needed to verify the request, we will reply with instructions."}
          </p>
          <div style={{ marginTop: "22px" }}>
            <AccountDeletionForm isJapanese={isJapanese} />
          </div>
          <p style={noteStyle}>
            {isJapanese
              ? "削除すると、アカウント、プロフィール、子どもプロフィール、アップロードした絵、生成した絵本、生成ジョブ、関連アセットが削除されます。削除後は復元できません。サブスクリプションはApp StoreまたはGoogle Playで別途解約してください。"
              : "Deletion removes your account, profiles, child profiles, uploaded drawings, generated storybooks, generation jobs, and related assets. It cannot be undone. Cancel subscriptions separately through the App Store or Google Play."}
          </p>
          </section>
        )}

        <section style={sectionStyle}>
          <h2 style={headingStyle}>{isJapanese ? "使い方・不具合のお問い合わせ" : "Product help and bug reports"}</h2>
          <p style={paragraphStyle}>
            {isJapanese
              ? "お問い合わせの際は、端末・OS、アプリのバージョンもお知らせいただくと確認がスムーズです。"
              : "To help us investigate, include your device and OS, app version, and a description of the issue."}
          </p>
          {appName ? (
            <a href={supportRequestHref(isJapanese, appName)} style={buttonStyle}>
              {isJapanese ? "メールでサポートに問い合わせ" : "Email support"}
            </a>
          ) : (
            <p style={paragraphStyle}>
              {isJapanese ? "その他を選んだ場合は、先にアプリ名を入力してください。" : "Enter the app name above to prepare your support email."}
            </p>
          )}
          <p style={contactStyle}>
            {isJapanese ? "サポート連絡先: " : "Support email: "}
            <a href={"mailto:" + contactEmail} style={{ color: "inherit", fontWeight: 800 }}>{contactEmail}</a>
          </p>
        </section>
      </div>
    </main>
  );
}

const sectionStyle: React.CSSProperties = {
  marginTop: "30px",
  padding: "24px",
  border: "1px solid rgba(31,45,46,0.14)",
  borderRadius: "8px",
  background: "rgba(255,255,255,0.56)",
};

const headingStyle: React.CSSProperties = { margin: 0, fontSize: "1.25rem", lineHeight: 1.4 };
const paragraphStyle: React.CSSProperties = { margin: "14px 0 0", lineHeight: 1.8, opacity: 0.8, fontWeight: 600 };
const noteStyle: React.CSSProperties = { margin: "18px 0 0", lineHeight: 1.8, opacity: 0.72, fontSize: "0.9rem" };
const contactStyle: React.CSSProperties = { margin: "18px 0 0", fontSize: "0.9rem", opacity: 0.76 };
const buttonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: "46px",
  marginTop: "20px",
  padding: "10px 18px",
  borderRadius: "6px",
  background: "#1f2d2e",
  color: "#fff",
  fontWeight: 800,
  textDecoration: "none",
};
const formStyle: React.CSSProperties = { display: "grid", gap: "12px" };
const labelStyle: React.CSSProperties = { display: "grid", gap: "7px", fontWeight: 800, lineHeight: 1.5 };
const inputStyle: React.CSSProperties = { borderColor: "rgba(31,45,46,0.28)", background: "#fff", color: "#1f2d2e" };
const helpStyle: React.CSSProperties = { margin: "-6px 0 4px", lineHeight: 1.65, opacity: 0.76, fontSize: "0.9rem" };
const submitStyle: React.CSSProperties = { marginTop: "4px", background: "#1f2d2e", color: "#fff", padding: "10px 18px" };
function statusStyle(kind: FormStatus["kind"]): React.CSSProperties {
  return {
    marginTop: "14px",
    lineHeight: 1.65,
    fontWeight: 700,
    color: kind === "error" ? "#8f2525" : "#315e43",
  };
}
