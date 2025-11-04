// src/shared/components/submission/PDFViewer.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "../../style/submission/pdf_viewer_style.css";

// ===== CONFIG =====
const R2_READER_BASE =
    import.meta?.env?.VITE_R2_READER_BASE ||
    process.env?.VITE_R2_READER_BASE ||
    "";

// Map any incoming URL to the Worker `/get?key=...`
function toWorkerUrl(inputUrl) {
    if (!R2_READER_BASE) return inputUrl;

    try {
        const u = new URL(inputUrl);
        if (u.origin === new URL(R2_READER_BASE).origin) return inputUrl;
        const key = u.pathname.replace(/^\/+/, "");
        const workerUrl = new URL("/get", R2_READER_BASE);
        workerUrl.searchParams.set("key", key);
        return workerUrl.toString();
    } catch {
        const workerUrl = new URL("/get", R2_READER_BASE);
        workerUrl.searchParams.set("key", String(inputUrl).replace(/^\/+/, ""));
        return workerUrl.toString();
    }
}

// ===== PDF.js worker setup =====
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
    const [renderAttempts, setRenderAttempts] = useState(0);
    const fallbackTimerRef = useRef(null);

    const viewerUrl = useMemo(() => toWorkerUrl(pdfUrl), [pdfUrl]);

    // Detect mobile browsers (not just Android)
    const isMobile = useMemo(() => {
        if (typeof navigator === "undefined") return false;
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        );
    }, []);

    // Detect Chrome specifically
    const isChrome = useMemo(() => {
        if (typeof navigator === "undefined") return false;
        return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    }, []);

    useEffect(() => {
        setFallback(false);
        setRenderAttempts(0);
        if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);

        // Shorter timeout for mobile devices where PDF.js often fails
        const timeout = isMobile ? 3000 : 6000;
        fallbackTimerRef.current = setTimeout(() => {
            console.warn("[pdf] Fallback triggered after timeout");
            setFallback(true);
        }, timeout);

        return () => {
            if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
        };
    }, [viewerUrl, isMobile]);

    const onDocLoad = ({ numPages }) => {
        setNumPages(numPages);
        setPageNumber(1);
        setError("");
        setFallback(false);
        if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
        console.log("[pdf] Successfully loaded with", numPages, "pages");
    };

    const onError = (e) => {
        console.error("[pdf] error:", e);
        setError(e?.message || "Failed to load PDF");
        setRenderAttempts(prev => prev + 1);

        // On mobile Chrome, fallback immediately after first failure
        if (isMobile && isChrome && renderAttempts === 0) {
            console.warn("[pdf] Mobile Chrome detected, using fallback");
            setFallback(true);
        } else if (renderAttempts >= 2) {
            setFallback(true);
        }
    };

    const canPrev = pageNumber > 1;
    const canNext = numPages ? pageNumber < numPages : false;

    const goPrev = () => canPrev && setPageNumber((p) => p - 1);
    const goNext = () => canNext && setPageNumber((p) => p + 1);
    const zoomOut = () => setScale((s) => Math.max(0.6, s - 0.1));
    const zoomIn = () => setScale((s) => Math.min(2.5, s + 0.1));
    const fitWidth = () => setScale(1.1);

    // Enhanced new tab opening for all browsers
    const openInNewTab = (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log("[pdf] Opening in new tab:", viewerUrl);

        try {
            // Method 1: Standard window.open
            const newWindow = window.open(viewerUrl, "_blank", "noopener,noreferrer");

            if (newWindow && !newWindow.closed && typeof newWindow.closed !== "undefined") {
                // Success - focus the new window
                newWindow.focus();
                console.log("[pdf] Opened successfully in new tab");
            } else {
                // Popup blocked - try creating a temporary link
                console.warn("[pdf] Popup blocked, trying temporary link method");
                const link = document.createElement("a");
                link.href = viewerUrl;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (err) {
            console.error("[pdf] window.open failed, trying link method:", err);
            // Fallback: create and click a temporary link
            try {
                const link = document.createElement("a");
                link.href = viewerUrl;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (linkErr) {
                console.error("[pdf] All methods failed:", linkErr);
                alert("Unable to open PDF. Please allow popups or try again.");
            }
        }
    };

    // For mobile devices, show a more prominent "Open" button
    const shouldShowMobilePrompt = isMobile && (fallback || !numPages);

    return (
        <div className="pdf-viewer pdf-viewer--canvas">
            <div className="pdf-toolbar">
                {!shouldShowMobilePrompt && (
                    <>
                        <button onClick={goPrev} disabled={!canPrev} aria-label="Previous page">‹</button>
                        <span className="pdf-page-indicator">{pageNumber}/{numPages || "—"}</span>
                        <button onClick={goNext} disabled={!canNext} aria-label="Next page">›</button>

                        <div className="pdf-spacer" />
                        <button onClick={zoomOut} aria-label="Zoom out">–</button>
                        <button onClick={fitWidth} aria-label="Fit to width">Fit</button>
                        <button onClick={zoomIn} aria-label="Zoom in">+</button>
                    </>
                )}

                <a
                    className="pdf-download"
                    href={viewerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={openInNewTab}
                    style={shouldShowMobilePrompt ? {
                        fontSize: "16px",
                        padding: "12px 20px",
                        fontWeight: "bold"
                    } : {}}
                >
                    {shouldShowMobilePrompt ? "📄 Open PDF" : "Open in new tab"}
                </a>
            </div>

            {shouldShowMobilePrompt ? (
                <div className="pdf-mobile-prompt" style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "40px 20px",
                    textAlign: "center",
                    minHeight: "300px"
                }}>
                    <div style={{ fontSize: "48px", marginBottom: "20px" }}>📄</div>
                    <h3 style={{ marginBottom: "10px" }}>PDF Ready to View</h3>
                    <p style={{ color: "#666", marginBottom: "20px" }}>
                        Click the button above to open the PDF in a new tab
                    </p>
                </div>
            ) : (
                <div className="pdf-canvas-wrap">
                    {!fallback ? (
                        <Document
                            file={viewerUrl}
                            loading={<div className="pdf-loading">Loading PDF…</div>}
                            onLoadSuccess={onDocLoad}
                            onLoadError={onError}
                            onSourceError={onError}
                            error={<div className="pdf-error">Couldn't render PDF.</div>}
                            options={{
                                // Enhanced options for better compatibility
                                cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
                                cMapPacked: true,
                                standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/',
                            }}
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
                                <div style={{ padding: "20px", textAlign: "center" }}>
                                    <p>Unable to display PDF in browser.</p>
                                    <a
                                        href={viewerUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={openInNewTab}
                                        style={{
                                            display: "inline-block",
                                            padding: "10px 20px",
                                            background: "#007bff",
                                            color: "white",
                                            textDecoration: "none",
                                            borderRadius: "4px",
                                            marginTop: "10px"
                                        }}
                                    >
                                        Open PDF in New Tab
                                    </a>
                                </div>
                            </object>
                        </div>
                    )}

                    {error && !shouldShowMobilePrompt && (
                        <div className="pdf-error">{error}</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PDFViewer;