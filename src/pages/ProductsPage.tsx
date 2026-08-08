import WorksSection from "../components/WorksSection";

export default function ProductsPage() {
  return (
    <main
      className="page-shell"
      style={{
        minHeight: "100vh",
        paddingTop: "76px",
        background: "#f7f3ea",
        color: "#1f2d2e",
      }}
    >
      <WorksSection />
    </main>
  );
}
