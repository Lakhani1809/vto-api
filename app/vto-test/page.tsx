"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "error" | "done";

export default function VtoTestPage() {
  const [userId, setUserId] = useState("");
  const [upperwear, setUpperwear] = useState<File | null>(null);
  const [lowerwear, setLowerwear] = useState<File | null>(null);
  const [dress, setDress] = useState<File | null>(null);
  const [layering, setLayering] = useState<File | null>(null);
  const [footwear, setFootwear] = useState<File | null>(null);
  const [accessories, setAccessories] = useState<File[]>([]);

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    image: string;
    downloadUrl: string | null;
  } | null>(null);

  const handleAccessoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setAccessories(Array.from(files));
    }
  };

  const handleSubmit = async () => {
    if (!userId.trim()) {
      setError("Please enter a User ID");
      return;
    }

    const hasGarment =
      upperwear || lowerwear || dress || layering || footwear || accessories.length > 0;
    if (!hasGarment) {
      setError("Please upload at least one garment image");
      return;
    }

    setStatus("loading");
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("user_id", userId.trim());

      if (upperwear) formData.append("upperwear", upperwear);
      if (lowerwear) formData.append("lowerwear", lowerwear);
      if (dress) formData.append("dress", dress);
      if (layering) formData.append("layering", layering);
      if (footwear) formData.append("footwear", footwear);

      accessories.forEach((file, index) => {
        formData.append(`accessory_${index}`, file);
      });

      const response = await fetch("/api/vto-supabase", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate VTO");
      }

      setResult({
        image: data.dataUrl || `data:image/png;base64,${data.image}`,
        downloadUrl: data.downloadUrl || null,
      });
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unexpected error");
    }
  };

  const handleDownload = () => {
    if (result?.downloadUrl) {
      window.open(result.downloadUrl, "_blank");
    } else if (result?.image) {
      const link = document.createElement("a");
      link.href = result.image;
      link.download = `vto-${userId}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>VTO API Test</h1>
        <p style={styles.subtitle}>
          Test the Virtual Try-On API with Supabase integration
        </p>

        <div style={styles.section}>
          <label style={styles.label}>
            User ID <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            placeholder="Enter user ID from user_profiles table"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            style={styles.input}
          />
          <span style={styles.hint}>
            The avatar will be fetched from the user_profiles.avatar_image_url column
          </span>
        </div>

        <div style={styles.divider} />

        <h2 style={styles.sectionTitle}>Garments</h2>

        <div style={styles.grid}>
          <div style={styles.uploadBox}>
            <label style={styles.uploadLabel}>
              Upperwear
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setUpperwear(e.target.files?.[0] || null)}
                style={styles.fileInput}
              />
              {upperwear && (
                <img
                  src={URL.createObjectURL(upperwear)}
                  alt="Upperwear preview"
                  style={styles.preview}
                />
              )}
            </label>
          </div>

          <div style={styles.uploadBox}>
            <label style={styles.uploadLabel}>
              Lowerwear
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLowerwear(e.target.files?.[0] || null)}
                style={styles.fileInput}
              />
              {lowerwear && (
                <img
                  src={URL.createObjectURL(lowerwear)}
                  alt="Lowerwear preview"
                  style={styles.preview}
                />
              )}
            </label>
          </div>

          <div style={styles.uploadBox}>
            <label style={styles.uploadLabel}>
              Dress
              <span style={styles.subHint}>(overrides upper/lower)</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setDress(e.target.files?.[0] || null)}
                style={styles.fileInput}
              />
              {dress && (
                <img
                  src={URL.createObjectURL(dress)}
                  alt="Dress preview"
                  style={styles.preview}
                />
              )}
            </label>
          </div>

          <div style={styles.uploadBox}>
            <label style={styles.uploadLabel}>
              Layering
              <span style={styles.subHint}>(jacket/hoodie)</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLayering(e.target.files?.[0] || null)}
                style={styles.fileInput}
              />
              {layering && (
                <img
                  src={URL.createObjectURL(layering)}
                  alt="Layering preview"
                  style={styles.preview}
                />
              )}
            </label>
          </div>

          <div style={styles.uploadBox}>
            <label style={styles.uploadLabel}>
              Footwear
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFootwear(e.target.files?.[0] || null)}
                style={styles.fileInput}
              />
              {footwear && (
                <img
                  src={URL.createObjectURL(footwear)}
                  alt="Footwear preview"
                  style={styles.preview}
                />
              )}
            </label>
          </div>

          <div style={styles.uploadBox}>
            <label style={styles.uploadLabel}>
              Accessories
              <span style={styles.subHint}>(multiple allowed)</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleAccessoryChange}
                style={styles.fileInput}
              />
              <div style={styles.accessoryGrid}>
                {accessories.map((file, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(file)}
                    alt={`Accessory ${index + 1}`}
                    style={styles.accessoryPreview}
                  />
                ))}
              </div>
            </label>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={status === "loading"}
          style={{
            ...styles.button,
            opacity: status === "loading" ? 0.7 : 1,
            cursor: status === "loading" ? "not-allowed" : "pointer",
          }}
        >
          {status === "loading" ? "Generating VTO..." : "Generate VTO"}
        </button>

        {status === "loading" && (
          <div style={styles.spinnerContainer}>
            <div style={styles.spinner} />
            <span style={styles.spinnerText}>Processing with Gemini AI...</span>
          </div>
        )}

        {error && (
          <div style={styles.errorBox} role="alert">
            {error}
          </div>
        )}

        {result && (
          <div style={styles.resultSection}>
            <h2 style={styles.resultTitle}>VTO Result</h2>
            <img src={result.image} alt="VTO Result" style={styles.resultImage} />

            <div style={styles.buttonGroup}>
              <button onClick={handleDownload} style={styles.downloadButton}>
                Download Image
              </button>
              {result.downloadUrl && (
                <a
                  href={result.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.linkButton}
                >
                  Open in New Tab
                </a>
              )}
            </div>

            {result.downloadUrl && (
              <div style={styles.urlBox}>
                <label style={styles.label}>Download URL:</label>
                <input
                  type="text"
                  value={result.downloadUrl}
                  readOnly
                  style={styles.urlInput}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
              </div>
            )}
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
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "2rem",
    background: "linear-gradient(145deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
  },
  card: {
    width: "100%",
    maxWidth: 900,
    background: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(20px)",
    padding: "2.5rem",
    borderRadius: 24,
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 24px 80px rgba(0, 0, 0, 0.4)",
  },
  title: {
    margin: 0,
    fontSize: "2rem",
    fontWeight: 700,
    color: "#ffffff",
    fontFamily: "'Clash Display', 'SF Pro Display', system-ui, sans-serif",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    margin: "0.5rem 0 0",
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: "1rem",
  },
  section: {
    marginTop: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    fontWeight: 600,
    color: "#ffffff",
    fontSize: "0.9rem",
  },
  required: {
    color: "#ff6b6b",
  },
  input: {
    padding: "0.85rem 1rem",
    borderRadius: 12,
    border: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(255, 255, 255, 0.05)",
    color: "#ffffff",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  hint: {
    fontSize: "0.8rem",
    color: "rgba(255, 255, 255, 0.4)",
  },
  divider: {
    margin: "1.5rem 0",
    height: 1,
    background: "rgba(255, 255, 255, 0.08)",
  },
  sectionTitle: {
    margin: "0 0 1rem",
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#ffffff",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "1rem",
  },
  uploadBox: {
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px dashed rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: "1rem",
    transition: "border-color 0.2s, background 0.2s",
  },
  uploadLabel: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    color: "#ffffff",
    fontWeight: 500,
    fontSize: "0.9rem",
    cursor: "pointer",
  },
  subHint: {
    fontSize: "0.75rem",
    color: "rgba(255, 255, 255, 0.4)",
    fontWeight: 400,
  },
  fileInput: {
    marginTop: "0.5rem",
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: "0.85rem",
  },
  preview: {
    marginTop: "0.5rem",
    width: "100%",
    maxHeight: 150,
    objectFit: "contain",
    borderRadius: 8,
    background: "rgba(255, 255, 255, 0.05)",
  },
  accessoryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "0.5rem",
    marginTop: "0.5rem",
  },
  accessoryPreview: {
    width: "100%",
    height: 60,
    objectFit: "contain",
    borderRadius: 6,
    background: "rgba(255, 255, 255, 0.05)",
  },
  button: {
    marginTop: "2rem",
    padding: "1rem 2rem",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: 14,
    fontSize: "1.1rem",
    fontWeight: 600,
    width: "100%",
    transition: "transform 0.15s, box-shadow 0.15s",
    boxShadow: "0 8px 32px rgba(102, 126, 234, 0.35)",
  },
  spinnerContainer: {
    marginTop: "1.5rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.75rem",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid rgba(255, 255, 255, 0.1)",
    borderTopColor: "#667eea",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  spinnerText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: "0.9rem",
  },
  errorBox: {
    marginTop: "1.5rem",
    padding: "1rem 1.25rem",
    background: "rgba(255, 107, 107, 0.1)",
    color: "#ff6b6b",
    borderRadius: 12,
    border: "1px solid rgba(255, 107, 107, 0.2)",
    fontSize: "0.9rem",
  },
  resultSection: {
    marginTop: "2rem",
    paddingTop: "1.5rem",
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
  },
  resultTitle: {
    margin: "0 0 1rem",
    fontSize: "1.25rem",
    fontWeight: 600,
    color: "#ffffff",
  },
  resultImage: {
    width: "100%",
    maxHeight: 600,
    objectFit: "contain",
    borderRadius: 16,
    background: "rgba(255, 255, 255, 0.02)",
  },
  buttonGroup: {
    marginTop: "1.25rem",
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
  },
  downloadButton: {
    padding: "0.85rem 1.5rem",
    background: "#1a1a2e",
    color: "#ffffff",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s",
  },
  linkButton: {
    padding: "0.85rem 1.5rem",
    background: "transparent",
    color: "#667eea",
    border: "1px solid #667eea",
    borderRadius: 12,
    fontSize: "0.95rem",
    fontWeight: 600,
    textDecoration: "none",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  urlBox: {
    marginTop: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  urlInput: {
    padding: "0.75rem 1rem",
    borderRadius: 10,
    border: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(255, 255, 255, 0.05)",
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "0.85rem",
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  },
};

// Add spinner animation
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
  `;
  document.head.appendChild(styleSheet);
}

