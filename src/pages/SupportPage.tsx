import { useLang } from "../contexts/LanguageContext";

const contactEmail = "contact@kumagaias.com";

function deletionRequestHref(isJapanese: boolean) {
  const subject = isJapanese ? "Pashabookアカウント削除の依頼" : "Pashabook account deletion request";
  const body = isJapanese
    ? "登録メールアドレス:\n\nPashabookアカウントと関連データの削除を希望します。"
    : "Account email address:\n\nI request deletion of my Pashabook account and associated data.";
  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function supportRequestHref(isJapanese: boolean) {
  const subject = isJapanese ? "Pashabookサポートの問い合わせ" : "Pashabook support request";
  const body = isJapanese
    ? "登録メールアドレス（任意）:\n端末・OS（任意）:\nアプリのバージョン（任意）:\n\nお問い合わせ内容:"
    : "Account email (optional):\nDevice / OS (optional):\nApp version (optional):\n\nHow can we help?";
  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function SupportPage() {
  const { lang } = useLang();
  const isJapanese = lang === "jp";

  return (
    <main style={{ minHeight: "100vh", background: "#f7f3ea", color: "#1f2d2e", padding: "112px 24px 56px" }}>
      <div style={{ maxWidth: "820px", margin: "0 auto" }}>
        <p style={{ margin: "32px 0 10px", fontSize: "0.76rem", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "#476c5c" }}>
          Pashabook Support
        </p>
        <h1 style={{ margin: 0, fontSize: "clamp(2rem, 5vw, 3.4rem)", lineHeight: 1.1 }}>
          {isJapanese ? "Pashabook サポート" : "Pashabook Support"}
        </h1>
        <p style={{ margin: "18px 0 34px", maxWidth: "760px", lineHeight: 1.85, opacity: 0.78, fontWeight: 650 }}>
          {isJapanese
            ? "Pashabookの使い方や不具合についてのお問い合わせ、アカウントと関連データの削除依頼はこちらをご確認ください。"
            : "Get help with Pashabook, report a problem, or request deletion of your account and associated data."}
        </p>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>{isJapanese ? "アカウントとデータを削除する" : "Delete your account and data"}</h2>
          <p style={paragraphStyle}>
            {isJapanese
              ? "サインインできる場合は、Pashabookアプリの「設定」から「アカウントを削除」を選び、確認画面で削除を確定してください。"
              : "If you can sign in, open Settings in the Pashabook app, choose Delete Account, and confirm the deletion."}
          </p>
          <p style={paragraphStyle}>
            {isJapanese
              ? "サインインできない場合は、下のボタンから contact@kumagaias.com へ削除を依頼してください。登録メールアドレスを記載してください。本人確認に追加情報が必要な場合は、返信でご案内します。パスワードや決済情報は送らないでください。"
              : "If you cannot sign in, email contact@kumagaias.com using the button below. Include the email address registered to your account. If we need more information to verify the request, we will reply with instructions. Do not send your password or payment details."}
          </p>
          <a href={deletionRequestHref(isJapanese)} style={buttonStyle}>
            {isJapanese ? "アカウント削除をメールで依頼" : "Request account deletion by email"}
          </a>
          <p style={noteStyle}>
            {isJapanese
              ? "削除すると、アカウント、プロフィール、子どもプロフィール、アップロードした絵、生成した絵本、生成ジョブ、関連アセットが削除されます。削除後は復元できません。サブスクリプションはApp StoreまたはGoogle Playで別途解約してください。"
              : "Deletion removes your account, profiles, child profiles, uploaded drawings, generated storybooks, generation jobs, and related assets. It cannot be undone. Cancel subscriptions separately through the App Store or Google Play."}
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>{isJapanese ? "使い方・不具合のお問い合わせ" : "Product help and bug reports"}</h2>
          <p style={paragraphStyle}>
            {isJapanese
              ? "問題の内容に加えて、登録メールアドレス（任意）、端末・OS、アプリのバージョンをお知らせいただくと確認がスムーズです。"
              : "To help us investigate, describe the issue and, if available, include your account email, device and OS, and app version."}
          </p>
          <a href={supportRequestHref(isJapanese)} style={buttonStyle}>
            {isJapanese ? "サポートへメール" : "Email Pashabook support"}
          </a>
          <p style={contactStyle}>
            {isJapanese ? "連絡先: " : "Contact: "}
            <a href={`mailto:${contactEmail}`} style={{ color: "inherit", fontWeight: 800 }}>{contactEmail}</a>
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
