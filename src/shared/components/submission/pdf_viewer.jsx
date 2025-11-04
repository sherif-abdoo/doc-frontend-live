// src/shared/components/submission/PDFViewer.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "../../style/submission/pdf_viewer_style.css";

// 1) Same-origin module worker (copied to /public via postinstall)
try {
    const workerUrl = `${process.env.PUBLIC_URL || ""}/pdf.worker.min.mjs`;
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
    const [fallback, setFallback] = useState(false); // native <object> fallback
    const fallbackTimerRef = useRef(null);

    // 2) Give PDF.js a little time; if it doesn't load, show native <object> fallback
    useEffect(() => {
        setFallback(false);
        if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = setTimeout(() => {
            setFallback(true);
        }, 6000); // grace period before showing fallback
        return () => clearTimeout(fallbackTimerRef.current);
    }, [pdfUrl]);

    const onDocLoad = ({ numPages }) => {
        setNumPages(numPages);
        setPageNumber(1);
        setError("");
        setFallback(false); // PDF.js loaded successfully
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

    // 3) Pass URL directly (R2 read worker now sends proper headers)
    const file = useMemo(() => pdfUrl, [pdfUrl]);

    // Android hint: some devices prefer download over inline when opening a new tab
    const isAndroid =
        typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);

    // Force a real tab navigation on Android (prevents silent "download" behavior)
    const openInNewTab = (e) => {
        if (isAndroid) {
            e.preventDefault();
            try {
                window.open(pdfUrl, "_blank", "noopener");
            } catch (err) {
                console.warn("window.open failed, falling back to href nav", err);
                // last resort: navigate current tab (keeps user flow)
                window.location.href = pdfUrl;
            }
        }
    };

    return (
        <div className="pdf-viewer pdf-viewer--canvas">
            <div className="pdf-toolbar">
                <button onClick={goPrev} disabled={!canPrev} aria-label="Previous page">
                    ‹
                </button>
                <span className="pdf-page-indicator">
          {pageNumber}/{numPages || "—"}
        </span>
                <button onClick={goNext} disabled={!canNext} aria-label="Next page">
                    ›
                </button>

                <div className="pdf-spacer" />
                <button onClick={zoomOut} aria-label="Zoom out">
                    –
                </button>
                <button onClick={fitWidth} aria-label="Fit to width">
                    Fit
                </button>
                <button onClick={zoomIn} aria-label="Zoom in">
                    +
                </button>

                {/* IMPORTANT: no `download` attr. Keep target=_blank + rel. */}
                <a
                    className="pdf-download"
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener"
                    onClick={openInNewTab}
                >
                    Open in new tab
                </a>
            </div>

            <div className="pdf-canvas-wrap">
                {!fallback ? (
                    <Document
                        file={file}
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
                        {/* Native PDF rendering as a safety net */}
                        <object
                            data={`${pdfUrl}#view=FitH`}
                            type="application/pdf"
                            className="pdf-frame"
                        >
                            <embed
                                src={`${pdfUrl}#view=FitH`}
                                type="application/pdf"
                                className="pdf-frame"
                            />
                            <a href={pdfUrl} target="_blank" rel="noreferrer">
                                Open PDF
                            </a>
                        </object>
                    </div>
                )}

                {error && <div className="pdf-error">{error}</div>}
            </div>
        </div>
    );
};

export default PDFViewer;
