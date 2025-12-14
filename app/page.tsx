export default function HomePage() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
        padding: "3rem 1.5rem",
        textAlign: "center",
      }}
    >
      <h1>Avatar Generation System</h1>
      <p>
        Upload a full-body photo to generate a clean fashion mannequin-style
        avatar using Gemini Flash.
      </p>
      <a
        href="/avatar-test"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0.75rem 1.25rem",
          background: "#2563eb",
          color: "white",
          borderRadius: "8px",
          fontWeight: 600,
        }}
      >
        Go to Avatar Test
      </a>
    </main>
  );
}

