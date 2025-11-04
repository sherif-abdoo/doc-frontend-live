// src/shared/components/submission/PDFViewer.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "../../style/submission/pdf_viewer_style.css";

/**
 * Same-origin module worker (copied to /public via postinstall).
 * We use workerPort (v5 way) to avoid dynamic-import issues.
 */
try {
    const workerUrl = `${process.env.PUBLIC_URL || ""}/pdf.worker.min.mjs`;
    const worker = new Worker(workerUrl, { type: "module" });

    // Debug logs (enable if needed):
    // worker.addEventListener("error", (e) => console.error("[pdfjs worker] error:", e));
    // worker.addEventListener("messageerror", (e) => console.error("[pdfjs worker] messageerror:", e.data));

    pdfjs.GlobalWorkerOptions.workerPort = worker;
} catch (e) {
    console.error("[pdfjs] Worker setup failed; rendering may be slower.", e);
}

const PDFViewer = ({ pdfUrl }) => {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.1);
    const [fileSource, setFileSource] = useState(pdfUrl);
    const [error, setError] = useState("");

    /**
     * Try blob first (better offline + avoids some CORS).
     * If blob fails, fall back to direct URL.
     */
    useEffect(() => {
        let revokeUrl;
        let cancelled = false;

        (async () => {
            try {
                const res = await fetch(pdfUrl, { method: "GET" });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const blob = await res.blob();
                if (!blob || blob.size === 0) throw new Error("Empty blob");

                const url = URL.createObjectURL(blob);
                if (!cancelled) {
                    setFileSource(url);
                    revokeUrl = url;
                }
            } catch {
                if (!cancelled) setFileSource(pdfUrl);
            }
        })();

        return () => {
            cancelled = true;
            if (revokeUrl) URL.revokeObjectURL(revokeUrl);
        };
    }, [pdfUrl]);

    const onDocLoad = ({ numPages }) => {
        setNumPages(numPages);
        setPageNumber(1);
        setError("");
    };

    const canPrev = pageNumber > 1;
    const canNext = numPages ? pageNumber < numPages : false;

    const goPrev = () => canPrev && setPageNumber((p) => p - 1);
    const goNext = () => canNext && setPageNumber((p) => p + 1);

    const zoomOut = () => setScale((s) => Math.max(0.6, s - 0.1));
    const zoomIn = () => setScale((s) => Math.min(2.5, s + 0.1));
    const fitWidth = () => setScale(1.1);

    const file = useMemo(() => fileSource, [fileSource]);

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

                <a className="pdf-download" href={pdfUrl} target="_blank" rel="noreferrer">
                    Open in new tab
                </a>
            </div>

            <div className="pdf-canvas-wrap">
                <Document
                    file={file}
                    loading={<div className="pdf-loading">Loading PDF…</div>}
                    onLoadSuccess={onDocLoad}
                    onLoadError={(e) => {
                        console.error("[pdf] onLoadError:", e);
                        setError(e?.message || "Failed to load PDF");
                    }}
                    onSourceError={(e) => {
                        console.error("[pdf] onSourceError:", e);
                        setError(e?.message || "PDF source error");
                    }}
                    error={<div className="pdf-error">Couldn’t render PDF.</div>}
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        renderAnnotationLayer
                        renderTextLayer
                    />
                </Document>

                {error && <div className="pdf-error">{error}</div>}
            </div>
        </div>
    );
};

export default PDFViewer;
