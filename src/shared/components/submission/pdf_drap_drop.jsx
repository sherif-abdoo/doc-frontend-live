import { useState, useRef } from "react";
import "../../style/submission/pdf_drap_drop_style.css";

export default function PdfDropzone({
  disabled = false,
  onUploadComplete,
  presignUrl = process.env.REACT_APP_PRESIGN_URL,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("Idle");
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const validateFile = (f) => {
    if (!f) return false;
    if (f.type !== "application/pdf") {
      alert("Only PDF files allowed!");
      return false;
    }
    if (f.size > 15 * 1024 * 1024) {
      alert("Max allowed size is 15MB");
      return false;
    }
    return true;
  };

  const handleFileSelection = (f) => {
    if (!validateFile(f)) return;
    setFile(f);
    uploadToCloudflare(f);
  };

  const uploadWithProgress = (url, file) =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", "application/pdf");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const p = Math.round((event.loaded / event.total) * 100);
          setProgress(p);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error("Failed to upload"));
      };

      xhr.onerror = () => reject(new Error("Upload failed"));
      xhr.send(file);
    });

  const uploadToCloudflare = async (file) => {
    try {
      setStatus("Requesting upload URL...");

      const presignRes = await fetch(presignUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type }),
      });

      if (!presignRes.ok) throw new Error("Presign failed");
      const { uploadURL, fileURL } = await presignRes.json();

      if (!uploadURL || !fileURL) throw new Error("Invalid presign response");

      setStatus("Uploading PDF...");
      setProgress(0);
      await uploadWithProgress(uploadURL, file);

      setProgress(100);
      setStatus("✅ Upload Complete!");
      onUploadComplete?.(fileURL);
    } catch (err) {
      console.error(err);
      setStatus("❌ " + err.message);
    }
  };

  const prevent = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setFile(null);
    setProgress(0);
    setStatus("Idle");
  };

  return (
    <div className="pdf-drop-container">
      <div
        className={`pdf-drop-zone ${isDragOver ? "drag-over" : ""}`}
        onClick={() => !disabled && fileInputRef.current?.click()}
        onDragEnter={(e) => {
          prevent(e);
          !disabled && setIsDragOver(true);
        }}
        onDragOver={prevent}
        onDragLeave={(e) => {
          prevent(e);
          setIsDragOver(false);
        }}
        onDrop={(e) => {
          prevent(e);
          setIsDragOver(false);
          if (!disabled) handleFileSelection(e.dataTransfer.files?.[0]);
        }}
      >
        {file && (
          <button className="remove-file-btn" onClick={clearFile}>
            ×
          </button>
        )}

        {file ? (
          <div className="file-details">
            ✅ {file.name} — {(file.size / 1024 / 1024).toFixed(2)} MB
          </div>
        ) : (
          <div className="placeholder">
            Drag & Drop PDF here
            <br />
            or click to browse
          </div>
        )}
      </div>

      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        style={{ display: "none" }}
        disabled={disabled}
        onChange={(e) => handleFileSelection(e.target.files?.[0])}
      />

      <p className="upload-status">{status}</p>

      {progress > 0 && (
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}
