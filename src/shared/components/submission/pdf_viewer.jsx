// src/shared/components/submission/PDFViewer.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "../../style/submission/pdf_viewer_style.css";

// ===== CONFIG =====
// Put your Worker base URL in an env var (Vite style)
const R2_READER_BASE =
    import.meta?.env?.VITE_R2_READER_BASE ||
    process.env?.VITE_R2_READER_BASE ||
    ""; // e.g. "https://your-worker.workers.dev"

// Map any incoming URL to the Worker `/get?key=...`
function toWorkerUrl(inputUrl) {
    if (!R2_READER_BASE) return inputUrl; // fallback if not set (but recommended to set!)

    try {
        const u = new URL(inputUrl);

        // If it's already pointing at the worker domain, just return it
        if (u.origin === new URL(R2_READER_BASE).origin) return inputUrl;

        // If it's a public r2.dev URL, extract the key from the pathname
        // Example: https://pub-xxx.r2.dev/uploads/2025-11-04/file.pdf  -> key = "uploads/2025-11-04/file.pdf"
        // For any other origin (S3/GCS proxies), we still try to use the path as key.
        const key = u.pathname.replace(/^\/+/, ""); // strip leading slash
        const workerUrl = new URL("/get", R2_READER_BASE);
        workerUrl.searchParams.set("key", key);
        return workerUrl.toString();
    } catch {
        // If input isn't a valid absolute URL, treat it as already a key (relative) and route via worker
        const workerUrl = new URL("/get", R2_READER_BASE);
        workerUrl.searchParams.set("key", String(inputUrl).replace(/^\/+/, ""));
        return workerUrl.toString();
    }
}

// ===== PDF.js worker (same-origin module worker) =====
try {
    const workerUrl = `${import.meta?.env?.BASE_URL || process.env.PUBLIC_URL || ""}/pdf.worker.min.mjs`;
    const worker = new Worker(workerUrl, { type: "module" });
    worker.addEventListener("error", (e) =>
        console.error("[pdfjs worker] error:", e.message || e)
    );
    worker.addEventListener("messageerror", (e) =>
        console.error("[pdfjs worker] messageerror:", e.data)
    );
    pdfjs.GlobalWorkerOptions.workerPort = worker;
} catch (e) {
    console.error("[pdfjs] Worker setup failed; rendering may be slower.", e);
}

const PDFViewer = ({ pdfUrl }) => {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.1);
    const [error, setError] = useState("");
    const [fallback, setFallback] = useState(false);
    const fallbackTimerRef = useRef(null);

    // ALWAYS use the Worker URL (critical for Chrome Android)
    const viewerUrl = useMemo(() => toWorkerUrl(pdfUrl), [pdfUrl]);

    useEffect(() => {
        setFallback(false);
        if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = setTimeout(() => setFallback(true), 6000);
        return () => clearTimeout(fallbackTimerRef.current);
    }, [viewerUrl]);

    const onDocLoad = ({ numPages }) => {
        setNumPages(numPages);
        setPageNumber(1);
        setError("");
        setFallback(false);
        if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };

    const onError = (e) => {
        console.error("[pdf] error:", e);
        setError(e?.message || "Failed to load PDF");
        setFallback(true);
    };

    const canPrev = pageNumber > 1;
    const canNext = numPages ? pageNumber < numPages : false;

    const goPrev = () => canPrev && setPageNumber((p) => p - 1);
    const goNext = () => canNext && setPageNumber((p) => p + 1);
    const zoomOut = () => setScale((s) => Math.max(0.6, s - 0.1));
    const zoomIn = () => setScale((s) => Math.min(2.5, s + 0.1));
    const fitWidth = () => setScale(1.1);

    // Android detection
    const isAndroid =
        typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);

    // Ensure a real tab on Android (prevents silent "download" behavior)
    const openInNewTab = (e) => {
        if (isAndroid) {
            e.preventDefault();
            try {
                window.open(viewerUrl, "_blank", "noopener,noreferrer");
            } catch (err) {
                console.warn("window.open failed, falling back", err);
                window.location.href = viewerUrl;
            }
        }
    };

    return (
        <div className="pdf-viewer pdf-viewer--canvas">
            <div className="pdf-toolbar">
                <button onClick={goPrev} disabled={!canPrev} aria-label="Previous page">‹</button>
                <span className="pdf-page-indicator">{pageNumber}/{numPages || "—"}</span>
                <button onClick={goNext} disabled={!canNext} aria-label="Next page">›</button>

                <div className="pdf-spacer" />
                <button onClick={zoomOut} aria-label="Zoom out">–</button>
                <button onClick={fitWidth} aria-label="Fit to width">Fit</button>
                <button onClick={zoomIn} aria-label="Zoom in">+</button>

                {/* IMPORTANT: target a Worker URL; no `download` attr */}
                <a
                    className="pdf-download"
                    href={viewerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={openInNewTab}
                >
                    Open in new tab
                </a>
            </div>

            <div className="pdf-canvas-wrap">
                {!fallback ? (
                    <Document
                        file={viewerUrl}         // <— use Worker URL for PDF.js too
                        loading={<div className="pdf-loading">Loading PDF…</div>}
                        onLoadSuccess={onDocLoad}
                        onLoadError={onError}
                        onSourceError={onError}
                        error={<div className="pdf-error">Couldn’t render PDF.</div>}
                    >
                        <Page
                            pageNumber={pageNumber}
                            scale={scale}
                            renderAnnotationLayer
                            renderTextLayer
                        />
                    </Document>
                ) : (
                    <div className="pdf-fallback">
                        <object
                            data={`${viewerUrl}#view=FitH`}
                            type="application/pdf"
                            className="pdf-frame"
                        >
                            <embed
                                src={`${viewerUrl}#view=FitH`}
                                type="application/pdf"
                                className="pdf-frame"
                            />
                            <a href={viewerUrl} target="_blank" rel="noreferrer">Open PDF</a>
                        </object>
                    </div>
                )}

                {error && <div className="pdf-error">{error}</div>}
            </div>
        </div>
    );
};

export default PDFViewer;