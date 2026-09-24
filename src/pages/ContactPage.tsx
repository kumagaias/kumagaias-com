import ContactSection from "../components/site/ContactSection";

export default function ContactPage({ support = false }: { support?: boolean }) {
  return (
    <main className="page-shell" style={{ minHeight: "100vh", background: "#f7f3ea", color: "#1f2d2e", padding: "118px 0 56px" }}>
      <ContactSection support={support} />
    </main>
  );
}
