import { useLang } from "../contexts/LanguageContext";

export default function PrivacyPage() {
  const { lang } = useLang();

  return (
    <main style={{ minHeight: "100vh", background: "#f7f3ea", color: "#1f2d2e", padding: "112px 24px 56px" }}>
      <div style={{ maxWidth: "820px", margin: "0 auto" }}>
        <p style={{ margin: "32px 0 10px", fontSize: "0.76rem", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "#476c5c" }}>
          Privacy Policy
        </p>
        <h1 style={{ margin: 0, fontSize: "clamp(2rem, 5vw, 3.4rem)", lineHeight: 1.1 }}>
          {lang === "jp" ? "個人情報保護方針" : "Privacy Policy"}
        </h1>

        <PolicyBlock title={lang === "jp" ? "取得する情報" : "Information We Collect"}>
          {lang === "jp"
            ? "お問い合わせフォームの利用時に、氏名、返信先メールアドレス、お問い合わせ内容を取得します。また、サイトの表示、保守、改善のため、アクセス日時、利用環境、エラー情報などの技術情報を取得する場合があります。"
            : "When you use the contact form, we collect your name, reply email address, and message. We may also collect technical information such as access time, device environment, and error details to display, maintain, and improve the site."}
        </PolicyBlock>
        <PolicyBlock title={lang === "jp" ? "利用目的" : "Purpose of Use"}>
          {lang === "jp"
            ? "取得した情報は、お問い合わせへの回答、本人確認、必要な連絡、サービスの運営・改善、不具合対応、不正利用の防止のために利用します。目的外の利用は行いません。"
            : "We use collected information to respond to inquiries, verify identity when needed, communicate, operate and improve services, handle defects, and prevent misuse. We do not use it beyond these purposes."}
        </PolicyBlock>
        <PolicyBlock title={lang === "jp" ? "管理と保存期間" : "Retention and Management"}>
          {lang === "jp"
            ? "取得した情報は、漏えい、滅失、毀損、不正アクセス等を防ぐため、必要かつ適切な安全管理措置を講じます。利用目的に照らして不要となった情報は、合理的な期間内に削除します。"
            : "We take necessary and appropriate safeguards to prevent leakage, loss, damage, and unauthorized access. Information no longer needed for the stated purposes is deleted within a reasonable period."}
        </PolicyBlock>
        <PolicyBlock title={lang === "jp" ? "外部サービスの利用" : "Use of External Services"}>
          {lang === "jp"
            ? "サイト運営やお問い合わせ対応のため、メール、ホスティング、アクセス解析等の外部サービスを利用する場合があります。この場合、各サービスの提供者が定める条件およびプライバシーポリシーに従って情報が取り扱われます。"
            : "We may use external services for email, hosting, analytics, and inquiry handling. In such cases, information is handled according to the terms and privacy policies of those providers."}
        </PolicyBlock>
        <PolicyBlock title={lang === "jp" ? "第三者提供" : "Third-Party Disclosure"}>
          {lang === "jp"
            ? "法令に基づく場合、本人の同意がある場合、または生命・身体・財産の保護に必要で本人の同意を得ることが困難な場合を除き、個人情報を第三者に提供しません。"
            : "We do not disclose personal information to third parties except when required by law, with consent, or when necessary to protect life, body, or property and obtaining consent is difficult."}
        </PolicyBlock>
        <PolicyBlock title={lang === "jp" ? "開示・訂正・削除等" : "Disclosure, Correction, and Deletion"}>
          {lang === "jp"
            ? "本人から個人情報の開示、訂正、追加、削除、利用停止等の請求があった場合は、本人確認のうえ、法令に従って合理的な範囲で対応します。"
            : "When we receive a request for disclosure, correction, addition, deletion, or suspension of use, we verify identity and respond within a reasonable scope in accordance with applicable laws."}
        </PolicyBlock>
        <PolicyBlock title={lang === "jp" ? "お問い合わせ" : "Contact"}>
          {lang === "jp"
            ? "個人情報の取り扱いに関するご相談は、サイト内の Contact からご連絡ください。内容を確認し、必要に応じて対応します。"
            : "For privacy-related inquiries, please contact us through the Contact page. We will review the request and respond as necessary."}
        </PolicyBlock>
      </div>
    </main>
  );
}

function PolicyBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: "34px", paddingTop: "24px", borderTop: "1px solid rgba(31,45,46,0.14)" }}>
      <h2 style={{ margin: 0, fontSize: "1.2rem" }}>{title}</h2>
      <p style={{ margin: "10px 0 0", lineHeight: 1.85, opacity: 0.78, fontWeight: 650 }}>{children}</p>
    </section>
  );
}
