export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "2rem",
        padding: "3rem 1.5rem",
        textAlign: "center",
        background: "linear-gradient(145deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
        color: "#ffffff",
      }}
    >
      <div style={{ maxWidth: 600 }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            margin: 0,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          VTO API
        </h1>
        <p style={{ color: "rgba(255, 255, 255, 0.6)", marginTop: "1rem", fontSize: "1.1rem" }}>
          Virtual Try-On API powered by Gemini Flash AI. Generate avatars and try on
          clothes with AI-powered image generation.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          width: "100%",
          maxWidth: 320,
        }}
      >
        <a
          href="/avatar-test"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem 1.5rem",
            background: "rgba(255, 255, 255, 0.05)",
            color: "white",
            borderRadius: "14px",
            fontWeight: 600,
            fontSize: "1rem",
            textDecoration: "none",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            transition: "background 0.2s, border-color 0.2s",
          }}
        >
          Avatar Generation Test
        </a>
        <a
          href="/vto-test"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem 1.5rem",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            borderRadius: "14px",
            fontWeight: 600,
            fontSize: "1rem",
            textDecoration: "none",
            boxShadow: "0 8px 32px rgba(102, 126, 234, 0.35)",
            transition: "transform 0.15s",
          }}
        >
          VTO with Supabase Test
        </a>
      </div>

      <div
        style={{
          marginTop: "2rem",
          padding: "1.5rem",
          background: "rgba(255, 255, 255, 0.03)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          maxWidth: 500,
          width: "100%",
        }}
      >
        <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 600 }}>
          API Endpoints
        </h3>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            fontSize: "0.9rem",
            textAlign: "left",
          }}
        >
          <div>
            <code
              style={{
                background: "rgba(102, 126, 234, 0.2)",
                padding: "0.25rem 0.5rem",
                borderRadius: "6px",
                color: "#a5b4fc",
              }}
            >
              POST /api/avatar
            </code>
            <p style={{ margin: "0.25rem 0 0", color: "rgba(255, 255, 255, 0.5)" }}>
              Generate avatar from uploaded image
            </p>
          </div>
          <div>
            <code
              style={{
                background: "rgba(102, 126, 234, 0.2)",
                padding: "0.25rem 0.5rem",
                borderRadius: "6px",
                color: "#a5b4fc",
              }}
            >
              POST /api/vto
            </code>
            <p style={{ margin: "0.25rem 0 0", color: "rgba(255, 255, 255, 0.5)" }}>
              VTO with direct file uploads
            </p>
          </div>
          <div>
            <code
              style={{
                background: "rgba(102, 126, 234, 0.2)",
                padding: "0.25rem 0.5rem",
                borderRadius: "6px",
                color: "#a5b4fc",
              }}
            >
              POST /api/vto-supabase
            </code>
            <p style={{ margin: "0.25rem 0 0", color: "rgba(255, 255, 255, 0.5)" }}>
              VTO with Supabase user integration
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

