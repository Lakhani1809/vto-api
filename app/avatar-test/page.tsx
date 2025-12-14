"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "error" | "done";

export default function AvatarTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const [vtoStatus, setVtoStatus] = useState<Status>("idle");
  const [vtoError, setVtoError] = useState<string | null>(null);
  const [vtoImage, setVtoImage] = useState<string | null>(null);
  const [baseAvatarFile, setBaseAvatarFile] = useState<File | null>(null);
  const [upperwear, setUpperwear] = useState<File | null>(null);
  const [lowerwear, setLowerwear] = useState<File | null>(null);
  const [dress, setDress] = useState<File | null>(null);
  const [layering, setLayering] = useState<File | null>(null);
  const [accessory, setAccessory] = useState<File | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) {
      setFile(null);
      setPreview(null);
      return;
    }
    setFile(selected);
    setAvatarUrl(null);
    setError(null);

    const url = URL.createObjectURL(selected);
    setPreview(url);
  };

  const onSubmit = async () => {
    if (!file) {
      setError("Please select an image first.");
      return;
    }
    setStatus("loading");
    setError(null);
    setAvatarUrl(null);

    const form = new FormData();
    form.append("image", file);

    try {
      const res = await fetch("/api/avatar", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to generate avatar");
      }

      const body = await res.json();
      // Handle base64 response (for Railway deployment)
      if (body.dataUrl) {
        setAvatarUrl(body.dataUrl);
      } else if (body.image) {
        setAvatarUrl(`data:image/png;base64,${body.image}`);
      } else if (body.avatarUrl) {
        // Fallback for local development with file storage
        setAvatarUrl(body.avatarUrl);
      }
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unexpected error");
    }
  };

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h1 style={{ margin: 0 }}>Avatar Test</h1>
        <p style={{ color: "#444", marginTop: "0.35rem" }}>
          Upload a full-body photo to generate a clean fashion mannequin-style
          avatar.
        </p>

        <div style={styles.section}>
          <label style={styles.label}>Upload image</label>
          <input type="file" accept="image/*" onChange={onFileChange} />
          {preview && (
            <div style={styles.preview}>
              <img
                src={preview}
                alt="Preview"
                style={{ maxWidth: "100%", maxHeight: "240px", borderRadius: 8 }}
              />
            </div>
          )}
        </div>

        <button
          style={{
            ...styles.button,
            opacity: status === "loading" ? 0.65 : 1,
            cursor: status === "loading" ? "not-allowed" : "pointer",
          }}
          onClick={onSubmit}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Generating..." : "Generate Avatar"}
        </button>

        {status === "loading" && (
          <div style={styles.spinnerContainer}>
            <div style={styles.spinner} aria-label="loading" />
            <span style={{ marginTop: 8, color: "#444" }}>Working with Gemini…</span>
          </div>
        )}

        {error && (
          <div style={styles.error} role="alert">
            {error}
          </div>
        )}

        {avatarUrl && (
          <div style={styles.result}>
            <h2 style={{ margin: "0 0 0.5rem 0" }}>Generated Avatar</h2>
            <img
              src={avatarUrl}
              alt="Generated avatar"
              style={{ maxWidth: "100%", borderRadius: 10 }}
            />
            <button
              onClick={() => {
                if (avatarUrl?.startsWith("data:")) {
                  const link = document.createElement("a");
                  link.href = avatarUrl;
                  link.download = "avatar.png";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                } else {
                  window.open(avatarUrl || "", "_blank");
                }
              }}
              style={{
                marginTop: "0.75rem",
                padding: "0.65rem 1rem",
                background: "#0f172a",
                color: "white",
                borderRadius: 8,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                width: "fit-content",
              }}
            >
              Download avatar (PNG)
            </button>
          </div>
        )}

        <div style={styles.divider} />

        <h2 style={{ margin: "0 0 0.5rem 0" }}>Virtual Try-On (VTO) Prototype</h2>
        <p style={{ color: "#444", marginTop: 0 }}>
          Dress overrides upperwear and lowerwear. Avatar remains unchanged.
        </p>

        <div style={{ display: "grid", gap: "0.75rem", marginTop: "0.75rem" }}>
          <label style={styles.label}>
            Base image (optional avatar upload)
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setBaseAvatarFile(e.target.files?.[0] || null)}
            />
            <span style={{ fontSize: 12, color: "#555" }}>
              Use this as the base avatar (otherwise the generated avatar above is used).
            </span>
          </label>
          <label style={styles.label}>
            Upperwear
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setUpperwear(e.target.files?.[0] || null)}
            />
          </label>
          <label style={styles.label}>
            Lowerwear
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLowerwear(e.target.files?.[0] || null)}
            />
          </label>
          <label style={styles.label}>
            Dress (overrides upperwear + lowerwear)
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setDress(e.target.files?.[0] || null)}
            />
          </label>
          <label style={styles.label}>
            Layering (jacket/hoodie/blazer)
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLayering(e.target.files?.[0] || null)}
            />
          </label>
          <label style={styles.label}>
            Accessory (one)
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAccessory(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        <button
          style={{
            ...styles.button,
            marginTop: "1rem",
            opacity: vtoStatus === "loading" ? 0.65 : 1,
            cursor: vtoStatus === "loading" ? "not-allowed" : "pointer",
          }}
          onClick={async () => {
            if (!avatarUrl && !baseAvatarFile) {
              setVtoError("Provide a base avatar (upload or generate) before VTO.");
              return;
            }
            if (
              !dress &&
              !upperwear &&
              !lowerwear &&
              !layering &&
              !accessory
            ) {
              setVtoError("Please upload at least one garment image.");
              return;
            }

            setVtoStatus("loading");
            setVtoError(null);
            setVtoImage(null);
            try {
              let avatarFile: File;
              if (baseAvatarFile) {
                avatarFile = baseAvatarFile;
              } else if (avatarUrl) {
                // Handle base64 data URL
                if (avatarUrl.startsWith("data:")) {
                  const response = await fetch(avatarUrl);
                  const blob = await response.blob();
                  avatarFile = new File([blob], "avatar.png", {
                    type: "image/png",
                  });
                } else {
                  // Handle regular URL (local dev)
                  const avatarResponse = await fetch(avatarUrl);
                  const avatarBlob = await avatarResponse.blob();
                  avatarFile = new File([avatarBlob], "avatar.png", {
                    type: avatarBlob.type || "image/png",
                  });
                }
              } else {
                throw new Error("No avatar available");
              }

              const form = new FormData();
              form.append("avatar", avatarFile);
              if (dress) form.append("dress", dress);
              if (!dress && upperwear) form.append("upperwear", upperwear);
              if (!dress && lowerwear) form.append("lowerwear", lowerwear);
              if (layering) form.append("layering", layering);
              if (accessory) form.append("accessory", accessory);

              const res = await fetch("/api/vto", {
                method: "POST",
                body: form,
              });

              if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.message || "Failed to generate VTO image");
              }

              const body = await res.json();
              setVtoImage(`data:image/png;base64,${body.image}`);
              setVtoStatus("done");
            } catch (err) {
              setVtoStatus("error");
              setVtoError(
                err instanceof Error ? err.message : "Unexpected error"
              );
            }
          }}
          disabled={vtoStatus === "loading"}
        >
          {vtoStatus === "loading" ? "Generating VTO..." : "Generate VTO"}
        </button>

        {vtoStatus === "loading" && (
          <div style={styles.spinnerContainer}>
            <div style={styles.spinner} aria-label="loading" />
            <span style={{ marginTop: 8, color: "#444" }}>
              Applying virtual try-on…
            </span>
          </div>
        )}

        {vtoError && (
          <div style={styles.error} role="alert">
            {vtoError}
          </div>
        )}

        {vtoImage && (
          <div style={styles.result}>
            <h2 style={{ margin: "0 0 0.5rem 0" }}>VTO Result</h2>
            <img
              src={vtoImage}
              alt="VTO result"
              style={{ maxWidth: "100%", borderRadius: 10 }}
            />
          </div>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
  },
  card: {
    width: "100%",
    maxWidth: 720,
    background: "white",
    padding: "1.75rem",
    borderRadius: 16,
    boxShadow: "0 12px 45px rgba(15, 23, 42, 0.08)",
  },
  section: {
    marginTop: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  label: {
    fontWeight: 600,
  },
  preview: {
    border: "1px solid #e5e7eb",
    padding: "0.5rem",
    borderRadius: 10,
    background: "#f9fafb",
  },
  button: {
    marginTop: "1.25rem",
    padding: "0.85rem 1.25rem",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 10,
    fontSize: "1rem",
    fontWeight: 600,
    width: "100%",
    transition: "transform 120ms ease, box-shadow 120ms ease",
    boxShadow: "0 10px 30px rgba(37, 99, 235, 0.25)",
  } as React.CSSProperties,
  spinnerContainer: {
    marginTop: "1rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.35rem",
  },
  spinner: {
    width: 32,
    height: 32,
    border: "3px solid #e5e7eb",
    borderTopColor: "#2563eb",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  } as React.CSSProperties,
  error: {
    marginTop: "1rem",
    padding: "0.75rem 1rem",
    background: "#fef2f2",
    color: "#b91c1c",
    borderRadius: 10,
    border: "1px solid #fecdd3",
  },
  result: {
    marginTop: "1.5rem",
    borderTop: "1px solid #e5e7eb",
    paddingTop: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  divider: {
    margin: "1.5rem 0",
    height: 1,
    background: "#e5e7eb",
  },
};

const globalStyles = `
@keyframes spin {
  to { transform: rotate(360deg); }
}
`;

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = globalStyles;
  document.head.appendChild(style);
}

